---
aliases: ["scaling configuration", "training recipe"]
tags: [training]
type: concept
first_seen: cs336/09
sources:
  - course: cs336
    lecture: "09"
    timestamps: ["45:00", "50:00"]
---
# Scaling Recipe

A complete function mapping a FLOPs budget to all hyperparameters needed for training (model size, learning rate, batch size, etc.). Must extrapolate predictably across scales — predictability is as important as optimality for successful large-scale training.

## Key Points from Sources

- **cs336 Lecture 09**

## Related Concepts

- [[Hyperparameter Transfer]] (requires) — Scaling recipes require that hyperparameters transfer predictably across scales
