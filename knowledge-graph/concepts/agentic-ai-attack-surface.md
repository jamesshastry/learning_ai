---
aliases: ["attack surface", "vulnerability surface", "Agent Attack Surface"]
tags: [security, agents, risk, safety, architecture]
type: concept
first_seen: cs294-agentic-f25/12
sources:
  - course: cs294-agentic-f25
    lecture: "12"
    timestamps: ["10:56"]
  - course: llm-agents-sp25
    lecture: "12"
    timestamps: ["10:45", "1:20:00"]
---
# Agentic AI Attack Surface

The complete set of vulnerability points in an agent system — model, input processing, prompt assembly, tool access, output generation, and environment interaction — vastly larger than standalone LLM attack surface as each component and interaction point introduces new security risks.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 12**
- **llm-agents-sp25 Lecture 12**

## Related Concepts

- [[CIA Triad for AI]] (threatens) — The expanded attack surface creates risks across all CIA dimensions
- [[AI Safety vs AI Security]] (related to) — Understanding the attack surface is prerequisite for both safety and security
- [[Prompt Injection]] (related to) — Prompt injection exploits the input processing point of the attack surface
