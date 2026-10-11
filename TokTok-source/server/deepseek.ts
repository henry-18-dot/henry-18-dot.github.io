import { ApiError, type Env, type Usage } from './types.ts';
import { actualCost, quotedCost, type Ledger } from './ledger.ts';

export interface Message {role:'system'|'user';content:string}
export interface CompletionOptions {messages:Message[];model?:'flash'|'pro';maxTokens:number;json?:boolean;signal:AbortSignal;temperature?:number}
export function parseUsage(raw:unknown):Usage|undefined {
  if(!raw||typeof raw!=='object')return;
  const r=raw as Record<string,unknown>;
  if(!Number.isInteger(r.prompt_tokens)||!Number.isInteger(r.completion_tokens)||Number(r.prompt_tokens)<0||Number(r.completion_tokens)<0)return;
  return {prompt_tokens:Number(r.prompt_tokens),completion_tokens:Number(r.completion_tokens),prompt_cache_hit_tokens:typeof r.prompt_cache_hit_tokens==='number'?r.prompt_cache_hit_tokens:undefined,prompt_cache_miss_tokens:typeof r.prompt_cache_miss_tokens==='number'?r.prompt_cache_miss_tokens:undefined};
}
export async function* readSse(body:ReadableStream<Uint8Array>,signal?:AbortSignal):AsyncGenerator<Record<string,unknown>> {
  const reader=body.getReader();const decoder=new TextDecoder();let pending='';
  try {
    while(true){
      if(signal?.aborted)throw new ApiError(504,'AI 回答超时，请稍后重试');
      const {done,value}=await reader.read();pending=(pending+decoder.decode(value,{stream:!done})).replace(/\r\n/g,'\n');
      let boundary:number;
      while((boundary=pending.indexOf('\n\n'))>=0){
        const frame=pending.slice(0,boundary);pending=pending.slice(boundary+2);
        const data=frame.split('\n').filter(l=>l.startsWith('data:')).map(l=>l.slice(5).trimStart()).join('\n');
        if(!data||data==='[DONE]')continue;
        try{yield JSON.parse(data);}catch{throw new ApiError(502,'AI 响应格式不正确');}
      }
      if(pending.length>500_000)throw new ApiError(502,'AI 响应过长');
      if(done)break;
    }
  }finally{await reader.cancel().catch(()=>undefined);reader.releaseLock();}
}
export class Deepseek {
  constructor(private env:Env,private ledger:Ledger,private fetcher:typeof fetch=fetch){}
  private async request(options:CompletionOptions,stream:boolean):Promise<{response:Response;reservation:string;model:'flash'|'pro'}> {
    if(!this.env.DEEPSEEK_API_KEY)throw new ApiError(503,'AI 尚未配置，仍可阅读已发布内容');
    const model=options.model||'flash';
    const body={model:model==='flash'?'deepseek-flash':'deepseek-v4-pro',messages:options.messages,max_tokens:options.maxTokens,thinking:{type:'disabled'},reasoning_effort:'none',temperature:options.temperature??0.35,stream,...(stream?{stream_options:{include_usage:true}}:{}),...(options.json?{response_format:{type:'json_object'}}:{})};
    const serialized=JSON.stringify(body);
    if(Buffer.byteLength(serialized)>55_000)throw new ApiError(413,'提问资料过长，请缩短问题');
    for(let attempt=0;attempt<2;attempt++){
      const reservation=await this.ledger.reserve(quotedCost(model,serialized,options.maxTokens,this.env));
      let response:Response;
      try{response=await this.fetcher('https://api.deepseek.com/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${this.env.DEEPSEEK_API_KEY}`,'Content-Type':'application/json'},body:serialized,signal:options.signal});}
      catch{throw new ApiError(options.signal.aborted?504:502,options.signal.aborted?'AI 回答超时，请稍后重试':'AI 连接中断，请稍后重试');}
      if(response.ok)return {response,reservation,model};
      // Non-2xx requests have no completed model usage; release their own reservation.
      await this.ledger.settle(reservation,0);
      await response.body?.cancel().catch(()=>undefined);
      if([429,500,503].includes(response.status)&&attempt===0&&!options.signal.aborted){
        await new Promise<void>((resolve,reject)=>{const t=setTimeout(resolve,600);options.signal.addEventListener('abort',()=>{clearTimeout(t);reject(new ApiError(504,'AI 回答超时'));},{once:true});});
        continue;
      }
      if(response.status===401)throw new ApiError(503,'AI 密钥配置不正确');
      if(response.status===402)throw new ApiError(503,'AI 账户余额不足');
      throw new ApiError(response.status===429?429:502,response.status===429?'AI 服务繁忙，请稍后重试':'AI 暂时无法回应，请稍后重试');
    }
    throw new ApiError(502,'AI 暂时无法回应');
  }
  async json<T>(options:CompletionOptions,validate:(value:unknown)=>T):Promise<T>{
    for(let repair=0;repair<2;repair++){
      const requestOptions={...options,json:true,messages:repair?[...options.messages,{role:'user' as const,content:'刚才返回的 JSON 为空或不符合结构。请严格重新返回约定的 JSON 对象，不加说明、不加代码围栏。'}]:options.messages};
      const {response,reservation,model}=await this.request(requestOptions,false);
      const data=await response.json().catch(()=>{throw new ApiError(502,'AI 响应格式不正确');}) as {choices?:{message?:{content?:string};finish_reason?:string}[];usage?:unknown};
      const usage=parseUsage(data.usage);if(usage)await this.ledger.settle(reservation,actualCost(model,usage,this.env));
      const choice=data.choices?.[0];
      if(!choice || choice.finish_reason!=='stop'){
        if(repair===0)continue;
        throw new ApiError(502,'AI 输出没有完成，请重试');
      }
      try{return validate(JSON.parse(choice.message?.content||''));}
      catch{if(repair===1)throw new ApiError(502,'AI 输出格式不正确，请重试');}
    }
    throw new ApiError(502,'AI 输出格式不正确');
  }
  async stream(options:CompletionOptions,onText:(text:string)=>void):Promise<Usage>{
    const {response,reservation,model}=await this.request(options,true);
    if(!response.body)throw new ApiError(502,'AI 没有返回内容');
    let usage:Usage|undefined;let finished=false;let textCount=0;
    for await(const data of readSse(response.body,options.signal)){
      const parsed=parseUsage(data.usage);if(parsed)usage=parsed;
      const choices=data.choices as {delta?:{content?:string};finish_reason?:string|null}[]|undefined;
      const choice=choices?.[0];
      if(typeof choice?.delta?.content==='string'&&choice.delta.content){textCount+=choice.delta.content.length;onText(choice.delta.content);}
      if(choice?.finish_reason){
        if(choice.finish_reason!=='stop')throw new ApiError(502,'AI 回答中断，可重新提问');
        finished=true;
      }
    }
    if(!finished||!usage||!textCount)throw new ApiError(502,'AI 回答中断，可重新提问');
    await this.ledger.settle(reservation,actualCost(model,usage,this.env));
    return usage;
  }
}
