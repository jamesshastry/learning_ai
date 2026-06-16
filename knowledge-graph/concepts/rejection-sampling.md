---
aliases: ["best-of-n sampling", "verifier-based sampling"]
tags: [training, data-generation, technique]
type: concept
first_seen: cs294-agentic-f25/01
sources:
  - course: cs294-agentic-f25
    lecture: "01"
    timestamps: ["01:03:04"]
---
# Rejection Sampling

Technique for generating SFT training data by sampling many candidate answers from an LLM and keeping only those that pass verification (test cases, math checkers, etc.). Used by DeepSeek R1 to bootstrap training data without a stronger teacher model.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 01**

## Related Concepts

- [[Supervised Fine-Tuning]] (generates data for) — Rejection sampling produces verified correct answers for SFT
