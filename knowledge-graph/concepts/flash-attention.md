---
aliases: ["FlashAttention", "flash attn"]
tags: [optimization, architecture]
type: concept
first_seen: cs336/05
sources:
  - course: cs336
    lecture: "05"
    timestamps: ["01:05:00", "01:17:08"]
---
# Flash Attention

An IO-aware attention algorithm that tiles the Q, K, V computation into blocks that fit in GPU SRAM, using online softmax (log-sum-exp trick) to accumulate results without materializing the full N×N attention matrix in HBM. Achieves O(N) memory and significant wall-clock speedup.

## Key Points from Sources

- **cs336 Lecture 05**

## Related Concepts

- [[Arithmetic Intensity]] (related to) — Flash Attention increases arithmetic intensity by reducing HBM traffic
- [[Activation Checkpointing]] (related to) — Flash Attention recomputes attention in backward pass like checkpointing
