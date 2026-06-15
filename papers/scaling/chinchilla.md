---
type: Paper
title: "Training Compute-Optimal Large Language Models"
authors: [Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch, Elena Buchatskaya, Trevor Cai, Eliza Rutherford, Diego de Las Casas, Lisa Anne Hendricks, Johannes Welbl, Aidan Clark, Tom Hennigan, Eric Noland, Katie Millican, George van den Driessche, Bogdan Damoc, Aurelia Guy, Simon Osindero, Karen Simonyan, Erich Elsen, Jack W. Rae, Oriol Vinyals, Laurent Sifre]
year: 2022
venue: NeurIPS 2022
resource: https://arxiv.org/abs/2203.15556
tags: [scaling-laws, compute-optimal, training, chinchilla, data-scaling]
timestamp: 2026-06-15T00:00:00Z
---

# Training Compute-Optimal Large Language Models

## Summary

Investigated the optimal allocation of a fixed compute budget between model size and training data. By training over 400 language models ranging from 70M to 16B parameters on 5 to 500 billion tokens, the authors found that **model size and training tokens should be scaled equally** — for every doubling of model parameters, the training data should also double. This produced **Chinchilla** (70B parameters, 1.4T tokens), which outperformed the much larger Gopher (280B) while using the same compute budget.

## Key Contributions

- **Revised scaling law** — demonstrated that prior work (Kaplan et al.) significantly underestimated the importance of training data, leading to over-parameterized, under-trained models
- **Equal scaling rule** — established that model parameters and training tokens should scale roughly equally for compute-optimal training
- **Chinchilla model** — a 70B parameter model trained on 4× more data than Gopher that outperformed it on nearly all benchmarks, proving the theory in practice
- **Downstream implications** — showed compute-optimal models are also cheaper to fine-tune and serve due to their smaller size at equivalent performance

## Why It Matters

Chinchilla fundamentally changed how the field allocates training compute. Before this paper, the trend was "bigger model, same data" — after it, labs shifted to "right-sized model, much more data." LLaMA, Mistral, and most efficient open-source models directly follow the Chinchilla scaling recipe rather than the GPT-3 approach of over-parameterization.

## Connections

- Directly revises [Scaling Laws](scaling-laws.md) by showing data matters more than Kaplan et al. predicted
- Explains why [GPT-3](../language-models/gpt3.md) was undertrained relative to its parameter count
- Vindicated by [The Bitter Lesson](the-bitter-lesson.md) — compute matters, but *how* you spend it matters too
