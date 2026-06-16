---
type: Lecture Notes
title: "Open Training Recipes: LLM Reasoning"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "04"
video: https://youtube.com/watch?v=cMiu3A7YBks
tags: [post-training, SFT, DPO, PPO, RLVR, Tulu, OLMo, data-curation, test-time-scaling]
timestamp: 2026-06-15T00:00:00Z
---

# Open Training Recipes: LLM Reasoning

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=cMiu3A7YBks)

## TL;DR
Hanna Hajishirzi (UW/AI2) presents the fully open Tulu 3 post-training recipe covering three stages: supervised fine-tuning (SFT with persona-driven synthetic data), preference tuning (DPO/PPO with carefully curated on-policy data), and reinforcement learning with verifiable rewards (RLVR). She also introduces s1 — a minimal test-time scaling recipe using budget forcing ("wait" tokens) on only 1K curated examples. Key insight: data quality and curation matter far more than algorithm choice or reward model scale.

## Key Takeaways
- Three-stage post-training: SFT → Preference Tuning → RLVR, each with distinct data requirements and algorithms
- Persona-driven synthetic data generation dramatically improves math reasoning diversity and performance
- Data curation is the single most important factor — 60% of data after self-consistency filtering performs as well as 100%
- PPO outperforms DPO but is harder to implement at scale; data quality improvements yield larger gains than algorithm changes
- RLVR replaces neural reward models with simple rule-based verification (if answer matches gold, reward=1), avoiding reward hacking
- RLVR works now because base models are strong enough — it failed on GPT-2 era models but shows significant gains on modern 70B+ models
- s1 test-time scaling: 1K carefully curated examples + budget forcing ("wait" token injection) achieves strong performance with minimal data
- Mid-training phase injects reasoning-oriented data (math, code) into the final 1% of pre-training for substantial base model improvements

## Detailed Notes

### [00:00-10:00] Open AI Ecosystem and Motivation
AI progress depends on open research. OLMo (fully open pre-training) and Tulu (open post-training recipes). Tulu 3 applied to LLAMA 405B achieves parity with GPT-4o and beats DeepSeek V3.

### [10:00-32:00] Stage 1 — Supervised Fine-Tuning
Careful evaluation design across capabilities (chat, knowledge, math, coding, safety, multilingual, instruction following). Hybrid data collection: human + synthetic. Persona-driven synthetic data: generate math/coding problems from diverse personas (chemist, musician, 6-year-old) for diversity. 150K hard math problems + 50K grade school math created. Self-consistency filtering removes 40% of data while maintaining performance. Chain-of-thought annotations crucial — shows models how to reason step by step.

### [32:00-50:00] Stage 2 — Preference Tuning
Preference data: chosen vs. rejected response pairs. RLAIF with GPT-4o as judge across helpfulness, instruction following, truthfulness, and honesty. On-policy data (from Tulu 3 SFT model itself) is critical — combining on-policy + off-policy + new prompts yields best results. PPO vs DPO: PPO gives ~1 point boost but is much harder to implement. Biggest gain comes from data curation, not algorithm choice. Over-optimization observed after extended DPO training.

### [50:00-01:05:00] Stage 3 — RLVR (Reinforcement Learning with Verifiable Rewards)
Replace neural reward model with rule-based verification: if final answer matches gold, reward=1, else 0. Applied to math (GSM8K, MATH) and precise instruction following (IFEval). RLVR continues improving where DPO over-optimizes. Works better at larger scale (7-point gain on 405B MATH vs 3-point on 70B). Stacking multiple RLVR rounds shows continued gains. GRPO optimization now pushing to 84.6% on MATH.

### [01:05:00-01:20:00] Test-Time Scaling and Pre-Training
s1: minimal recipe — 1K carefully curated reasoning examples + budget forcing (inject "wait" token when model stops too early). Sequential scaling (budget forcing) outperforms parallel scaling (majority voting). Mid-training: final 1% of pre-training with high-quality reasoning data; patching specific weaknesses (e.g., multiplication). Self-RAG: model generates critic tokens to self-evaluate retrieval and generation quality. OpenScholar: test-time synthesis of scientific literature.

## Notable Quotes
- "Using 59K data and 1K data — almost similar results, which is very interesting"
- "RLVR is not really new — it's actually the simplest way of using RL. Why did it work now? Because base model qualities have improved a lot"
- "We saw really good results with ShareGPT early on but we later dropped this data because licensing and the way the data was collected was not that good"

## Concepts Introduced
- [[Tulu 3 Post-Training Recipe]]
- [[RLVR (RL with Verifiable Rewards)]]
- [[Persona-Driven Synthetic Data]]
- [[Budget Forcing]]
- [[s1 Test-Time Scaling]]
- [[Mid-Training]]
- [[Self-RAG]]
- [[Data Mixing for Post-Training]]

## Connections to Other Lectures
- Lecture 02 (Weston) presents the self-rewarding and IRPO approaches that RLVR builds upon
- Lecture 01 (Chen) covers inference-time techniques; s1's budget forcing is a novel addition
- Lecture 03 (Yu Su) discusses reasoning and planning challenges that post-training addresses

## Open Questions
- How far can RLVR scale with even larger models and more diverse verifiable tasks?
- Can budget forcing be replaced with learned "when to think more" policies?
- What is the optimal balance between pre-training data quality and post-training recipe sophistication?
