---
aliases: ["TP", "Intra-Layer Parallelism"]
tags: [training, distributed-training, parallelism]
type: concept
first_seen: cs336/08
sources:
  - course: cs336
    lecture: "08"
    timestamps: ["15:00"]
  - course: mit-6s191
    lecture: "09"
    timestamps: ["24:27", "26:20"]
---
# Tensor Parallelism

Splitting weight matrices within a single layer across GPUs using column parallelism (partition output) and row parallelism (partition input). For transformer MLPs, stacking column + row parallelism requires only one all-reduce per two-layer block. Best on high-bandwidth interconnects.

## Key Points from Sources

- **cs336 Lecture 08**
- **mit-6s191 Lecture 09**

## Related Concepts

- [[Transformer]] (related to) — Foundational concept in modern LLM development
- [[Pipeline Parallelism]] (complements) — TP splits within layers; PP splits across layers.
