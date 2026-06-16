---
aliases: ["Self-Correction Limitation"]
tags: [limitation, reasoning, safety]
type: concept
first_seen: llm-agents-f24/01
sources:
  - course: llm-agents-f24
    lecture: "01"
    timestamps: ["53:42", "54:39", "55:20", "57:09"]
---
# LLM Self-Correction Failure

The finding that LLMs cannot reliably self-correct their reasoning without oracle feedback — while review prompts can fix wrong answers, they equally risk corrupting correct ones, yielding no net improvement and sometimes degradation across benchmarks.

## Key Points from Sources

- **llm-agents-f24 Lecture 01**

## Related Concepts

- [[Self-Consistency]] (contrasts with) — Self-consistency improves via sampling diversity; self-correction fails via iterative revision.
- [[Self-Debug]] (contrasts with) — Self-debug succeeds because unit tests provide oracle feedback that general reasoning lacks.
