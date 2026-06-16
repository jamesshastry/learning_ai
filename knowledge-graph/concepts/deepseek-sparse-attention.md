---
aliases: ["DSA", "sparse token selection attention"]
tags: [architecture, optimization]
type: concept
first_seen: cs336/04
sources:
  - course: cs336
    lecture: "04"
    timestamps: ["23:17", "25:51"]
---
# DeepSeek Sparse Attention

An efficient attention method that uses a lightweight indexer to select top-K relevant tokens from the full context, then performs full attention only on this subset. Can be bolted on during long-context extension rather than pre-training.

## Key Points from Sources

- **cs336 Lecture 04**

## Related Concepts

- [[Sliding Window Attention]] (contrasts with) — DSA selects relevant tokens globally vs fixed local windows
