---
aliases: ["variable-length tokenization"]
tags: [architecture, optimization]
type: concept
first_seen: cs336/01
sources:
  - course: cs336
    lecture: "01"
    timestamps: ["28:45", "01:18:41"]
---
# Adaptive Computation

The principle that different parts of an input should receive different amounts of computational resources. In tokenization, common sequences compress into single tokens (less computation) while rare or complex parts remain as multiple tokens (more computation).

## Key Points from Sources

- **cs336 Lecture 01**

## Related Concepts

- [[Byte Pair Encoding]] (related to) — BPE implements adaptive computation through variable token granularity
- [[Mixture of Experts]] (related to) — MoE also provides adaptive computation by routing to specialized experts
