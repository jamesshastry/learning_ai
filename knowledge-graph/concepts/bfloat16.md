---
aliases: ["BF16", "brain floating point"]
tags: [hardware, training]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["09:57", "10:25"]
---
# BFloat16

A 16-bit floating point format with 1 sign bit, 8 exponent bits, and 7 mantissa bits. Has the same dynamic range as FP32 (8 exponent bits) but lower resolution. Developed by Google Brain in 2018 specifically for deep learning workloads.

## Key Points from Sources

- **cs336 Lecture 02**

## Related Concepts

- [[Mixed Precision Training]] (part of) — BF16 is the workhorse precision format for modern LLM training
