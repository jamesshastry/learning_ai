---
aliases: ["Softmax Function", "Softmax Layer"]
tags: [architecture, theory]
type: concept
first_seen: MIT15.773/03
sources:
  - course: MIT15.773
    lecture: "03"
    timestamps: ["01:09:17", "01:09:59"]
---
# Softmax

An activation function that converts K arbitrary real numbers into K probabilities summing to 1, via P(i) = exp(a_i) / Σ exp(a_j). Used as the output layer for multi-class classification. GPT-4 uses a 52,000-way softmax.

## Key Points from Sources

- **MIT15.773 Lecture 03**

## Related Concepts

- [[Sigmoid]] (contrasts with) — Sigmoid outputs one probability; softmax outputs K probabilities summing to 1
- [[Categorical Cross-Entropy]] (related to) — Categorical cross-entropy is the loss function used with softmax outputs
