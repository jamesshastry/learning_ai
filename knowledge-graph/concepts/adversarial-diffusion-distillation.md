---
aliases: ["ADD", "Step Distillation"]
tags: [inference, efficiency, architecture]
type: concept
first_seen: cs153/09
sources:
  - course: cs153
    lecture: "09"
    timestamps: ["22:02", "52:17", "52:22"]
---
# Adversarial Diffusion Distillation

Technique for reducing diffusion model inference steps from 50 to 2-4 while preserving quality. Uses adversarial training to teach a student model to produce high-quality outputs in fewer denoising steps. Enables product tiering from a single base model (fast/cheap vs. slow/high-quality).

## Key Points from Sources

- **cs153 Lecture 09**

## Related Concepts

- [[Latent Diffusion]] (part of) — Distillation operates on latent diffusion models to create faster variants.
- [[Open Weight Business Model]] (enables) — Step-count tiering (Schnell/Dev/Pro) creates natural commercial differentiation.
