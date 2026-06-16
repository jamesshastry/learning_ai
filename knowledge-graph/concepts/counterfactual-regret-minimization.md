---
aliases: ["CFR"]
tags: [algorithm, game-theory, imperfect-information]
type: concept
first_seen: cs294-agentic-f25/06
sources:
  - course: cs294-agentic-f25
    lecture: "06"
    timestamps: ["11:16"]
---
# Counterfactual Regret Minimization

Algorithm for finding Nash equilibria in imperfect-information games like poker. Tracks regret for not having taken each action at each decision point, converging to equilibrium over iterations. Standard RL methods fail in these settings.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 06**

## Related Concepts

- [[Self-Play]] (enables in) — CFR enables sound self-play in imperfect-information games
