---
aliases: ["Pixel-level Classification"]
tags: [task, computer-vision]
type: concept
first_seen: mit-6s191/03
sources:
  - course: mit-6s191
    lecture: "03"
    timestamps: ["51:25", "52:44"]
---
# Semantic Segmentation

A computer vision task that assigns a class label to every pixel in an image, producing a dense classification map. Uses encoder-decoder architecture with downsampling (convolution + pooling) followed by upsampling to reconstruct full-resolution output.

## Key Points from Sources

- **mit-6s191 Lecture 03**

## Related Concepts

- [[Convolutional Neural Network]] (uses) — Semantic segmentation uses CNN encoders with added decoder networks.
