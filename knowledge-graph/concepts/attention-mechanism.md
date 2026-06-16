---
aliases: ["Attention"]
tags: [architecture, sequence-modeling, transformer]
type: concept
first_seen: mit-6s191/02
sources:
  - course: mit-6s191
    lecture: "02"
    timestamps: ["42:35", "43:15"]
---
# Attention Mechanism

A mechanism that enables neural networks to learn which parts of an input sequence are most important by computing similarity scores between query and key representations, then extracting relevant features via weighted combination with value representations. Eliminates the need for sequential recurrence and enables parallel processing.

## Key Points from Sources

- **mit-6s191 Lecture 02**

## Related Concepts

- [[Self-Attention]] (generalizes) — Self-attention applies attention within a single sequence.
- [[Transformer]] (enables) — The attention mechanism is the foundational building block of transformers.
