---
aliases: ["Dual-Mode Reasoning"]
tags: [architecture, reasoning, planning]
type: concept
first_seen: llm-agents-f24/08
sources:
  - course: llm-agents-f24
    lecture: "08"
    timestamps: ["30:00", "35:00"]
---
# Dualformer

A transformer architecture that learns to dynamically switch between fast thinking (direct solution prediction) and slow thinking (full search trace generation) within a single model, trained by randomly dropping search trace tokens during training.

## Key Points from Sources

- **llm-agents-f24 Lecture 08**

## Related Concepts

- [[Searchformer]] (extends) — Dualformer adds adaptive fast/slow switching to Searchformer's search-trace approach.
