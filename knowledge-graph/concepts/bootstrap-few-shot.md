---
aliases: ["Self-Generated Demonstrations"]
tags: [optimization, prompting]
type: concept
first_seen: llm-agents-f24/05
sources:
  - course: llm-agents-f24
    lecture: "05"
    timestamps: ["32:11", "33:06", "43:01"]
---
# Bootstrap Few-Shot

A technique that runs a basic version of a program on training inputs, traces module inputs and outputs from successful trajectories, and uses those as few-shot demonstrations in module prompts — a form of automated example generation.

## Key Points from Sources

- **llm-agents-f24 Lecture 05**

## Related Concepts

- [[MePro Optimizer]] (component of) — Bootstrapped demonstrations are a key input to MePro's optimization.
- [[Self-Consistency]] (related to) — Both use multiple samples to find high-quality outputs.
