---
aliases: ["OOV", "UNK Token", "Unknown Token"]
tags: [data]
type: concept
first_seen: MIT15.773/05
sources:
  - course: MIT15.773
    lecture: "05"
    timestamps: ["38:28"]
---
# Out-of-Vocabulary

Tokens encountered at inference time that were not present in the training vocabulary, collapsed into a single special token (UNK), causing loss of distinguishing information between different unknown words.

## Key Points from Sources

- **MIT15.773 Lecture 05**

## Related Concepts

- [[Vocabulary]] (related to) — OOV tokens arise from a fixed vocabulary built on training data
- [[Subword Tokenization]] (contrasts with) — Subword tokenization eliminates OOV by breaking unknown words into known subwords
