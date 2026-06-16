---
aliases: ["GQA", "group query attention"]
tags: [architecture, optimization]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["01:21:09", "01:22:36"]
---
# Grouped Query Attention

An attention variant that uses fewer key-value heads than query heads, with groups of query heads sharing the same KV head. Provides a tunable tradeoff between full multi-head attention (best quality) and multi-query attention (best inference speed), achieving near-MHA quality with significant KV cache reduction.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[Multi-Query Attention]] (related to) — GQA generalizes MQA by allowing more than one KV head
- [[KV Cache]] (enables) — GQA dramatically reduces KV cache memory requirements
