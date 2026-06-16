---
aliases: ["prompt attack", "injection attack", "Indirect Prompt Injection", "Direct Prompt Injection"]
tags: [security, attacks, LLM, safety, adversarial, agents, application]
type: concept
first_seen: cs294-agentic-f25/12
sources:
  - course: cs294-agentic-f25
    lecture: "12"
    timestamps: ["14:44"]
  - course: llm-agents-f24
    lecture: "12"
    timestamps: ["35:00", "38:00"]
  - course: llm-agents-sp25
    lecture: "12"
    timestamps: ["15:20", "22:45"]
---
# Prompt Injection

An attack vector where malicious instructions are embedded in content that agents process (retrieved documents, tool outputs, user messages), causing the agent to execute unintended actions — the agent-safety analog of SQL injection in traditional software.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 12**
- **llm-agents-f24 Lecture 12**
- **llm-agents-sp25 Lecture 12**

## Related Concepts

- [[Agent Attack Surface]] (exploits) — Prompt injection exploits the boundary between user input and model instructions
- [[Agent Safety]] (critical threat to) — Prompt injection is one of the most critical agent-specific safety vulnerabilities.
- [[Agentic RAG]] (threatens) — RAG systems are vulnerable to prompt injection through retrieved content.
- [[DataSentinel]] (related to) — DataSentinel provides defense against prompt injection
- [[Agentic AI Attack Surface]] (part of) — Prompt injection is a key component of the agent attack surface
