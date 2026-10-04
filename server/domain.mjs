import { randomUUID,createHash } from 'node:crypto';
import { ruleChecklist,checklist,assess } from './ai.mjs';
export const FEE=6000,EARNING=4000,APPEAL_MS=48*60*60*1000;
export const exampleListing='Sunny one-bedroom apartment in Cambridge. Recently renovated kitchen with a dishwasher. Bedroom has large windows and natural light. Updated bathroom with new fixtures. Building entrance on Garden Street. Available for a 12-month lease.';
export class AppError extends Error{constructor(message,status=400){super(message);this.status=status;}}
const need=(ok,message,status=400)=>{if(!ok)throw new AppError(message,status)};
const clean=(x,max=500)=>typeof x==='string'?x.trim().slice(0,max):'';
function makeCase(input,now){const listing=clean(input.listing,5000);return {id:randomUUID(),title:clean(input.title,120)||'New apartment walkthrough',address:clean(input.address,200)||'Address to confirm',listing,source:clean(input.source,250)||'Renter-provided listing text',questions:clean(input.questions,1000),createdAt:now,listingCapturedAt:now,renterId:'renter-demo',state:'awaiting_access',scope:ruleChecklist(listing),scopeAccepted:false,access:false,slotId:null,verifierId:null,feeMinor:FEE,currency:'USD',payment:{status:'not_authorized',mode:'simulated'},earning:{status:'pending',amountMinor:EARNING,payoutStatus:'not_submitted'},evidence:[],assessment:[],audit:[{at:now,actor:'renter',action:'Created listing snapshot'}],ai:{mode:'rules',label:'Deterministic demo checklist · no model call',tokens:0,costUsd:0}};}
export function initialData(mode='simulated'){const now=new Date().toISOString();const c=makeCase({title:'The Garden Street apartment',address:'Garden Street, Cambridge · synthetic listing',listing:exampleListing,questions:'Does the kitchen really include a dishwasher? How much natural light reaches the bedroom?',source:'Synthetic demo listing · no live property'},now);c.payment.mode=mode;return {version:1,paymentMode:mode,cases:[c],operations:[],webhookIds:[],slots:[{id:'maya-am',verifierId:'verifier-demo',name:'Maya Chen',initials:'MC',label:'Tomorrow · 10:00–10:45 am',day:'Tomorrow',time:'10:00 am',area:'Cambridge',caseId:null},{id:'maya-pm',verifierId:'verifier-demo',name:'Maya Chen',initials:'MC',label:'Tomorrow · 2:00–2:45 pm',day:'Tomorrow',time:'2:00 pm',area:'Cambridge',caseId:null},{id:'leo-am',verifierId:'verifier-leo',name:'Leo Martin',initials:'LM',label:'In 2 days · 9:00–9:45 am',day:'In 2 days',time:'9:00 am',area:'Cambridge',caseId:null}]};}
export class Walkthrough {
  constructor(store,payments,env=process.env){this.store=store;this.payments=payments;this.env=env;this.queue=Promise.resolve();}
  now(){return new Date().toISOString()}
  run(fn){const next=this.queue.then(fn);this.queue=next.catch(()=>{});return next;}
  role(actor,...allowed){need(allowed.includes(actor.role),'This action requires the correct independent role.',403);}
  get(id,actor){const c=this.store.data.cases.find(c=>c.id===id);need(c,'Case not found',404);if(actor.role==='renter')need(c.renterId===actor.id,'Case not found',404);if(actor.role==='verifier')need(!c.verifierId||c.verifierId===actor.id,'This case is assigned to a different verifier.',403);return c;}
  audit(c,actor,action){c.audit.push({at:this.now(),actor:actor.role,action});this.store.save();}
  snapshot(actor){return {mode:this.payments.mode,aiMode:this.env.AI_MODE||'rules',cases:this.store.data.cases.filter(c=>actor.role==='operator'||actor.role==='renter'&&c.renterId===actor.id||actor.role==='verifier'&&c.verifierId===actor.id).map(c=>({...c,evidence:c.evidence.map(({data,...rest})=>rest)})),slots:this.store.data.slots,operations:this.store.data.operations.filter(o=>actor.role==='operator'||this.store.data.cases.some(c=>c.id===o.caseId&&(c.renterId===actor.id||c.verifierId===actor.id))).map(({simulatedProviderResult,result,...o})=>({...o,providerId:result?.id})),now:this.now()};}
  async action(id,action,input,actor){return this.run(async()=>{
    if(action==='create'){this.role(actor,'renter');need(clean(input.listing,5000).length>=30,'Add at least 30 characters of listing text.');need(input.consent===true,'Confirm you have permission to share this listing.');need(this.store.data.cases.length<100,'Demo case limit reached.');const c=makeCase(input,this.now());c.payment.mode=this.payments.mode;this.store.data.cases.push(c);this.store.save();return c;}
    const c=this.get(id,actor);
    if(action==='checklist'){
      this.role(actor,'renter');need(['awaiting_access','awaiting_authorization'].includes(c.state)&&!c.scopeAccepted,'Checklist is frozen after you accept the scope.');
      c.aiAttempts=(c.aiAttempts||0)+1;need(c.aiAttempts<=3,'Checklist generation is limited to three attempts per case. Use the manual scope.');this.store.save();
      try{const result=await checklist(c.listing,c.questions,this.env);c.scope=result.items;c.ai=result.meta;this.audit(c,actor,'Generated grounded checklist');}catch(e){c.ai={...c.ai,error:e.message};this.store.save();throw new AppError(e.message,502);}return c;
    }
    if(action==='scope'){
      this.role(actor,'renter');need(['awaiting_access','awaiting_authorization'].includes(c.state),'Scope can no longer change.');need(input.accepted===true,'Accept the fixed $60 service scope and completion terms.');need(input.access===true,'Confirm that the listing contact has agreed to allow access.');const slot=this.store.data.slots.find(s=>s.id===input.slotId);need(slot&&!slot.caseId,'Choose an available verifier appointment.',409);const contact=clean(input.contact,200);need(contact.length>2,'Enter the access contact or synthetic demo contact.');c.scopeAccepted=true;c.acceptedAt=this.now();c.access=true;c.accessContact=contact;c.slotId=slot.id;c.verifierId=slot.verifierId;c.state='awaiting_authorization';this.audit(c,actor,'Accepted fixed scope, service terms, and access confirmation');return c;
    }
    if(action==='reschedule'){
      this.role(actor,'renter');need(c.state==='awaiting_authorization'&&c.payment.status==='not_authorized','Only an uncharged tentative appointment can be changed.');need(input.access===true,'Confirm access for the new time.');const slot=this.store.data.slots.find(s=>s.id===input.slotId);need(slot&&!slot.caseId,'Choose an available appointment.',409);c.slotId=slot.id;c.verifierId=slot.verifierId;this.audit(c,actor,'Changed tentative appointment; frozen service scope preserved');return c;
    }
    if(action==='order'){
      this.role(actor,'renter');need(c.state==='awaiting_authorization'&&c.scopeAccepted&&c.access,'Approve the scope and confirm access first.');if(c.payment.orderId)return {orderId:c.payment.orderId,approveUrl:c.payment.approveUrl};
      const result=await this.payments.operation(c,'order');c.payment.orderId=result.id;c.payment.approveUrl=result.links?.find(x=>['approve','payer-action'].includes(x.rel))?.href;this.audit(c,actor,'Created verification-fee checkout');return {orderId:result.id,approveUrl:c.payment.approveUrl};
    }
    if(action==='authorize'){
      this.role(actor,'renter');need(c.state==='awaiting_authorization'&&c.scopeAccepted&&c.access,'Confirm scope and access before authorizing.');need(c.payment.orderId,'Create a checkout first.');const slot=this.store.data.slots.find(s=>s.id===c.slotId);need(!slot.caseId||slot.caseId===c.id,'Appointment was taken before authorization. Select another available time.',409);
      try{const result=await this.payments.operation(c,'authorize',this.payments.mode==='simulated'&&input.simulateTimeout===true);c.payment.authorizationId=result.id;c.payment.status='authorized';c.payment.authorizedAt=this.now();c.payment.expiresAt=new Date(Date.now()+48*3600000).toISOString();await this.lockSlot(c,actor);this.audit(c,actor,'Authorized $60 verification fee and locked appointment');}catch(e){if(!c.payment.authorizationId)c.payment.status='unknown';this.store.save();throw new AppError(e.message,409);}return c;
    }
    if(action==='start'){
      this.role(actor,'verifier');need(c.state==='scheduled'&&c.payment.status==='authorized','A confirmed appointment and authorization are required.');need(Date.parse(c.payment.expiresAt)>Date.now(),'The service authorization window expired. Ask the operator to void it.');c.state='in_progress';c.session={id:randomUUID(),phrase:`GARDEN ${Math.floor(1000+Math.random()*9000)}`,issuedAt:this.now()};this.audit(c,actor,'Started visit and issued fresh session challenge');return c;
    }
    if(action==='evidence'){
      this.role(actor,'verifier');need(c.state==='in_progress','Start the visit before adding evidence.');need(input.sessionId===c.session.id&&input.challenge===c.session.phrase,'Evidence must reference the current visit session and challenge.');need(c.scope.some(i=>i.id===input.itemId),'Select a checklist item.');need(c.evidence.length<12,'This demo supports up to 12 images per case.');need(['matched','inconsistent','uncertain'].includes(input.observation),'Choose an observation status.');const note=clean(input.note,1000);need(note.length>=10,'Add a specific observation of at least 10 characters.');
      let data=input.data;need(typeof data==='string'&&data.length<6_000_000,'Image exceeds the 4 MB demo limit.');need(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data),'Upload a PNG, JPEG, or WebP image.');const bytes=Buffer.from(data.split(',')[1],'base64');need(bytes.length<=4*1024*1024,'Image exceeds the 4 MB demo limit.');const magic=bytes.subarray(0,12);need(magic.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))||magic[0]===255&&magic[1]===216&&magic[2]===255||magic.subarray(0,4).toString()==='RIFF'&&magic.subarray(8,12).toString()==='WEBP','File does not match a supported image format.');
      const hash=createHash('sha256').update(bytes).digest('hex');need(!this.store.data.cases.some(other=>other.evidence.some(e=>e.hash===hash)),'This exact file has already been submitted. Capture a fresh image.',409);const e={id:randomUUID(),itemId:input.itemId,sessionId:c.session.id,challenge:c.session.phrase,receivedAt:this.now(),hash,data,observation:input.observation,note,synthetic:input.synthetic===true};c.evidence.push(e);this.audit(c,actor,`Added ${e.synthetic?'synthetic demo':'uploaded'} evidence for ${input.itemId}`);return {id:e.id};
    }
    if(action==='submit'){
      this.role(actor,'verifier');need(c.state==='in_progress','The visit is not in progress.');need(c.evidence.length>0,'Add evidence before submitting.');c.assessment=assess(c);c.state='evidence_review';this.audit(c,actor,'Submitted evidence for independent completion review');return c;
    }
    if(action==='review'){
      this.role(actor,'operator');need(c.state==='evidence_review','This case is not awaiting independent review.');need(c.payment.status==='authorized'&&Date.parse(c.payment.expiresAt)>Date.now(),'The service authorization window expired or is unresolved. Close the incomplete service and void the hold.');need(actor.id!==c.verifierId,'Verifiers cannot approve their own work.',403);need(input.confirmed===true,'Confirm that each agreed deliverable was independently reviewed.');c.assessment=assess(c);need(c.assessment.every(x=>x.evidenceIds.length),'Missing evidence prevents service completion. Mark the visit incomplete or return it for evidence.');need(clean(input.note,1000).length>=10,'Add a specific independent review note.');c.review={operatorId:actor.id,note:clean(input.note,1000),completedAt:this.now()};c.state='complete';c.earning.status='pending';c.earning.eligibleAt=new Date(Date.now()+APPEAL_MS).toISOString();this.audit(c,actor,'Independently approved completed service; published evidence report');
      await this.capture(c,actor,input.simulateTimeout);return c;
    }
    if(action==='return'){
      this.role(actor,'operator');need(c.state==='evidence_review','Case is not in review.');c.state='in_progress';this.audit(c,actor,'Returned evidence package for additional coverage');return c;
    }
    if(['incomplete','cancel','expire'].includes(action)){
      this.role(actor,...(action==='cancel'?['renter','operator']:['verifier','operator']));need(!['complete','disputed','cancelled','incomplete'].includes(c.state),'Closed cases cannot be cancelled or voided.');need(c.payment.status!=='unknown','Reconcile the unknown payment before closing the service.');c.state=action==='cancel'?'cancelled':'incomplete';c.closureReason=clean(input.reason,500)||'Access unavailable or service incomplete';this.releaseSlot(c);this.audit(c,actor,`Service ${c.state}: ${c.closureReason}`);if(c.payment.status==='authorized')await this.void(c,actor);return c;
    }
    if(action==='reconcile'){
      this.role(actor,'operator');return this.reconcileCase(c,actor);
    }
    if(action==='appeal'){
      this.role(actor,'renter');need(c.state==='complete'&&!c.appeal,'Only a completed report can be appealed once.');need(Date.now()<Date.parse(c.earning.eligibleAt),'The 48-hour in-app appeal window has ended. Contact the service operator.');need(clean(input.reason,1000).length>=10,'Describe the issue in at least 10 characters.');c.appeal={reason:clean(input.reason,1000),at:this.now(),status:'open'};c.state='disputed';c.earning.status='held';this.audit(c,actor,'Opened service appeal; held unpaid verifier earning');return c;
    }
    if(action==='resolve'){
      this.role(actor,'operator');need(c.state==='disputed','No active appeal.');need(clean(input.note,1000).length>=10,'Explain the appeal decision.');need(['uphold','refund'].includes(input.decision),'Choose an appeal outcome.');if(input.decision==='refund'){need(c.payment.status==='captured','A confirmed capture is required before refund.');c.payment.status='refund_pending';this.store.save();try{const r=await this.payments.operation(c,'refund');c.payment.status='refunded';c.payment.refundId=r.id;}catch(e){c.payment.status='unknown';c.payment.error=e.message;}}
      c.appeal.status=input.decision;c.appeal.resolution=clean(input.note,1000);c.state='complete';c.earning.status=input.decision==='refund'?'held':'pending';this.audit(c,actor,`Resolved appeal: ${input.decision}`);return c;
    }
    if(action==='eligibility'){
      this.role(actor,'operator');need(c.state==='complete'&&c.payment.status==='captured'&&c.earning.status==='pending','Only undisputed, captured service earnings can become eligible.');need(Date.now()>=Date.parse(c.earning.eligibleAt),'The 48-hour appeal window has not elapsed.');c.earning.status='eligible';this.audit(c,actor,'Verifier earning eligible; payout not submitted');return c;
    }
    if(action==='advance-demo'){
      this.role(actor,'operator');need(this.payments.mode==='simulated','Demo clock is unavailable in sandbox mode.');need(c.state==='complete'&&c.payment.status==='captured'&&c.earning.status==='pending','Complete and capture the service before advancing the demo appeal clock.');c.earning.eligibleAt=new Date(Date.now()-1).toISOString();c.earning.clockSimulated=true;this.audit(c,actor,'Simulated passage of the 48-hour appeal window');return c;
    }
    throw new AppError('Unknown action',404);
  });}
  async reconcileCase(c,actor){const ops=await this.payments.reconcile(c);for(const op of ops.filter(o=>o.status==='confirmed')){
        if(op.type==='order'){c.payment.orderId=op.result.id;c.payment.approveUrl=op.result.links?.find(x=>['approve','payer-action'].includes(x.rel))?.href;}
        if(op.type==='authorize'){c.payment.authorizationId=op.result.id;c.payment.status='authorized';c.payment.expiresAt=new Date(Date.now()+48*3600000).toISOString();if(['cancelled','incomplete'].includes(c.state))await this.void(c,actor);else await this.lockSlot(c,actor);}
        if(op.type==='capture'){c.payment.status='captured';c.payment.captureId=op.result.id;c.earning.fundingRequired=false;}
        if(op.type==='void')c.payment.status='voided';
        if(op.type==='refund'){c.payment.status='refunded';c.earning.status='held';}
      }if(!this.store.data.operations.some(o=>o.caseId===c.id&&o.status!=='confirmed'))delete c.payment.error;this.audit(c,actor,'Reconciled unresolved provider operations');return c;

  }
  async reset(actor){return this.run(async()=>{this.role(actor,'operator');need(this.payments.mode==='simulated','Reset is available only for simulated demo data.');this.store.data=initialData();this.store.save();return this.snapshot(actor);});}
  async expireDue(){return this.run(async()=>{for(const c of this.store.data.cases){if(['scheduled','in_progress','evidence_review'].includes(c.state)&&c.payment.status==='authorized'&&Date.parse(c.payment.expiresAt)<=Date.now()){c.state='incomplete';c.closureReason='48-hour service window expired';this.releaseSlot(c);await this.void(c,{role:'operator',id:'expiry-worker'});}}});}
  async webhook(event){return this.run(async()=>{if(this.store.data.webhookIds.includes(event.id))return;const ids=[event.resource?.id,event.resource?.supplementary_data?.related_ids?.order_id,event.resource?.supplementary_data?.related_ids?.authorization_id];const c=this.store.data.cases.find(c=>[c.payment.orderId,c.payment.authorizationId,c.payment.captureId].filter(Boolean).some(id=>ids.includes(id)));if(c)await this.reconcileCase(c,{role:'operator',id:'webhook-reconciliation'});this.store.data.webhookIds.push(event.id);this.store.save();});}
  async lockSlot(c,actor){const slot=this.store.data.slots.find(s=>s.id===c.slotId);if(slot.caseId&&slot.caseId!==c.id){c.state='incomplete';c.closureReason='Appointment became unavailable after authorization';await this.void(c,actor);return;}slot.caseId=c.id;c.state='scheduled';this.store.save();}
  releaseSlot(c){const slot=this.store.data.slots.find(s=>s.id===c.slotId);if(slot?.caseId===c.id)slot.caseId=null;}
  async capture(c,actor,timeout){c.payment.status='capture_pending';this.store.save();try{const r=await this.payments.operation(c,'capture',this.payments.mode==='simulated'&&timeout===true);c.payment.captureId=r.id;c.payment.status='captured';this.audit(c,actor,'Captured $60 fee for delivered service');}catch(e){c.payment.status='unknown';c.payment.error=e.message;c.earning.fundingRequired=true;this.audit(c,actor,'Capture outcome unknown; report remains available and earning obligation preserved');}}
  async void(c,actor){c.payment.status='void_pending';this.store.save();try{const r=await this.payments.operation(c,'void');c.payment.status='voided';c.payment.voidId=r.id;this.audit(c,actor,'Confirmed authorization void for incomplete service');}catch(e){c.payment.status='unknown';c.payment.error=e.message;this.audit(c,actor,'Void outcome unknown; reconciliation required');}}
}
