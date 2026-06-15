---
type: Paper
title: "Denoising Diffusion Probabilistic Models"
authors: [Jonathan Ho, Ajay Jain, Pieter Abbeel]
year: 2020
venue: NeurIPS 2020
resource: https://arxiv.org/abs/2006.11239
tags: [diffusion, generative-models, image-generation, denoising, ddpm]
timestamp: 2026-06-15T00:00:00Z
---

# Denoising Diffusion Probabilistic Models

## Summary

Demonstrated that **diffusion probabilistic models** — which generate data by iteratively denoising from pure Gaussian noise — can produce image quality rivaling GANs. The paper established a simple training objective: predict the noise added at each timestep using a U-Net, then reverse the diffusion process at inference to generate samples. By connecting diffusion models to denoising score matching and Langevin dynamics, the authors provided both a practical algorithm and a solid theoretical foundation.

## Key Contributions

- **Simplified training objective** — reduced the variational lower bound to a reweighted denoising objective where the model simply predicts the noise ε added at each step, making training straightforward and stable
- **High-quality unconditional generation** — achieved FID 3.17 on CIFAR-10 and produced high-fidelity 256×256 images on LSUN, competitive with state-of-the-art GANs without their training instabilities
- **Progressive lossy compression interpretation** — showed that the diffusion process implements a form of progressive coding where early denoising steps determine global structure and later steps add fine details
- **Connection to score matching** — unified diffusion models with score-based generative modeling, establishing a theoretical link between the denoising objective and learning the gradient of the data distribution

## Why It Matters

DDPM launched the diffusion era that replaced GANs as the dominant generative paradigm. Every major image generation system from 2022 onward — Stable Diffusion, DALL-E 2, Midjourney, Imagen — builds on this foundation. The stability of diffusion training (no mode collapse, no adversarial dynamics) combined with their sample quality made them the first generative approach to achieve broad commercial deployment.

## Connections

- Replaced [GANs](gan.md) as the state-of-the-art for image generation by offering stable training and better mode coverage
- Combined with [CLIP](clip.md) to enable text-guided image generation (e.g., DALL-E 2, Stable Diffusion)
- Referenced in MIT 15.773 Lecture 11 on generative models
