---
aliases: ["tensor core units", "matrix multiply-accumulate units"]
tags: [hardware]
type: concept
first_seen: cs336/05
sources:
  - course: cs336
    lecture: "05"
    timestamps: ["25:00", "35:00"]
---
# Tensor Cores

Specialized GPU hardware that performs small matrix multiply-accumulate operations (e.g., 16x16x16 in BF16) at much higher throughput than general CUDA cores. All modern LLM training uses tensor cores for matmul operations.

## Key Points from Sources

- **cs336 Lecture 05**

## Related Concepts

- [[Streaming Multiprocessor]] (part of) — Tensor cores are housed within each SM
