---
aliases: ["dynamic batching", "iteration-level batching"]
tags: [infrastructure]
type: concept
first_seen: cs336/10
sources:
  - course: cs336
    lecture: "10"
    timestamps: ["55:00"]
---
# Continuous Batching

An inference serving technique that dynamically adds and removes requests from the batch as they arrive and complete, rather than waiting for all requests in a static batch to finish. Dramatically improves GPU utilization for serving.

## Key Points from Sources

- **cs336 Lecture 10**

## Related Concepts

- [[PagedAttention]] (related to) — Often implemented together in inference servers like vLLM
