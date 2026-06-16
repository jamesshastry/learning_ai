---
aliases: ["Eval-First Training", "Eval Maxing"]
tags: [training, application]
type: concept
first_seen: mse435/06
sources:
  - course: mse435
    lecture: "06"
    timestamps: ["24:04", "24:45", "24:52", "25:16"]
---
# Eval-Driven Development

The practice at AI labs where evaluation benchmarks define the training roadmap — you first define the hill to climb (the eval), then use RL as an "eval-maxing machine" to climb it. Evals are the most guarded asset at labs. SWE-bench sparked the coding model race. Enterprise evals differ from lab evals and define the specialization opportunity.

## Key Points from Sources

- **mse435 Lecture 06**

## Related Concepts

- [[RLVR (RL with Verifiable Rewards)]] (enables) — Evals provide the reward signal that RL training optimizes against.
- [[Enterprise Model Specialization]] (enables) — Enterprise-specific evals are what enable meaningful model specialization beyond frontier labs.
