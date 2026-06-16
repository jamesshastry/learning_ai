---
aliases: ["Policy Learning", "Policy Network", "REINFORCE"]
tags: [reinforcement-learning, optimization]
type: concept
first_seen: mit-6s191/05
sources:
  - course: mit-6s191
    lecture: "05"
    timestamps: ["34:57", "47:13"]
---
# Policy Gradient

An RL method that directly learns a policy pi(a|s) as a probability distribution over actions, rather than learning value functions. Enables stochastic policies and continuous action spaces. Trained by maximizing expected reward via gradient of log-probability weighted by returns.

## Key Points from Sources

- **mit-6s191 Lecture 05**

## Related Concepts

- [[Q-Function]] (alternative to) — Policy gradients learn policies directly, bypassing Q-function estimation.
