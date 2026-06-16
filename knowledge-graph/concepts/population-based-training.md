---
aliases: ["PBT", "league training", "population diversity"]
tags: [training, multi-agent, robustness]
type: concept
first_seen: cs294-agentic-f25/10
sources:
  - course: cs294-agentic-f25
    lecture: "10"
    timestamps: ["15:00"]
---
# Population-Based Training

Training technique that maintains a diverse population of agent strategies/policies to prevent rock-paper-scissors-style cycling. Critical for AlphaStar's robustness — agents trained against diverse opponents develop more general strategies.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 10**

## Related Concepts

- [[Self-Play]] (extends) — PBT adds population diversity to basic self-play
