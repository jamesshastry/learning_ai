---
aliases: ["vLLM paging", "virtual memory KV cache"]
tags: [infrastructure, optimization]
type: concept
first_seen: cs336/10
sources:
  - course: cs336
    lecture: "10"
    timestamps: ["01:00:00"]
---
# PagedAttention

A KV cache management technique inspired by operating system virtual memory that stores cache in non-contiguous pages. Eliminates memory fragmentation from variable- length sequences, enables sharing common prefixes across requests, and dramatically improves memory utilization in inference serving.

## Key Points from Sources

- **cs336 Lecture 10**

## Related Concepts

- [[KV Cache]] (related to) — PagedAttention is a memory management strategy for KV caches
