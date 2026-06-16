---
type: Lecture Notes
title: "Jensen Huang from NVIDIA on the Compute Behind Intelligence"
course: CS153 Frontier Systems
university: Stanford
lecture_id: "04"
video: https://youtube.com/watch?v=tsQB0n0YV3k
tags: [compute, nvidia, architecture, co-design, scaling, energy, chips]
timestamp: 2026-06-15T00:00:00Z
---

# Stanford CS153 Frontier Systems | Jensen Huang from NVIDIA on the Compute Behind Intelligence

**Course:** Frontier Systems
**Video:** [YouTube](https://youtube.com/watch?v=tsQB0n0YV3k)

## TL;DR
Jensen Huang, NVIDIA CEO, delivers a rapid-fire Q&A covering the fundamental reinvention of computing driven by AI. He explains how co-design across the full stack achieved 1 million times performance improvement over 10 years (vs. Moore's Law's 100x), discusses why MFU is a misleading metric, describes how each GPU generation (Hopper for pre-training, Grace Blackwell for inference, Vera Rubin for agents, Feynman for swarms of agents) is architected for specific AI workloads, argues forcefully for open models and global competition, and shares personal career and leadership philosophy rooted in resilience and suffering.

## Key Takeaways
1. **Computing is being reinvented for the first time in 60+ years:** The shift from pre-recorded/retrieval-based computing to generative/continuous computing changes every layer of the stack.
2. **Co-design delivers exponential gains:** NVIDIA's approach of co-designing across algorithms, frameworks, compilers, and hardware achieved ~1,000,000x improvement in 10 years, far exceeding Moore's Law.
3. **MFU is a misleading metric:** Low MFU can indicate smart overprovisioning; tokens per watt is a better measure but still incomplete since not all tokens are equal.
4. **Each GPU generation targets a different AI workload:** Hopper for pre-training, Grace Blackwell NVLink72 for inference/decode, Vera Rubin for agents, and Feynman for systems of agents/swarms.
5. **Open models are essential for safety, security, and democratization:** Open models enable security researchers to interrogate systems and ensure underrepresented languages and domains get foundation models.

## Detailed Notes

### The Reinvention of Computing [00:08-08:20]
- Computing has been fundamentally the same since IBM System 360 (64 years) — same architecture, same programming model.
- The shift: from pre-recorded, retrieval-based, on-demand computing to **generated, contextually relevant, continuous computing**.
- Generative AI enabled not just image generation but the ability to **think** — generating tokens consumed internally (reasoning) vs. externally (tool use).
- The transition from GPT to agentic systems was "fairly easy to predict" once thinking-as-token-generation was understood.
- Agentic computing is **continuous** — fundamentally different from on-demand cloud computing.

### Co-Design and the Million-X Speedup [08:20-13:50]
- [[Co-Design]] originated at Stanford with John Hennessy's RISC work: simpler instruction sets co-designed with compilers outperformed individually optimized systems.
- NVIDIA extended co-design across CPUs, GPUs, networking, switches, storage, algorithms, and frameworks.
- Moore's Law: ~10x per 5 years, ~100x per 10 years. NVIDIA achieved **1,000,000x over 10 years** through co-design.
- This massive speedup enabled AI researchers to simply "take all of the internet" as training data — the computational abundance changed the approach to AI research entirely.

### Open Source and Open Models [17:10-26:10]
- NVIDIA uses more Anthropic and OpenAI tokens than almost anyone — 100% of engineers are agentically supported.
- Open-source models won't work nearly as well as products like Claude Code with their full harness.
- NVIDIA builds open foundation models in multiple domains: **Nemotron** (language), **BioNemo** (biology), **Alpamo** (autonomous vehicles), **Groot** (humanoid robotics), climate science.
- Rationale for language models: many societies have languages too small for commercial priority (e.g., Swedish, Indian dialects). Nemotron is near-frontier and fine-tunable for any language.
- Language models are fused with domain-specific models using human priors — Alpamo combines language reasoning with driving world models, reducing training data needs.
- **Safety argument for open models:** You can't defend against or secure a black box. Open models allow systematic interrogation. Cheap AI swarms (e.g., Nemotron Nano) can provide cybersecurity defense at scale.

### MFU, Tokens Per Watt, and Evaluation [27:00-33:00]
- MFU (Model FLOPs Utilization) is "simply wrong" as a comprehensive metric.
- Jensen prefers **low MFU** because it means overprovisioned resources — at any given point, something is bottlenecked (flops, memory bandwidth, memory capacity, network capacity).
- Overprovisioning avoids Amdahl's Law — spiky workloads need peak provisioning.
- **Tokens per watt** is better but still incomplete: for decode, aggregate bandwidth across NVLink72 matters most, and MFU is very low during decode.
- Not all tokens are equal — coding tokens are more valuable than other tokens.
- The real eval must measure meaningful outcomes, not just compute utilization.

### GPU Architecture Roadmap: Hopper → Blackwell → Vera Rubin → Feynman [33:00-38:11]
- **Hopper:** Designed for pre-training. Bet on building multi-billion dollar systems when the most expensive supercomputer was $350M — a marketplace of precisely zero customers.
- **Grace Blackwell NVLink72:** Designed for inference/decode. World's first rack-scale computer. 50x improvement over Hopper in two years (vs. Moore's Law 2x). Decode requires massive memory bandwidth beyond one chip — ganged 72 GPUs with new switching/interconnects.
- **Vera Rubin:** Designed for **agents**. Agents need: long-term memory connected to storage via fabric, extremely low-latency CPUs for tool calls (multi-billion dollar GPU waits for one CPU running a tool). New CPU designed for single-threaded, low-latency workloads.
- **Feynman:** Designed for **systems of agents** — swarms of agents with sub-agents. The vision of modular AI systems with deeply nested agent hierarchies.

### Energy and Sustainable Computing [38:30-41:30]
- Computing needs approximately **1,000x more energy** than currently available — possibly off by orders of magnitude.
- Future computing is both **generative** (intelligent, contextually aware) and **continuous** — far more energy-intensive than pre-recorded, on-demand computing.
- First priority: energy efficiency through co-design (50x tokens/watt improvement).
- Market forces now make sustainable energy investment viable without government subsidies — best time in history to upgrade the grid.

### Career Advice: Suffering and Resilience [42:07-45:25]
- The advice to "follow your passion" sets too high a bar — many people don't know what they're passionate about.
- Jensen enjoys ~10% of his work; 90% is hard. He suffers through it with full commitment.
- Suffering builds resilience — a muscle needed when family, company, or colleagues need you to fight through adversity.
- Seek both joy and pain; resilience requires practice.

### Strategic Thinking and First Principles [01:04:30-01:08:15]
- Observe → reason from first principles → ask "is this a big deal?" → ask "what happens next?" → build a mental model of the future → work backwards.
- Balance between being too overfit (great at one niche but can't fund R&D) and too general purpose (good at nothing).
- Reduce opportunity cost and increase optionality.
- Get the journey to pay for itself.

### Biggest Mistake and Mobile Devices [01:00:00-01:04:30]
- First generation product architecture was "completely wrong" — no Z-buffer, forward texture mapping instead of inverse, no floating point — but the recovery taught strategic thinking.
- The genuine strategic mistake: entering mobile devices. Built a billion-dollar business, then locked out during 3G→4G transition by Qualcomm's modem dominance.
- Recovery: shifted mobile low-power expertise into robotics (Thor chip lineage), but the initial entry was a waste of resources.

### Geopolitics and Chip Export [47:27-52:20]
- Comparing GPUs to atomic bombs is "stupid" — billions of people use GPUs; Jensen advocates them to family and friends.
- Conceding two-thirds of the world market to competitors would shrink the American tech industry. The telecommunications precedent shows how policy can destroy domestic technology leadership.
- AI singularity fears are irresponsible science fiction — "It is not true" that we don't understand these systems or that they'll suddenly become infinitely powerful.

### Stanford and Compute Access [53:00-57:00]
- Universities lack billion-dollar compute budgets because funding is fragmented across departments.
- Stanford should aggregate resources and build campus-wide supercomputers — analogous to the linear accelerator Stanford built in the past.
- With a $40B endowment, cutting $1B for a cloud compute service for all students and researchers would be transformative.

## Notable Quotes
> "Computing is being reinvented for the first time as dramatically as it is for the first time really in about 60 plus years." — Jensen Huang [01:23]
> "1 million X over 10 years. And so somewhere between 100,000x and a million X. When you're talking about numbers that big, it really doesn't matter." — Jensen Huang [12:17]
> "If you want AI to be safe and secure, it has to be open. You can't defend against a black box and you can't secure a black box." — Jensen Huang [23:58]
> "I really love doing 10% of my work and 90% of my work is hard and I suffer through it." — Jensen Huang [43:50]
> "It is not true that we have no idea how these systems work. It is not true." — Jensen Huang [51:46]

## Concepts Introduced
- [[Co-Design]] — The practice of simultaneously optimizing algorithms, software frameworks, compilers, and hardware architecture together rather than in isolation, yielding exponential performance gains beyond what individual optimization can achieve.
- [[Agentic Computing]] — A paradigm where computers run continuously and autonomously rather than on-demand, executing multi-step tasks with sub-agents and tool use.
- [[NVLink72]] — NVIDIA's rack-scale interconnect technology that gangs 72 GPUs together to provide aggregate memory bandwidth far beyond a single chip, enabling efficient decode/inference for large language models.
- [[Tokens Per Watt]] — A performance metric measuring intelligence output relative to energy consumption, considered more meaningful than MFU for evaluating AI system efficiency.
- [[Nemotron]] — NVIDIA's near-frontier open language model designed to be fine-tuned for any language, democratizing AI capabilities for underrepresented languages and societies.

## Connections to Other Lectures
- **Lecture 01 (Resilience):** Jensen's emphasis on suffering, resilience, and embracing challenges mirrors the cybersecurity leader's emphasis on running toward stressful situations.
- **Lecture 05 (Energy Bottlenecks):** Jensen's discussion of 1000x energy needs directly connects to Scott Nolan's lecture on energy as a fundamental bottleneck for AI scaling.
- **Lecture 11 (Compute Infrastructure):** Anjney Midha's analysis of compute scarcity, GPU pricing trends, and infrastructure cycles provides the economic framework for Jensen's hardware roadmap.

## Open Questions
- Will co-design advantages continue to compound, or will architectural paradigms shift (e.g., photonics, quantum) and reset the competitive landscape?
- How will the transition from on-demand to continuous computing change cloud infrastructure economics and pricing models?
- Can open models maintain near-frontier quality as model scale reaches trillions of parameters, given the massive compute requirements for training?
- What is the right evaluation metric for intelligence output when different token types (code, reasoning, creative) have vastly different value?
- How should universities restructure compute budgets in the AI era — and who should bear the cost?
