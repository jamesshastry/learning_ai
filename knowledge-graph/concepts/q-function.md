---
aliases: ["Q-Value", "Action-Value Function", "Q(s", "a)"]
tags: [reinforcement-learning, value-learning]
type: concept
first_seen: mit-6s191/05
sources:
  - course: mit-6s191
    lecture: "05"
    timestamps: ["13:16", "13:53"]
---
# Q-Function

A function mapping state-action pairs to expected total discounted return. Q(s,a) tells the agent how good it is to take action a in state s, considering all future rewards. The optimal policy selects the action maximizing Q at each state.

## Key Points from Sources

- **mit-6s191 Lecture 05**

## Related Concepts

- [[Deep Q-Network]] (approximated by) — DQNs use neural networks to approximate the Q-function.
