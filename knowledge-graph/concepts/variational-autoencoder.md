---
aliases: ["VAE"]
tags: [architecture, generative-models]
type: concept
first_seen: mit-6s191/04
sources:
  - course: mit-6s191
    lecture: "04"
    timestamps: ["18:11", "28:22"]
---
# Variational Autoencoder

A probabilistic extension of autoencoders that learns mean and variance parameters for each latent variable, enabling sampling from the latent space. Trained with reconstruction loss plus KL divergence regularization against a normal prior. Uses the reparameterization trick for end-to-end differentiability.

## Key Points from Sources

- **mit-6s191 Lecture 04**

## Related Concepts

- [[Reparameterization Trick]] (depends on) — The reparameterization trick enables backpropagation through sampling.
- [[KL Divergence]] (uses) — KL divergence regularizes the learned latent distributions.
