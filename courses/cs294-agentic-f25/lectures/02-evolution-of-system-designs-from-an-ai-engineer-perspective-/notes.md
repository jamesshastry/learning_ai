---
type: Lecture Notes
title: "Evolution of System Designs from an AI Engineer Perspective"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "02"
video: https://youtube.com/watch?v=xqRAS6rAouo
tags: [ai-infrastructure, system-design, neocloud, applications, startup, industry]
timestamp: 2026-06-15T00:00:00Z
---

# Evolution of System Designs from an AI Engineer Perspective

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=xqRAS6rAouo)

## TL;DR
Yangqing Jia (NVIDIA, formerly Lepton AI / Caffe creator) surveys the AI landscape from an industry practitioner's perspective: model evolution, consumer vs enterprise applications, AI infrastructure as a third pillar of cloud computing, and hardware trends. He draws parallels between historical computing paradigms and modern AI infrastructure challenges.

## Key Takeaways
- The gap between open-source and closed-source model quality has shrunk from ~1 year to ~6 months
- AI infrastructure has become the "third pillar" of IT alongside web cloud and data cloud, with fundamentally different compute-to-IO ratios
- Consumer AI apps that target prosumers (productivity use cases) show strongest willingness to pay — coding, content creation, voice
- Enterprise AI applications have strong potential but move slowly; Glean exemplifies successful enterprise AI search
- GPU supply chain management is a major non-technical challenge for AI startups
- Hardware design is cycling back toward mainframe-like architectures (NVL72) with shared memory across racks

## Detailed Notes

### 00:00 — Background and Chinese Keyboard Analogy
Jia connects next-token prediction to the century-old problem of optimizing Chinese typewriter layouts via bigram statistics — the same fundamental principle as modern LLMs, just with more sophisticated models and longer context.

### 08:00 — Model Landscape
Closed-source models (GPT-5, Gemini, Grok) lead in absolute quality. Open-source models (DeepSeek, Qwen) catch up within ~6 months. OpenRouter data shows 10x growth in token consumption year-over-year, proving real usage rather than hype.

### 15:00 — Research Innovation Timeline
2022: Transformer/GPT breakthrough (analogous to AlexNet). Then MoE for efficiency, test-time scaling for reasoning, and RL (DeepSeek-style) for defining sophisticated loss functions aligned with end results.

### 20:00 — Application Landscape
Consumer apps: chat (ChatGPT, Gemini), coding (Cursor), search (Perplexity). 11 new apps entered the a16z top-50 list in just 6 months. Prosumer tools with embedded productivity value command $20-50/month willingness to pay.

### 29:00 — Enterprise Applications
Enterprise AI is nascent but high-potential. Glean (enterprise search) reached $100M ARR by connecting multiple data sources. Companies start with closed-source models then build proprietary models as data accumulates. Duolingo exemplifies AI-native synergy rather than disruption.

### 33:00 — AI Infrastructure as Third Pillar
Web cloud (microservices, flexible VMs) → Data cloud (Snowflake, Databricks, distributed SQL) → AI cloud (exaflops of low-precision compute, rigid GPU allocation, MPI-like workloads). AI workloads require locality, are not interruptible, and need specialized orchestration (Ray, SkyPilot).

### 44:00 — Kubernetes vs Slurm Holy War
Researchers want simple Slurm-like "give me machines, run my job" abstractions. Operations teams want Kubernetes orchestration. The fundamental tension: developer simplicity vs operational reliability when GPUs regularly fail.

### 50:00 — Hardware Evolution
Computing has come full circle: from Cray-2 mainframes (1985) with shared bus → OCP modular servers (cloud era) → DGX boxes (GPU era) → NVL72 rack-level integration with shared memory (back to mainframe-like architecture). This enables disaggregated inference and eliminates model partitioning complexity.

## Notable Quotes
- "The biggest lesson from 70 years of AI research is that we can employ a generalized approach and deploy a large amount of computation onto a large amount of data."
- "If we were to do Lepton again, we would be bullshitting more, in a respectful manner."
- "Attention is all you need — and only by driving attention and grabbing customers and efficiently using feedback to quickly iterate, can a startup be successful."

## Concepts Introduced
- [[Neocloud]] — AI-centric cloud providers (CoreWeave, Lambda) optimized for GPU workloads
- [[AI Infrastructure Third Pillar]] — AI compute as distinct from web cloud and data cloud
- [[Test-Time Scaling]] — Having models reason longer during inference for better results
- [[Prosumer AI Applications]] — Productivity-embedded AI tools commanding premium pricing

## Connections to Other Lectures
- Lecture 01 (Yann Dubois) covers the training pipeline that Jia's infrastructure serves
- Lecture 09 (Clay Bavor) discusses practical deployment challenges in enterprise AI agents
- Lecture 06 (Noam Brown) covers the RL techniques Jia references as enabling sophisticated loss functions

## Open Questions
- Will the open-source vs closed-source gap continue to shrink, or will frontier labs pull ahead with reasoning capabilities?
- When will AI workload interruptibility reach the maturity of conventional cloud workloads?
- How will edge AI and on-device models reshape the centralized GPU cloud model?
