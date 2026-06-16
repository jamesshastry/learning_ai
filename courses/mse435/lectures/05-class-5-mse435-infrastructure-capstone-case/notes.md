---
type: Lecture Notes
title: "Class 5: Infrastructure Capstone — OpenAI's Compute Strategy"
course: MSE435 Economics of the AI Supercycle
university: Stanford
lecture_id: "05"
video: https://youtube.com/watch?v=4k53z3Ysjg0
tags: [openai, compute, infrastructure, stargate, heterogeneous-compute, sachin-katti]
timestamp: 2026-06-15T00:00:00Z
---

# Class 5: Infrastructure Capstone — OpenAI's Compute Strategy

**Course:** Economics of the AI Supercycle
**Video:** [YouTube](https://youtube.com/watch?v=4k53z3Ysjg0)

## TL;DR
Sachin Katti (OpenAI VP of Industrial Compute, former Intel CTO and Stanford professor) reveals how OpenAI's compute infrastructure works and where it's heading. Revenue is a lagging indicator of compute capacity — OpenAI has tripled compute year-over-year and revenue has followed. The 30 GW aspirational target would consume double-digit % of US grid capacity. Inference is already the majority of compute (and growing to 80%+) because RL training, synthetic data generation, and products are all inference workloads. Agentic workloads are transforming compute from simple inference calls into complex DAGs requiring heterogeneous infrastructure (GPUs + CPUs + Cerebras + memory-optimized chips). The biggest structural bottleneck is fab capacity (TSMC, ASML). A single gigawatt costs ~$70B and requires half a million GPUs. Chip design takes 3 years — AI designing its own next-generation chips is the path to bending this cycle.

## Key Takeaways
- OpenAI has tripled compute year-over-year for 3 years; revenue has tracked compute directly
- 30 GW aspirational target = 100+ GW across all hyperscalers = double-digit % of US grid capacity
- "Every human should have a GPU" vision = 7 terawatts, two orders of magnitude beyond current targets
- Revenue is a "lagging indicator" for frontier labs: revenue = compute capacity x utilization
- OpenAI 5.5 launch drove meaningful double-digit revenue growth in just 2 weeks
- Inference is already the majority of compute; will reach 80%+ because RL training, synthetic data, and products are all inference
- Scaling laws now cover the entire lifecycle: pre-training, post-training (RL), synthetic data generation, and inference
- Agentic compute graphs are complex DAGs: inference → tool calls → database queries → VM environments → back to inference
- Vision: "make the human the bottleneck, not the AI" — human should be in flow state with AI completing tasks instantly
- Heterogeneous compute is essential: GPUs for training, Cerebras for fast inference, memory-optimized chips for long context, CPUs for orchestration
- TSMC's wafer allocation policy ensures multiple chip vendors will exist — they won't be single-threaded on any customer
- Concentrated clusters are more cost-effective per megawatt than distributed edge compute; 400k token prefill latency (400-500ms) dwarfs any network latency gains from edge placement
- Bringing Cerebras into OpenAI's stack forced redesign of API infrastructure to handle faster token generation
- Chip design cycle is 3 years; AI designing next-gen chips is the only way to accelerate this
- A gigawatt of compute costs ~$70B and requires ~500K GPUs
- Biggest structural risk: fab capacity concentration (TSMC → ASML is the single choke point)
- Long: foundational infrastructure layer (transformers, batteries, generation, cooling); Short: model wrappers and the concept of "apps" as a paradigm

## Detailed Notes

### [00:00-06:00] Intel's AI Comeback and OpenAI Compute Overview
Intel story: supply constraints and CPU resurgence (agentic workloads need CPUs for orchestration) give Intel tailwinds. OpenAI compute chart: left side shows 3-year tripling of compute; right side shows aspirational 30 GW target. Revenue has tracked compute capacity linearly. Sachin's role: lead Industrial Compute at OpenAI — delivering compute across training and inference. "My job is to make the numbers go up and to the right."

### [06:00-12:00] Revenue as Lagging Indicator and Scaling Laws
Revenue = compute x utilization. OpenAI 5.5 drove double-digit growth in 2 weeks through broader adoption beyond coding. Scaling laws have evolved from pre-training only to covering entire compute lifecycle: pre-training → post-training with RL (primarily inference) → synthetic data generation (inference) → product serving (inference). Inference is already the majority; expected to reach 80%+. Even "training the next level of intelligence" is now mostly inference compute.

### [12:00-20:00] The Agentic Compute Graph
Evolution: chatbot (single inference node) → reasoning (multiple inference nodes) → agents (complex DAGs with inference + tool calls + DB queries + VM environments + feedback loops). Agents close the loop: not just thinking/suggesting but trying, observing output, iterating. Vision: "make the human the bottleneck" — AI should finish tasks so quickly that humans are constantly asked for next steps. This requires heterogeneous compute: GPUs, Cerebras (fast inference), memory-optimized accelerators (hold entire GitHub projects in context), CPUs (orchestrate agentic workflows). "You can't deliver this kind of experience economically on pure GPU-based compute."

### [20:00-30:00] TSMC, Supply Chain Resilience, and Concentrated vs Edge Compute
TSMC allocates wafers to multiple customers to avoid single-customer dependency — this structurally ensures multiple chip types will exist. The "single choke point" is TSMC → ASML. OpenAI needs a "resilient compute supply chain" that isn't single-threaded on any component. On edge vs. centralized: concentrated clusters are more cost-effective per megawatt due to labor economics and construction scale. Technically, 400k token prefill takes 400-500ms — far larger than any network latency savings from edge placement. Will change as models get smaller and distillation improves, but not yet economically favorable.

### [30:00-40:00] Cerebras Integration, Latency Optimization, and Memory Architecture
Bringing Cerebras into OpenAI: tokens generated so fast that all other system latencies (API, load balancing, app layer) became bottlenecks — forced end-to-end latency optimization across the entire stack. Blog post published about this. Every 30-50ms of latency reduction → higher engagement, revenue, retention. Biggest underappreciated shift: current GPU systems are simplistic (compute unit + one layer of HBM). Future: multi-layer memory hierarchies (like CPU evolution with L1/L2/L3 cache, flash, HDD). AI is increasingly designing next-gen chips and software — recursive improvement. Chip design takes 3 years from ideation to production; AI-assisted design is the only way to compress this cycle.

### [40:00-48:00] Long/Short, Stargate Economics, and Student Advice
Stargate: 1 GW = $70B in spend, 500K GPUs. OpenAI prioritizes "time to compute" over "amount of compute." Long: the foundational infrastructure layer — transformers, batteries, power generation, cooling, materials science. EE enrollments have declined but this is where the opportunity is. Short: model wrappers and potentially the concept of "apps" as a paradigm — in an outcome-driven future, apps are just "a crutch to get to an outcome." First to $10T: probably Nvidia. Biggest unsolved problem: fab capacity (TSMC, Samsung, Intel, Micron/SK Hynix/Samsung for memory). If you dig deeper: ASML is the single choke point for all of it.

## Notable Quotes
- "Revenue is basically a lagging indicator for frontier lab companies — it's a very simple calculation of how much compute we have and how well utilized is the compute."
- "We have succeeded from a compute perspective when we have built the systems such that the human becomes the bottleneck."
- "You can't actually deliver this kind of experience economically on pure GPU-based compute."
- "A six-month lead in intelligence is an enormous lead."
- "Today apps are a crutch to get to an outcome."
- "ASML — that is the single choke point of the whole supply chain."

## Concepts Introduced
- [[Revenue as Compute Proxy]] — Frontier lab revenue directly tracks available compute capacity and utilization
- [[Agentic Compute DAG]] — Complex directed acyclic graphs of inference, tool calls, VMs, and feedback loops
- [[Heterogeneous Compute]] — Mix of GPUs, ASICs, CPUs, and memory-optimized chips for different workload phases
- [[Human as Bottleneck]] — Design goal where AI completes tasks faster than humans can provide next instructions
- [[Compute Supply Chain Resilience]] — Need for multi-vendor, multi-fab diversity to avoid single points of failure
- [[Recursive Chip Design]] — AI designing the next generation of chips and infrastructure it will run on
- [[Prefill Latency Dominance]] — 400-500ms prefill time dwarfs network latency, favoring centralized over edge compute

## Connections to Other Lectures
- Lecture 01: The revenue-compute correlation provides the mechanism behind the AI value chain triangle
- Lecture 02: Sunny Mudra's Groq is one example of the heterogeneous compute Sachin describes
- Lecture 03: Chase Lochmiller builds the data centers Sachin is filling; the $70B/GW cost aligns with Chase's $60M/MW
- Lecture 04: Ali Ghodsi said AGI is here but context is the bottleneck — Sachin says compute is still the bottleneck
- Lecture 06: Yash Bottle's Applied Compute addresses the model specialization layer that sits above Sachin's infrastructure

## Open Questions
- Can OpenAI actually reach 30 GW by end of decade, and what happens to US grid stability?
- Will the recursive AI chip design cycle truly compress the 3-year design timeline?
- At what point does edge inference become economically viable as models get smaller?
- Is the "apps are a crutch" thesis correct, and what replaces apps as the user interface paradigm?
- How will TSMC wafer allocation politics shape which accelerators succeed?
