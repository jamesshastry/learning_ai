---
aliases: ["BPTT"]
tags: [training, optimization]
type: concept
first_seen: mit-6s191/02
sources:
  - course: mit-6s191
    lecture: "02"
    timestamps: ["32:30", "32:36"]
---
# Backpropagation Through Time

The training algorithm for RNNs that extends standard backpropagation across sequential time steps, computing gradients from the current position back to the beginning of the sequence. Involves repeated multiplication by weight matrices, leading to vanishing or exploding gradient problems.

## Key Points from Sources

- **mit-6s191 Lecture 02**

## Related Concepts

- [[Vanishing Gradient Problem]] (causes) — Repeated multiplication by small weight values causes gradient signal to decay.
