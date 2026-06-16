---
aliases: ["model-based evaluation", "AI judge", "LLM Judge", "AI Judge"]
tags: [evaluation, methodology, training, llm]
type: concept
first_seen: cs294-agentic-f25/04
sources:
  - course: cs294-agentic-f25
    lecture: "04"
    timestamps: ["17:00"]
  - course: cs336
    lecture: "12"
    timestamps: ["15:00"]
  - course: mit-6s191
    lecture: "07"
    timestamps: ["31:31", "32:34"]
---
# LLM-as-Judge

Using a language model to evaluate the outputs of another language model, checking if responses contain prohibited information even in non-obvious forms (translations, encodings, paraphrases). More flexible than rule-based metrics but introduces its own biases.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 04**
- **cs336 Lecture 12**
- **mit-6s191 Lecture 07**

## Related Concepts

- [[Human Evaluation]] (approximates) — LLM judges are cheaper but less reliable than human evaluators
- [[Transformer]] (related to) — Foundational concept in modern LLM development
- [[LLM Evaluation]] (component of) — LLM-as-judge is a metric strategy used within systematic LLM evaluation.
