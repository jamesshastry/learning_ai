---
aliases: ["Denoising Diffusion", "Score-Based Model"]
tags: [architecture, generative-models]
type: concept
first_seen: mit-6s191/06
sources:
  - course: mit-6s191
    lecture: "06"
    timestamps: ["29:01", "31:13"]
---
# Diffusion Model

A generative model that creates samples by iteratively removing noise, decomposing generation into many small denoising steps. Trained by adding progressive Gaussian noise to data (forward process) then learning to reverse this process. Produces diverse, high-quality samples with stable training.

## Key Points from Sources

- **mit-6s191 Lecture 06**

## Related Concepts

- [[Generative Adversarial Network]] (alternative to) — Diffusion models address GAN training instability while achieving superior sample quality.
