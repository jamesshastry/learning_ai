---
aliases: ["Pretrained Models"]
tags: [training, application]
type: concept
first_seen: MIT15.773/04
sources:
  - course: MIT15.773
    lecture: "04"
    timestamps: ["01:00:31", "01:01:26"]
---
# Transfer Learning

The practice of taking a neural network pretrained on a large dataset (e.g., ImageNet) and adapting it for a new, specific task by freezing learned feature layers and retraining only the classification head, dramatically reducing data requirements.

## Key Points from Sources

- **MIT15.773 Lecture 04**

## Related Concepts

- [[Fine-Tuning]] (related to) — Fine-tuning unfreezes some pretrained layers for further task-specific training
- [[ResNet]] (related to) — ResNet pretrained on ImageNet is commonly used for transfer learning
