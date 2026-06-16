---
aliases: ["auxiliary balancing loss", "expert balancing"]
tags: [training, architecture]
type: concept
first_seen: cs336/04
sources:
  - course: cs336
    lecture: "04"
    timestamps: ["01:04:18", "01:06:00"]
---
# Load Balancing Loss

An auxiliary loss term that penalizes uneven token distribution across experts. Computed as the dot product of fraction-of-tokens-dispatched and probability-mass- allocated per expert. Gradient pushes down routing probability for popular experts proportional to their token fraction.

## Key Points from Sources

- **cs336 Lecture 04**

## Related Concepts

- [[Expert Collapse]] (contrasts with) — Primary defense against expert collapse
