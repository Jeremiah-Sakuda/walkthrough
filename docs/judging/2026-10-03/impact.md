# Walkthrough — independent impact, innovation, and pitch assessment

This is a simulated judge assessment, not an official result or prize prediction.

- **Project:** Walkthrough
- **Pinned commit:** `521a0f4ff8c0760e4d0bdcbd18c86302505979ec`
- **Frozen source:** `/private/tmp/paypal-judge-20261003/walkthrough`
- **Persona:** Impact/innovation/presentation judge; all five criteria scored independently.
- **Method:** Read the assigned protocol, repository documentation, React interface source, server/domain/payment/model code, and regression tests. Ran `node --version` (v22.22.3), `npm test`, and one isolated, in-memory product repro. No sibling projects, peer findings, or root build summaries informed these scores.
- **Limitations:** No interactive UI inspection or new build; design score assesses the experience represented in source, not verified rendering or usability. No provider calls, user interviews, real property visit, clean dependency installation, or recorded pitch review. Historical verification claims in repository documentation are not independent observations for this assessment. Dependencies are the supplied snapshot dependencies. Private repository status and absence of a recorded video were supplied with the assignment. References below are repository-relative and line-verified in the frozen source. No external market novelty research was undertaken, so differentiation statements describe the mechanism rather than claim it is unprecedented.

## Scores

| Criterion | Score /10 |
| --- | ---: |
| Technological Implementation | 6.5 |
| Design | 7.0 |
| Potential Impact | 6.0 |
| Innovation/Idea | 7.0 |
| Presentation | 5.5 |
| **Equal-weight total** | **64 /100** |

### Technological Implementation — 6.5

The local workflow has meaningful depth. Frozen scope, appointment allocation, independent completion, adverse findings, refunds, delayed earning eligibility, and unknown-payment reconciliation form one service lifecycle. Seventeen tests passed in this review, including unfavorable completion, missing coverage, slot conflicts, response loss, appeals, and expiration (`test/workflow.test.mjs:14–30`). Stable operation records are saved before dispatch (`server/payments.mjs:14–17`), and service completion is separated from successful collection (`server/domain.mjs:51–53`, `93`). These are relevant implementation choices rather than decorative financial API calls.

The integration evidence limits the score. PayPal sandbox endpoints are implemented (`server/payments.mjs:25–30`), but neither the repository nor this review demonstrates account-backed execution. AI is a real optional Responses API adapter with constrained output and substring grounding (`server/ai.mjs:17–22`); the default path makes no model call (`server/ai.mjs:15`). The report simply aggregates verifier-entered observations and coverage (`server/ai.mjs:24`). This is a coherent prototype, but not yet persuasive proof of skillful live PayPal-plus-AI operation. The test labeled verified webhook calls domain reconciliation directly; it does not validate PayPal's signature endpoint (`test/workflow.test.mjs:26`, `server/payments.mjs:50–53`).

### Design — 7.0

The source presents a coherent complete service, with listing/scope, visit, report, and activity areas (`src/main.jsx:27–31`). It makes the fixed fee, rental-deposit exclusion, independent review, report limits, and simulated mode explicit (`src/main.jsx:22`, `25`, `32`, `34`). Scope consent precedes authorization, the verifier can stop safely, and an operator can request more evidence (`src/main.jsx:42–46`, `53–55`, `64`). Report categories and evidence links are useful for a renter deciding what to ask next (`src/main.jsx:62–63`). These deserve credit even without visual inspection.

The largest experience gap is scope customization. Renter questions are displayed, but the default baseline does not convert them into required evidence and there is no scope editor in the rendered checklist/acceptance flow (`src/main.jsx:40–42`; reproduced below). A user may believe a particular concern is part of the paid service while the frozen completion criteria omit it. The read-only checklist is reviewable but not practically correctable. Mobile and accessibility behavior remain unverified by this judge; CSS breakpoint rules alone do not prove usability.

### Potential Impact — 6.0

The audience is specific: students or interns moving remotely to one launch city, unable to attend a showing (`PRD.md:17–21`). The demonstrated product can organize questions, collect linked observations, and preserve an unfavorable report without penalizing completed work. It avoids taking a rental deposit or implying that a visit proves ownership or safe tenancy (`PRD.md:11–15`; `src/main.jsx:32`). This narrow promise plausibly helps a real decision and is stronger than an unexplained property-risk score.

However, usefulness and demand are hypotheses. Five renter interviews, three verifier interviews, a consented visit, usability evaluation, and measured economics are proposed rather than supplied (`PRD.md:21`, `95–106`; `README.md:123–125`). The app demonstrates synthetic images and a chosen dishwasher discrepancy, not whether a remote renter discovers a consequential issue they would otherwise miss. Access relies on a renter checkbox and contact string (`server/domain.mjs:27`); only one operational verifier exists in the demo (`src/main.jsx:42`). The proposed $20 gross allocation must cover more than payments: recruitment, coordination, independent review, exceptions, and reserves are unmeasured (`PRD.md:25`, `71–73`; `README.md:113`). These are immediate one-city feasibility questions, not demands for enterprise maturity.

### Innovation/Idea — 7.0

The strongest differentiating mechanism within this artifact is incentive alignment: evidence can contradict the listing while still counting as completed, payable work. Independent completion review is the trigger for capture; the listing's desirability is not (`server/domain.mjs:51–53`; `test/workflow.test.mjs:14`). Scope approval, fresh session requests, evidence references, and separate earning/payment states reinforce that idea. This combination gives the project a clear explanation beyond “AI checks apartments.” I make no claim that other services lack these mechanisms.

PayPal has a natural role because the sold unit is a bounded service whose completion is determined later. AI's necessity is much weaker as demonstrated. The working default performs the same lifecycle with four fixed checklist items, and image comparison is explicitly human based (`server/ai.mjs:1–15`, `24`; `README.md:103`). The optional model could add value by translating varied listing claims and renter priorities into better capture instructions, but no comparison against a manual checklist establishes that advantage. The next innovation evidence should demonstrate better scope coverage, not add an unsupported authenticity or fraud-detection claim.

### Presentation — 5.5

The tagline, audience, price, service boundary, and adverse-outcome story are easy to communicate (`README.md:5`, `35–44`). Documentation is unusually candid about simulation, model limits, untested sandbox behavior, and unpaid earnings (`README.md:68`, `91–103`, `113`). A short pitch could make the dishwasher discrepancy its turning point: the property is less attractive, yet the verifier did the contracted work and earned the fee. That is memorable and backed by the local domain test.

No recorded video was supplied. The eight-step README script moves among three roles, payment reconciliation, appeals, an artificial clock advance, and a second failure case; it is not proof that an audience can follow the full story in less than three minutes. The proposal still describes broader AI evidence comparison (`PRD.md:5`, `36`), although the README clearly labels it historical (`README.md:131`). Submission materials should lead with the implemented checklist-assisted/human-review product and a real recorded result. The lack of video affects this criterion directly; it does not make all other criteria zero.

## Strengths worth preserving

1. **Pay for evidence quality rather than a favorable verdict.** The adverse-completion test protects the central product mechanism (`test/workflow.test.mjs:14`).
2. **Make service completion and collection independent facts.** An unknown capture keeps the report available and records funding exposure (`server/domain.mjs:93`).
3. **Show limits where decisions happen.** The fee card and report explicitly distinguish a visit from a tenancy endorsement (`src/main.jsx:32`, `63`).
4. **Make failure paths inspectable.** Void, appeal, earning, and operation state are represented, not collapsed into a single success badge (`src/main.jsx:68`; `server/domain.mjs:58–72`).
5. **Keep the demo runnable without paid accounts while labeling it honestly.** The default deterministic and simulated paths are explicit (`README.md:19`, `91`; `server/ai.mjs:15`).

## Observed product gap and reproducible evidence

**Custom renter concern can be omitted from the paid scope.** Observed in an isolated domain execution; interface correction gap is source-inferred.

1. Create a case with listing text describing an apartment and shared basement laundry.
2. Enter: “Please photograph basement water stains and check whether the washing machine is present.”
3. Generate the default rules checklist.
4. Accept scope with a valid access contact and available appointment.
5. Observe `scopeAccepted: true`, the saved question unchanged, and only four generic requests: entrance, kitchen, bedroom, bathroom. None requires basement/laundry evidence.

Preserved runnable reproduction: `/private/tmp/paypal-judge-20261003/walkthrough-impact-repro.mjs`. Run `node /private/tmp/paypal-judge-20261003/walkthrough-impact-repro.mjs`. It uses MemoryStore and simulated mode only, makes no network requests, and does not touch demo data. The assertion passed. Root cause: `ruleChecklist` accepts only listing text and adjusts citations, not capture requests (`server/ai.mjs:1–15`); scope approval requires consent/access but does not map questions to scope (`server/domain.mjs:26–27`). Completion checks coverage only of that scope (`server/domain.mjs:52`). This is not a claim that a user was charged without consent; it is a mismatch between collecting their concern and making it actionable.

## Prioritized improvements

No P0 is assigned: this review did not observe a broken core simulated demo.

| Priority | Concrete change or evidence | Why it affects judging |
| --- | --- | --- |
| P1 | Add a small pre-acceptance checklist editor and map each renter question to an item or an explicit “outside this visit” decision. Preserve the frozen version afterward. Add the basement/laundry repro as a regression case. | Turns personalized intake into contracted work; closes a direct problem/solution gap. |
| P1 | Record actual sandbox authorization, capture after adverse completion, incomplete-service void, and refund, with redacted provider identifiers. Exercise the model path on several listing/question pairs. Keep current simulation labels. | Establishes required-platform feasibility beyond implemented adapters. See `README.md:68`, `101`. |
| P1 | Run one consented or clearly staged physical visit and show the original listing claim beside the relevant uploaded photograph and resulting finding. Have five target renters explain what they learned and what remains unknown; report failures. | Tests actual evidence usefulness rather than whether synthetic sample buttons advance state. See `src/main.jsx:48–50`; `PRD.md:101–103`. |
| P1 | Define one launch neighborhood/channel and recruit a small verifier cohort. Log access acceptance, time to appointment, travel, visit duration, independent review time, and failed-access cost across a few visits. | Tests the supply/access bottleneck and whether $60/$40 works. Do not claim partnerships or viable margins before evidence. |
| P1 | Make and publish a sub-three-minute demo, and make the repository public when the owner authorizes it. Center the story on one renter question, one adverse observation, independent approval, and the distinct charge/earning states. | Closes the supplied submission gaps and makes the central idea judgeable without reconstructing the README. |
| P2 | Compare the model-generated checklist against the fixed baseline on a small frozen set of varied listings. Score missed renter concerns, unsupported requests, human editing time, latency, and provider cost. | Demonstrates incremental AI benefit; exact-substring grounding alone does not prove useful questions. See `server/ai.mjs:18–22`. |
| P2 | Write a one-page operating policy for denied access, failed collection, refund after good-faith verifier work, and the source of any travel stipend. Demonstrate one supported compensation outcome; keep payout clearly unavailable until implemented and verified. | Makes the earning promise credible without requiring a nationwide marketplace. See `README.md:113`; `server/domain.mjs:68–72`, `93`. |
| P2 | Rehearse the pitch with one unfamiliar viewer and remove optional clock/reconciliation/appeal detours from the main recording; retain them as supplemental evidence. | Improves comprehension under the video limit while preserving technical depth. |

## Adoption and operating thesis

An initial adoption loop is plausible but unvalidated: reach a concentrated cohort of incoming remote students, secure one accessible visit, deliver a useful report, and ask whether they would refer another incoming renter. University housing ambassadors and inspection providers are candidate channels, not existing partners (`PRD.md:21`). A renter may buy infrequently, so repeat consumer usage should not be assumed. A pilot should measure referral willingness and the cost of recruiting each new seasonal cohort. On the supply side, dependable visit access, compact travel distances, and fair handling of wasted trips matter more immediately than a broad verifier directory. The current artifact demonstrates the transaction workflow, not this adoption loop.

## Stage-one and submission readiness

**Mock assessment: conditional.** Theme fit and a runnable local service workflow are supported by source and the passing tests. Reasonable use of required APIs is implemented but needs actual sandbox/model evidence; the default run cannot demonstrate those providers operating. This is not an organizer decision.

- Present: MIT license (`LICENSE:1–21`), setup instructions (`README.md:9–32`), working simulated domain tests, documented API adapters, explicit boundaries.
- Missing in supplied submission: public repository visibility and a public YouTube demonstration under three minutes. The repository is private per assignment; no video was supplied, consistent with `README.md:127`.
- Conditional: account-backed PayPal/model behavior, real evidence usefulness, and unfamiliar-user comprehension. Hosting is optional under the supplied protocol; the existing local setup should not be mistaken for an incomplete hosting requirement.
- Not prerequisites imposed by this review: nationwide coverage, enterprise identity infrastructure, production-scale storage, or a full marketplace. These should not displace proof of the small service actually offered.

## Top three judge questions

1. What useful decision did a target renter make from an actual evidence package, and would they pay $60 for it?
2. Show one unfamiliar listing/question pair where the model materially improves the visit scope over the manual baseline, plus the actual sandbox record of the resulting service payment.
3. Who recruits the verifier and arranges access, and who pays for travel, review, collection failure, or a justified refund while preserving fair compensation?

## Smallest credible next iteration

Keep one locality, one verifier, and the current service-fee scope. Add editable question-to-checklist mapping. Run one consented visit with actual photographs, a deliberately documented mismatch, and independent completion review. Exercise the sandbox fee lifecycle and the model checklist path; record their real outputs separately from simulated failures. Ask a small group of target renters to interpret the report and state willingness to pay, and log the visit/review costs. Package those results into one short recording and public source submission. Do not expand into rental deposits, automated authenticity judgments, or geographic breadth before this evidence exists.

**Confidence: medium.** High confidence in source-linked boundaries and observed tests/repro; moderate confidence in product fit and innovation assessment; limited confidence in visual usability, real-provider behavior, demand, and video delivery because those were not observed.

**Moderator evidence note:** A portable copy of the isolated question-coverage reproduction is preserved as [impact-repro.mjs](impact-repro.mjs). Run `node impact-repro.mjs /absolute/path/to/walkthrough-at-521a0f4`. The coordinator independently reran it successfully. This preservation note does not change the judge's scores.
