---
aliases: ["key-value cache", "attention cache"]
tags: [optimization, architecture]
type: concept
first_seen: cs336/10
sources:
  - course: cs336
    lecture: "10"
    timestamps: ["20:00"]
---
# KV Cache

A memory structure that stores the key and value projections for all previously processed tokens, enabling efficient autoregressive generation without recomputing attention for past positions. Size grows linearly with context length and number of attention heads, making it a major memory bottleneck.

## Key Points from Sources

- **cs336 Lecture 10**

## Related Concepts

- [[Grouped Query Attention]] (related to) — GQA reduces KV cache size by sharing KV heads across query heads
- [[PagedAttention]] (related to) — PagedAttention manages KV cache memory efficiently via virtual paging
