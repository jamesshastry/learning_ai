---
aliases: ["prefill phase", "decode phase", "inference phases"]
tags: [optimization]
type: concept
first_seen: cs336/10
sources:
  - course: cs336
    lecture: "10"
    timestamps: ["08:15"]
---
# Prefill vs Decode

The two distinct phases of LLM inference. Prefill processes all prompt tokens in parallel (compute-bound, like training). Decode generates tokens one at a time, reading the full KV cache and model weights each step (memory-bound). This dichotomy fundamentally shapes inference optimization strategies.

## Key Points from Sources

- **cs336 Lecture 10**

## Related Concepts

- [[KV Cache]] (related to) — KV cache is built during prefill and read during each decode step
