---
aliases: ["Training Epoch"]
tags: [training]
type: concept
first_seen: MIT15.773/03
sources:
  - course: MIT15.773
    lecture: "03"
    timestamps: ["03:14", "05:34"]
---
# Epoch

One complete pass through the entire training dataset. In SGD, each epoch contains multiple mini-batch iterations, each updating weights. Models are typically trained for 10-300 epochs depending on convergence.

## Key Points from Sources

- **MIT15.773 Lecture 03**

## Related Concepts

- [[Mini-Batch]] (related to) — Each epoch consists of multiple mini-batch iterations in SGD
- [[Early Stopping]] (related to) — Early stopping monitors validation loss across epochs
