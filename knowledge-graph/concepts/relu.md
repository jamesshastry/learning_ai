---
aliases: ["Rectified Linear Unit"]
tags: [architecture, optimization]
type: concept
first_seen: MIT15.773/01
sources:
  - course: MIT15.773
    lecture: "01"
    timestamps: ["43:28", "45:26"]
---
# ReLU

An activation function defined as max(0, x) — passes positive values unchanged and squishes negative values to zero. Considered a key factor in deep learning's success due to its gradient-preserving properties and minimal non-linearity.

## Key Points from Sources

- **MIT15.773 Lecture 01**

## Related Concepts

- [[Activation Function]] (part of) — ReLU is the default activation function for hidden layers
- [[Vanishing Gradient Problem]] (contrasts with) — ReLU avoids vanishing gradients since its gradient is 1 for positive inputs
