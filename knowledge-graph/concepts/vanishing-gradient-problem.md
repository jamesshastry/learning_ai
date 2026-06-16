---
aliases: ["Vanishing Gradients"]
tags: [training, limitation]
type: concept
first_seen: mit-6s191/02
sources:
  - course: mit-6s191
    lecture: "02"
    timestamps: ["34:00", "34:55"]
---
# Vanishing Gradient Problem

A training difficulty where gradients shrink exponentially as they propagate through many time steps or layers, resulting in negligible learning signal for early parts of the sequence. Biases the model toward capturing only short-term dependencies.

## Key Points from Sources

- **mit-6s191 Lecture 02**

## Related Concepts

- [[LSTM]] (addressed by) — LSTM architecture was designed to mitigate vanishing gradients.
