---
aliases: ["DP", "Distributed Data Parallel", "DDP"]
tags: [training, distributed-training, parallelism]
type: concept
first_seen: cs336/07
sources:
  - course: cs336
    lecture: "07"
    timestamps: ["15:00"]
  - course: mit-6s191
    lecture: "09"
    timestamps: ["09:04", "10:41"]
---
# Data Parallelism

The simplest distributed training strategy: replicate the full model on each GPU, distribute different data batches to each replica, compute gradients independently, then synchronize via all-reduce mean. Scales linearly but limited by batch size degrading generalization.

## Key Points from Sources

- **cs336 Lecture 07**
- **mit-6s191 Lecture 09**

## Related Concepts

- [[Transformer]] (related to) — Foundational concept in modern LLM development
- [[FSDP]] (extended by) — FSDP adds sharding on top of the data parallel baseline.
