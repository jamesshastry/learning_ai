---
aliases: ["Intra-Attention"]
tags: [architecture, transformer]
type: concept
first_seen: mit-6s191/02
sources:
  - course: mit-6s191
    lecture: "02"
    timestamps: ["47:05", "50:02"]
---
# Self-Attention

A form of attention where the query, key, and value are all derived from the same input sequence, allowing the model to identify relationships between different positions within that sequence. Computed as softmax(Q·K^T / sqrt(d_k)) × V.

## Key Points from Sources

- **mit-6s191 Lecture 02**

## Related Concepts

- [[Attention Mechanism]] (variant of) — Self-attention is attention applied within a single input.
