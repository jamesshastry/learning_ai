---
type: Lecture Notes
title: "LLM Agents Overview — Training LLMs for AI Agents"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "01"
video: https://youtube.com/watch?v=r1qZpYAmqmg
tags: [pre-training, post-training, RLHF, reasoning, scaling-laws, SFT, reinforcement-learning]
timestamp: 2026-06-15T00:00:00Z
---

# LLM Agents Overview — Training LLMs for AI Agents

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=r1qZpYAmqmg)

## TL;DR
Yann Dubois (OpenAI) provides a comprehensive overview of the three-stage LLM training pipeline: pre-training (next-word prediction on internet-scale data), classic post-training/RLHF (aligning to human preferences), and reasoning reinforcement learning (optimizing for verifiable correctness). The lecture covers data pipelines, scaling laws, compute economics, and the progression from SFT to RL for building agentic models.

## Key Takeaways
- Pre-training teaches the model "everything about the world" via next-word prediction on 10-40 trillion tokens; post-training teaches it how to interact with humans and reason
- The three bottlenecks differ by stage: pre-training (data + compute), RLHF (data quality + evals), reasoning RL (environment + hacks)
- Scaling laws allow predicting large-scale performance from small-scale experiments, making research tractable
- SFT is behavior cloning (bounded by demonstrator quality); RL can surpass demonstrator performance by optimizing rewards directly
- Rejection sampling with verifiers (as in DeepSeek R1) is a key technique for generating SFT data at the frontier where no stronger model exists
- Test-time compute (reasoning) is a new scaling axis alongside train-time compute

## Detailed Notes

### 00:00 — The Three Stages of LLM Training
The pipeline consists of: (1) pre-training on 10T+ tokens, costing $10M+, taking months; (2) classic RLHF on ~100K problems, costing ~$100K, taking days; (3) reasoning RL on ~1M problems, costing ~$1M, taking weeks. Each stage has different bottlenecks.

### 08:00 — What Actually Matters in Practice
Five components: architecture, training algorithm/loss, data, evaluation, and systems/infra. Academia historically focused on architecture and algorithms, but what matters in practice is data, evaluation, and systems. Architecture is largely settled on transformers + MoE.

### 12:00 — Pre-training Data Pipeline
Steps: download all of internet (Common Crawl, 250B pages) → extract text from HTML → filter (PII, NSFW, deduplication) → heuristic filtering (document length, outlier tokens) → model-based filtering (distribution matching to high-quality reference sets like Wikipedia) → data mix reweighting. FineWeb paper shows each filtering step measurably improves downstream performance.

### 36:00 — Mid-training
Performed on <10% of pre-training data. Used to change data mix (more code, science, multilingual), extend context length (DeepSeek V3: 4K → 128K), add formatting/instruction following, and include high-quality reasoning data. Acts as bridge between pre-training and post-training.

### 41:00 — Scaling Laws and the Bitter Lesson
Log-linear relationship between compute and test loss enables predicting performance at scale from small experiments. Chinchilla optimal: ~20 tokens per parameter. The Bitter Lesson (Sutton): the only thing that matters long-term is leveraging compute. Don't over-complicate; do the simple thing that scales.

### 53:00 — Post-training: SFT
SFT (Supervised Fine-Tuning) trains on desired answers using next-word prediction. Data sources: human-written answers, LLM-generated answers (Alpaca approach), or rejection sampling with verifiers (DeepSeek R1 approach). Only ~2K examples needed for style/instruction following; up to 800K for reasoning.

### 01:08:00 — Post-training: Reinforcement Learning
RL overcomes SFT limitations: not bounded by demonstrator ability, avoids teaching hallucination, doesn't require ideal answers. Key decision: what reward to optimize? Options include rule-based rewards (string match, test cases), trained reward models, or LLM-as-judge. DeepSeek R1 uses rule-based verifiers for reasoning and reward models for general prompts.

### 01:13:00 — RL Training Details
R1 pipeline: start with SFT model → apply RL (GRPO algorithm) → use rejection sampling to generate new SFT data → repeat. Format rewards enforce proper use of thinking tags. The RL stage teaches genuine reasoning capability beyond pattern matching.

## Notable Quotes
- "Pre-training is really about predicting the next word on internet... if you can predict the next word on every single domain, then you must have some understanding of that domain."
- "Don't spend time over-complicating things. Do the simple thing and make sure that it scales."
- "The more compute you pour into the models, the more improvements you get out of it... more compute equals better performance."
- "SFT can teach hallucination — if it provides a reference the model doesn't know about, you're teaching the model to make up plausibly sounding references."

## Concepts Introduced
- [[Pre-training]] — Next-word prediction on internet-scale data
- [[Scaling Laws]] — Log-linear relationship between compute and performance
- [[Chinchilla Optimal]] — ~20 tokens per parameter for compute-optimal training
- [[Supervised Fine-Tuning]] — Behavior cloning on desired outputs
- [[Rejection Sampling]] — Generating many answers and keeping only verified-correct ones
- [[Test-Time Compute]] — Spending more inference compute for better answers

## Connections to Other Lectures
- Lecture 03 (Jiantao Jiao) dives deeper into verifiable agents and the RL training loop
- Lecture 05 (Weizhu Chen) covers practical challenges of agentic model training at Microsoft
- Lecture 06 (Noam Brown) discusses self-play as recursive self-improvement, the missing piece in LLM RL

## Open Questions
- Can reasoning RL scale beyond math and coding to open-ended domains where verification is hard?
- Will test-time compute scaling laws be as reliable as train-time scaling laws?
- How do we prevent reward hacking in agentic RL environments at scale?
