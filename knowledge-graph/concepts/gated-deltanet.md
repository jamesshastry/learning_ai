---
aliases: ["GDN", "gated delta network"]
tags: [architecture]
type: concept
first_seen: cs336/04
sources:
  - course: cs336
    lecture: "04"
    timestamps: ["14:58", "19:01"]
---
# Gated DeltaNet

A state-space model extending linear attention with two input-dependent gates (forget gate gamma and input gate beta) plus a key-direction projection for erasing old information before writing new. Used in Qwen 3.5 in 3:1 hybrid with full attention.

## Key Points from Sources

- **cs336 Lecture 04**

## Related Concepts

- [[Linear Attention]] (related to) — GDN elaborates linear attention with LSTM-inspired gating
- [[Mamba]] (contrasts with) — GDN adds input gate and key-projection vs Mamba's single forget gate
