---
aliases: ["Search-Augmented LLM", "Beyond A*"]
tags: [reasoning, planning, architecture]
type: concept
first_seen: llm-agents-f24/08
sources:
  - course: llm-agents-f24
    lecture: "08"
    timestamps: ["23:23", "24:40", "25:29"]
---
# Searchformer

A model trained to output A* search traces before final solutions for planning tasks, achieving 10x better sample efficiency and working with 10x smaller models compared to solution-only approaches, demonstrating that learning search processes improves reasoning.

## Key Points from Sources

- **llm-agents-f24 Lecture 08**

## Related Concepts

- [[Dualformer]] (extended by) — Dualformer adds adaptive switching between search-trace and direct-solution modes.
- [[Chain-of-Thought Prompting]] (related to) — Both add intermediate reasoning steps; Searchformer learns algorithmic search traces.
