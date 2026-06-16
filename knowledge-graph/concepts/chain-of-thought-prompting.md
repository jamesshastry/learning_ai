---
aliases: ["CoT", "Step-by-Step Reasoning"]
tags: [reasoning, prompting, theory]
type: concept
first_seen: llm-agents-f24/01
sources:
  - course: llm-agents-f24
    lecture: "01"
    timestamps: ["12:05", "17:54", "22:03", "29:57"]
  - course: llm-agents-sp25
    lecture: "01"
    timestamps: []
---
# Chain-of-Thought Prompting

A prompting technique where intermediate reasoning steps are included in few-shot examples, enabling LLMs to generate step-by-step reasoning before producing final answers, dramatically improving performance on complex tasks.

## Key Points from Sources

- **llm-agents-f24 Lecture 01**
- **llm-agents-sp25 Lecture 01**

## Related Concepts

- [[Self-Consistency]] (enables) — Chain-of-thought produces diverse reasoning paths that self-consistency can aggregate.
- [[Least-to-Most Prompting]] (related to) — Both are reasoning strategies using intermediate steps, with least-to-most adding decomposition.
