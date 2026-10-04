// Portable copy of the impact judge's isolated reproduction.
// Usage: node impact-repro.mjs /path/to/walkthrough-at-521a0f4
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = resolve(process.argv[2] || '.');
const load = file => import(pathToFileURL(resolve(root, file)).href);
const { MemoryStore } = await load('server/store.mjs');
const { Walkthrough, initialData } = await load('server/domain.mjs');
const { Payments } = await load('server/payments.mjs');
globalThis.fetch = async () => { throw new Error('External requests prohibited in judging reproduction'); };
const store = new MemoryStore(initialData);
const app = new Walkthrough(store, new Payments(store, { PAYMENT_MODE: 'simulated' }), { AI_MODE: 'rules' });
const renter = { role: 'renter', id: 'renter-demo' };
const c = await app.action(null, 'create', {
  listing: 'One-bedroom apartment with kitchen and bathroom. The basement contains shared laundry.',
  questions: 'Please photograph basement water stains and check whether the washing machine is present.',
  consent: true
}, renter);
await app.action(c.id, 'checklist', {}, renter);
assert.equal(c.scope.some(i => /basement|laundry|washing|water stains/i.test(i.request)), false);
await app.action(c.id, 'scope', { accepted: true, access: true, contact: 'Consented staged access contact', slotId: 'maya-am' }, renter);
assert.equal(c.scopeAccepted, true);
console.log(JSON.stringify({ mode: c.ai.mode, questions: c.questions, scopeAccepted: c.scopeAccepted, requests: c.scope.map(i => i.request), customQuestionCovered: false }, null, 2));
