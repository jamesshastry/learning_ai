---
aliases: ["softmax-free attention", "associative attention"]
tags: [architecture, optimization]
type: concept
first_seen: cs336/04
sources:
  - course: cs336
    lecture: "04"
    timestamps: ["06:00", "09:07"]
---
# Linear Attention

Attention mechanism that drops the softmax normalization, enabling matrix multiplication reordering via associativity: Q(K^T V) instead of (QK^T)V. Changes complexity from O(N^2 D) to O(N D^2). Has an equivalent RNN form for efficient inference with constant-size state.

## Key Points from Sources

- **cs336 Lecture 04**

## Related Concepts

- [[Mamba]] (prerequisite for) — Mamba 2 extends linear attention with input-dependent gating
