---
type: Lecture Notes
title: "Class 6: Enterprise Internal Knowledge — Model Training and Specialization"
course: MSE435 Economics of the AI Supercycle
university: Stanford
lecture_id: "06"
video: https://youtube.com/watch?v=LRGX-gTegVA
tags: [model-training, post-training, rlvr, applied-compute, enterprise-ai, continual-learning]
timestamp: 2026-06-15T00:00:00Z
---

# Class 6: Enterprise Internal Knowledge — Model Training and Specialization

**Course:** Economics of the AI Supercycle
**Video:** [YouTube](https://youtube.com/watch?v=LRGX-gTegVA)

## TL;DR
Yash Bottle (Applied Compute founder, ex-OpenAI post-training team, Stanford '25) explains the modern model training pipeline and why enterprise AI requires specialization beyond frontier models. Key insight: RL with verifiable rewards (RLVR) is the breakthrough technique — using only ~5% of pre-training compute but delivering massive performance gains. Code is the dominant domain because it has deterministic verification (compile + unit tests), abundant synthetic data, and is arguably "AGI complete" since every task can be reduced to code. Applied Compute helps enterprises like DoorDash and Cognition/Windsurf create specialized models by optimizing against enterprise-specific evaluations. The next frontier is continual learning — models improving from production interactions — and the pre-training vs. post-training compute split is shifting rapidly in favor of post-training.

## Key Takeaways
- Modern model training has four eras: pre-training scaling (2018-19), scaling laws/GPT-3 (2020-21), RLHF/preference tuning (2022-23), reasoning models/RLVR (2024-25)
- Pre-training compresses all of human knowledge (the internet) into model weights; post-training aligns the model and teaches it to be useful
- Chain-of-thought reasoning is a completely emergent behavior — not explicitly trained, it emerges from RL in constrained environments
- RLVR (RL with Verifiable Rewards) is the key technique: you need a deterministic way to check if the model's output is correct
- Code dominates because: (1) deterministic verification via compilation + unit tests, (2) abundant synthetic data, (3) coding may be "AGI complete" — every task reduces to code
- DeepSeek V3 pre-training: ~2.5M H800 hours; DeepSeek R1 RL training: ~150K hours — RL uses only ~5% of pre-training compute but delivers outsized gains
- The RL compute percentage is rapidly increasing as labs scale post-training
- Three scaling laws: pre-training scaling, post-training scaling, and test-time (inference) scaling
- Applied Compute helps enterprises create specialized models: DoorDash (menu digitization), Cognition/Windsurf (real-time bug detection), Ramp (fast spreadsheet search)
- General models set the floor; specialized models set the ceiling for enterprise differentiation
- Eval sets are the most guarded asset at labs — evals set the roadmap and RL is an "eval-maxing machine"
- Continual learning is the next frontier: models learning from production interactions with sparse rewards
- Cursor's "composer" model uses online training — taking gradient steps from implicit production rewards (code acceptance/reversion)
- Transformers will likely remain dominant despite inefficiency; the recipe is working and AI will probably discover the next architecture
- Pareto frontier of performance/cost/latency: small specialized models can match large model performance at fraction of cost
- The data market is getting tougher — as models improve, creating harder training tasks becomes more expensive; synthetic data generation will increasingly replace human data labeling

## Detailed Notes

### [00:00-06:00] Introduction and Background
Yash Bottle: Stanford '25, connected with Sam Altman freshman year, joined OpenAI residency early 2023. Started on evals ("the hairy job nobody wants"), then led agentic coding research that became Codex. Founded Applied Compute one year ago with co-founders Rhythm and Lyndon (all Stanford/OpenAI). Core insight: frontier models are "smart geniuses that know nothing about your business" — enterprises need specialization.

### [06:00-12:00] History of Model Training
Timeline: Transformer architecture (2017, Google Brain — self-attention, scalable on GPUs), pre-training era (2018-19, next-token prediction on internet-scale data), scaling laws (Kaplan → GPT-3 breakthrough, Chinchilla compute-optimal scaling), RLHF era (human preference tuning for alignment and safety → ChatGPT), and reasoning models (2024, 01 — test-time compute as new scaling axis). Chain-of-thought is emergent: models develop reasoning behavior from constrained RL environments without being explicitly taught.

### [12:00-18:00] Why Code Dominates and Bottleneck Evolution
Three reasons code is the dominant RL domain: (1) deterministic verification — compile code, run unit tests; (2) easy to generate massive synthetic data; (3) many researchers believe "coding models are AGI complete" — every task can be reduced to code (Claude writes code to make slides rather than using specialized tools). Bottleneck evolution: compute → architecture → pre-training data → RL environments → continual learning (next frontier). We've run out of internet-scale pre-training data. Labs are buying old libraries and scanning books; architectural advances focus on better data utilization.

### [18:00-27:00] Pre-training vs Post-training Economics and Enterprise Specialization
Pre-training: compresses internet into weights via loss optimization; orders of magnitude more compute than post-training. Post-training: teaches model what good/bad looks like via SFT → RLHF → RLVR. DeepSeek numbers: V3 pre-training ~2.5M H800-hours, R1 RL training ~150K hours (~5% of pre-training compute). But this ratio is rapidly shifting as labs scale RL runs across multiple data centers. Applied Compute examples: DoorDash menu digitization (general models failed at DoorDash's specific modifier/style-guide rules; specialized training optimized directly for error rate reduction); Cognition/Windsurf bug detection (small model post-trained to catch bugs in sub-2-second saves, matching large model performance at fraction of cost/latency).

### [27:00-36:00] Evals, Continual Learning, and Non-Transformer Architectures
Evals are the most guarded lab asset: they set the roadmap, RL is an "eval-maxing machine." SWE-bench started the coding model race. Enterprise evals differ from lab evals (JP Morgan vs Goldman Sachs have different standards). Continual learning: models improving from production use. Cursor's composer model: online training from implicit rewards (did user accept/revert code). Applied Compute's "context basing": offline agents analyze documents and past traces to extract learnings. On non-transformer architectures (Mamba, etc.): "scaling transformers is working" — likely AI will discover the next architecture if we keep scaling. Ilya Sutskever and Yann LeCun argue from first principles that humans don't need internet-scale data, therefore a more efficient architecture must exist.

### [36:00-48:00] Three Scaling Laws, Long/Short, and Rapid Fire
Jensen's three scaling laws: pre-training, post-training, and test-time (inference). Post-training compute share is growing fast. Long: Nvidia and compute/chip providers. Risk: labs may in-house chip design given Nvidia's 75% margins. Short: the data market — as models improve, creating harder training tasks gets more expensive; synthetic data generation will increasingly replace human labeling (but best data founders pivot to next wave: robotics, egocentric data). Favorite AI product: ImageGPT2 / Image Duo for visual thinking. If not building Applied Compute: would work on energy/hardware to address compute scarcity.

## Notable Quotes
- "These models today are like smart geniuses that know nothing about your business."
- "A tip for anyone: whenever you join a company, work on the hairiest thing that no one wants to work on, because people will like you for it."
- "Chain of thought is a completely emergent behavior — no one trained it to do that."
- "General models set the floor, but in order to set the ceiling you need to go and build specialized systems."
- "Every task when you boil it down is a coding task — that's why Claude and these other models are writing code to do things instead of using tool calls."
- "Probably more likely that the AI will tell us what the better architecture is if we just continue scaling it up."

## Concepts Introduced
- [[RLVR (RL with Verifiable Rewards)]] — Training technique using deterministic reward signals (code tests, math proofs) to create reasoning models
- [[Post-Training Scaling]] — Investing more compute in RL/post-training for outsized capability gains vs pre-training
- [[Emergent Chain-of-Thought]] — Model reasoning behavior that emerges from constrained RL without explicit training
- [[Code as AGI-Complete Domain]] — Thesis that coding is universal and every task can be reduced to code generation
- [[Enterprise Model Specialization]] — Training task-specific models that differentiate enterprises from competitors
- [[Continual Learning]] — Models improving from production interactions with sparse, implicit reward signals
- [[Pareto Frontier Optimization]] — Trading off performance, cost, and latency by training small specialized models
- [[Eval-Driven Development]] — Using eval sets to define training roadmaps; RL as an "eval-maxing machine"

## Connections to Other Lectures
- Lecture 01: Applied Compute addresses the app layer's challenge of creating differentiated value
- Lecture 02: Brad/Sunny discussed inference cost deflation — Yash shows how post-training makes models more efficient, not just cheaper
- Lecture 04: Ali Ghodsi identified the "context problem" — Applied Compute directly solves it via enterprise specialization
- Lecture 05: Sachin Katti described heterogeneous compute; Yash shows how different training techniques utilize that compute differently

## Open Questions
- Will the pre-training → post-training compute ratio continue shifting, and where does it stabilize?
- Can continual learning work at scale without catastrophic forgetting?
- If coding is "AGI complete," what does the coding eval landscape look like in 3 years?
- Will AI-designed architectures eventually replace transformers, or will transformers persist through inertia?
- How do enterprises prevent model specialization from becoming a recurring expensive engagement?
