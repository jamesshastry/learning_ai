---
aliases: ["operational intensity", "compute-to-memory ratio"]
tags: [hardware, optimization]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["40:37", "46:01"]
---
# Arithmetic Intensity

The ratio of floating point operations to bytes of memory transferred for a given computation. Determines whether an operation is memory-bound (low intensity) or compute-bound (high intensity). H100 accelerator intensity is ~295 FLOPs/byte.

## Key Points from Sources

- **cs336 Lecture 02**

## Related Concepts

- [[Roofline Analysis]] (enables) — Arithmetic intensity is the x-axis of roofline plots
- [[Flash Attention]] (related to) — Flash Attention increases arithmetic intensity by reducing memory movement
