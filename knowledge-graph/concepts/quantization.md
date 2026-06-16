---
aliases: ["model quantization", "weight quantization"]
tags: [optimization]
type: concept
first_seen: cs336/10
sources:
  - course: cs336
    lecture: "10"
    timestamps: ["25:00"]
---
# Quantization

Reducing the numerical precision of model weights and/or activations (e.g., FP16 to INT8 or INT4) to decrease memory footprint and increase inference speed. Can be done post-training (PTQ) or during training (QAT). Trades precision for efficiency.

## Key Points from Sources

- **cs336 Lecture 10**

## Related Concepts

- [[BFloat16]] (related to) — Quantization goes beyond BF16 training precision to INT8/INT4 for serving
