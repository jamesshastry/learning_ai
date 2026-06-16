---
aliases: ["Alpha", "Step Size", "Eta"]
tags: [optimization, training, hyperparameter]
type: concept
first_seen: MIT15.773/02
sources:
  - course: MIT15.773
    lecture: "02"
    timestamps: ["41:56", "42:20"]
  - course: mit-6s191
    lecture: "01"
    timestamps: ["43:17", "44:26"]
---
# Learning Rate

A hyperparameter (eta) that controls the size of weight updates during gradient descent. Too small leads to getting stuck in local minima; too large causes overshooting and divergence. Adaptive methods like Adam adjust the learning rate automatically.

## Key Points from Sources

- **MIT15.773 Lecture 02**
- **mit-6s191 Lecture 01**

## Related Concepts

- [[Gradient Descent]] (part of) — Learning rate is a key parameter in the gradient descent update rule
