# MSE435 Course Materials — Summaries

*Auto-generated from course website: https://mse435.stanford.edu/materials.html*
*Date: 2026-06-10*

---

## Week 1: Intro to the Economics of Generative AI

**Speaker:** Apoorv Agrawal (Instructor, Partner at Altimeter Capital)

### Reading 1: The Economics of Generative AI (2024)
**Author:** Apoorv Agrawal | **Date:** April 25, 2024
**URL:** https://apoorv03.com/p/the-economics-of-generative-ai

The Gen AI stack is "A-shaped" — value concentration is inverted compared to the cloud economy. Eighteen months after the "iPhone moment of AI," the semis layer (NVIDIA) captured 83% of Gen AI stack revenues (~$75B of $90B) and 88% of gross profits ($64B of $73B). NVIDIA earns 85%+ gross margins on datacenter products. The infra layer earns ~$10B and apps only ~$5B. Agrawal predicts this inverted pyramid won't persist — drawing parallels to mobile and cloud, where value accrued first in hardware, then shifted to software over a decade. Key levers for the shift: custom silicon from hyperscalers, new model architectures beyond transformers, and cost reduction techniques (batching, distillation, quantization, MoE).

### Reading 2: The Economics of Generative AI: Two Years Later
**Author:** Apoorv Agrawal | **Date:** April 1, 2026
**URL:** https://apoorv03.com/p/the-economics-of-generative-ai-two

Two-year update: the AI ecosystem grew ~5x from $90B to $435B, but the fundamental structure is unchanged. NVIDIA alone added $175B in revenue — 3x the entire app layer combined. Key thesis: "Semi is a one-player game. Apps is a two-player game (OpenAI + Anthropic = 75% of app revenue). Infra is the only competitive layer." Every major hyperscaler is developing custom chips (Google TPU 7th-gen, Amazon Trainium, OpenAI+Broadcom 10GW deal, Microsoft Maia, Meta MTIA). Top-5 hyperscaler capex hit $443B in 2025 (73% YoY), projected >$600B in 2026. Jensen Huang dismisses custom ASICs: "a lot of ASICs get canceled." The stack will eventually flip, but could take over a decade.

### Reading 3-5: The State of Consumer AI (3-part series)
**Author:** Apoorv Agrawal | **Dates:** March 2-30, 2026

**Part 1 — Usage:** ChatGPT dominates with 70% of AI WAU (~900M users), approaching core utility status (YouTube/Chrome tier). Gemini holds 15-20% via Google's distribution. Every quarter brings a hyped challenger (DeepSeek, Grok, Gemini spikes) that fails to sustain. "Attention is easier to capture; daily habits are hard to build."

**Part 2 — Engagement:** ChatGPT's DAU:MAU ratio (45%) is 2x Gemini's (22%). Week-4 retention at 66% (up from 40% three years ago) — improving while growing 10x, which is extremely rare. Shows a "smile curve" in retention where lapsed users reactivate. The window to displace ChatGPT is narrowing.

**Part 3 — Monetization:** Consumer AI's advertising opportunity may exceed subscriptions. ChatGPT queries carry stronger intent signals than search (users provide "budget, preferences, constraints in a single prompt"). With ~800-900M free users, $30/user annual ad revenue implies ~$25B ad opportunity — modest vs. Meta's $57/user. Key risk: not all AI usage is commercial.

---

## Week 2: Silicon — The GPU Economy

### Supplementary: Acquired Podcast — Altimeter Capital
**URL:** https://www.youtube.com/watch?v=npBC3R-dOr0
Brad Gerstner (Altimeter founder) discusses AI investment thesis, the GPU economy, and how Altimeter positions within the AI supercycle.

### Supplementary: Groq Founder Jonathan Ross
**URL:** https://www.youtube.com/watch?v=VfIK5LFGnlk
Jonathan Ross discusses custom AI chips, OpenAI/Anthropic's silicon strategies, and NVIDIA's competitive trajectory.

---

## Week 3: Infrastructure — Building AI Factories at Gigawatt Scale

**Speaker:** Chase Lochmiller (Crusoe)

### Reading: A Primer on AI Data Centers
**Author:** Eric Flaningam | **Date:** October 13, 2024
**URL:** https://www.generativevalue.com/p/a-primer-on-ai-data-centers

Comprehensive primer comparing the AI datacenter buildout to the electric grid buildout 100 years ago. Largest AI data centers will consume up to 1 GW — every five mega data centers adds an NYC-equivalent load to the grid. AI data centers differ from traditional ones: bigger, denser, location-flexible (training doesn't need user proximity), and far higher energy/cooling demands. Key bottlenecks: grid expansion (years-long wait for transmission), permitting (consistently the #1 bottleneck), and cooling (liquid → immersion cooling transition). Nuclear is clean and reliable but needs economically viable construction. NVIDIA is "exceptionally well-positioned across the full stack."

### Supplementary: McKinsey — The AI Infrastructure of the Future
**URL:** https://www.mckinsey.com/capabilities/tech-and-ai/our-insights/the-ai-infrastructure-of-the-future
McKinsey podcast/article on Crusoe's approach to powering AI with stranded energy sources.

---

## Week 4: Enterprise AI — Service as a Software

**Speaker:** Ali Ghodsi (Databricks)

### Reading: The End of Software
**Author:** Chris Paik
**URL:** https://docs.google.com/document/d/103cGe8qixC7ZzFsRu5Ww2VEW5YgH9zQaiaqbBsZ1lcc/edit
Thesis that AI agents will replace traditional SaaS by performing the work that software merely assisted with. Rather than selling licenses to tools, companies will sell outcomes delivered by AI agents — fundamentally changing the economics of software.

### Supplementary: Ali Ghodsi with David Solomon at Goldman Sachs
**URL:** https://www.youtube.com/watch?v=WLrRhc6hig4
Databricks CEO Ali Ghodsi in conversation with Goldman Sachs CEO David Solomon on enterprise AI, data platforms, and the shift from software to AI-powered services.

---

## Week 5: Infrastructure & Capstone Case

**Speaker:** Sachin Katti (Head of Industrial Compute, OpenAI)

### Supplementary: OpenAI x Broadcom — Building Custom Silicon
**URL:** https://www.youtube.com/watch?v=qqAbVTFnfk8
OpenAI Podcast episode discussing the partnership with Broadcom for custom AI accelerators and the rationale for building custom silicon at 10GW scale.

### Supplementary: Sachin Katti — Scaling AI from Silicon to Systems
**URL:** https://www.youtube.com/watch?v=vjB7Nd8NvT0
Deep dive into OpenAI's infrastructure challenges and how they're building the compute layer for frontier AI models.

### Supplementary: Supply and Demand of AI Tokens
**URL:** https://www.youtube.com/watch?v=LF3aUIM57uw
Analysis of the economics of AI inference — token pricing, demand curves, and how the market for AI compute is evolving.

---

## Week 6: Intelligence — Unlocking Enterprise Internal Knowledge

**Speaker:** Yash Patil (Applied Intelligence)

### Reading: 2025 LLM Year in Review
**Author:** Andrej Karpathy | **Date:** December 19, 2025
**URL:** https://karpathy.bearblog.dev/year-in-review-2025/

Karpathy identifies 6 key developments of 2025:
1. **RLVR (RL from Verifiable Rewards)** — New training stage where LLMs develop reasoning by training against automatically verifiable puzzles (math/code). OpenAI's o3 was the inflection point.
2. **Jagged Intelligence** — LLMs are simultaneously brilliant and easily fooled. Benchmarks are losing trust because they're susceptible to RLVR optimization.
3. **Cursor** — Revealed a new "LLM app" layer that bundles context engineering, orchestrates multiple LLM calls, and provides an "autonomy slider."
4. **Claude Code** — First convincing LLM agent combining tool use and reasoning locally. "A little spirit/ghost that lives on your computer."
5. **Vibe Coding** — AI crossed the threshold enabling programs via English alone. Code becomes "free, ephemeral, malleable, discardable."
6. **Nano Banana** — Hints at LLMs communicating through images/infographics/apps, not just text. Current chatbot UIs are like 1980s command lines — a GUI equivalent is needed.

### Reading: Welcome to the Era of Experience
**Authors:** David Silver, Richard S. Sutton (Google DeepMind) | **Published by:** MIT Press (preprint)
**URL:** https://storage.googleapis.com/deepmind-media/Era-of-Experience%20/The%20Era%20of%20Experience%20Paper.pdf

Landmark paper arguing AI is transitioning from the "era of human data" to the "era of experience." Key thesis: progress from supervised learning on human data is slowing — the majority of high-quality data sources have been consumed. The next leap requires agents that learn from their own experience interacting with environments, not just imitating humans. Four defining characteristics of experiential AI:
1. **Streams** — Agents inhabit ongoing streams of experience (not episodic interactions). Information carries across time, goals stretch far into the future.
2. **Actions & Observations** — Agents act autonomously in the real world through both human-friendly (UI) and machine-friendly (API) interfaces, grounded in motor control and sensors.
3. **Rewards** — Grounded in environmental feedback (heart rate, exam scores, CO₂ levels), not human prejudgement. Enables discovering strategies humans wouldn't think of.
4. **Planning & Reasoning** — Using non-human mechanisms of thought (symbolic, distributed, continuous). Human language is "highly unlikely to be the optimal instance of a universal computer."

The paper argues that without grounding in real-world data, AI will become "an echo chamber of existing human knowledge." World models that predict consequences of actions enable planning directly in terms of effects on the environment.

---

## Cross-Reference: Concepts Across Readings

| Concept | Weeks | Readings |
|---------|-------|----------|
| **NVIDIA dominance / GPU economy** | 1, 2, 3 | Economics of GenAI (both), Data Centers Primer |
| **Custom silicon (TPU, Trainium, ASICs)** | 1, 2, 5 | Economics 2-year update, OpenAI x Broadcom |
| **AI datacenter buildout / energy** | 3, 5 | Data Centers Primer, McKinsey, Sachin Katti talk |
| **Value chain economics (A-shaped stack)** | 1, 4 | Economics of GenAI (both), End of Software |
| **Consumer AI / ChatGPT dominance** | 1 | State of Consumer AI (3 parts) |
| **Experiential AI / beyond human data** | 6 | Era of Experience (Silver & Sutton) |
| **Vibe coding / LLM agents** | 6 | Karpathy Year in Review |
| **Enterprise AI / Service as Software** | 4, 6 | End of Software, Enterprise Knowledge lecture |
