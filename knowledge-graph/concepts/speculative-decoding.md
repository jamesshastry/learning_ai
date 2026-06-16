---
aliases: ["spec decoding", "speculative execution", "spec decode", "draft-verify decoding"]
tags: [optimization, infrastructure]
type: concept
first_seen: cs336/01
sources:
  - course: cs336
    lecture: "01"
    timestamps: ["43:15"]
  - course: cs336
    lecture: "10"
    timestamps: ["45:00"]
---
# Speculative Decoding

An inference optimization using a small draft model to generate K candidate tokens, then verifying them in parallel with the full model. Accepted tokens provide multi- token speedup while maintaining the exact same output distribution as standard autoregressive generation.

## Key Points from Sources

- **cs336 Lecture 01**
- **cs336 Lecture 10**

## Related Concepts

- [[KV Cache]] (related to) — Speculative decoding leverages KV cache for efficient parallel verification
- [[Multi-Token Prediction]] (related to) — MTP builds a draft model into the architecture for speculative decoding
