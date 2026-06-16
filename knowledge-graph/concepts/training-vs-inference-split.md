---
aliases: ["Training-Inference Ratio"]
tags: [infrastructure, economics, compute]
type: concept
first_seen: mse435/01
sources:
  - course: mse435
    lecture: "01"
    timestamps: ["18:37", "18:54", "19:02"]
---
# Training vs Inference Split

The allocation of GPU compute between model training (~60%) and inference serving (~40%) as reported by Nvidia, with expectations that inference will grow over time as AI products scale. Training workloads are predictable and sustained; inference is bursty and follows human usage patterns.

## Key Points from Sources

- **mse435 Lecture 01**

## Related Concepts

- [[Marginal Cost of Intelligence]] (enables) — Inference compute directly drives the marginal cost of serving AI users.
- [[AI Value Chain Triangle]] (related to) — The shift toward inference-heavy compute could change the economics of the entire stack.
