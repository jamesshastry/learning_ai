---
type: Lecture Notes
title: "Andreas Blattmann from Black Forest Labs on Visual Intelligence"
course: CS153 Frontier Systems
university: Stanford
lecture_id: "09"
video: https://youtube.com/watch?v=CBaLU0dDEY8
tags: [visual-intelligence, diffusion-models, open-source, image-generation, multimodal]
timestamp: 2026-06-15T00:00:00Z
---

# Stanford CS153 Frontier Systems | Andreas Blattmann from Black Forest Labs on Visual Intelligence

**Course:** Frontier Systems
**Video:** [YouTube](https://youtube.com/watch?v=CBaLU0dDEY8)

## TL;DR
Andreas Blattmann, co-founder of Black Forest Labs and co-creator of Stable Diffusion, explains the journey from latent diffusion models to the Flux model family and the frontier of visual intelligence. He introduces the distinction between natural representations (video, audio — from the physical world) and unnatural representations (text — human-made and information-dense), argues that visual models must train on natural representations first (as human babies do) rather than treating vision as an add-on to language, and describes how BFL bootstrapped the Flux flywheel from academic research with minimal compute to a multi-hundred-million-dollar business powering image editing for Meta's 2 billion users.

## Key Takeaways
1. **Natural vs. unnatural representations:** Video/audio are natural (high-dimensional, redundant, from physics); text is unnatural (human-made, information-dense). AI must learn from natural representations first, as babies do, to achieve higher intelligence.
2. **Latent diffusion was born from compute constraints:** Unable to afford training in pixel space, BFL developed perceptually equivalent latent representations — a "learned JPEG codec" — that enabled orders-of-magnitude compute savings while matching or beating competitors.
3. **Context feedback drove capability jumps:** Flux 1's open-weight release revealed massive user demand for character consistency/editing. Within 60 days of competitive pressure (GPT-4 image launch), BFL shipped Flux Context, doubled revenue in 6 weeks, and won the Meta partnership.
4. **Open weights + customization = commercial sustainability:** When aesthetic preferences vary widely by audience (culture, use case), open models that customers can customize outperform one-size-fits-all closed models. BFL's tiered release (Schnell/Dev/Pro) proved this model.
5. **Self-Flow enables multimodal compounding:** BFL's Self-Flow paper solves alignment of generative model representations with multimodal representation learning, enabling cross-modal learning gains (e.g., sound-action correlations teaching physics understanding).

## Detailed Notes

### Natural vs. Unnatural Representations [11:41-14:50]
- **Natural representations:** Video, audio — electromagnetic waves, sound from physical phenomena. Humans cannot control the source (the sun, physics). High-dimensional, highly redundant.
- **Unnatural representations:** Text — evolved for efficient human communication. Very low redundancy, high information per symbol.
- Why images/video need compression before training: natural signals have massive redundancy that text doesn't have.
- Human babies learn from natural representations first (observation, hearing, interaction) for 3-5 years before learning text. A 3-year-old's intelligence is qualitatively different from an LLM's.
- **BFL's conviction:** Natural representations are the fundament of higher intelligence. Starting from language and bolting on vision is the wrong approach.

### From Latent Diffusion to Stable Diffusion [04:29-08:50]
- Started PhD at Heidelberg in 2019 (computer vision was a niche topic in AI). Competed with Google and OpenAI research teams from a tiny lab.
- **Key innovation: latent generative modeling.** Train a compression model (like learned JPEG) to find perceptually equivalent but lower-dimensional representations, then train generative models in that latent space.
- This saved enormous compute — produced better models with orders of magnitude less compute than competitors.
- Found compute through open source community. Released Stable Diffusion in 2022 — surprised by the hype, especially in the Bay Area vs. Germany where few knew about it.

### Bootstrapping the Flux Flywheel [19:10-27:55]
- **Phase 1 — Focus:** At company founding, had the recipe for frontier image models. Decided to build a 10x better unimodal text-to-image model. Three months of focused execution → Flux 1.
- **Phase 2 — Context feedback:** Users were training LoRAs for character consistency, revealing demand for image editing and precise control. Text descriptions are inherently ambiguous ("blue bird" = infinite possible images).
- **Phase 3 — Competitive response:** When GPT-4 image dropped, team didn't panic. Assessed the landscape methodically, restaffed within 24 hours. 60 days later, shipped Flux Context (editing model). Revenue doubled in 6 weeks. Meta partnership announced for 2 billion users — from a 25-person team in Germany.
- **Key leadership lesson:** "The mark of a good leader is to not panic. Keep calm, look at the data, assess the landscape, come up with a plan step by step."

### Open Weights as Business Model [42:00-56:00]
- When aesthetic preferences vary widely by audience (culture, brand, personal taste), open models that customers can customize are more valuable than closed one-size-fits-all models.
- **Flux 1 packaging:** Schnell (fast, 4-step, Apache 2.0 open), Dev (open weights, commercial license), Pro (behind API, highest quality, most steps). Same model size, different step counts — unlike language models where tiers are different sizes.
- Adversarial diffusion distillation enables this: you can distill a multi-step diffusion model down to 2-4 steps with minimal quality loss. This creates natural product tiering.
- Open-source community gets fast lightweight model; enterprises get high-quality API; developers get customizable middle ground.

### Diffusion vs. Auto-regressive Models [50:00-54:30]
- Diffusion models iterate orthogonal to data dimension (noise→clean); language models iterate along data dimension (token by token).
- **Diffusion training advantage:** Data inefficient in a good way — each example generates infinite training losses from different noise levels.
- **Diffusion inference advantage:** Can distill to very few steps (50 → 4 → 2). Auto-regressive models can't easily skip tokens.
- **Auto-regressive training advantage:** Parallel token training, more data efficient.
- **Open research problem:** Combining data efficiency of auto-regressive models with inference properties of diffusion/flow-matching models.

### Self-Flow: Multimodal Representation Alignment [41:42-43:45]
- Previous work aligned generative model representations with single-modality representation learning models (e.g., DINO for images).
- Self-Flow extends this to multimodal alignment — aligning generation with understanding across multiple natural representations simultaneously.
- Enables compounding effects: correlations between modalities (e.g., sound of collision + visual of collision) help the model understand physics better than learning either modality alone.

### Physical AI and Action Prediction [31:23-37:14]
- Pre-training and mid-training are still observation-only — models observe examples and compute losses. No interaction.
- **Mid-training adds actions:** Condition model on input + predict actions (keystrokes, robot movements). Enables computer use, physical AI.
- **Post-training = physical interaction:** Hook model to robot, let it interact with real world, create data, pipe back into training. Physical world naturally applies boundary conditions (robot joints have limits) — provides inherent verification.
- This closes the feedback loop that's especially hard for aesthetics/preferences (subjective human judgment) but natural for physical tasks.

### Cultural Resilience at BFL [47:47-48:30]
- Only one person has ever left the company in its entire history.
- Culture of "disagree and commit" — spirited internal debate, but unified execution after decisions are made.
- BFL applies guardrails equally to all partners regardless of size or money — has lost meaningful revenue by refusing to remove guardrails for large customers.

## Notable Quotes
> "If I just see two rigid bodies colliding, I always have a sound attached to it. Being able to observe this correlation for a model is super important." — Andreas Blattmann [16:56]
> "The mark of a good leader is to not panic. Keep calm, look at the data, assess the landscape, and then come up with a plan step by step." — Anjney Midha [27:23]
> "Wherever in life we have verifiability, progress can quite reliably be made." — Anjney Midha [35:48]
> "Open makes a lot of sense in domains where the distribution of preferences is quite wide and heterogeneous." — Anjney Midha [40:47]

## Concepts Introduced
- [[Natural vs. Unnatural Representations]] — Natural representations (video, audio) come from physical phenomena with high redundancy; unnatural representations (text) are human-engineered for efficient communication. AI should learn from natural representations first.
- [[Latent Diffusion]] — Training generative models in a compressed latent space rather than pixel space, using a learned compression model that preserves perceptual quality while dramatically reducing dimensionality and compute cost.
- [[Adversarial Diffusion Distillation]] — Technique for reducing the number of diffusion steps from 50 to 2-4 while preserving quality, enabling product tiering (fast/cheap vs. slow/high-quality) from a single base model.
- [[Self-Flow]] — BFL's technique for aligning generative model representations with multimodal representation learning models, enabling cross-modal compounding effects where correlations between modalities improve understanding.
- [[Physical Verification]] — The principle that AI progress is fastest and most reliable in domains where task completion can be physically verified, contrasted with aesthetic/creative domains requiring subjective human judgment.

## Connections to Other Lectures
- **Lecture 08 (Amit Jain, Luma AI):** Amit's unified architecture directly addresses the same multimodal challenge Andy describes, but approaches it differently — Luma builds one backbone while BFL pioneered modality-specific innovations (latent diffusion) that inform the unified approach.
- **Lecture 10 (Mati Staniszewski, ElevenLabs):** The cascaded vs. fused debate in audio parallels the unimodal vs. multimodal progression in visual intelligence that Andy describes.
- **Lecture 11 (Anjney Midha):** Anjney's framework of context feedback loops and verifiability directly contextualizes BFL's journey — the Flux flywheel exemplifies his thesis about how frontier labs bootstrap and sustain progress.

## Open Questions
- Will natural representation learning (video + audio first) produce fundamentally different intelligence than language-first approaches, or will the models converge?
- Can adversarial diffusion distillation techniques be applied to auto-regressive models to achieve similar inference speedups?
- As visual models become multimodal and capable of physical AI, how does the verification problem change for creative/aesthetic tasks?
- Will the open-weight model remain commercially viable as training costs increase to billions of dollars?
