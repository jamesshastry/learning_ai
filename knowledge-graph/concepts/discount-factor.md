---
aliases: ["Gamma", "Temporal Discounting"]
tags: [reinforcement-learning, hyperparameter]
type: concept
first_seen: mit-6s191/05
sources:
  - course: mit-6s191
    lecture: "05"
    timestamps: ["09:31", "10:07"]
---
# Discount Factor

A parameter gamma (0 < gamma < 1) that reduces the weight of future rewards in the total return calculation. Reflects preference for immediate rewards over delayed ones, with R(t) = sum of gamma^k * r(t+k) for k = 0,1,2,...

## Key Points from Sources

- **mit-6s191 Lecture 05**

## Related Concepts

- [[Reward Signal]] (modifies) — The discount factor weights future rewards relative to immediate ones.
