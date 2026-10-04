# Walkthrough — panel assessment

**63.0/100**, averaging three independent mock judges. Individual totals: **62–64/100**. Evaluated commit: `521a0f4ff8c0760e4d0bdcbd18c86302505979ec`. This is not an official result or prize prediction.

Walkthrough's strongest idea is paying for a completed evidence package even when its findings make the apartment less attractive. The panel valued the separation of service completion, collection, and verifier earnings. The prototype makes that mechanism work in simulation, but the evidence package's usefulness, operating economics, and actual PayPal/model execution remain unproved. The review also found gaps in recovery, question coverage, and reviewer feedback.

## Independent scorecards

Each criterion is /10 with equal weight. Total = 2 × sum. Means use unrounded values, displayed to one decimal.

| Judge | Technology | Design | Impact | Innovation | Presentation | Total /100 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [Technical](technical.md) | 6.5 | 7.0 | 6.0 | 6.5 | 5.0 | 62 |
| [Product/design](design.md) | 6.5 | 7.0 | 6.0 | 6.5 | 5.5 | 63 |
| [Impact/innovation](impact.md) | 6.5 | 7.0 | 6.0 | 7.0 | 5.5 | 64 |
| **Panel mean** | **6.5** | **7.0** | **6.0** | **6.7** | **5.3** | **63.0** |

All reviewers submitted independent scores without seeing peer feedback. The impact judge gave the incentive mechanism slightly more innovation credit; the technical judge was less persuaded by presentation evidence. The range is not a statistical confidence interval. All three marked stage-one readiness conditional.

## What was demonstrated

- The technical judge ran **17 passing tests**, a successful production build, and an isolated HTTP smoke check for health, session/state access, role/origin rejection, and HTML/CSP. The impact judge also ran the tests. No clean dependency installation was performed.
- The design judge completed scope/authorization, partial evidence blocked from approval, return for more evidence, adverse findings, lost capture response, reconciliation, report, and appeal/uphold. It inspected 375px mobile views and saved five screenshots in [the design report](design.md).
- The coordinator independently reran three [technical reproductions](technical-repro.mjs) and the [question-coverage reproduction](impact-repro.mjs). Scripts accept the source checkout as an argument and use simulated payments/mocked model output. An [HTTP smoke script](technical-http-smoke.mjs) is also preserved.
- No real payment or model-provider requests were made. Successful synthetic evidence flow does not establish actual inspection usefulness or verified provider behavior.

## First fixes and evidence to collect

| Priority | Finding and evidence | Smallest convincing resolution |
| --- | --- | --- |
| P1 | **A confirmed capture can be saved without applying it to the case.** Restoring an actual save checkpoint leaves a complete service and confirmed operation, but case `capture_pending`; reconciliation skips confirmed operations. [Confirmation save](https://github.com/Jeremiah-Sakuda/walkthrough/blob/521a0f4ff8c0760e4d0bdcbd18c86302505979ec/server/payments.mjs#L32). | Apply confirmed-but-unapplied results idempotently on restart/reconcile, or atomically persist both facts. Add crash-boundary tests. The reproduction used a saved checkpoint, not a live process kill or real charge; do not fix it by issuing a new capture. |
| P1 | **A renter question can disappear from the accepted work scope.** The impact judge requested basement water-stain/laundry evidence; the accepted default scope still contained only four generic room tasks. [Rules checklist](https://github.com/Jeremiah-Sakuda/walkthrough/blob/521a0f4ff8c0760e4d0bdcbd18c86302505979ec/server/ai.mjs#L1). | Map each question to an evidence item or explicit exclusion, and let the renter edit/confirm before freezing. Preserve that version after payment consent. The renter did consent to the displayed scope; no unauthorized charge was alleged. |
| P1 | **Returning work loses the operator's detailed correction.** The browser judge typed review notes, requested more evidence, and found only a generic message in the verifier view. [Return action](https://github.com/Jeremiah-Sakuda/walkthrough/blob/521a0f4ff8c0760e4d0bdcbd18c86302505979ec/src/main.jsx#L63). | Send and persist the correction, link it to affected tasks, and show it above the verifier's capture form. Verify that the worker can identify what to redo without an outside conversation. |
| P1 | **Operational mobile text is too small.** At 375px, the design judge measured 9px session instructions and 10px task text, despite no horizontal overflow. | Enlarge core instructions and status text, allow cards to grow, and compact the persistent hero for verifier/operator work. Test a visit and unknown-payment screen, not just the landing page. |
| P2 | **Corrupt image bytes count as coverage.** PNG signatures followed by non-image text were accepted as four evidence items and could complete with explicit operator approval. [Upload validation](https://github.com/Jeremiah-Sakuda/walkthrough/blob/521a0f4ff8c0760e4d0bdcbd18c86302505979ec/server/domain.mjs#L45). | Decode supported media before counting usable evidence; use real small-image fixtures. This does not bypass the human role and does not imply the app must perform automated authenticity detection. |
| P2 | **Empty claims pass AI grounding.** A mocked schema-valid response with empty claim strings passes substring validation. [Grounding check](https://github.com/Jeremiah-Sakuda/walkthrough/blob/521a0f4ff8c0760e4d0bdcbd18c86302505979ec/server/ai.mjs#L21). | Require meaningful nonempty claims and distinct useful coverage; evaluate missed questions and irrelevant exact quotes. This is a validator reproduction, not evidence that a real model returned those claims. |
| P2 | **Checkout return may select the wrong case.** The callback carries a case ID but the frontend does not consume it; selection falls back to the first case. [Return URL](https://github.com/Jeremiah-Sakuda/walkthrough/blob/521a0f4ff8c0760e4d0bdcbd18c86302505979ec/server/payments.mjs#L26). | Restore matching case context while retaining server-confirmed authorization. This is source-inferred; verify a two-case sandbox return before treating it as an observed integration failure. |

No P0 was assigned. Normal simulated capture-response-loss reconciliation worked in the browser; the separate persisted-confirmation gap shows why that success does not cover every restart boundary.

## Product and presentation evidence

Run one consented physical visit or clearly identified realistic staged inspection. Show a listing claim, the corresponding photograph, an unfavorable finding, and an uncertainty. Ask target renters what they learned and what remains unknown. Measure access success, travel/visit time, independent review time, and direct costs before claiming that the illustrative $60/$40 split is viable. The working app proves workflow mechanics, not a staffed service or paid-out earnings.

Compare an actual model-generated checklist with the fixed baseline on varied listing/question pairs. Measure missed concerns, unsupported requests, and editing effort. Keep image comparison described as human observation; no judge verified visual AI, liveness, or property authenticity.

For the recording, concentrate on one renter concern, one adverse finding, independent completion, and the distinct payment/earning states. The current script is not a video. A printable, image-bearing renter report would also make the deliverable easier to revisit than JSON alone; see the design judge's detailed suggestions.

## Readiness and next iteration

The original repository was independently confirmed **private**. MIT licensing and local setup exist; public source and a public video under three minutes remain submission gaps. Hosting is optional under the [official rules](https://paypalaihackathon.devpost.com/rules). Real sandbox/model operation is unverified, so this panel cannot assure passage through the required API-use screen; the organizer decides.

Recommended order: repair confirmed-result replay; preserve question coverage and correction feedback; validate media/model outputs; make field instructions readable; demonstrate one actual sandbox service lifecycle and model-assisted checklist; collect one useful evidence package and a small renter comprehension study; record and publish the submission. Keep the bounded service and adverse-result compensation principle.

Full feedback: [technical](technical.md), [design](design.md), [impact/innovation](impact.md). Machine-readable scores accompany each. This repository was judged on its own, with no sibling comparisons supplied to its judges.
