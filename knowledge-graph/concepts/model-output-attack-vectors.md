---
aliases: ["output-as-attack", "model output threats"]
tags: [security, attacks, taxonomy]
type: concept
first_seen: cs294-agentic-f25/12
sources:
  - course: cs294-agentic-f25
    lecture: "12"
    timestamps: ["14:00"]
---
# Model Output Attack Vectors

Six pathways through which LLM outputs can serve as attack vectors: (1) user-facing content (info leakage), (2) parameters for further invocations (compounding errors), (3) branch conditions (altered control flow), (4) function call parameters (SQL injection), (5) direct code execution, (6) external-facing actions (harm to world).

## Key Points from Sources

- **cs294-agentic-f25 Lecture 12**

## Related Concepts

- [[Hybrid Agent System]] (vulnerability of) — Each output pathway represents a distinct attack chain in hybrid systems
