import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { ApiError, type Env, type Usage } from './types.ts';
import { isProduction } from './auth.ts';

export const MICRO = 1_000_000;
export interface Ledger {
  acquire(): Promise<string>;
  release(id: string): Promise<void>;
  reserve(amount: number): Promise<string>;
  settle(id: string, actual: number): Promise<void>;
  cacheGet(key: string): Promise<unknown | undefined>;
  cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void>;
}
interface State {
  day: string; month: string; daily: number; monthly: number;
  requests: number[]; slots: Record<string,number>;
  reservations: Record<string,{amount:number;day:string;month:string}>;
  cache: Record<string,{expires:number;value:unknown}>;
}
export function periods(now:number) { const d = new Date(now+8*3600_000).toISOString().slice(0,10); return {day:d,month:d.slice(0,7)}; }
function initial(now:number): State { return {...periods(now),daily:0,monthly:0,requests:[],slots:{},reservations:{},cache:{}}; }
function positive(env:Env,key:string,fallback:number) { const n = Number(env[key] || fallback); if(!Number.isFinite(n)||n<=0) throw new ApiError(503,'AI 预算配置不正确'); return n; }
export function limits(env:Env) { return {daily:Math.floor(positive(env,'DAILY_BUDGET_CNY',1)*MICRO),monthly:Math.floor(positive(env,'MONTHLY_BUDGET_CNY',10)*MICRO)}; }
export function price(model:'flash'|'pro', env:Env) {
  return {input:positive(env,`${model.toUpperCase()}_INPUT_CNY_PER_M`,model==='flash'?2:9),output:positive(env,`${model.toUpperCase()}_OUTPUT_CNY_PER_M`,model==='flash'?8:27),hit:positive(env,`${model.toUpperCase()}_CACHE_CNY_PER_M`,model==='flash'?0.04:0.30)};
}
export function quotedCost(model:'flash'|'pro', serializedPrompt:string,maxTokens:number,env:Env): number {
  // A byte-level upper allowance is deliberately larger than normal token estimates.
  const inputAllowance = Buffer.byteLength(serializedPrompt,'utf8')+1024;
  const p = price(model,env);
  return Math.ceil(inputAllowance*p.input+maxTokens*p.output);
}
export function actualCost(model:'flash'|'pro',usage:Usage,env:Env): number {
  const p=price(model,env); const hit=Math.max(0,Math.min(usage.prompt_tokens,usage.prompt_cache_hit_tokens||0));
  return Math.ceil((usage.prompt_tokens-hit)*p.input+hit*p.hit+usage.completion_tokens*p.output);
}
export class FileLedger implements Ledger {
  private queue:Promise<unknown> = Promise.resolve();
  constructor(private path:string, private env:Env, private clock:()=>number=Date.now) {}
  private async transaction<T>(fn:(state:State,now:number)=>T):Promise<T> {
    const action = this.queue.then(async()=>{
      const now=this.clock();
      const state:State = await readFile(this.path,'utf8').then(JSON.parse).catch((e:NodeJS.ErrnoException)=>{if(e.code==='ENOENT')return initial(now);throw new ApiError(503,'本地预算账本无法读取');});
      if(!state || !Array.isArray(state.requests) || !state.reservations || !state.slots || !state.cache || !Number.isSafeInteger(state.daily) || !Number.isSafeInteger(state.monthly) || state.daily<0 || state.monthly<0 || typeof state.day!=='string' || typeof state.month!=='string') throw new ApiError(503,'本地预算账本格式不正确');
      const current=periods(now);
      if(state.day!==current.day){state.day=current.day;state.daily=0;}
      if(state.month!==current.month){state.month=current.month;state.monthly=0;}
      state.requests=state.requests.filter(t=>t>now-60_000);
      for(const [id,expires] of Object.entries(state.slots))if(expires<=now)delete state.slots[id];
      for(const [id,c] of Object.entries(state.cache))if(c.expires<=now)delete state.cache[id];
      const result=fn(state,now);
      await mkdir(dirname(this.path),{recursive:true});
      const temporary=`${this.path}.${randomUUID()}.tmp`;
      await writeFile(temporary,JSON.stringify(state),'utf8');
      await rename(temporary,this.path);
      return result;
    });
    this.queue=action.catch(()=>undefined);
    return action;
  }
  acquire() { return this.transaction((s,now)=>{
    if(s.requests.length>=5)throw new ApiError(429,'请求较多，请稍等一分钟');
    if(Object.keys(s.slots).length>=2)throw new ApiError(429,'已有两个 AI 请求在进行');
    const id=randomUUID();s.requests.push(now);s.slots[id]=now+110_000;return id;
  }); }
  release(id:string) {return this.transaction(s=>{delete s.slots[id];});}
  reserve(amount:number) {return this.transaction(s=>{
    const max=limits(this.env);
    if(!Number.isSafeInteger(amount)||amount<=0)throw new ApiError(503,'费用预留不正确');
    if(s.daily+amount>max.daily||s.monthly+amount>max.monthly)throw new ApiError(429,'本日或本月 AI 预算已用完');
    const id=randomUUID();s.daily+=amount;s.monthly+=amount;s.reservations[id]={amount,day:s.day,month:s.month};return id;
  });}
  settle(id:string,actual:number) {return this.transaction(s=>{
    const r=s.reservations[id];if(!r)return;
    if(!Number.isSafeInteger(actual)||actual<0)throw new ApiError(503,'费用记录不正确');
    const difference=actual-r.amount;
    if(r.day===s.day)s.daily=Math.max(0,s.daily+difference);
    if(r.month===s.month)s.monthly=Math.max(0,s.monthly+difference);
    delete s.reservations[id];
  });}
  cacheGet(key:string){return this.transaction(s=>s.cache[key]?.value);}
  cacheSet(key:string,value:unknown,ttl:number){return this.transaction((s,now)=>{
    const keys=Object.keys(s.cache);if(keys.length>=100)delete s.cache[keys[0]];
    s.cache[key]={value,expires:now+ttl*1000};
  });}
}

// One EVAL atomically reads and writes the owner ledger across Vercel instances.
export const LEDGER_LUA = `
local key=KEYS[1]
local op=ARGV[1]
local now=tonumber(ARGV[2])
local day=ARGV[3]
local month=ARGV[4]
local id=ARGV[5]
local value=tonumber(ARGV[6])
local dailyMax=tonumber(ARGV[7])
local monthlyMax=tonumber(ARGV[8])
local raw=redis.call('GET',key)
local s
if raw then s=cjson.decode(raw) else s={day=day,month=month,daily=0,monthly=0,requests={},slots={},reservations={}} end
if s.day~=day then s.day=day;s.daily=0 end
if s.month~=month then s.month=month;s.monthly=0 end
local recent={}
for _,t in ipairs(s.requests) do if tonumber(t)>now-60000 then table.insert(recent,t) end end
s.requests=recent
local active=0
for k,t in pairs(s.slots) do if tonumber(t)<=now then s.slots[k]=nil else active=active+1 end end
if op=='acquire' then
 if #recent>=5 then return cjson.encode({error='rate'}) end
 if active>=2 then return cjson.encode({error='concurrency'}) end
 table.insert(s.requests,now);s.slots[id]=now+110000
elseif op=='release' then s.slots[id]=nil
elseif op=='reserve' then
 if s.daily+value>dailyMax or s.monthly+value>monthlyMax then return cjson.encode({error='budget'}) end
 s.daily=s.daily+value;s.monthly=s.monthly+value;s.reservations[id]={amount=value,day=day,month=month}
elseif op=='settle' then
 local r=s.reservations[id]
 if r then
  local delta=value-tonumber(r.amount)
  if r.day==day then s.daily=math.max(0,s.daily+delta) end
  if r.month==month then s.monthly=math.max(0,s.monthly+delta) end
  s.reservations[id]=nil
 end
end
redis.call('SET',key,cjson.encode(s))
return cjson.encode({ok=true})`;

export class RedisLedger implements Ledger {
  constructor(private env:Env,private fetcher:typeof fetch=fetch) {}
  private async command(command:unknown[]):Promise<unknown> {
    if(!this.env.UPSTASH_REDIS_REST_URL||!this.env.UPSTASH_REDIS_REST_TOKEN)throw new ApiError(503,'请先配置 AI 预算服务');
    try {
      const response=await this.fetcher(this.env.UPSTASH_REDIS_REST_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${this.env.UPSTASH_REDIS_REST_TOKEN}`},body:JSON.stringify(command),signal:AbortSignal.timeout(8000)});
      if(!response.ok)throw new Error('budget unavailable');
      const data=await response.json() as {result:unknown;error?:string};
      if(data.error)throw new Error('budget unavailable');
      return data.result;
    }catch {throw new ApiError(503,'AI 预算服务暂时不可用，请稍后再试');}
  }
  private async mutate(op:string,id:string,value=0) {
    const now=Date.now(),p=periods(now),max=limits(this.env);
    const result=JSON.parse(String(await this.command(['EVAL',LEDGER_LUA,1,'toktok:owner:ledger:v1',op,now,p.day,p.month,id,value,max.daily,max.monthly]))) as {error?:string};
    if(result.error)throw new ApiError(429,result.error==='budget'?'本日或本月 AI 预算已用完':result.error==='concurrency'?'已有两个 AI 请求在进行':'请求较多，请稍等一分钟');
  }
  async acquire(){const id=randomUUID();await this.mutate('acquire',id);return id;}
  release(id:string){return this.mutate('release',id);}
  async reserve(amount:number){if(!Number.isSafeInteger(amount)||amount<=0)throw new ApiError(503,'费用预留不正确');const id=randomUUID();await this.mutate('reserve',id,amount);return id;}
  settle(id:string,actual:number){if(!Number.isSafeInteger(actual)||actual<0)throw new ApiError(503,'费用记录不正确');return this.mutate('settle',id,actual);}
  async cacheGet(key:string){const raw=await this.command(['GET',`toktok:cache:${key}`]);return raw?JSON.parse(String(raw)):undefined;}
  async cacheSet(key:string,value:unknown,ttl:number){await this.command(['SET',`toktok:cache:${key}`,JSON.stringify(value),'EX',ttl]);}
}
let singleton:Ledger|undefined;
export function getLedger(env:Env=process.env):Ledger {
  if(!singleton) singleton=isProduction(env)?new RedisLedger(env):new FileLedger(resolve(env.LOCAL_LEDGER_PATH||'server/.runtime/ledger.json'),env);
  return singleton;
}
