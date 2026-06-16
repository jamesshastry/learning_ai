---
aliases: ["Rotary Position Embedding", "rotary positional encoding"]
tags: [architecture]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["32:58", "36:00"]
---
# RoPE

A relative position encoding method that rotates pairs of embedding dimensions by angles proportional to absolute position. Inner products between rotated vectors depend only on relative position difference, providing pure relative position information without absolute cross-terms.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[Sinusoidal Position Encoding]] (contrasts with) — RoPE multiplies with sines/cosines (no cross-terms) vs adding embeddings
