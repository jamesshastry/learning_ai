---
aliases: ["sandbox", "code execution environment"]
tags: [infrastructure, training, agents]
type: concept
first_seen: cs294-agentic-f25/05
sources:
  - course: cs294-agentic-f25
    lecture: "05"
    timestamps: ["02:50"]
---
# Environment Simulator

CPU-based infrastructure for executing agent actions during training (running code, tests, tool calls). Typically requires 10x the CPU count relative to the GPU training cluster, representing a major infrastructure cost.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 05**

## Related Concepts

- [[Multi-Turn Agentic Training]] (enables) — Simulators provide the feedback loop for multi-turn training
