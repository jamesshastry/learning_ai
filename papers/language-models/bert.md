---
type: Paper
title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding"
authors: [Jacob Devlin, Ming-Wei Chang, Kenton Lee, Kristina Toutanova]
year: 2019
venue: NAACL 2019
resource: https://arxiv.org/abs/1810.04805
tags: [transformers, pre-training, nlp, language-models, bidirectional]
timestamp: 2026-06-14T00:00:00Z
---

# BERT

## Summary

Introduced **bidirectional pre-training** for language representations using the Transformer encoder. Unlike left-to-right models (GPT), BERT uses **masked language modeling** (randomly mask 15% of tokens, predict them from both directions) and **next sentence prediction** as pre-training objectives, then fine-tunes on downstream tasks.

## Key Contributions

- **Bidirectional context** — every token attends to all other tokens in both directions, capturing richer representations than left-to-right models
- **Masked language modeling (MLM)** — a pre-training objective inspired by the Cloze task, enabling bidirectional training without information leakage
- **Pre-train then fine-tune paradigm** — demonstrated that a single pre-trained model could be fine-tuned to achieve state-of-the-art on 11 NLP tasks simultaneously
- **BERT-Large** — 340M parameters, huge for 2018 but tiny by today's standards; showed that bigger models transfer better

## Why It Matters

BERT proved that [Transformers](../foundations/attention-is-all-you-need.md) could be pre-trained on unlabeled text and fine-tuned for virtually any NLP task. It dominated NLP benchmarks for years and established the encoder-only branch of the Transformer family tree (as opposed to [GPT-3](gpt3.md)'s decoder-only branch). Google still uses BERT-derived models in search.

## Connections

- Uses the encoder half of [Attention Is All You Need](../foundations/attention-is-all-you-need.md)
- Competing paradigm to [GPT-3](gpt3.md) — bidirectional (BERT) vs. autoregressive (GPT)
- The "pre-train + fine-tune" paradigm was later extended to "pre-train + prompt" by [GPT-3](gpt3.md) and "pre-train + RLHF" by [InstructGPT](instruct-gpt.md)
- Scaling behavior validated by [Scaling Laws](../scaling/scaling-laws.md)
