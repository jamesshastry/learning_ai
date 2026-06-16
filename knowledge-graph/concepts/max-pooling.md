---
aliases: ["MaxPool", "Downsampling", "Pooling"]
tags: [architecture, computer-vision]
type: concept
first_seen: MIT15.773/04
sources:
  - course: MIT15.773
    lecture: "04"
    timestamps: ["31:48", "34:00"]
  - course: mit-6s191
    lecture: "03"
    timestamps: ["34:40", "35:06"]
---
# Max Pooling

A downsampling operation that reduces the spatial dimensions of feature maps by taking the maximum value within non-overlapping patches (e.g., 2×2). Preserves the strongest detected features while increasing the relative receptive field of subsequent convolutional layers.

## Key Points from Sources

- **MIT15.773 Lecture 04**
- **mit-6s191 Lecture 03**

## Related Concepts

- [[Convolutional Neural Network]] (part of) — Max pooling layers follow convolutional layers to reduce dimensions
