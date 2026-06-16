---
aliases: ["Flywheel Takeoff", "self-play training", "recursive self-improvement"]
tags: [theory, scaling, strategy, training, game-theory, multi-agent]
type: concept
first_seen: cs153/11
sources:
  - course: cs153
    lecture: "11"
    timestamps: ["36:27", "36:33", "37:07"]
  - course: cs294-agentic-f25
    lecture: "06"
    timestamps: ["09:51"]
---
# Recursive Self-Improvement

The point at which an AI system's context feedback and compute flywheels become self-sustaining — the system generates enough revenue to fund compute, and enough context to improve capabilities, without external intervention. Sometimes equated with paths to AGI/ASI, but Anjney views it at the systems level rather than individual model level.

## Key Points from Sources

- **cs153 Lecture 11**
- **cs294-agentic-f25 Lecture 06**

## Related Concepts

- [[Context Feedback Loop]] (enables) — Recursive self-improvement is the asymptotic state of compounding context feedback loops.
- [[Verifiability Thesis]] (prerequisite for) — Self-improvement requires verifiable domains to maintain reliable capability gains.
- [[Minimax Equilibrium]] (converges to) — Sound self-play provably reaches equilibrium in 2p0s games
