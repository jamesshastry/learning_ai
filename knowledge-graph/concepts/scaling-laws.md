---
aliases: ["neural scaling laws", "compute-performance relationship", "compute-optimal scaling", "Neural Scaling Laws", "Power Law Scaling"]
tags: [training, theory, compute, scaling]
type: concept
first_seen: cs294-agentic-f25/01
sources:
  - course: cs294-agentic-f25
    lecture: "01"
    timestamps: ["43:00", "45:00"]
  - course: cs336
    lecture: "01"
    timestamps: ["45:28", "46:20"]
  - course: mit-6s191
    lecture: "09"
    timestamps: ["05:51", "07:00"]
---
# Scaling Laws

Empirically observed power-law relationships between model size, training data volume, and model performance (loss). More parameters and more data independently improve performance, but inference cost considerations often drive smaller models trained on more data in practice.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 01**
- **cs336 Lecture 01**
- **mit-6s191 Lecture 09**

## Related Concepts

- [[Chinchilla Optimal]] (related to) — Chinchilla uses scaling laws to derive optimal data-to-parameter ratios
- [[Bitter Lesson]] (supports) — Scaling laws empirically validate that more compute yields better performance
- [[Chinchilla Scaling]] (related to) — Chinchilla refined compute-optimal scaling to balance model size vs data
- [[Hyperparameter Transfer]] (enables) — Scaling laws require predictable hyperparameter behavior across scales
- [[Data Parallelism]] (motivates) — Scaling laws motivate the need for distributed training to handle more data.
