---
aliases: ["Reinforcement Learning with Verifiable Rewards", "Verifiable RL"]
tags: [theory, training, architecture, optimization]
type: concept
first_seen: llm-agents-sp25/04
sources:
  - course: llm-agents-sp25
    lecture: "04"
    timestamps: []
  - course: mse435
    lecture: "06"
    timestamps: ["14:44", "14:50", "23:19", "31:32"]
---
# RLVR (RL with Verifiable Rewards)

A training technique where models are placed in constrained environments with deterministic reward signals — the model attempts a task hundreds or thousands of times, and a verifier (compiler, unit tests, mathematical proof checker) provides a binary or scalar reward. Uses only ~5% of pre-training compute but delivers massive capability gains. Key innovation behind reasoning models like o1 and R1.

## Key Points from Sources

- **llm-agents-sp25 Lecture 04**
- **mse435 Lecture 06**

## Related Concepts

- [[Emergent Chain-of-Thought]] (enables) — RLVR training in constrained environments is what causes chain-of-thought to emerge.
- [[Code as AGI-Complete Domain]] (enables) — Code is ideal for RLVR because compilation and unit tests provide deterministic verification.
