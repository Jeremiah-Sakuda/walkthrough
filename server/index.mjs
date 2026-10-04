import http from 'node:http';
import { readFileSync,existsSync,statSync } from 'node:fs';
import { resolve,extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { printableReport } from './report.mjs';
import { Store } from './store.mjs';
import { Payments } from './payments.mjs';
import { Walkthrough,initialData,AppError } from './domain.mjs';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const store=new Store(resolve(root,process.env.DATA_DIR||'data'),()=>initialData(process.env.PAYMENT_MODE||'simulated'));
const payments=new Payments(store);
const app=new Walkthrough(store,payments);
await app.recoverConfirmed();
const sessions=new Map(),buckets=new Map();
const port=Number(process.env.PORT||3103),host=process.env.HOST||'127.0.0.1';
if(!['127.0.0.1','localhost','::1'].includes(host))throw new Error('This demo has local role switching and must bind to loopback. Add production identity before public hosting.');
const roles={renter:{id:'renter-demo',role:'renter',name:'Alex Morgan'},verifier:{id:'verifier-demo',role:'verifier',name:'Maya Chen'},operator:{id:'operator-demo',role:'operator',name:'Jordan Lee'}};
const allowedOrigins=new Set([`http://localhost:${port}`,`http://127.0.0.1:${port}`,'http://localhost:5173','http://127.0.0.1:5173',process.env.APP_URL].filter(Boolean));
function json(res,status,data){res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data))}
async function body(req){let bytes=0,text='';for await(const chunk of req){bytes+=chunk.length;if(bytes>6_200_000)throw new AppError('Request too large',413);text+=chunk;}try{return JSON.parse(text||'{}')}catch{throw new AppError('Malformed JSON',400)}}
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');
  try{
    const url=new URL(req.url,`http://localhost:${port}`);
    if(url.pathname==='/api/health')return json(res,200,{ok:true,project:'walkthrough',mode:payments.mode});
    if(url.pathname.startsWith('/api/')){
      const key=req.socket.remoteAddress;const now=Date.now();let bucket=buckets.get(key);if(!bucket||now-bucket.at>60000){bucket={at:now,count:0};buckets.set(key,bucket)}if(++bucket.count>240)throw new AppError('Too many requests. Try again in a minute.',429);
      if(req.method!=='GET'&&url.pathname!=='/api/paypal/webhook'){
        if(req.headers.origin&&!allowedOrigins.has(req.headers.origin))throw new AppError('Origin not allowed',403);
        if(!req.headers['content-type']?.includes('application/json'))throw new AppError('JSON content type required',415);
      }
      if(req.method==='POST'&&url.pathname==='/api/session'){
        const input=await body(req);const actor=roles[input.role];if(!actor)throw new AppError('Unknown demo role');const sid=randomBytes(32).toString('hex');const old=req.headers.cookie?.match(/(?:^|;\s*)wt_session=([^;]+)/)?.[1];if(old)sessions.delete(old);sessions.set(sid,{...actor,expires:Date.now()+12*3600000});res.setHeader('Set-Cookie',`wt_session=${sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200`);return json(res,200,{actor,localDemoIdentity:true});
      }
      if(req.method==='POST'&&url.pathname==='/api/paypal/webhook'){
        const event=await body(req);await payments.verifyWebhook(req.headers,event);if(!event.id)throw new AppError('Missing webhook ID');
        await app.webhook(event);
        return json(res,200,{received:true,note:'Provider evidence reconciled and workflow state applied.'});
      }
      const sid=req.headers.cookie?.match(/(?:^|;\s*)wt_session=([^;]+)/)?.[1];const actor=sessions.get(sid);if(!actor||actor.expires<Date.now())throw new AppError('Choose a demo role to start.',401);
      if(req.method==='POST'&&url.pathname==='/api/reset'){await body(req);return json(res,200,{...await app.reset(actor),actor});}
      if(req.method==='GET'&&url.pathname==='/api/state')return json(res,200,{...app.snapshot(actor),actor});
      const report=url.pathname.match(/^\/api\/cases\/([^/]+)\/report$/);
      if(req.method==='GET'&&report){const c=app.get(report[1],actor);if(!c.review)throw new AppError('The independently reviewed report is not available yet.',409);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Content-Security-Policy':"default-src 'none'; img-src data:; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'"});return res.end(printableReport(c));}
      const media=url.pathname.match(/^\/api\/cases\/([^/]+)\/evidence\/([^/]+)$/);
      if(req.method==='GET'&&media){const c=app.get(media[1],actor);const e=c.evidence.find(e=>e.id===media[2]);if(!e)throw new AppError('Evidence not found',404);const [prefix,b64]=e.data.split(',');res.writeHead(200,{'Content-Type':prefix.slice(5).split(';')[0],'Cache-Control':'private, no-store'});return res.end(Buffer.from(b64,'base64'));}
      const action=url.pathname.match(/^\/api\/cases\/([^/]+)\/([a-z-]+)$/);
      if(req.method==='POST'&&(url.pathname==='/api/cases'||action)){const input=await body(req);const result=await app.action(action?.[1],action?.[2]||'create',input,actor);return json(res,200,{result:result?.id?{id:result.id}:result,...app.snapshot(actor),actor});}
      throw new AppError('API route not found',404);
    }
    if(req.method!=='GET')throw new AppError('Method not allowed',405);
    const dist=resolve(root,'dist');let file=resolve(dist,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(dist+'/'))file=resolve(dist,'index.html');if(!existsSync(file)||!statSync(file).isFile())file=resolve(dist,'index.html');
    if(!existsSync(file)){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('Walkthrough API is running. Use npm run dev for the app, or npm run build then npm start.');}
    const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
    res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(readFileSync(file));
  }catch(error){json(res,error.status||500,{error:error.status?error.message:'Service operation could not be completed. Check configuration and reconcile any unresolved payment.'});}
});
const expiryTimer=setInterval(()=>app.expireDue().catch(()=>console.error('Expiry sweep failed; operator review required')),60000);expiryTimer.unref();
app.expireDue().catch(()=>console.error('Initial expiry sweep failed; operator review required'));
server.listen(port,host,()=>console.log(`Walkthrough: http://${host}:${port} · payments ${payments.mode} · local synthetic-data demo`));
