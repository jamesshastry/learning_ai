---
aliases: ["local attention", "banded attention"]
tags: [architecture, optimization]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["01:25:08", "01:26:46"]
---
# Sliding Window Attention

An attention pattern where tokens can only attend to a fixed-size local window of neighboring positions, reducing quadratic cost to linear. Modern architectures alternate sliding window layers with full attention layers to balance long-range and local information processing.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[Flash Attention]] (related to) — Flash Attention provides constant-factor speedups for both full and windowed attention
