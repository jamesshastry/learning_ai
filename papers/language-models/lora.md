---
type: Paper
title: "LoRA: Low-Rank Adaptation of Large Language Models"
authors: [Edward J. Hu, Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, Weizhu Chen]
year: 2021
venue: ICLR 2022
resource: https://arxiv.org/abs/2106.09685
tags: [fine-tuning, parameter-efficient, low-rank, adaptation, lora]
timestamp: 2026-06-15T00:00:00Z
---

# LoRA: Low-Rank Adaptation of Large Language Models

## Summary

Proposed **Low-Rank Adaptation (LoRA)**, a parameter-efficient method for adapting large pre-trained models to downstream tasks. Instead of fine-tuning all model weights, LoRA freezes the pre-trained weights and injects trainable low-rank decomposition matrices into each Transformer layer. This reduces trainable parameters by up to **10,000×** and GPU memory by **3×** while matching or exceeding full fine-tuning performance on GPT-3 175B.

## Key Contributions

- **Low-rank decomposition of weight updates** — models weight changes as ΔW = BA where B and A are small matrices, exploiting the hypothesis that adaptation has low intrinsic dimensionality
- **No inference latency overhead** — the low-rank matrices can be merged into the original weights at deployment, unlike adapter layers which add sequential computation
- **Task switching via matrix swaps** — different LoRA matrices can be hot-swapped for different tasks without reloading the base model, enabling efficient multi-task serving
- **Empirical validation at scale** — demonstrated on GPT-3 175B that LoRA matches full fine-tuning on RoBERTa, DeBERTa, and GPT-2 benchmarks with a fraction of the parameters

## Why It Matters

LoRA democratized fine-tuning by making it feasible on consumer hardware. Before LoRA, adapting a 175B model required hundreds of GPUs; after it, researchers could fine-tune on a single GPU. It became the dominant fine-tuning method in the open-source ecosystem (QLoRA, LoRA+, etc.) and is the standard technique behind most custom model deployments.

## Connections

- Enables practical fine-tuning of models like [GPT-3](gpt3.md) that are too large for full parameter updates
- Builds on the pre-training paradigm established by [BERT](bert.md) — LoRA makes adaptation of any pre-trained Transformer efficient
- Complements [InstructGPT](instruct-gpt.md) — LoRA is often used for the supervised fine-tuning stage of alignment pipelines
- Referenced in MIT 15.773 Lecture 10 on fine-tuning techniques
- Referenced in CS336 Lecture 15 on parameter-efficient fine-tuning
