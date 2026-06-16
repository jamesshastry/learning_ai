---
aliases: ["bytes per token"]
tags: [data, optimization]
type: concept
first_seen: cs336/01
sources:
  - course: cs336
    lecture: "01"
    timestamps: ["01:07:28"]
---
# Compression Ratio

The ratio of bytes to tokens in a tokenized sequence, measuring how efficiently a tokenizer compresses raw text. Higher compression means shorter sequences, which is desirable since attention cost is quadratic in sequence length.

## Key Points from Sources

- **cs336 Lecture 01**

## Related Concepts

- [[Byte Pair Encoding]] (related to) — BPE aims to maximize compression ratio through learned merges
- [[Vocabulary Size]] (contrasts with) — Increasing vocab size improves compression but introduces sparsity
