---
aliases: ["AMP", "automatic mixed precision"]
tags: [training, optimization]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["11:54", "12:38"]
---
# Mixed Precision Training

Training technique using lower precision (BF16) for parameters, activations, and gradients while keeping optimizer states in FP32 for numerical stability. Reduces memory usage and increases throughput without significant quality loss.

## Key Points from Sources

- **cs336 Lecture 02**

## Related Concepts

- [[BFloat16]] (part of) — BF16 is the standard low-precision format used in mixed precision training
