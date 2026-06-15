---
type: Paper
title: "Neural Machine Translation by Jointly Learning to Align and Translate"
authors: [Dzmitry Bahdanau, Kyunghyun Cho, Yoshua Bengio]
year: 2015
venue: ICLR 2015
resource: https://arxiv.org/abs/1409.0473
tags: [attention, machine-translation, seq2seq, alignment, nlp]
timestamp: 2026-06-15T00:00:00Z
---

# Neural Machine Translation by Jointly Learning to Align and Translate

## Summary

Introduced the **attention mechanism** for neural machine translation, solving the critical bottleneck of fixed-length encoder representations in sequence-to-sequence models. Instead of compressing the entire source sentence into a single vector, the decoder learns to **attend to different parts of the source at each generation step**, computing a context vector as a weighted sum of all encoder hidden states. This "soft alignment" allows the model to handle long sentences and learn word-level correspondences without explicit alignment tables.

## Key Contributions

- **Additive attention mechanism** — at each decoding step, a small feedforward network scores how well each source position matches the current decoder state, producing attention weights that create a dynamic context vector
- **Eliminated the information bottleneck** — removed the fixed-length vector compression that forced encoder-decoder models to squeeze all source information into a single representation, enabling translation of longer sentences
- **Learned soft alignments** — the attention weights naturally learn interpretable word-level alignments between source and target, providing transparency into the model's translation decisions
- **State-of-the-art translation** — achieved results competitive with phrase-based statistical MT on English-French, demonstrating that end-to-end neural approaches could match traditional pipelines

## Why It Matters

This paper introduced the concept of attention that would transform all of deep learning. While originally designed for machine translation, the attention mechanism became a universal building block — it is the core operation in every Transformer model. Without Bahdanau attention, the leap to self-attention and the Transformer architecture would not have happened.

## Connections

- The direct predecessor of [Attention Is All You Need](attention-is-all-you-need.md) — Vaswani et al. generalized this additive attention into multi-head self-attention and removed recurrence entirely
- Operated on word representations learned by methods like [Word2Vec](word2vec.md), bridging discrete tokens and continuous attention
