---
aliases: ["Cost Function", "Objective Function", "Error Function"]
tags: [training, theory, optimization]
type: concept
first_seen: MIT15.773/02
sources:
  - course: MIT15.773
    lecture: "02"
    timestamps: ["22:48", "23:53"]
  - course: mit-6s191
    lecture: "01"
    timestamps: ["33:40", "34:52"]
---
# Loss Function

A function that quantifies the deviation between a model's predictions and ground truth labels. Cross-entropy loss is used for classification; mean squared error for regression. Training minimizes the empirical average loss across the dataset.

## Key Points from Sources

- **MIT15.773 Lecture 02**
- **mit-6s191 Lecture 01**

## Related Concepts

- [[Gradient Descent]] (enables) — Loss functions provide the objective that gradient descent minimizes
- [[Binary Cross-Entropy]] (related to) — Binary cross-entropy is a specific loss function for classification
- [[Gradient Descent]] (prerequisite for) — The loss function defines the landscape that gradient descent navigates.
