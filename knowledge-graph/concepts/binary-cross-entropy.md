---
aliases: ["BCE", "Log Loss"]
tags: [training, theory]
type: concept
first_seen: MIT15.773/02
sources:
  - course: MIT15.773
    lecture: "02"
    timestamps: ["31:58", "29:07"]
---
# Binary Cross-Entropy

A loss function for binary classification that uses -[y·log(p) + (1-y)·log(1-p)], penalizing confident wrong predictions exponentially harder than uncertain ones.

## Key Points from Sources

- **MIT15.773 Lecture 02**

## Related Concepts

- [[Loss Function]] (part of) — BCE is the standard loss function for binary classification
- [[Categorical Cross-Entropy]] (related to) — Categorical cross-entropy generalizes BCE to multi-class problems
