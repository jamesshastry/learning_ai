---
aliases: ["Einstein operations", "einsum"]
tags: [infrastructure, training]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["18:16", "19:04"]
---
# Einops

A library for tensor manipulation using named dimensions inspired by Einstein summation notation. Provides einsum (generalized matrix multiplication), reduce (aggregation), and rearrange (reshape/transpose) operations that make tensor operations explicit and less error-prone than index-based approaches.

## Key Points from Sources

- **cs336 Lecture 02**

## Related Concepts

- [[Resource Accounting]] (enables) — Named dimensions make FLOP counting straightforward — product of all dimension sizes
