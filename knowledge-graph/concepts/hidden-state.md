---
aliases: ["Cell State", "Internal State", "h(t)"]
tags: [architecture, sequence-modeling]
type: concept
first_seen: mit-6s191/02
sources:
  - course: mit-6s191
    lecture: "02"
    timestamps: ["11:06", "13:00"]
---
# Hidden State

An internal variable maintained by an RNN that captures information from past time steps. Updated at each step as h(t) = f(W_hh * h(t-1) + W_xh * x(t)), it serves as the network's memory of previous inputs in the sequence.

## Key Points from Sources

- **mit-6s191 Lecture 02**

## Related Concepts

- [[Recurrent Neural Network]] (part of) — The hidden state is the defining component of RNNs.
