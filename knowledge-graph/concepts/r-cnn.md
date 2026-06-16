---
aliases: ["Region-based CNN", "Faster R-CNN"]
tags: [architecture, computer-vision]
type: concept
first_seen: mit-6s191/03
sources:
  - course: mit-6s191
    lecture: "03"
    timestamps: ["49:41", "50:58"]
---
# R-CNN

An object detection architecture that uses a CNN to extract features from the full image, proposes candidate regions, then classifies each region. End-to-end differentiable, enabling backpropagation through the entire pipeline including region proposals.

## Key Points from Sources

- **mit-6s191 Lecture 03**

## Related Concepts

- [[Object Detection]] (implements) — R-CNN is a dominant approach to object detection.
