---
aliases: ["GD", "Optimization"]
tags: [optimization, training]
type: concept
first_seen: MIT15.773/02
sources:
  - course: MIT15.773
    lecture: "02"
    timestamps: ["40:17", "41:40"]
  - course: mit-6s191
    lecture: "01"
    timestamps: ["37:37", "38:42"]
---
# Gradient Descent

An iterative optimization algorithm that updates neural network weights by computing the gradient of the loss with respect to weights and stepping in the negative gradient direction. Converges to a local minimum of the loss landscape.

## Key Points from Sources

- **MIT15.773 Lecture 02**
- **mit-6s191 Lecture 01**

## Related Concepts

- [[Stochastic Gradient Descent]] (related to) — SGD is a more practical variant that uses mini-batches
- [[Learning Rate]] (related to) — Learning rate controls the step size in gradient descent
- [[Backpropagation]] (depends on) — Gradient descent requires backpropagation to compute gradients.
- [[Learning Rate]] (depends on) — The learning rate controls the step size in gradient descent.
