---
aliases: ["Backprop", "Back-propagation"]
tags: [training, optimization, fundamentals]
type: concept
first_seen: MIT15.773/02
sources:
  - course: MIT15.773
    lecture: "02"
    timestamps: ["56:52", "57:14"]
  - course: mit-6s191
    lecture: "01"
    timestamps: ["39:54", "41:45"]
---
# Backpropagation

An efficient algorithm for computing the gradient of the loss function with respect to all network weights by applying the chain rule backward through the network layers, reducing computation to a sequence of matrix multiplications suitable for GPU acceleration.

## Key Points from Sources

- **MIT15.773 Lecture 02**
- **mit-6s191 Lecture 01**

## Related Concepts

- [[Gradient Descent]] (enables) — Backprop provides the gradients that gradient descent needs
- [[GPU]] (related to) — Backprop's matrix operations are accelerated by GPU hardware
