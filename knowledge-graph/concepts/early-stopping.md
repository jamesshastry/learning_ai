---
aliases: ["Validation-based Stopping"]
tags: [training, optimization, regularization]
type: concept
first_seen: MIT15.773/03
sources:
  - course: MIT15.773
    lecture: "03"
    timestamps: ["13:19", "13:35"]
  - course: mit-6s191
    lecture: "01"
    timestamps: ["53:03", "54:00"]
---
# Early Stopping

A regularization technique that monitors training and validation loss curves during training, saving model checkpoints and selecting the checkpoint where validation loss begins to increase, indicating the onset of overfitting. Architecture-agnostic and widely applicable.

## Key Points from Sources

- **MIT15.773 Lecture 03**
- **mit-6s191 Lecture 01**

## Related Concepts

- [[Overfitting]] (contrasts with) — Early stopping prevents overfitting by halting training at the right time
- [[Dropout]] (related to) — Dropout is an alternative regularization method
- [[Overfitting]] (addresses) — Early stopping halts training before overfitting becomes severe.
