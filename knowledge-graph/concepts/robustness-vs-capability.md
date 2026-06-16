---
aliases: ["Pass@k vs Fail@k", "Agent Reliability"]
tags: [evaluation, agents, safety]
type: concept
first_seen: llm-agents-f24/02
sources:
  - course: llm-agents-f24
    lecture: "02"
    timestamps: ["01:03:14", "01:04:11", "01:06:03", "01:07:02"]
---
# Robustness vs Capability

The distinction between capability (can an agent solve a task at least once in k attempts, pass@k) and robustness (can an agent solve a task every time in k attempts, fail@k) — real-world deployment requires robustness, but current benchmarks mostly measure capability.

## Key Points from Sources

- **llm-agents-f24 Lecture 02**

## Related Concepts

- [[Digital Automation]] (constrains) — Real-world digital automation requires high robustness, not just high capability.
- [[Agent-Computer Interface]] (related to) — Better interfaces may improve both capability and robustness.
