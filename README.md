# Walkthrough

**See it before you sign.** A local, working apartment-verification demo for remote renters. A renter pays for a bounded evidence package, not a guarantee about a property. An unfavorable finding can still represent complete, paid work.

Built for the PayPal AI Hackathon. React frontend, Node 22 backend, atomic local JSON persistence, optional PayPal sandbox and OpenAI integrations. MIT licensed.

## Run locally

Requires Node **22.22+** and npm.

```sh
npm ci
npm run build
npm start
```

Open **http://localhost:3103**. No credentials, PayPal account, model key, or payment is needed in the default demo. The backend binds to loopback and deliberately refuses public hosts because role selection is a local demonstration identity system.

For development:

```sh
npm run dev
```

This starts the API on **3103** and Vite on **5173**. Open **http://localhost:5173**. Both processes stop with Ctrl+C. Vite uses a strict port and polling; the backend uses no file watcher to avoid host file-descriptor limits. Restart after backend edits.

```sh
npm test       # 17 meaningful state/workflow regression tests
npm run build # production frontend
npm run check # both
```

## A three-minute demo

1. Stay in **Renter · Alex**. Open the seeded Garden Street listing. Inspect the source-linked checklist and the specific dishwasher question.
2. Select Maya's available appointment. Confirm access and accept the fixed scope and service terms. Click **Authorize $60 · simulated**. The hold and locked appointment are now separate recorded facts.
3. Switch to **Verifier · Maya**, start the session, and add a **staged sample** for each item. These generated PNG illustrations are explicitly labeled synthetic and include the session challenge. The kitchen sample is an unfavorable observation.
4. Submit for independent review. Switch to **Operator · Jordan**. Inspect each linked image, enter review notes, and confirm the deliverable. Optionally enable **lose the capture response** before approving to demonstrate an unknown payment outcome.
5. A completed service publishes its report regardless of the finding. If the response was lost, open **Activity → Reconcile provider state**. Exactly one simulated capture is confirmed.
6. Switch to Renter to read/download the report or appeal. An appeal holds the earning for independent review. The operator can uphold or refund the service.
7. In Operator Activity, **Demo: advance 48 hours**, then **Check payout eligibility**. The $40 earning becomes eligible; **no payout is sent**.
8. For the failure path, create a new case and authorize it. The verifier chooses **Access unavailable · stop safely**. The incomplete service voids the hold and releases the appointment; it makes no fraud verdict.

To repeat the demonstration, use **Operator → footer → Reset demo** and confirm. Reset exists only in simulated mode and removes local demo cases, images, and financial records. Sandbox state cannot be reset this way.

## What works

- Listing snapshots with bounded text, source, capture time, explicit sharing consent, and renter questions.
- Grounded, reviewable checklist generation; deterministic credential-free mode plus a connected optional OpenAI structured-output path.
- Renter approval freezes the scope, fixed $60 USD fee, cancellation rule, and 48-hour appeal window.
- Access confirmation, tentative appointment selection, serialized slot locking after authorization, conflict recovery via appointment-only rescheduling, and late authorization followed by void when the slot is taken.
- Distinct local renter, verifier, and independent operator permissions, enforced by the server with opaque session cookies.
- Session-specific challenges; PNG/JPEG/WebP upload; server timestamps; SHA-256 exact-file reuse rejection across cases. Up to **12 images, 4 MB each**. No video support in this build.
- Evidence item associations and explicit matched/inconsistent/uncertain/missing findings, based on the verifier's stated observation plus deterministic coverage checks.
- Human completion review before capture; missing coverage blocks completion. Favorable results are not required for the agreed $40 earning.
- Separate service, authorization, capture, void, refund, earning, and payout states. A complete report remains accessible if capture is unknown, and the earning obligation remains recorded.
- Stable operation identifiers persisted before provider dispatch. Duplicate capture prevention; explicit read reconciliation after unknown outcomes; verified webhook deduplication and shared domain reconciliation.
- A startup/60-second worker closes overdue 48-hour services and voids confirmed authorizations. Expired sessions cannot start. Unresolved operations require reconciliation and are never guessed successful.
- Reports with evidence links, downloadable JSON, service appeals, independently decided refund/uphold outcomes, and a detailed activity ledger.
- Responsive desktop/mobile design, keyboard focus, native dialog focus containment, semantic forms, reduced-motion handling, and visible failure states.

All money uses integer USD minor units. The server fixes the service fee at 6000 and verifier earning at 4000; neither browser nor model chooses payment amounts.

## Configure PayPal sandbox

This adapter is implemented but **not exercised against a real PayPal account in this build session**. Credentials, account capabilities, return URLs, and provider behavior must be verified before presenting it as a successful sandbox integration.

Copy `.env.example` to `.env`, then set:

```dotenv
PAYMENT_MODE=sandbox
PAYPAL_CLIENT_ID=your-sandbox-client-id
PAYPAL_CLIENT_SECRET=your-sandbox-secret
PAYPAL_WEBHOOK_ID=your-sandbox-webhook-id
APP_URL=http://localhost:3103
DATA_DIR=./data-sandbox
```

Use `APP_URL=http://localhost:5173` when using Vite. Restart the API. Use a separate data directory for each payment mode; switching the mode of existing state fails closed. Unsupported mode values also fail closed. The adapter is hardcoded to `api-m.sandbox.paypal.com`; there is no live-money mode.

The renter creates an Orders v2 order with `AUTHORIZE` intent and approves it at PayPal using a sandbox buyer. On returning, click **Confirm sandbox authorization**. The server authorizes the stored order, validates USD 60.00, and obtains the authorization ID from PayPal. The callback alone cannot mark payment authorized. Only the operator's completed-service review can request Payments v2 capture. Cancellation/incomplete work calls void; an upheld refund appeal calls capture refund.

Configure PayPal webhook delivery to `/api/paypal/webhook` through an appropriately secured test tunnel if needed. No tunnel or deployment is configured here. The server calls PayPal's verify-webhook-signature endpoint, deduplicates event IDs, reads provider state, and applies confirmed outcomes through the same serialized workflow. Webhook payload assertions alone cannot complete payments.

A timeout remains unknown. **An order-creation timeout without a returned order ID cannot currently be automatically reconciled**; inspect the sandbox dashboard rather than sending a new payment operation. This is a documented feasibility gap. Other unknown operations are reconciled by stored order/authorization/capture IDs. Unconfirmed provider states stay unresolved. Provider idempotency retention, reauthorization beyond the service window, and rejected-operation recovery need further sandbox testing.

## Optional AI checklist

Default `AI_MODE=rules` is a deterministic fixture path, explicitly labeled **no model call**. It is useful for judges without paid credentials; it is not represented as AI inference.

To exercise the connected model path, explicitly configure:

```dotenv
AI_MODE=openai
OPENAI_API_KEY=your-key
OPENAI_MODEL=gpt-4o-mini
```

Restart and click **Draft with AI** before accepting a case scope. This sends only the supplied listing text and questions to the Responses API using strict JSON schema output, no tools, `store:false`, a 20-second timeout, a 1,400-output-token bound, and at most three attempts per case. Every proposed claim must be an exact substring of the listing or the whole result is rejected. Failure keeps the baseline manual checklist available. The UI records actual provider token usage and latency; model cost remains unmeasured rather than fabricated. No live model calls were made during this build.

**Evidence comparison is human-observation based in this MVP.** Images are not sent to a model, and it does not claim image matching, deepfake detection, liveness verification, or automated authenticity assessment. Optional model integration currently covers checklist drafting only. This is the PRD's explicit fallback when multimodal reliability is not established.

## Persistence and operational boundaries

`data/walkthrough.json` holds cases, evidence bytes, operations, and audit events. Writes use a temporary file and atomic rename; application mutations are serialized in one Node process. **Run only one backend process per DATA_DIR.** This is not a multi-instance database. Sessions are in memory, expire after 12 hours, and reset on restart; choose a role again to continue persisted cases.

Local demo roles are intentionally selectable. They demonstrate independent permissions but do not establish real-world identity or prevent one person impersonating multiple demo roles. Real authentication, case-specific user enrollment, CSRF/rebinding hardening for hosted environments, durable queues, backups, and transactional database constraints are release requirements. The API refuses non-loopback binding.

Images require an authenticated cookie and are not placed in public assets. Responses are no-store. There are **no expiring signed media URLs, automated 30-day deletion, encrypted-at-rest cloud storage, or production retention guarantees**. Raw media remain in local data until reset/deletion. Use synthetic or explicitly consented data only; never identify real occupants or upload sensitive documents. The demo includes a second verifier as a disabled preview; only Maya is operational.

No PayPal Payouts integration is enabled. **Eligible is not submitted or paid.** Capture does not prove funded payout liquidity. A reserve policy for failed collection, aborted-visit travel, refunds after payouts, and independent verifier onboarding remains unimplemented. The $60/$40 split is illustrative economics, not validated margin.

## Validation and remaining release gates

The 17 automated tests cover adverse-report completion, incomplete access void, independent role restrictions, missing coverage, stale session/reused files, concurrent slot conflicts, capture response loss, late authorization compensation, appeal refund, payout eligibility timing, malformed scope mutation, frozen scope and expiration, disk persistence, payment-mode isolation, webhook domain application/deduplication, rescheduling after conflict, automatic expiry, late-review capture rejection, and restricted demo reset.

The parent implementation review also exercised desktop and 375px browser flows: renter scope/authorization; staged verifier evidence; adverse operator completion with capture timeout; reconciliation; appeal/uphold; and separately recorded earning eligibility. Build/test output is reproducible with `npm run check`. These tests do not establish PayPal account feasibility or AI quality.

Before a public hackathon submission:

- Exercise real sandbox authorization, capture, void, refund, and supported payouts, and resolve unknown-order recovery.
- Exercise the model path, freeze evidence evaluation cases, and report failures as well as successes.
- Obtain real consented evidence and renter/verifier feedback; measure travel, support, provider usage cost, and viability.
- Add production identities, secure media lifecycle, reliable scheduled jobs, and judge-safe hosting.
- Make the repository public only when authorized, publish a public demo video shorter than three minutes, and verify current competition rules. No hosting or public video was produced by this implementation.

## Documentation and sources

[Product requirements](PRD.md) and [hackathon rubric](HACKATHON.md) preserve the original proposal and its broader release gates. Their proposal statuses are historical, not a description of this implemented local MVP. The supplied deadline is November 12, 2026, 3:00 pm EST, with judging access through December 15; recheck the [official rules](https://paypalaihackathon.devpost.com/rules) before submission.

Implementation references: [PayPal authorize and delay capture](https://developer.paypal.com/checkout/delay-capture/), [Payments v2](https://developer.paypal.com/api/payments/v2), [webhook verification](https://developer.paypal.com/api/rest/webhooks/rest/), and [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs). No third-party interior photographs or remote assets are used; the apartment illustration and staged scene graphics are code-generated synthetic assets.
