---
aliases: ["SGD", "Mini-batch Gradient Descent", "Stochastic Gradient Descent", "Mini-Batch Gradient Descent"]
tags: [optimization, training]
type: concept
first_seen: MIT15.773/02
sources:
  - course: MIT15.773
    lecture: "02"
    timestamps: ["01:05:11", "01:06:33"]
  - course: mit-6s191
    lecture: "01"
    timestamps: ["46:54", "47:31"]
---
# Stochastic Gradient Descent

A variant of gradient descent that computes gradients over a small random subset (mini-batch) of the training data rather than the entire dataset, balancing computational efficiency with gradient accuracy. Typical batch sizes range from 32 to hundreds of samples.

## Key Points from Sources

- **MIT15.773 Lecture 02**
- **mit-6s191 Lecture 01**

## Related Concepts

- [[Gradient Descent]] (related to) — SGD approximates full gradient descent using mini-batches
- [[Adam Optimizer]] (related to) — Adam is a popular variant of SGD with adaptive learning rates
- [[Gradient Descent]] (variant of) — Mini-batch SGD is the practical variant of full-batch gradient descent.
