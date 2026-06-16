---
aliases: ["GAN"]
tags: [architecture, generative-models]
type: concept
first_seen: mit-6s191/04
sources:
  - course: mit-6s191
    lecture: "04"
    timestamps: ["34:52", "40:02"]
---
# Generative Adversarial Network

A generative modeling framework consisting of two competing neural networks: a generator that maps random noise to synthetic data instances, and a discriminator that classifies inputs as real or fake. Trained via an adversarial minimax objective where the generator tries to fool the discriminator.

## Key Points from Sources

- **mit-6s191 Lecture 04**

## Related Concepts

- [[CycleGAN]] (extended by) — CycleGANs extend GANs for unpaired domain-to-domain translation.
