---
type: Paper
title: "Attention Is All You Need"
authors: [Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin]
year: 2017
venue: NeurIPS 2017
resource: https://arxiv.org/abs/1706.03762
tags: [transformers, attention, architecture, nlp, deep-learning]
timestamp: 2026-06-14T00:00:00Z
---

# Attention Is All You Need

## Summary

Introduced the **Transformer architecture**, replacing recurrence and convolutions entirely with self-attention mechanisms. The model uses multi-head attention, positional encodings, and a simple encoder-decoder structure to achieve state-of-the-art results on machine translation while being significantly more parallelizable and faster to train.

## Key Contributions

- **Self-attention as the sole mechanism** — eliminated the sequential bottleneck of RNNs, enabling full parallelization across sequence positions
- **Multi-head attention** — allows the model to attend to information from different representation subspaces at different positions simultaneously
- **Positional encoding** — sinusoidal functions inject sequence order information without recurrence, enabling the model to learn relative positions
- **Encoder-decoder architecture** — the encoder maps input to continuous representations; the decoder generates output autoregressively with masked attention

## Why It Matters

This is arguably the most consequential ML paper of the 2010s. Nearly every major AI system in 2024-2026 — GPT-4, Claude, Gemini, Llama — is built on the Transformer. The architecture's parallelizability unlocked [scaling laws](../scaling/scaling-laws.md) that made modern LLMs possible.

## Connections

- Directly enables [BERT](../language-models/bert.md) (encoder-only Transformer)
- Directly enables [GPT-3](../language-models/gpt3.md) (decoder-only Transformer)
- Vindicated by [The Bitter Lesson](../scaling/the-bitter-lesson.md) — a general architecture that scales beats hand-engineered alternatives
- Referenced in CS153 Lecture 01 as foundational reading
- [Scaling Laws](../scaling/scaling-laws.md) quantified *why* Transformers work better with more compute
