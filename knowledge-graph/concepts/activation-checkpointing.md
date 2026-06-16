---
aliases: ["gradient checkpointing", "rematerialization", "Gradient Checkpointing", "Rematerialization"]
tags: [training, optimization, memory, distributed-training]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["01:13:23", "01:15:56"]
  - course: mit-6s191
    lecture: "09"
    timestamps: ["13:29", "14:53"]
---
# Activation Checkpointing

A memory optimization that stores activations only at periodic checkpoints (e.g., every 4th layer) and recomputes intermediate activations during the backward pass. Achieves ~4x memory reduction at ~33% extra compute cost. Widely used because GPU compute is cheaper than memory.

## Key Points from Sources

- **cs336 Lecture 02**
- **mit-6s191 Lecture 09**

## Related Concepts

- [[Gradient Accumulation]] (related to) — Both are memory-saving techniques that trade compute or latency for memory
- [[Pipeline Parallelism]] (complements) — Often used together with pipeline parallelism for large model training.
