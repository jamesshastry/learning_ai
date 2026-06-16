---
aliases: ["entropy loss collapse", "mode collapse in RL"]
tags: [training, failure-mode, RL]
type: concept
first_seen: cs294-agentic-f25/03
sources:
  - course: cs294-agentic-f25
    lecture: "03"
    timestamps: ["57:13", "59:03"]
---
# Entropy Collapse

A failure mode in RL training where the model's token generation probability distribution becomes increasingly peaked, destroying diversity of outputs. The model converges to producing a single answer per prompt, preventing further learning.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 03**

## Related Concepts

- [[On-Policy RL]] (mitigated by) — On-policy training helps maintain higher entropy
- [[DAPO]] (mitigated by) — Decoupled clipping thresholds encourage exploration
