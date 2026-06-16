---
aliases: ["4D Parallelism", "Multi-Dimensional Parallelism"]
tags: [distributed-training, parallelism, systems]
type: concept
first_seen: mit-6s191/09
sources:
  - course: mit-6s191
    lecture: "09"
    timestamps: ["37:07", "41:06"]
---
# 5D Parallelism

The practice of composing multiple parallelism strategies simultaneously for large-scale training: data parallel (across groups), tensor parallel (within nodes), pipeline parallel (across nodes), expert parallel (for MoE), and sequence/context parallel (for long sequences). Strategy selection depends on model size, cluster topology, and communication bandwidth hierarchy.

## Key Points from Sources

- **mit-6s191 Lecture 09**

## Related Concepts

- [[Data Parallelism]] (contains) — Data parallelism is one of the 5 dimensions.
- [[Tensor Parallelism]] (contains) — Tensor parallelism is one of the 5 dimensions.
- [[Pipeline Parallelism]] (contains) — Pipeline parallelism is one of the 5 dimensions.
