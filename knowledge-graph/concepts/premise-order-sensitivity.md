---
aliases: ["Premise Order Effect"]
tags: [limitation, reasoning, evaluation]
type: concept
first_seen: llm-agents-f24/01
sources:
  - course: llm-agents-f24
    lecture: "01"
    timestamps: ["58:08", "59:02", "01:00:22", "01:01:39"]
---
# Premise Order Sensitivity

A fundamental LLM limitation where reordering the premises or sentences in reasoning problems causes significant performance drops (10+ points on math, 30+ on logic), revealing that LLMs process information sequentially and cannot reason flexibly about unordered premises.

## Key Points from Sources

- **llm-agents-f24 Lecture 01**

## Related Concepts

- [[Irrelevant Context Distraction]] (related to) — Both reveal fundamental fragility in LLM reasoning capabilities.
- [[LLM Self-Correction Failure]] (related to) — Both are limitations where LLMs fail at tasks trivial for humans.
