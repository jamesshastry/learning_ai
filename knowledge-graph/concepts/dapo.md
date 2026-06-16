---
aliases: ["Decoupled Alignment from Policy Optimization"]
tags: [algorithm, RL, training]
type: concept
first_seen: cs294-agentic-f25/03
sources:
  - course: cs294-agentic-f25
    lecture: "03"
    timestamps: ["01:02:31"]
---
# DAPO

A GRPO variant that decouples the upper and lower clipping thresholds in the likelihood ratio, making the upper threshold larger to encourage the model to increase probability of rare but correct tokens, promoting exploration.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 03**

## Related Concepts

- [[GRPO]] (variant of) — DAPO modifies GRPO's clipping mechanism
