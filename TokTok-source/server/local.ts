import { createServer } from 'node:http';
import { resolve } from 'node:path';
import { createHandler } from './handler.ts';

try{process.loadEnvFile(resolve('.env.local'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw new Error('无法载入 .env.local');}
const routes={
  '/api/questions':createHandler('questions'),
  '/api/ask':createHandler('ask'),
  '/api/comments':createHandler('comments'),
  '/api/health':createHandler('health')
};
const server=createServer((req,res)=>{
  const path=new URL(req.url||'/', 'http://127.0.0.1:8796').pathname;
  const handler=routes[path as keyof typeof routes];
  if(handler)void handler(req,res);
  else {res.statusCode=404;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({error:{message:'没有找到此接口'}}));}
});
server.listen(8796,'127.0.0.1',()=>{process.stdout.write('TokTok API: http://127.0.0.1:8796\n');});
server.on('error',()=>{process.stderr.write('API 无法启动，请检查 8796 端口\n');process.exitCode=1;});
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>server.close(()=>process.exit()));
