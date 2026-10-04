// Portable, offline reproductions. Usage: node technical-repro.mjs /absolute/source/root
// The source tree is read-only to this script. Every payment is simulated.
import assert from 'node:assert/strict';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
const root=resolve(process.argv[2]||'.');
const load=p=>import(pathToFileURL(join(root,p)));
const {Store,MemoryStore}=await load('server/store.mjs');
const {Walkthrough,initialData}=await load('server/domain.mjs');
const {Payments}=await load('server/payments.mjs');
const {checklist}=await load('server/ai.mjs');
const renter={role:'renter',id:'renter-demo'},verifier={role:'verifier',id:'verifier-demo'},operator={role:'operator',id:'operator-demo'};
function setup(){const store=new MemoryStore(initialData);return {store,app:new Walkthrough(store,new Payments(store,{PAYMENT_MODE:'simulated'}),{}),c:store.data.cases[0]};}
async function prepare(app,c){
 await app.action(c.id,'scope',{accepted:true,access:true,contact:'Synthetic test contact',slotId:'maya-am'},renter);
 await app.action(c.id,'order',{},renter);await app.action(c.id,'authorize',{},renter);await app.action(c.id,'start',{},verifier);
}
async function cover(app,c,corrupt=false){
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=','base64');
 for(const item of c.scope){
  const bytes=corrupt?Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.from('NOT-A-PNG-'+item.id)]):Buffer.concat([png,Buffer.from(item.id)]);
  await app.action(c.id,'evidence',{itemId:item.id,sessionId:c.session.id,challenge:c.session.phrase,observation:'uncertain',note:'Synthetic test payload for coverage validation.',synthetic:true,data:'data:image/png;base64,'+bytes.toString('base64')},verifier);
 }
 await app.action(c.id,'submit',{},verifier);
}
const review={confirmed:true,note:'Synthetic operator approval for regression reproduction.'};

// 1. Restore exactly the image of state saved after confirmed capture, before the
// caller applies its result. This is an existing Store.save boundary, not an
// invented provider response or an arbitrary hand-edited case state.
{
 const {store,app,c}=setup();await prepare(app,c);await cover(app,c);
 let checkpoint;
 store.save=()=>{if(!checkpoint&&c.payment.status==='capture_pending'&&store.data.operations.some(o=>o.type==='capture'&&o.status==='confirmed'))checkpoint=JSON.stringify(store.data);};
 await app.action(c.id,'review',review,operator);assert.ok(checkpoint);
 const dir=mkdtempSync(join(tmpdir(),'walkthrough-judge-crash-'));
 try{
  writeFileSync(join(dir,'walkthrough.json'),checkpoint);
  const restored=new Store(dir,initialData),restarted=new Walkthrough(restored,new Payments(restored,{PAYMENT_MODE:'simulated'}),{}),rc=restored.data.cases[0];
  assert.equal(rc.payment.status,'capture_pending');
  await restarted.action(rc.id,'reconcile',{},operator);await restarted.expireDue();
  assert.equal(rc.payment.status,'capture_pending');
  assert.equal(restored.data.operations.find(o=>o.type==='capture').status,'confirmed');
  await assert.rejects(restarted.action(rc.id,'review',review,operator),/not awaiting/);
  await assert.rejects(restarted.action(rc.id,'eligibility',{},operator),/captured/);
  console.log('OBSERVED crash checkpoint: service complete, capture operation confirmed, case capture_pending; reconcile + expiry cannot recover.');
 }finally{rmSync(dir,{recursive:true,force:true});}
}

// 2. These payloads have the PNG magic prefix but no IHDR or actual image data.
// An honest human reviewer may reject them; the software coverage gate does not.
{
 const {app,c}=setup();await prepare(app,c);await cover(app,c,true);
 await app.action(c.id,'review',review,operator);
 assert.equal(c.payment.status,'captured');assert.equal(c.evidence.length,4);
 console.log('OBSERVED corrupt media: four non-decodable PNG-prefix payloads count as complete coverage and can be operator-approved/captured.');
}

// 3. A deliberately synthetic, schema-valid output_text fixture exercises local
// post-validation only; it is not evidence that an actual model emits this output.
{
 const oldFetch=globalThis.fetch;
 globalThis.fetch=async()=>new Response(JSON.stringify({output:[{type:'message',role:'assistant',content:[{type:'output_text',text:JSON.stringify({items:[1,2,3].map(i=>({title:'Generic item '+i,claim:'',request:'Look at the room.'}))})}]}],usage:{total_tokens:50}}),{status:200,headers:{'Content-Type':'application/json'}});
 try{
  const out=await checklist('Apartment with a kitchen and a bathroom.','Does it have a dishwasher?',{AI_MODE:'openai',OPENAI_API_KEY:'OFFLINE-FIXTURE'});
  assert.equal(out.items.length,3);assert.ok(out.items.every(i=>i.claim===''));
  console.log('OBSERVED validator: three empty claims accepted as listing-grounded model checklist; no network request made.');
 }finally{globalThis.fetch=oldFetch;}
}
