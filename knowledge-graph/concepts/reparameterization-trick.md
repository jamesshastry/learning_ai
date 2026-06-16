---
aliases: ["Reparameterization"]
tags: [training, generative-models]
type: concept
first_seen: mit-6s191/04
sources:
  - course: mit-6s191
    lecture: "04"
    timestamps: ["28:50", "30:42"]
---
# Reparameterization Trick

A technique that makes VAE training differentiable by expressing latent variables as Z = mu + sigma * epsilon, where epsilon is drawn from a fixed distribution. This offsets the stochasticity to a non-learned random variable, enabling gradient flow through the sampling operation.

## Key Points from Sources

- **mit-6s191 Lecture 04**

## Related Concepts

- [[Variational Autoencoder]] (enables) — Without reparameterization, VAEs cannot be trained via backpropagation.
