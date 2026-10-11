import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { authenticate, allowedOrigin, tokenHash } from '../server/auth.ts';
import { FileLedger, RedisLedger, MICRO, quotedCost, actualCost, type Ledger } from '../server/ledger.ts';
import { readSse, Deepseek } from '../server/deepseek.ts';
import { retrieve } from '../server/knowledge.ts';
import { cacheKey, createHandler, parseContext } from '../server/handler.ts';
import { rankQuestions, virtualLikes } from '../server/generate.ts';
import { ApiError, type Knowledge } from '../server/types.ts';

const code='owner-test-code-with-32-characters';
const env={LOCAL_ACCESS_CODE:code,DEEPSEEK_API_KEY:'fake-test-key',DAILY_BUDGET_CNY:'1',MONTHLY_BUDGET_CNY:'10'};
const knowledge:Knowledge={revision:'v1',books:[],authors:[],records:[
  {bookId:'book',chapterId:'c1',pageId:'p1',title:'劳动',text:'劳动维持生命，行动发生在公共空间。'},
  {bookId:'book',chapterId:'c2',pageId:'p2',title:'行动',text:'公共行动与言说把不同的人连接起来。'},
  {bookId:'other',pageId:'p3',title:'别的书',text:'与当前位置无关。'}
]};
async function ledgerPath(){const root=resolve('server/.runtime');await mkdir(root,{recursive:true});return resolve(await mkdtemp(resolve(root,'test-')),'ledger.json');}
function fakeLedger(){
  const cache=new Map<string,unknown>();const reserves:number[]=[];const settles:number[]=[];
  const ledger:Ledger={acquire:async()=>'slot',release:async()=>{},reserve:async n=>{reserves.push(n);return `r${reserves.length}`;},settle:async(_id,n)=>{settles.push(n);},cacheGet:async k=>cache.get(k),cacheSet:async(k,v)=>{cache.set(k,v);}};
  return {ledger,reserves,settles};
}
async function withServer(handler:ReturnType<typeof createHandler>,run:(url:string)=>Promise<void>){
  const server=createServer((req,res)=>void handler(req,res));
  await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));
  const address=server.address();assert(address&&typeof address==='object');
  try{await run(`http://127.0.0.1:${address.port}`);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
}

test('production needs a valid hash and never accepts the local raw code alone',()=>{
  authenticate(`Bearer ${code}`,env);
  assert.throws(()=>authenticate(`Bearer ${code}`,{VERCEL:'1',LOCAL_ACCESS_CODE:code}),ApiError);
  authenticate(`Bearer ${code}`,{VERCEL:'1',TOKEN_HASH:tokenHash(code)});
  assert.throws(()=>authenticate('Bearer not-my-access-code-0123456',{VERCEL:'1',TOKEN_HASH:tokenHash(code)}),(e:unknown)=>e instanceof ApiError&&e.status===401);
});
test('CORS only accepts the exact personal origin and local HTTP',()=>{
  assert(allowedOrigin('https://henry-18-dot.github.io'));assert(allowedOrigin('http://127.0.0.1:8795'));
  assert(!allowedOrigin('https://henry-18-dot.github.io.attacker.test'));assert(!allowedOrigin('https://attacker.test'));assert(!allowedOrigin('null'));
});
test('file ledger atomically gates concurrency and rolls daily rate separately from monthly spend',async()=>{
  let now=Date.UTC(2026,9,11,14);const path=await ledgerPath();const ledger=new FileLedger(path,env,()=>now);
  const acquired=await Promise.allSettled([ledger.acquire(),ledger.acquire(),ledger.acquire()]);
  assert.equal(acquired.filter(x=>x.status==='fulfilled').length,2);assert.equal(acquired.filter(x=>x.status==='rejected').length,1);
  for(const result of acquired)if(result.status==='fulfilled')await ledger.release(result.value);
  const r=await ledger.reserve(MICRO);await assert.rejects(()=>ledger.reserve(1),/预算/);
  await ledger.settle(r,250_000);const leftover=await ledger.reserve(750_000);
  now+=24*3600_000;await ledger.reserve(MICRO);
  await ledger.settle(leftover,0);
  const state=JSON.parse(await readFile(path,'utf8'));assert.equal(state.daily,MICRO);assert.equal(state.monthly,1_250_000);
});
test('rate ceiling counts completed requests and interrupted reservations remain charged after restart',async()=>{
  const path=await ledgerPath();const ledger=new FileLedger(path,env);
  for(let i=0;i<5;i++){const slot=await ledger.acquire();await ledger.release(slot);}
  await assert.rejects(()=>ledger.acquire(),/一分钟/);
  await ledger.reserve(MICRO);
  await assert.rejects(()=>new FileLedger(path,env).reserve(1),/预算/);
});
test('malformed local ledger and unavailable production Redis fail closed',async()=>{
  const path=await ledgerPath();await writeFile(path,'{broken');await assert.rejects(()=>new FileLedger(path,env).acquire(),/账本/);
  await assert.rejects(()=>new RedisLedger({VERCEL:'1'}).reserve(1),/预算服务/);
  const mock:typeof fetch=async()=>new Response('failure',{status:503});
  await assert.rejects(()=>new RedisLedger({UPSTASH_REDIS_REST_URL:'https://redis.invalid',UPSTASH_REDIS_REST_TOKEN:'test'},mock).acquire(),/暂时不可用/);
});
test('peak reservation is conservative and usage accounts for cache hits',()=>{
  assert(quotedCost('flash','中文资料',1200,env)>actualCost('flash',{prompt_tokens:10,completion_tokens:300},env));
  assert.equal(actualCost('flash',{prompt_tokens:1000,completion_tokens:100,prompt_cache_hit_tokens:500},env),1820);
});
test('retrieval keeps book identity, puts current page first and rejects stale revision',()=>{
  const result=retrieve(knowledge,{bookId:'book',pageId:'p1',question:'公共行动'});
  assert.equal(result[0].pageId,'p1');assert.equal(result.length,2);assert(result.every(r=>r.bookId==='book'));
  assert.throws(()=>retrieve(knowledge,{bookId:'book',revision:'old'}),/更新/);
  assert.throws(()=>retrieve(knowledge,{bookId:'missing'}),/没有找到/);
});
test('JSON context validation, candidate diversity and stable virtual heat',()=>{
  assert.throws(()=>parseContext({bookId:'book',interests:new Array(11).fill('历史')}));
  const value={questions:[
    {text:'公共行动为什么需要不同的人？',kind:'理解',relevance:4,answerability:4,novelty:3},
    {text:'公共行动为什么需要不同的人？',kind:'理解',relevance:4,answerability:4,novelty:3},
    {text:'行动如何应用到学生的公共讨论？',kind:'应用',relevance:3,answerability:4,novelty:4},
    {text:'行动与劳动的差别如何影响生活？',kind:'比较',relevance:4,answerability:4,novelty:3}
  ]};
  const questions=rankQuestions(value,{bookId:'book'});assert.equal(questions.length,3);assert.equal(new Set(questions.map(q=>q.id)).size,3);
  assert(new Set(questions.map(q=>q.kind)).size>=2);assert.equal(virtualLikes(4,4),800);assert.equal(virtualLikes(0,0),20);
  assert.equal(cacheKey('questions',{bookId:'book',interests:['历史','政治']},'v1'),cacheKey('questions',{bookId:'book',interests:['政治','历史']},'v1'));
  assert.notEqual(cacheKey('questions',{bookId:'book'},'v1'),cacheKey('questions',{bookId:'book'},'v2'));
});
test('SSE parser handles fragmented UTF-8 and keep-alive comments',async()=>{
  const encoded=new TextEncoder().encode(': keep-alive\r\n\r\ndata: {"choices":[{"delta":{"content":"你好"}}]}\r\n\r\ndata: [DONE]\r\n\r\n');
  const stream=new ReadableStream<Uint8Array>({start(c){for(let i=0;i<encoded.length;i+=3)c.enqueue(encoded.slice(i,i+3));c.close();}});
  const result=[];for await(const item of readSse(stream))result.push(item);
  assert.equal(result.length,1);assert.equal((result[0].choices as {delta:{content:string}}[])[0].delta.content,'你好');
});
test('401 upstream does not retry; a 503 retries once with a distinct reservation',async()=>{
  let count=0;const state=fakeLedger();const fail:typeof fetch=async()=>{count++;return new Response('',{status:401});};
  await assert.rejects(()=>new Deepseek(env,state.ledger,fail).json({signal:new AbortController().signal,maxTokens:100,messages:[{role:'user',content:'return json'}]},v=>v),/密钥/);
  assert.equal(count,1);assert.equal(state.reserves.length,1);
  count=0;const retryState=fakeLedger();const retry:typeof fetch=async()=>{count++;return count===1?new Response('',{status:503}):Response.json({choices:[{finish_reason:'stop',message:{content:'{"ok":true}'}}],usage:{prompt_tokens:10,completion_tokens:10}});};
  const value=await new Deepseek(env,retryState.ledger,retry).json({signal:new AbortController().signal,maxTokens:100,messages:[{role:'user',content:'return json'}]},v=>v);
  assert.deepEqual(value,{ok:true});assert.equal(count,2);assert.equal(retryState.reserves.length,2);
});
test('JSON schema repair is bounded and reserves every new model request',async()=>{
  const state=fakeLedger();let count=0;
  const mock:typeof fetch=async()=>{count++;return Response.json({choices:[{finish_reason:'stop',message:{content:count===1?'not JSON':'{"ok":true}'}}],usage:{prompt_tokens:10,completion_tokens:10}});};
  const value=await new Deepseek(env,state.ledger,mock).json({signal:new AbortController().signal,maxTokens:100,messages:[{role:'user',content:'return json'}]},v=>{assert.equal((v as {ok:boolean}).ok,true);return v;});
  assert.deepEqual(value,{ok:true});assert.equal(count,2);assert.equal(state.reserves.length,2);
});
test('HTTP authentication blocks upstream and successful ask emits sources and usage',async()=>{
  let calls=0;const state=fakeLedger();
  const mock:typeof fetch=async()=>{
    calls++;
    return new Response('data: {"choices":[{"delta":{"content":"公共行动需要共同空间。"},"finish_reason":null}]}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":20,"completion_tokens":10}}\n\ndata: [DONE]\n\n',{headers:{'Content-Type':'text/event-stream'}});
  };
  await withServer(createHandler('ask',{env,ledger:state.ledger,knowledge,fetcher:mock}),async url=>{
    const denied=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bookId:'book',question:'什么是行动？'})});assert.equal(denied.status,401);assert.equal(calls,0);
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${code}`,Origin:'https://henry-18-dot.github.io'},body:JSON.stringify({bookId:'book',pageId:'p1',question:'什么是行动？'})});
    assert.equal(response.status,200);assert.equal(response.headers.get('Access-Control-Allow-Origin'),'https://henry-18-dot.github.io');
    const events=await response.text();assert.match(events,/event: delta/);assert.match(events,/event: sources/);assert.match(events,/"pageId":"p1"/);assert.match(events,/event: done/);assert.equal(calls,1);assert.equal(state.settles.length,1);
  });
});
test('truncated SSE retains its reservation and sends a recoverable error',async()=>{
  const state=fakeLedger();const mock:typeof fetch=async()=>new Response('data: {"choices":[{"delta":{"content":"回答开始"}}]}\n\n');
  await withServer(createHandler('ask',{env,ledger:state.ledger,knowledge,fetcher:mock}),async url=>{
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${code}`},body:JSON.stringify({bookId:'book',question:'什么是行动？'})});
    const text=await response.text();assert.match(text,/回答开始/);assert.match(text,/event: error/);assert.doesNotMatch(text,/event: done/);assert.equal(state.reserves.length,1);assert.equal(state.settles.length,0);
  });
});
test('comments use six actor roles then a separate anonymous Pro judge and exclude false facts',async()=>{
  const state=fakeLedger();let calls=0;let authors:string[]=[];
  const mock:typeof fetch=async(_url,init)=>{
    calls++;const request=JSON.parse(String(init?.body));let content:unknown;
    if(calls===1){
      assert.equal(request.model,'deepseek-flash');
      const input=JSON.parse(request.messages[1].content);assert.equal(input.roles.length,6);assert.equal(input.roles.filter((r:{crossover:boolean})=>r.crossover).length,1);
      authors=input.roles.map((r:{id:string})=>r.id);
      content={comments:authors.map((authorId,index)=>({authorId,body:`第${index+1}条评论讨论公共空间如何连接个人的选择与共同的行动，也提醒读者留意不同的人所处的实际条件。`}))};
    }else{
      assert.equal(request.model,'deepseek-v4-pro');
      const input=JSON.parse(request.messages[1].content);assert(!('roles' in input));assert(!JSON.stringify(input).includes('authorId'));
      content={scores:input.comments.map((c:{index:number})=>({index:c.index,relevance:4,grounded:c.index!==0,constructive:3,mischief:2,reason:'内容回应资料中的公共空间。'}))};
    }
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(content)}}],usage:{prompt_tokens:100,completion_tokens:100}});
  };
  await withServer(createHandler('comments',{env,ledger:state.ledger,knowledge,fetcher:mock}),async url=>{
    const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${code}`},body:JSON.stringify({bookId:'book'})});
    assert.equal(response.status,200);const data=await response.json() as {comments:{ai:boolean;likes:number}[];authors:unknown[]};
    assert.equal(data.comments.length,5);assert.equal(data.authors.length,6);assert(data.comments.every(c=>c.ai&&c.likes===virtualLikes(3,2)));assert.equal(calls,2);
  });
});
