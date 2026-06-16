---
aliases: ["paired t-test", "matched comparison"]
tags: [statistics, evaluation, methodology]
type: concept
first_seen: cs294-agentic-f25/07
sources:
  - course: cs294-agentic-f25
    lecture: "07"
    timestamps: ["20:00"]
---
# Paired Comparison Testing

Statistical method comparing two models on the same set of questions, computing per-question differences before aggregating. Dramatically reduces variance because question difficulty factors cancel out, enabling detection of smaller improvements.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 07**

## Related Concepts

- [[Predictable Noise]] (reduces) — Paired testing reduces noise compared to independent evaluation
