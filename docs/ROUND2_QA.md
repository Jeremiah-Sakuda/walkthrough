# Round-two local verification evidence

## Provenance

The coordinator exercised an isolated local browser instance on port **3303**, sourced from commit **5783237815484e1e039d947218b9c07d6d8f3b90**. The five screenshots used in the video come from that run. They are historical captures of the first remediation milestone. The separate supplemental `07-final-mobile-ledger.png` comes from the final-code check described below.

The packaging agent inspected the five video frames and supplemental final mobile frame visually, assembled their narration, and verified the encoded artifact. Browser observations below were reported by the coordinator; the packaging agent did not repeat those interactive flows or control the browser.

## Observed in the coordinator's browser run

- Edited the dishwasher question's title and evidence instruction in the pre-consent scope editor. The question reference remained visible; acceptance froze the edited scope.
- Confirmed simulated authorization and the scheduled visit flow. The retained screenshot shows the accepted frozen checklist, not a provider receipt.
- Submitted partial coverage and observed the guard against approving missing work.
- Requested additional evidence with explicit task selection and detailed operator notes. Switching to verifier displayed those exact instructions and the affected kitchen/dishwasher items above capture tasks.
- Completed the synthetic flow with a deliberately lost capture response. Activity showed **Service complete / Payment unknown / Earning pending**, with reconciliation available. This is a local simulation, not a PayPal response.
- Checked a 375px viewport. No horizontal overflow was observed in that checked view. Ledger labels were 16px, while values were still 11px; simulation disclosure and Activity subtitle were also 11px. This prompted follow-up CSS corrections.

## Findings corrected after those captures

Commit `c7f7ac56488704839fc9310ddc631235f7afb40c` changed arbitrary question/model-task staged samples to **uncertain**, explicitly saying a generic synthetic illustration cannot answer the specific question. This prevents the earlier custom dishwasher sample from implying a matched observation beside the kitchen scenario's absent-dishwasher finding. The baseline bedroom citation now prioritizes the actual window/light sentence. Ledger values became 16px and mobile disclosure/support copy 14px. Next-action orientation was added near the case heading.

The old `06-mobile-ledger.png` is deliberately excluded from the published preview and committed evidence bundle. Final CSS and sample changes passed production build and automated checks. The coordinator then refreshed isolated port3303 to **c7f7ac5**, kept the existing completed case, and inspected Activity at **375px**: no horizontal overflow was observed. The supplemental [final mobile ledger capture](demo/frames/07-final-mobile-ledger.png) records this narrower final-code check. It does not establish a repeated full lifecycle or fresh sample-generation check; the retained case correctly preserves historical frozen scope references. Likewise, a real two-case PayPal callback return was not tested; case restoration is implemented and still requires sandbox verification.

## Reproducible local checks at c7f7ac5

- `npm test`: **25/25 passed**. Includes capture/void/refund persisted-confirmation replay without dispatch, question scope editing/freezing, task-linked correction persistence, corrupt/truncated/tiny/oversized media rejection with real image decoding, empty/duplicate model response rejection and embedded-photo report content.
- `npm run build`: production bundle passed.
- `node docs/judging/2026-10-03/technical-http-smoke.mjs .`: isolated disposable-state listener checked health, anonymous denial, renter session/state, role restriction, foreign-origin rejection and production HTML/CSP. This reused the historical smoke script without editing the original judge's evidence.
- Sharp was updated to **0.35.5** after checking dependency advisories; npm installation audit reported **0 vulnerabilities** for that installed dependency graph.
- `npm run eval`: **8 frozen cases, 14/14 concern terms represented versus 1/14 fixed-baseline terms**, zero unsupported listing quotes by exact-substring check, **zero provider requests**. This measures mechanical concern retention, not semantic quality, user usefulness or model superiority. Human editing time and provider cost remain unmeasured.

## Preview and limitations

[Local narrated preview](demo/README.md) assembles actual captured interface stills. It is edited, not a continuous screen recording. The transcript discloses the source version and later corrections not recaptured in the video. The separate final mobile still provides the narrower follow-up evidence above. It is not a public YouTube submission or a provider-backed demonstration.

No live PayPal/model call, physical visit, participant interview, public video publishing, actual compensation payout or funded reserve was verified. The prototype uses selectable local roles and synthetic evidence. The report/export checks establish artifact content, not inspection authenticity. The owner explicitly authorized public source publication, and the coordinator verified GitHub visibility as PUBLIC after its history secret scan passed. The public video link and final submission requirements remain separate gates.
