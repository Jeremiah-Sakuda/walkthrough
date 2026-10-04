import { randomUUID } from 'node:crypto';
export class Payments {
  constructor(store,env=process.env){this.store=store;this.env=env;this.mode=env.PAYMENT_MODE||'simulated';if(!['simulated','sandbox'].includes(this.mode))throw new Error('PAYMENT_MODE must be simulated or sandbox');if(store.data.paymentMode&&store.data.paymentMode!==this.mode)throw new Error('Stored payment mode differs. Use a separate DATA_DIR for each mode.');store.data.paymentMode=this.mode;}
  async request(path,{method='GET',body,id}={}){
    if(!this.env.PAYPAL_CLIENT_ID||!this.env.PAYPAL_CLIENT_SECRET)throw new Error('PayPal sandbox credentials are missing');
    const root='https://api-m.sandbox.paypal.com';
    const auth=await fetch(root+'/v1/oauth2/token',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:'Basic '+Buffer.from(`${this.env.PAYPAL_CLIENT_ID}:${this.env.PAYPAL_CLIENT_SECRET}`).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});
    if(!auth.ok)throw new Error('PayPal sandbox authentication failed');
    const {access_token}=await auth.json();
    const result=await fetch(root+path,{method,signal:AbortSignal.timeout(20000),headers:{Authorization:`Bearer ${access_token}`,'Content-Type':'application/json',...(id?{'PayPal-Request-Id':id}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
    if(!result.ok)throw new Error(`PayPal sandbox returned HTTP ${result.status}; reconcile before retrying`);
    return result.status===204?{}:result.json();
  }
  async operation(c,type,simulateTimeout=false){
    const key=`${c.id}:${type}`;let op=this.store.data.operations.find(o=>o.key===key);
    if(op){if(op.status==='confirmed')return op.result;throw new Error('An operation is unresolved. Reconcile it before continuing.');}
    op={id:randomUUID(),key,caseId:c.id,type,status:'pending',mode:this.mode,createdAt:new Date().toISOString()};this.store.data.operations.push(op);this.store.save();
    try{
      let result;
      if(this.mode==='simulated'){
        result={id:`SIM-${type.toUpperCase()}-${randomUUID().slice(0,8)}`,status:{order:'CREATED',authorize:'CREATED',capture:'COMPLETED',void:'VOIDED',refund:'COMPLETED'}[type],simulated:true};
        op.simulatedProviderResult=result;this.store.save();
        if(simulateTimeout)throw new Error('Simulated response loss. The provider outcome is unknown until reconciliation.');
      }else{
        const id=op.id;
        if(type==='order'){result=await this.request('/v2/checkout/orders',{method:'POST',id,body:{intent:'AUTHORIZE',purchase_units:[{reference_id:c.id,custom_id:c.id,description:'Walkthrough apartment verification service only',amount:{currency_code:'USD',value:'60.00'}}],payment_source:{paypal:{experience_context:{return_url:`${this.env.APP_URL||'http://localhost:3103'}/?approved=${c.id}`,cancel_url:`${this.env.APP_URL||'http://localhost:3103'}/?cancelled=${c.id}`,user_action:'PAY_NOW',shipping_preference:'NO_SHIPPING'}}}}});}
        if(type==='authorize'){const order=await this.request(`/v2/checkout/orders/${c.payment.orderId}/authorize`,{method:'POST',id,body:{}});result=order.purchase_units?.[0]?.payments?.authorizations?.[0];if(!result?.id||result.status!=='CREATED'||result.amount?.currency_code!=='USD'||result.amount?.value!=='60.00')throw new Error('Authorization not confirmed by PayPal');}
        if(type==='capture'){result=await this.request(`/v2/payments/authorizations/${c.payment.authorizationId}/capture`,{method:'POST',id,body:{amount:{currency_code:'USD',value:'60.00'},final_capture:true}});if(!result.id||result.amount?.currency_code!=='USD'||result.amount?.value!=='60.00'||result.status!=='COMPLETED')throw new Error('Capture is not confirmed complete');}
        if(type==='void'){await this.request(`/v2/payments/authorizations/${c.payment.authorizationId}/void`,{method:'POST',id});result={id:c.payment.authorizationId,status:'VOIDED'};}
        if(type==='refund'){result=await this.request(`/v2/payments/captures/${c.payment.captureId}/refund`,{method:'POST',id,body:{amount:{currency_code:'USD',value:'60.00'},note_to_payer:'Walkthrough service appeal refund'}});if(!result.id||result.amount?.currency_code!=='USD'||result.amount?.value!=='60.00'||result.status!=='COMPLETED')throw new Error('Refund is not confirmed complete');}
      }
      op.status='confirmed';op.result=result;op.confirmedAt=new Date().toISOString();this.store.save();return result;
    }catch(error){op.status='unknown';op.error=error.message;this.store.save();throw error;}
  }
  async reconcile(c){
    const ops=this.store.data.operations.filter(o=>o.caseId===c.id&&o.status!=='confirmed');
    for(const op of ops){let result;
      if(this.mode==='simulated')result=op.simulatedProviderResult;
      else{
        if(op.type==='authorize'&&c.payment.orderId){const order=await this.request(`/v2/checkout/orders/${c.payment.orderId}`);result=order.purchase_units?.[0]?.payments?.authorizations?.find(a=>a.status==='CREATED');}
        if(op.type==='capture'&&c.payment.orderId){const order=await this.request(`/v2/checkout/orders/${c.payment.orderId}`);result=order.purchase_units?.[0]?.payments?.captures?.find(a=>a.status==='COMPLETED');}
        if(op.type==='void'&&c.payment.authorizationId){const auth=await this.request(`/v2/payments/authorizations/${c.payment.authorizationId}`);if(auth.status==='VOIDED')result=auth;}
        if(op.type==='refund'&&c.payment.captureId){const capture=await this.request(`/v2/payments/captures/${c.payment.captureId}`);if(capture.status==='REFUNDED')result={id:c.payment.captureId,status:'COMPLETED'};}
      }
      if(result&&this.mode==='sandbox'&&['authorize','capture'].includes(op.type)&&(!result.id||result.amount?.currency_code!=='USD'||result.amount?.value!=='60.00'))result=undefined;
      if(result){op.status='confirmed';op.result=result;op.reconciledAt=new Date().toISOString();}else op.error='Provider outcome remains unresolved. No repeat charge was sent. Inspect the PayPal sandbox dashboard.';
    }
    this.store.save();return ops;
  }
  async verifyWebhook(headers,event){
    if(this.mode!=='sandbox'||!this.env.PAYPAL_WEBHOOK_ID)throw new Error('Webhooks require sandbox mode and a configured webhook ID');
    const result=await this.request('/v1/notifications/verify-webhook-signature',{method:'POST',body:{auth_algo:headers['paypal-auth-algo'],cert_url:headers['paypal-cert-url'],transmission_id:headers['paypal-transmission-id'],transmission_sig:headers['paypal-transmission-sig'],transmission_time:headers['paypal-transmission-time'],webhook_id:this.env.PAYPAL_WEBHOOK_ID,webhook_event:event}});
    if(result.verification_status!=='SUCCESS')throw new Error('Invalid webhook signature');
  }
}
