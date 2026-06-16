---
aliases: ["Reward", "Reward Function"]
tags: [reinforcement-learning, fundamentals]
type: concept
first_seen: mit-6s191/05
sources:
  - course: mit-6s191
    lecture: "05"
    timestamps: ["08:22", "08:28"]
---
# Reward Signal

A scalar value received by an RL agent after taking an action, indicating the quality of that action. Can be positive, negative, or zero; may be sparse (only at episode end) or dense (every step). The agent's objective is to maximize cumulative discounted reward.

## Key Points from Sources

- **mit-6s191 Lecture 05**

## Related Concepts

- [[Q-Function]] (component of) — Q-values are expectations over cumulative reward signals.
