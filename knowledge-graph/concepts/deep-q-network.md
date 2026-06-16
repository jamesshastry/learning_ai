---
aliases: ["DQN"]
tags: [architecture, reinforcement-learning]
type: concept
first_seen: mit-6s191/05
sources:
  - course: mit-6s191
    lecture: "05"
    timestamps: ["25:02", "31:04"]
---
# Deep Q-Network

A neural network that approximates the Q-function, taking a state as input and outputting Q-values for all possible actions. Trained by minimizing the difference between predicted Q-values and target values computed from observed rewards and future Q estimates.

## Key Points from Sources

- **mit-6s191 Lecture 05**

## Related Concepts

- [[Q-Function]] (approximates) — DQN learns to approximate the Q-function from experience.
