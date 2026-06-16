---
aliases: ["always-on experts"]
tags: [architecture]
type: concept
first_seen: cs336/04
sources:
  - course: cs336
    lecture: "04"
    timestamps: ["54:34", "55:38"]
---
# Shared Experts

A subset of MoE experts that bypass the router and process every token, handling common computation. Introduced by DeepSeek MoE, allows routed experts to specialize more. Combined with fine-grained expert segmentation for best results.

## Key Points from Sources

- **cs336 Lecture 04**

## Related Concepts

- [[Mixture of Experts]] (part of) — Shared experts are a key component of DeepSeek-style MoE design
