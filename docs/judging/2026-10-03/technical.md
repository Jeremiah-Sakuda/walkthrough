# Walkthrough — independent technical mock judge

**Pinned commit:** `521a0f4ff8c0760e4d0bdcbd18c86302505979ec`  
**Judge:** Technical / PayPal + AI implementation  
**Assessment date:** October 3, 2026  
**Source:** `/private/tmp/paypal-judge-20261003/walkthrough`  
**Overall:** **62 / 100** — a coherent, unusually explicit simulated service workflow, with insufficient live integration evidence and a reproducible payment-recovery defect.

This is a mock assessment under the supplied five-criterion rubric, not an organizer decision or prize prediction. Only this assigned source snapshot and the common judging protocol were evaluated. No sibling repositories, peer assessments, or prior implementation conversation were consulted. Historical implementation claims embedded in the README are treated as claims, not independent verification.

## Scores

| Criterion | Score / 10 | Main reason |
|---|---:|---|
| Technological Implementation | 6.5 | Substantial working simulation and sensible financial boundaries; real PayPal and model execution remain unverified, and restart recovery can strand a confirmed capture. |
| Design | 7.0 | Coherent three-role flow with useful state and uncertainty distinctions; assessed principally from source, with runtime usability unverified by this judge. |
| Potential Impact | 6.0 | Specific remote-renter problem and useful evidence-delivery mechanism; access, actual evidence usefulness, verifier supply, and economics remain hypotheses. |
| Innovation / Idea | 6.5 | Paying for independently reviewed work regardless of whether findings are favorable is the strongest mechanism; AI contribution is currently modest. |
| Presentation | 5.0 | Clear setup and unusually candid demo instructions, but no recorded end-to-end video, provider demonstration, or consented real visit supplied. |
| **Equal-weight total** | **62 / 100** | **2 × (6.5 + 7 + 6 + 6.5 + 5)** |

### Technological Implementation — 6.5

This is a working application with meaningful domain logic, not simply a checkout button attached to a concept. The implementation freezes scope, separates authorization from capture, serializes appointment assignment, enforces action roles, links evidence to checklist items, handles adverse findings without reducing the fixed earning, and records refunds and earning eligibility separately. Seventeen tests pass, including slot contention, lost capture response, late authorization compensation, expiry, and appeals (`test/workflow.test.mjs:14–30`). Fixed monetary values belong to the server (`server/domain.mjs:3`, `:8`), and payment request IDs are persisted before dispatch (`server/payments.mjs:15–17`). These choices deserve credit at hackathon scale.

The limits materially affect the PayPal-plus-AI criterion. The normal runnable demonstration uses simulated payments and deterministic checklist rules. The sandbox adapter and model adapter are implemented, but neither is independently verified with its provider; the repository itself explicitly acknowledges that absence (`README.md:68`, `:101–103`). Payout is only an accounting state, accurately disclosed (`README.md:113`). The crash checkpoint reproduced below shows that the persistence design can save a confirmed capture without applying it to the case; operator reconciliation then cannot recover it. This is directly relevant to the showcased recovery story. AI validation also accepts empty grounding claims. These gaps keep the technical score below a strongly demonstrated integration, without imposing production-scale requirements on a local hackathon prototype.

### Design — 7.0

The source describes a complete and understandable renter → verifier → operator → renter experience. Listing, visit, report, and activity form a stable navigation structure; the fixed fee and payment status remain beside the case (`src/main.jsx:27–32`). The workflow explains why an unfavorable finding can still mean completed work, includes a safe-stop path, links findings to evidence, and shows appeals and compensation separately (`src/main.jsx:50–68`). Simulation, synthetic evidence, and limited authenticity checks are visibly labeled rather than hidden in developer documentation. Semantic forms, a native modal dialog, error/status announcements, and responsive styles are also present (`src/main.jsx:26`, `:42`, `:70`; `src/styles.css:3–8`).

This score is based on implementation structure and product copy, not an independently completed browser session. I did not use the design judge's port or inherit its observations. I therefore do not claim that narrow-screen layout, image rendering, keyboard behavior, or every interaction works in practice. Source inspection identifies a return-flow weakness: sandbox checkout encodes a case ID in the callback, but the UI initializes selection as empty and does not consume that parameter (`server/payments.mjs:26`; `src/main.jsx:14–20`). A renter paying for a later case can return to the first case and need to find the correct one manually. The recovery defect also means a confirmed operation can coexist with a stuck case and no reconciliation button (`src/main.jsx:68`).

### Potential Impact — 6.0

The target is specific: students or interns arranging a rental remotely in one launch city (`PRD.md:19–25`). A scoped, inspectable visit can plausibly help answer appliance, room-condition, and access questions before a consequential rental decision. The mechanism matches that need more directly than an unsupported property-safety score: it collects observations, retains uncertainty, and excludes rental-deposit custody and claims of rental authority. The implemented adverse-finding and access-failure paths support that narrower value proposition.

The artifact does not establish that renters will buy this service, that listing contacts will reliably permit access, or that $60 covers verifier work plus platform costs. Interviews and pilot economics remain proposed (`PRD.md:21`, `:99–105`; `README.md:125`). Synthetic scenes establish application behavior, not the usefulness of an actual evidence package. The absence of payouts does not erase the prototype's value, but it leaves the operational loop for the verifier incomplete. The next impact evidence should be one consented visit and measured renter comprehension, visit/travel time, and support effort, rather than a larger geographic promise.

### Innovation / Idea — 6.5

The strongest design choice is that the platform buys complete evidence, not a favorable verdict. Operator review determines whether the contracted work was delivered; an absent dishwasher can still lead to capture and the same verifier earning. Scope approval, session-specific requests, linked observations, and separate service/payment/earning states combine into a credible trust mechanism (`server/domain.mjs:26–53`, `:64–75`). The explicit boundary around deposits also produces a more defensible product concept.

I make no market-novelty claim or competitor comparison. The demonstrated differentiation is within the artifact: incentive alignment and a bounded evidence workflow. Current AI drafts checklist text and has no image-comparison role (`server/ai.mjs:13–24`). The deterministic baseline already drives the complete simulation, so the submission still needs evidence of what the model adds: for example, detecting important listing-specific questions that the baseline misses, without inventing claims. That evaluation would strengthen both innovation and technical relevance more than adding an untested AI badge or broad fraud-detection claim.

### Presentation — 5.0

The README provides runnable setup, an ordered demo, exact role transitions, a deliberately adverse finding, unknown-payment recovery, and explicit limitations. It distinguishes an illustrative earning from an actual payout and identifies default rules as “no model call” (`README.md:9–44`, `:91–113`). The pitch “See it before you sign” and the fixed-fee evidence package are easy to explain. These are useful submission materials.

No recorded video was supplied, and a written three-minute script is not evidence of a successful recorded demonstration. There is also no successful sandbox receipt chain, model-run evaluation, or consented physical visit in the reviewed artifact. The current private repository and missing public video are submission-readiness gaps supplied in the judging brief, not reasons to zero every product score. A short recording should prioritize one question, accepted scope, real sandbox authorization, unfavorable-but-complete evidence, operator capture, and report delivery; the failure path can be a brief final contrast. It should accurately label staged images and explain the actual model role.

## Verification method and limits

- **Observed:** Node `v22.22.3`; `npm test` passed **17/17**; `npm run build` passed under Vite **6.4.3**, producing the production bundle. Dependencies were reused through the supplied `node_modules` symlink; no clean installation was attempted.
- **Observed:** The portable offline script `technical-repro.mjs` completed all three reproductions below. It imports the assigned source, uses simulated payments, creates disposable state under the system temporary directory, and never writes to application source or contacts a provider.
- **Observed:** The portable `technical-http-smoke.mjs` passed health, anonymous-state denial (401), renter session/state retrieval, renter review denial (403), foreign-origin rejection (403), and production HTML/CSP checks on isolated port **33213**, using disposable simulated state. Initial binding was blocked by the tool sandbox (`listen EPERM`); the authorized local-listener retry succeeded. The separate UI server on port 3203 was not used or changed.
- **Source-inferred:** Broader API and callback behavior were inspected in `server/index.mjs:25–45` and `src/main.jsx:14–20`. The HTTP smoke proves the listed checks only, not the full browser or sandbox callback flow.
- **Unverified:** Real PayPal account capability, authorization/capture/void/refund responses, webhook signature verification, live model response quality, clean installation, browser rendering/accessibility, and a recorded demo. No secrets, provider credentials, payments, model calls, source changes, or external posting were used.

Reproduce the added checks with:

```sh
node technical-repro.mjs /absolute/path/to/walkthrough
node technical-http-smoke.mjs /absolute/path/to/walkthrough
```

Observed output from the portable checks:

```text
OBSERVED crash checkpoint: service complete, capture operation confirmed, case capture_pending; reconcile + expiry cannot recover.
OBSERVED corrupt media: four non-decodable PNG-prefix payloads count as complete coverage and can be operator-approved/captured.
OBSERVED validator: three empty claims accepted as listing-grounded model checklist; no network request made.
HTTP smoke passed: health, anonymous denial, renter session/state, role enforcement, cross-origin rejection, production HTML/CSP. Isolated port 33213/data directory.
```

## Findings and prioritized improvements

### 1. P1 — Replay confirmed payment results into domain state after restart

**Observed using a persisted checkpoint.** `server/payments.mjs:32` saves a capture operation as confirmed before returning to `server/domain.mjs:93`, where the case is changed from `capture_pending` to `captured`. A process stop between those writes leaves a complete case, a confirmed capture operation, and an unapplied capture result. Reconciliation selects only operations whose status is not confirmed (`server/payments.mjs:35–36`), so the result is never reapplied. The UI also hides the reconciliation action once all operations are confirmed (`src/main.jsx:68`).

**Reproduction:** Run the first block of `technical-repro.mjs`. It completes a simulated visit and snapshots the exact state at the existing save boundary where the capture operation first becomes confirmed while the case remains pending. It writes that snapshot to a disposable real `Store`, constructs a new application instance, and runs reconciliation plus expiry. The case stays `capture_pending`; repeated review and eligibility are rejected. This is a faithful restoration of an actual serialized boundary, not a live process-kill test or a fabricated provider reply.

**Impact and fix:** The simulated provider has already captured once, but case accounting is stuck. Preserve an explicit “domain result applied” marker, or commit operation confirmation and case transition together. On startup/reconciliation, idempotently apply every confirmed but unapplied result. Add restart-boundary coverage for capture, void, refund, and reconciliation; do not resolve the gap by issuing another charge.

### 2. P1 — Demonstrate the actual PayPal and model integration paths

**Unverified integration evidence, not a claimed provider API defect.** The adapter routes and financial checks are implemented (`server/payments.mjs:26–30`, `:40–53`), but the tests instantiate simulated mode (`test/workflow.test.mjs:10`). Even the webhook test calls the domain webhook method directly and does not prove signature verification (`test/workflow.test.mjs:26`). README disclosures correctly acknowledge absent provider execution (`README.md:68`, `:101`).

Record sandbox order approval, authorization, capture, void, and refund with provider IDs and verified webhook/reconciliation behavior. Separately show one actual model-generated checklist and its baseline comparison. Include a provider-declined operation and the documented unresolved order-creation timeout (`README.md:87`); show the recovery or explain the remaining operator procedure. This is the highest-value evidence improvement for the hackathon theme. No provider-contract mismatch is asserted by this review, and no synthetic fixture is used to claim provider feasibility.

### 3. P2 — Reject empty or duplicated “grounded” AI claims

**Observed local validator defect.** The strict schema allows any string claim, while `listing.includes(i.claim)` accepts an empty string (`server/ai.mjs:17`, `:21`). The third reproduction supplies three schema-valid items with empty claims in a synthetic `output_text` fixture. The local validator accepts them and labels them listing-sourced. It does not contact OpenAI or establish that a real model emits this output; it isolates the application's post-validation contract.

Require a nonempty trimmed claim, meaningful title/request strings, and reasonable distinct coverage. Add fixtures for empty claims, repeated items, irrelevant exact substrings, and listing-specific questions omitted by the result. Grounding should demonstrate useful support for the checklist, not merely a technically successful substring operation. Keep the manual fallback available on rejection.

### 4. P2 — Validate image decoding before counting usable coverage

**Observed.** Upload validation accepts supported magic bytes but does not decode an image (`server/domain.mjs:45`). The second reproduction submits four distinct PNG signatures followed by non-image text; there is no PNG image structure. All four are accepted and count as covered. With explicit simulated operator approval, the case completes and captures because the gate checks evidence IDs (`server/domain.mjs:52`). Existing workflow tests also use signature-plus-text fixtures (`test/workflow.test.mjs:12`), so their passing result does not establish usable media.

This does **not** bypass the human approval role: an attentive reviewer can reject the files. Still, accidental corruption should be rejected before review, and the interface should explain a broken image rather than count it as usable coverage. Decode and validate supported media, retain a small valid-image fixture in tests, and test a corrupt upload separately. This is evidence-quality hardening, not a demand for automated authenticity detection.

### 5. P2 — Restore the correct case after sandbox checkout

**Source-inferred; browser/provider return was not exercised.** The return URL includes `?approved=<case-id>` (`server/payments.mjs:26`). UI selection starts empty and falls back to the first case; there is no query-parameter selection in the initialization or refresh path (`src/main.jsx:14–20`). A later-created case can therefore lose its context after the full-page PayPal redirect. The correct case remains manually selectable, so this is not a claim that payment is irrecoverably lost.

On return, select the authorized session's matching case, display its pending approval/authorization state, and offer the existing server-confirmation action. Never treat the query parameter itself as proof of authorization. Verify with two cases so a single seeded case does not mask the problem.

### 6. P1 — Supply a public recorded demo and real evidence of usefulness

**Submission/evidence gap.** The brief specifies a private original repository and no supplied recording. The README itself leaves public source/video and pilot evidence outstanding (`README.md:123–127`). Publish the required artifacts when authorized, preserving accurate simulation labels. Add one consented or explicitly staged visit whose images actually answer the accepted questions, plus a small renter comprehension check and measured visit/travel costs. A polished synthetic application flow alone cannot establish that the package helps the customer decide.

**No P0 is assigned.** The supplied simulated core workflow passes its tests; the identified defects do not justify calling the entire demo broken.

## Strengths worth preserving

- Server-owned fixed pricing and independence between findings, service completion, and earning amount.
- Explicit permission checks, slot contention handling, late-authorization compensation, and a bounded expiry worker.
- Unknown provider outcomes remain visible; the normal lost-response test avoids duplicate capture.
- Honest distinctions between simulated payments, model-free rules, staged images, eligible earnings, and actual payouts.
- A report and appeal process that supports uncertainty and does not pretend to establish rental authority or safe tenancy.
- A runnable, modest dependency footprint with tests targeting important workflow behavior rather than only rendering snapshots.

## Stage-one readiness and next iteration

**Readiness: conditional.** A functional local prototype, setup instructions, MIT license, theme alignment, and implemented PayPal/AI adapters are present. Actual required-provider use remains unverified. Public repository visibility and the required public video remain submission gaps. This is a mock readiness assessment, not a finding of official disqualification. Hosting is optional under the supplied rubric; local-only operation is not by itself a failure.

**Top three judge questions**

1. Can you show actual sandbox authorization → independently reviewed adverse report → capture, plus an incomplete visit → void, with provider evidence and one reconciled uncertain outcome?
2. Which renter questions does the model checklist handle better than the deterministic baseline, and how often do grounding or coverage checks reject its output?
3. Does one consented physical visit produce a package renters can interpret, at a cost and access success rate compatible with the illustrative $60/$40 split?

**Smallest credible next iteration:** Fix confirmed-result replay and add its restart test; reject empty claims and undecodable images; restore callback case context. Then run one real sandbox lifecycle and one real model checklist, collect one bounded consented/staged evidence package, and record an under-three-minute demo of the actual supported flow. Retain the current limitations around payouts and image authenticity unless new evidence justifies changing them.

**Confidence: medium.** High confidence in the inspected logic, passing build/tests, and three offline reproductions; lower confidence in live provider feasibility and actual browser usability because neither was independently exercised here.
