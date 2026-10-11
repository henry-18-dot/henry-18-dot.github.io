import { createHash } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { z } from 'zod';
import { authenticate, configuredAuth, cors, isProduction } from './auth.ts';
import { Deepseek } from './deepseek.ts';
import { factualPolicy, generateComments, generateQuestions } from './generate.ts';
import { contextText, getKnowledge, retrieve } from './knowledge.ts';
import { getLedger, type Ledger } from './ledger.ts';
import { ApiError, type Context, type Env, type Knowledge, PROMPT_VERSION } from './types.ts';

const contextSchema=z.object({bookId:z.string().min(1).max(120),chapterId:z.string().max(120).optional(),pageId:z.string().max(120).optional(),revision:z.string().max(200).optional(),question:z.string().trim().min(1).max(1200).optional(),interests:z.array(z.string().trim().min(1).max(40)).max(10).optional()});
export function parseContext(raw:unknown):Context {
  const result=contextSchema.safeParse(raw);
  if(!result.success)throw new ApiError(400,'请提供书籍位置和有效的问题');
  return result.data;
}
export function cacheKey(kind:string,context:Context,revision:string):string {
  return createHash('sha256').update(JSON.stringify({kind,revision,prompt:PROMPT_VERSION,book:context.bookId,chapter:context.chapterId,page:context.pageId,question:context.question,interests:[...new Set(context.interests||[])].sort()})).digest('hex');
}
async function body(req:IncomingMessage&{body?:unknown}):Promise<unknown>{
  if(req.body!==undefined){
    const serialized=typeof req.body==='string'?req.body:JSON.stringify(req.body);
    if(Buffer.byteLength(serialized)>32_768)throw new ApiError(413,'请求内容过长');
    try{return typeof req.body==='string'?JSON.parse(req.body):req.body;}catch{throw new ApiError(400,'请求格式不正确');}
  }
  const chunks:Buffer[]=[];let bytes=0;
  for await(const chunk of req){const b=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);bytes+=b.length;if(bytes>32_768)throw new ApiError(413,'请求内容过长');chunks.push(b);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new ApiError(400,'请求格式不正确');}
}
function json(res:ServerResponse,status:number,value:unknown){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(JSON.stringify(value));}
function event(res:ServerResponse,name:string,value:unknown){if(!res.destroyed&&!res.writableEnded)res.write(`event: ${name}\ndata: ${JSON.stringify(value)}\n\n`);}
export interface HandlerDependencies {env?:Env;ledger?:Ledger;knowledge?:Knowledge;fetcher?:typeof fetch}
export function createHandler(kind:'questions'|'ask'|'comments'|'health',deps:HandlerDependencies={}){
  return async(req:IncomingMessage&{body?:unknown},res:ServerResponse):Promise<void>=>{
    const env=deps.env||process.env;let ledger:Ledger|undefined;let slot:string|undefined;
    const controller=new AbortController();let timeout:ReturnType<typeof setTimeout>|undefined;
    const disconnect=()=>{if(!res.writableEnded)controller.abort();};res.on('close',disconnect);
    try{
      cors(req,res);
      if(req.method==='OPTIONS'){res.statusCode=204;res.end();return;}
      if(kind==='health'){
        if(req.method!=='GET')throw new ApiError(405,'此接口只接受 GET');
        json(res,200,{ok:true,aiConfigured:Boolean(env.DEEPSEEK_API_KEY),authConfigured:configuredAuth(env),budgetReady:!isProduction(env)||Boolean(env.UPSTASH_REDIS_REST_URL&&env.UPSTASH_REDIS_REST_TOKEN),mode:isProduction(env)?'production':'local'});return;
      }
      if(req.method!=='POST')throw new ApiError(405,'此接口只接受 POST');
      authenticate(req.headers.authorization,env);
      const context=parseContext(await body(req));
      if(kind==='ask'&&!context.question)throw new ApiError(400,'请先输入问题');
      const knowledge=deps.knowledge||await getKnowledge();
      const records=retrieve(knowledge,context);
      ledger=deps.ledger||getLedger(env);slot=await ledger.acquire();
      timeout=setTimeout(()=>controller.abort(),90_000);
      const key=cacheKey(kind,context,knowledge.revision);
      const cached=await ledger.cacheGet(key);
      if(kind!=='ask'&&cached){json(res,200,cached);return;}
      const ai=new Deepseek(env,ledger,deps.fetcher);
      if(kind==='questions'){
        const data=await generateQuestions(ai,knowledge,context,controller.signal);
        await ledger.cacheSet(key,data,3600);json(res,200,data);return;
      }
      if(kind==='comments'){
        const data=await generateComments(ai,knowledge,context,controller.signal);
        await ledger.cacheSet(key,data,24*3600);json(res,200,data);return;
      }
      const sources=records.map(({bookId,chapterId,pageId,title})=>({bookId,chapterId,pageId,title}));
      res.statusCode=200;res.setHeader('Content-Type','text/event-stream; charset=utf-8');res.setHeader('X-Accel-Buffering','no');res.flushHeaders();
      if(cached&&typeof cached==='object'&&'text' in cached&&typeof cached.text==='string'){
        event(res,'delta',{text:cached.text});event(res,'sources',{sources});event(res,'done',{usage:{cached:true,prompt_tokens:0,completion_tokens:0}});res.end();return;
      }
      let text='';
      const usage=await ai.stream({signal:controller.signal,maxTokens:1200,messages:[
        {role:'system',content:`${factualPolicy}\n你是阅读助手。开头直接回答问题，通常 300 至 600 汉字。需要时用 2 至 3 个 Markdown 小标题、短段和少量表情。避免空泛总结、夸张宣传和心理诊断。只用提供的资料位置标识，不生成外部网址。无法确认的引语要明确说明无法确认，再给可据资料回答的解释。`},
        {role:'user',content:JSON.stringify({question:context.question,material:contextText(records)})}
      ]},delta=>{if(controller.signal.aborted)throw new ApiError(504,'AI 回答已中断');text+=delta;event(res,'delta',{text:delta});});
      await ledger.cacheSet(key,{text},3600);
      event(res,'sources',{sources});event(res,'done',{usage});res.end();
    }catch(error){
      const e=error instanceof ApiError?error:new ApiError(controller.signal.aborted?504:500,controller.signal.aborted?'AI 回答已中断，请重试':'暂时无法处理，请稍后重试');
      if(res.headersSent){event(res,'error',{message:e.message});if(!res.writableEnded)res.end();}
      else if(!res.destroyed)json(res,e.status,{error:{message:e.message}});
    }finally{
      if(timeout)clearTimeout(timeout);res.off('close',disconnect);
      if(slot&&ledger)await ledger.release(slot).catch(()=>undefined);
    }
  };
}
