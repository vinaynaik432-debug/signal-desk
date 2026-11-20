import { createServer } from 'node:http';
import { mkdirSync,existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { routes } from './api.mjs';
import { publicFiles } from './assets.mjs';
import { openDB } from './local-db.mjs';

const secretFile=fileURLToPath(new URL('../secrets/providers.env',import.meta.url));
const localEnv=fileURLToPath(new URL('./.env',import.meta.url));
if(existsSync(localEnv)) process.loadEnvFile(localEnv);
else if(existsSync(secretFile)) process.loadEnvFile(secretFile);
const data=fileURLToPath(new URL('./.local/',import.meta.url));
mkdirSync(data,{recursive:true,mode:0o700});
const env={...process.env,DB:openDB(data+'prospect-desk.sqlite')};
const port=Number(process.env.PORT || 8787);
const host='127.0.0.1';
const server=createServer(async(req,res)=>{
  try{
    if(![host+':'+port,'localhost:'+port].includes(req.headers.host)) {res.writeHead(403).end();return;}
    let bytes=0;const chunks=[];
    for await (const chunk of req){bytes+=chunk.length;if(bytes>8192){res.writeHead(413).end();return;}chunks.push(chunk);}
    const url='http://'+req.headers.host+req.url;
    const request=new Request(url,{method:req.method,headers:req.headers,body:chunks.length?Buffer.concat(chunks):undefined});
    const output=await routes(request,env,publicFiles());res.writeHead(output.status,Object.fromEntries(output.headers));
    res.end(Buffer.from(await output.arrayBuffer()));
  }catch{res.writeHead(500).end('Workspace unavailable');}
});
server.listen(port,host,()=>console.log('Signal Desk is running at http://'+host+':'+port+'/'));
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'That port is already in use. Open the running app or set PORT.':e.message);process.exit(1);});
