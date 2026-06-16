---
aliases: ["Latent Generative Modeling", "Learned JPEG"]
tags: [architecture, training, efficiency]
type: concept
first_seen: cs153/09
sources:
  - course: cs153
    lecture: "09"
    timestamps: ["07:50", "07:55", "08:07"]
---
# Latent Diffusion

Training generative models in a compressed latent space rather than raw pixel space. A compression model (like a learned JPEG codec) finds perceptually equivalent but lower-dimensional representations, enabling orders-of-magnitude compute savings while matching quality of pixel-space training.

## Key Points from Sources

- **cs153 Lecture 09**

## Related Concepts

- [[Adversarial Diffusion Distillation]] (enables) — Latent diffusion models are the base from which distillation produces faster variants.
- [[Natural vs Unnatural Representations]] (related to) — Latent diffusion compresses the redundancy inherent in natural visual representations.
