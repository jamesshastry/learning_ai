---
aliases: ["Unit Test Self-Correction"]
tags: [application, reasoning, code-generation]
type: concept
first_seen: llm-agents-f24/01
sources:
  - course: llm-agents-f24
    lecture: "01"
    timestamps: ["57:33", "57:38"]
---
# Self-Debug

A technique where LLMs correct their generated code by using unit test results as oracle feedback, naturally leveraging the availability of automated verification in coding tasks to achieve genuine self-improvement, unlike general reasoning self-correction.

## Key Points from Sources

- **llm-agents-f24 Lecture 01**

## Related Concepts

- [[LLM Self-Correction Failure]] (contrasts with) — Succeeds where general self-correction fails because unit tests provide reliable oracle signal.
- [[Agents for Software Development]] (enables) — Self-debug is a core capability used in coding agent systems like SWE-agent.
