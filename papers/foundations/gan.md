---
type: Paper
title: "Generative Adversarial Networks"
authors: [Ian J. Goodfellow, Jean Pouget-Abadie, Mehdi Mirza, Bing Xu, David Warde-Farley, Sherjil Ozair, Aaron Courville, Yoshua Bengio]
year: 2014
venue: NeurIPS 2014
resource: https://arxiv.org/abs/1406.2661
tags: [generative-models, adversarial-training, architecture, deep-learning]
timestamp: 2026-06-14T00:00:00Z
---

# Generative Adversarial Networks (GANs)

## Summary

Proposed an adversarial framework where two neural networks — a **generator** and a **discriminator** — are trained simultaneously in a minimax game. The generator learns to produce realistic data (e.g., images), while the discriminator learns to distinguish real data from generated data. At equilibrium, the generator produces data indistinguishable from the real distribution.

## Key Contributions

- **Adversarial training framework** — a fundamentally new paradigm for generative modeling that requires no explicit density estimation
- **Implicit generative model** — the generator learns the data distribution implicitly through the adversarial signal, avoiding the need to define a tractable likelihood
- **Theoretical grounding** — proved that the minimax game has a global optimum where the generator perfectly replicates the data distribution

## Why It Matters

GANs opened the door to high-fidelity generative models for images, video, and audio. While largely superseded by diffusion models (2020+) for image generation, the adversarial training principle remains influential — it appears in RLHF (discriminator-like reward models) and in techniques used by [Constitutional AI](../language-models/constitutional-ai.md).

## Connections

- The adversarial principle evolved into the reward-model paradigm in [InstructGPT](../language-models/instruct-gpt.md)
- Preceded by and builds on the latent-space ideas that [AlexNet](alexnet.md) made practical at scale
- Largely displaced for image generation by diffusion models (Stable Diffusion, DALL·E 2), but the framework's ideas persist
