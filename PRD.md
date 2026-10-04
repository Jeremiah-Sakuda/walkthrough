# Walkthrough product requirements

**Version:** 0.1. **Date:** October 3, 2026. **Status:** Proposed MVP; no implementation or validation. See the [implementation and shared requirements](README.md) for shared requirements, timeline, and payment sources.

Walkthrough helps a person considering a remote rental obtain fresh, structured evidence from a local apartment visit. AI identifies missing information before the visit and compares the resulting evidence against the listing afterward. The renter buys a verification service whose scope and limitations are visible before payment.

## Hackathon objective

The goal is to win first place overall in the PayPal AI Hackathon. Prioritize a strong showing across all five equally weighted judging criteria. See [the goal, official judging criteria, and project-specific evidence plan](HACKATHON.md).

## Product decision and original concept

The original proposal held a rental deposit and captured it to the landlord after a successful tour. Physical access and matching photos do not establish rental authority, lease validity, or the absence of fraud. The recommended MVP therefore handles the verification fee and verifier compensation, while leaving the rental deposit outside the product.

Deposit authorization remains a gated extension described below. This is a deliberate proposed reduction in the initial promise. The MVP can report what was observed, what appears inconsistent, and what remains unresolved; it cannot certify a safe tenancy.

## Audience and problem

The primary customer is a student or intern moving to one launch city who cannot attend a showing. A local verifier performs a bounded visit with a checklist and fresh capture requests. The listing contact supplies access but does not control the report or verifier compensation.

The hypothesis is that renters will pay for timely, inspectable evidence before deciding whether to proceed. Interview five recent remote renters and three potential verifiers to test the problem, service price, travel cost, and access arrangements. University housing ambassadors or an existing inspection provider are candidate recruitment channels, not established partnerships.

## Service scope and pricing

For the demo, propose a $60 verification fee, including a $40 verifier earning and $20 gross platform allocation before processing, travel, support, and refunds. These are illustrative assumptions with no established margin. A single-city, 48-hour fulfillment window keeps scheduling bounded; no nationwide coverage or turnaround guarantee is claimed.

The renter approves a checklist covering the address shown, agreed rooms, visible condition, and specific listing claims. An unfavorable finding still counts as completed work if the agreed evidence is supplied. Access denial, an incomplete visit, or unusable evidence means the service is incomplete and the fee is voided. Any verifier travel stipend for an aborted visit must come from a separately budgeted platform amount, not a surprise renter charge.

## Main user journey

1. The renter enters listing text, selected photos they have permission to share, the listing contact, target visit time, and specific questions. Arbitrary site scraping is outside the MVP.
2. AI proposes concern areas and a visit checklist, citing listing text or image references. It distinguishes observed inconsistencies from unsupported suspicions. A low-price claim requires a supplied, credible comparison; otherwise price context is unavailable.
3. The renter reviews the service scope, fee, cancellation rules, and report limits. A verifier and access slot are tentatively available before checkout.
4. The renter authorizes the verification fee. On confirmed authorization, the scheduler locks the assignment and appointment. If locking fails, void the hold.
5. During the visit, the app issues session-specific requests such as showing a named room and a changing challenge phrase. The verifier submits fresh evidence with timestamps and checklist links.
6. AI compares submitted material to the listing and identifies missing coverage, apparent differences, and uncertain matches. A human operator reviews the evidence package for completion independently of the listing contact.
7. Once the agreed deliverable is complete and accessible, the platform captures the service fee under the renter's accepted terms and delivers the report. Incomplete or expired work triggers void processing.
8. The renter decides whether to pursue the rental. Verifier earnings become payout-eligible after the service's appeal window, regardless of whether the report is favorable.

## Functional requirements

| ID | Requirement and acceptance condition |
| --- | --- |
| W1 | Create a case from bounded listing text and permitted photos. Record source, capture date, and renter questions without claiming the listing is authentic. |
| W2 | Generate a reviewable checklist with evidence references. Unsupported claims and missing comparison data remain unknown. |
| W3 | Display verifier availability and obtain access confirmation. No showing available means verification incomplete, not a fraud verdict. |
| W4 | Confirm the appointment only after fee authorization and atomic local slot assignment. A late payment response cannot double-book a verifier. |
| W5 | Issue session-specific capture requests and associate evidence with the case, checklist item, and session. Reject identical reused files using hashes; flag suspected reuse for human review. |
| W6 | Compare listing claims and visit evidence with explicit matched, inconsistent, missing, or uncertain states. No generic safe-property badge. |
| W7 | Require an operator to confirm service completion before capture. The verifier and listing contact cannot approve their own payout. |
| W8 | Pay for completed work whether the listing appears consistent or concerning. An adverse report must not reduce the agreed verifier earning. |
| W9 | On cancelled, expired, or incomplete service, reconcile and void the authorization. Show unresolved operations and any separately funded travel stipend. |
| W10 | Deliver an evidence-linked report, receipt, appeal route, and payout status with auditable actions and accessible media controls. |

The MVP accepts up to 12 images and one 60-second clip per case, with a proposed 100 MB total limit. These limits require device and model testing. If the selected model only accepts images, sample and label frames and do not describe that as continuous video verification.

## Evidence and AI boundaries

AI performs two bounded tasks: turn listing claims into a useful checklist, and compare collected evidence against that checklist. It may flag repeated images, missing rooms, apparent mismatches, and suspicious language with reasons. It must not invent external price comparisons, property records, ownership information, or image-search results.

Session challenges, timestamps, and file hashes help identify certain reuse patterns but are not proof of location, liveness, or authenticity. Metadata can be manipulated. The product does not promise general AI-generated-image detection. Human review can still miss collusion or a convincing false scene.

An observation such as “the kitchen layout differs from the listing photo” must link to the two relevant images. “The landlord is a scammer” is not an allowed conclusion from a missed showing or visual mismatch. Listing text and visible instructions in images are untrusted input and cannot authorize payment or alter the checklist.

## Payment and service states

Case states are draft, awaiting access, awaiting authorization, scheduled, in progress, evidence review, complete, incomplete, cancelled, and disputed. Financial states are separate and include authorized, capture pending, captured, void pending, voided, refund pending, refunded, and unknown. Verifier earnings and payouts have independent pending, eligible, submitted, successful, or failed states.

Walkthrough is the configured service merchant in the proposed sandbox. The authorization covers the verification fee only. The fee can be captured only for the frozen service scope after operator completion approval. Renter acknowledgment helps usability but cannot be required indefinitely for a verifier to earn payment for delivered work; the contract explains the objective completion process and appeal route.

For the demo, propose a 48-hour appeal window before payout eligibility. A dispute holds the relevant unpaid earning while an independent operator reviews it. Refunds after payout are a platform exposure that needs a reserve policy before production. Payouts must use an available platform balance; capture success does not automatically imply payout liquidity.

If capture fails after completed work, keep the report and payment problem visible, request an explicit new checkout when appropriate, and preserve the verifier obligation under a pre-agreed platform policy. Do not silently make the verifier bear renter collection risk. The feasibility gate must identify who funds this exposure.

## Experience and data

The renter moves through listing review, appointment selection, visit progress, and an evidence report. The verifier receives a focused mobile checklist with safe stop and upload-retry controls. The operator sees coverage, inconsistencies, and separate payment status. Bryntum is optional for appointment scheduling, resource conflicts, and hold-dependent confirmation if those capabilities materially help.

Core records are ListingSnapshot, Case, ServiceScope, AccessConfirmation, Verifier, Appointment, Challenge, EvidenceItem, Assessment, CompletionReview, Authorization, Appeal, Earning, and Payout. Retain original evidence privately and expose only permitted derivatives. Signed media access must expire; users cannot enumerate another renter's case.

Default raw-media retention is 30 days after closure, extended only for a disclosed active dispute. Keep demo media synthetic or consented; avoid publishing addresses, occupants, identifying documents, or private interiors without permission. Location collection requires consent and is not treated as definitive proof. Verifiers must be able to abandon an unsafe visit; the app must not require entry to earn an agreed aborted-visit stipend.

## MVP and exclusions

Must ship: one locality, one or two enrolled demo verifiers, listing intake, concern review, scheduling, service-fee authorization, session challenges, evidence comparison, independent completion review, capture or void, report, and compensation records. Confirmed Payouts is required for the full verifier-payment demo; without access, label earnings pending and remove the claim of completed payment.

Deferred: rental-deposit custody, landlord payouts, nationwide verifier marketplaces, automatic legal conclusions, ownership certification, background checks, arbitrary scraping, broad deepfake detection, and guarantees against rental fraud.

## Deposit extension gates

The original held-deposit concept requires all of the following before inclusion: a permitted and tested landlord payment flow; a defined process for checking identity and authority to rent; renter approval of the exact lease and amount; reviewed deposit-handling requirements in the launch jurisdiction; clear cancellation and dispute responsibility; and a supported authorization window covering the actual process.

Even after those gates, an AI pass cannot release the deposit. A favorable tour is only one input to explicit renter approval. Do not describe a PayPal authorization as escrow or imply a protection guarantee. If any gate remains unresolved, the demo and submission stay focused on the verification service.

## Validation and release gates

| Area | Proposed acceptance target |
| --- | --- |
| Payment feasibility | Complete authorization, delivered-service capture, cancelled-service void, refund, and verifier payout in sandbox; identify funding for failed collection and aborted visits. |
| Workflow reliability | Test concurrent slot booking, no-show, lost upload, expired authorization, timeout, duplicate completion, and payout failure without duplicate charges or false completion. |
| Evidence usefulness | Freeze eight consented or synthetic cases covering a match, clear mismatch, missing room, reused file, difficult viewpoint, and incomplete access. All material mismatch or missing-evidence cases must be flagged for review; human scoring records false alarms and uncertainty. |
| Claim discipline | Every report observation links to supplied evidence. No unverified ownership, legal authority, safe-tenancy, or definitive fraud claims. |
| Usability | At least four of five renters can identify observed facts, unresolved questions, and the next decision. Both demo verifiers complete the capture flow without assistance. |
| Economics | Measure actual visit time, travel, support time, and model cost for the pilot; report whether the proposed price covers them rather than asserting viable margins. |

By October 9, prove a usable evidence package from one real consented visit or a clearly labeled staged scene, plus the service payment lifecycle. If multimodal comparison is unreliable, keep AI-assisted checklist generation and human evidence comparison, and narrow the claims accordingly. If access or verifier availability fails, cut geographic breadth rather than inventing coverage.

## Demo and judging plan

Use 2:45: 20 seconds for the remote renter's problem, 30 for listing concerns and agreed scope, 25 for fee authorization and scheduling, 45 for a recorded consented visit and fresh evidence requests, 30 for an evidence-linked report and service capture, and 15 for an access-failure case with a void. Label the visit footage as recorded and distinguish app-time simulation from provider behavior.

The report can find a mismatch and still pay the verifier because the contracted work was completed. That is the central trust demonstration. Impact evidence comes from renter feedback; implementation evidence is the linked scheduling, evidence, and payment lifecycle. The pitch must say that Walkthrough supports a rental decision, not that it proves a listing is safe.

## Unresolved decisions

Validate launch locality, verifier supply, access arrangements, capture safety, completion rubric, payer and verifier dispute handling, funding reserves, payout access, consented media sources, and realistic unit economics. These are feasibility questions, not evidence of existing partners or operational capacity.
