# Walkthrough local demo preview

[Play the narrated preview](preview.mp4) · [Transcript](TRANSCRIPT.md) · [Captions](captions.vtt) · [Storyboard](storyboard.json) · [Video metadata](video-metadata.json)

This is an **edited narrated walkthrough of actual local UI screenshots**, not continuous footage. Every selected frame was captured by the coordinator from **5783237815484e1e039d947218b9c07d6d8f3b90** on an isolated local demo, then visually inspected during packaging. The captions and narration identify simulated payments. All listing/evidence examples are synthetic.

Subsequent code corrections at **c7f7ac56488704839fc9310ddc631235f7afb40c** include uncertain custom-task sample observations, a more specific bedroom citation, mobile status typography and next-action orientation. They passed local tests/build but are **not recaptured in this preview**. The earlier mobile ledger screenshot is not included. A separate [final mobile ledger still](frames/07-final-mobile-ledger.png), captured at c7f7ac5 with the existing completed case, confirms the coordinator’s narrow 375px no-overflow check; it is not included in the video. See [round-two QA](../ROUND2_QA.md) for precisely what was observed and which checks were automated.

The preview demonstrates question-scope editing, a frozen agreement, preserved task-specific correction feedback, and the separation of service completion from an unknown simulated payment. It does not prove real PayPal execution, live AI quality, physical inspection usefulness, user demand or sent payouts. There is no public video URL yet.

To reproduce encoding on a Mac with `say`, `ffmpeg` and `ffprobe`, use the parent workspace's `scripts/render-demo.mjs` against this `storyboard.json`. The committed MP4, captions and transcript are directly usable without that helper. Temporary `.render/` files are excluded from source control. Narration uses the macOS Samantha voice, 175 words/minute; screenshots preserve actual app state rather than generated mockups.
