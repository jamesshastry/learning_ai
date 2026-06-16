---
aliases: ["AE", "Self-Encoder"]
tags: [architecture, generative-models, unsupervised]
type: concept
first_seen: mit-6s191/04
sources:
  - course: mit-6s191
    lecture: "04"
    timestamps: ["11:58", "16:00"]
---
# Autoencoder

A neural network that learns compressed representations by encoding input data into a low-dimensional latent space Z and decoding back to reconstruct the original input. Trained with reconstruction loss (no labels), enabling unsupervised feature learning.

## Key Points from Sources

- **mit-6s191 Lecture 04**

## Related Concepts

- [[Variational Autoencoder]] (extended by) — VAEs add probabilistic sampling to the autoencoder framework.
- [[Latent Space]] (contains) — The bottleneck layer defines the latent space.
