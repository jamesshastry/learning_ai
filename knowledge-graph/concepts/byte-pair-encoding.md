---
aliases: ["BPE", "byte-pair encoding"]
tags: [data, architecture]
type: concept
first_seen: cs336/01
sources:
  - course: cs336
    lecture: "01"
    timestamps: ["01:05:07", "01:12:03"]
---
# Byte Pair Encoding

A data-driven tokenization algorithm that starts with byte-level tokens and iteratively merges the most frequent adjacent pair into a new token, building a vocabulary tailored to the training corpus. Common sequences become single tokens while rare sequences fragment into multiple tokens, enabling adaptive computation.

## Key Points from Sources

- **cs336 Lecture 01**

## Related Concepts

- [[Compression Ratio]] (enables) — BPE optimizes compression ratio by creating tokens for frequent byte sequences
- [[Tokenization]] (part of) — BPE is the dominant tokenization algorithm for modern LLMs
