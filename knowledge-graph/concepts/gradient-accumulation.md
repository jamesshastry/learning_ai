---
aliases: ["micro-batching"]
tags: [training, optimization]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["01:12:31"]
---
# Gradient Accumulation

Technique for simulating large batch sizes without proportional memory increase by computing gradients on smaller micro-batches and accumulating them before updating parameters. Enables use of effective batch sizes larger than what fits in GPU memory.

## Key Points from Sources

- **cs336 Lecture 02**

## Related Concepts

- [[Activation Checkpointing]] (related to) — Both reduce memory pressure during training
