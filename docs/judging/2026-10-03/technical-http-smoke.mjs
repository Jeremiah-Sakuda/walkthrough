// Offline HTTP smoke with an ephemeral listener and disposable simulated state.
// Usage: node technical-http-smoke.mjs /absolute/source/root
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(process.argv[2]||'.'),dir=mkdtempSync(join(tmpdir(),'walkthrough-http-'));
const server=spawn(process.execPath,[join(root,'server/index.mjs')],{cwd:root,env:{...process.env,PORT:'33213',HOST:'127.0.0.1',DATA_DIR:dir,PAYMENT_MODE:'simulated',AI_MODE:'rules'},stdio:['ignore','pipe','pipe']});
let stderr='';server.stderr.on('data',b=>stderr+=b);
const exited=new Promise(resolve=>server.once('exit',resolve));
const base='http://127.0.0.1:33213';
try {
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(new Error('Server exited '+c+' '+stderr)));});
 let r=await fetch(base+'/api/health');assert.equal(r.status,200);assert.equal((await r.json()).mode,'simulated');
 r=await fetch(base+'/api/state');assert.equal(r.status,401);
 r=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'renter'})});assert.equal(r.status,200);const cookie=r.headers.get('set-cookie').split(';')[0];
 r=await fetch(base+'/api/state',{headers:{cookie}});assert.equal(r.status,200);const state=await r.json();const id=state.cases[0].id;
 r=await fetch(base+`/api/cases/${id}/review`,{method:'POST',headers:{'Content-Type':'application/json',cookie},body:JSON.stringify({confirmed:true,note:'Unauthorized reviewer test.'})});assert.equal(r.status,403);
 r=await fetch(base+'/api/session',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://foreign.example'},body:JSON.stringify({role:'operator'})});assert.equal(r.status,403);
 r=await fetch(base+'/');assert.equal(r.status,200);assert.match(r.headers.get('content-security-policy'),/default-src 'self'/);assert.match(await r.text(),/root/);
 console.log('HTTP smoke passed: health, anonymous denial, renter session/state, role enforcement, cross-origin rejection, production HTML/CSP. Isolated port 33213/data directory.');
} finally {if(server.exitCode===null)server.kill();await exited;rmSync(dir,{recursive:true,force:true});}
