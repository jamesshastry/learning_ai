---
aliases: ["Adversarial Example", "Jailbreak"]
tags: [security, limitation]
type: concept
first_seen: mit-6s191/06
sources:
  - course: mit-6s191
    lecture: "06"
    timestamps: ["23:44", "25:00"]
---
# Adversarial Attack

A technique that creates inputs with imperceptible perturbations designed to fool neural network models. Computed by taking the gradient of the loss function with respect to the input (rather than weights) and adding noise that maximizes the loss. Extends to physical 3D objects.

## Key Points from Sources

- **mit-6s191 Lecture 06**

## Related Concepts

- [[Gradient Descent]] (inverts) — Adversarial attacks apply gradient ascent on the input rather than gradient descent on weights.
