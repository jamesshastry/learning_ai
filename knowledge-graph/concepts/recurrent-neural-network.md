---
aliases: ["RNN"]
tags: [architecture, sequence-modeling]
type: concept
first_seen: mit-6s191/02
sources:
  - course: mit-6s191
    lecture: "02"
    timestamps: ["13:20", "14:00"]
---
# Recurrent Neural Network

A class of neural networks that maintain an internal hidden state h(t) updated at each time step via a recurrence relation, enabling processing of sequential data by linking computations across time. Uses shared weight matrices at every time step.

## Key Points from Sources

- **mit-6s191 Lecture 02**

## Related Concepts

- [[Hidden State]] (contains) — The hidden state is the core mechanism enabling temporal memory in RNNs.
- [[Backpropagation Through Time]] (trained by) — RNNs are trained using BPTT to propagate gradients across time steps.
