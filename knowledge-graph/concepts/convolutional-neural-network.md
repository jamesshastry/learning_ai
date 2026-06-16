---
aliases: ["CNN", "ConvNet"]
tags: [architecture, computer-vision]
type: concept
first_seen: MIT15.773/04
sources:
  - course: MIT15.773
    lecture: "04"
    timestamps: ["06:33", "38:19"]
  - course: mit-6s191
    lecture: "03"
    timestamps: ["29:33", "38:18"]
---
# Convolutional Neural Network

A neural network architecture designed for spatial data that uses convolutions, non-linearities, and pooling to learn hierarchical feature representations. Composed of a feature extraction backbone (conv + pool layers) and a task-specific head (dense layers for classification).

## Key Points from Sources

- **MIT15.773 Lecture 04**
- **mit-6s191 Lecture 03**

## Related Concepts

- [[Convolutional Filter]] (related to) — CNNs are built from stacks of convolutional filters
- [[Max Pooling]] (related to) — Pooling layers downsample feature maps between convolutional blocks
- [[Convolution]] (contains) — Convolutions are the primary operation in CNNs.
- [[Max Pooling]] (contains) — Pooling layers reduce spatial dimensions between convolution layers.
