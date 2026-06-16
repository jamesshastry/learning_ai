---
aliases: ["next-word prediction", "language modeling"]
tags: [training, foundation]
type: concept
first_seen: cs294-agentic-f25/01
sources:
  - course: cs294-agentic-f25
    lecture: "01"
    timestamps: ["00:27", "12:00"]
---
# Pre-training

The first stage of LLM training where the model learns to predict the next token on internet-scale data (10-40 trillion tokens), acquiring broad world knowledge through self-supervised learning.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 01**

## Related Concepts

- [[Scaling Laws]] (enables) — Pre-training performance follows predictable scaling laws with compute
- [[Mid-training]] (followed by) — Mid-training continues pre-training on higher-quality curated data
