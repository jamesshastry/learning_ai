---
aliases: ["chinchilla scaling", "compute-optimal training", "Chinchilla scaling laws", "Hoffmann scaling laws", "compute-optimal scaling", "Chinchilla-optimal", "compute efficiency"]
tags: [training, compute, optimization, theory]
type: concept
first_seen: cs294-agentic-f25/01
sources:
  - course: cs294-agentic-f25
    lecture: "01"
    timestamps: ["46:47"]
  - course: cs336
    lecture: "09"
    timestamps: ["30:00"]
  - course: cs336
    lecture: "09"
    timestamps: ["01:00:00"]
---
# Compute-Optimal Training

Scaling laws from Hoffmann et al. (2022) showing that compute-optimal training balances model size and data roughly equally, with a rule of thumb of ~20 tokens per parameter. Corrected earlier Kaplan (OpenAI) scaling laws that recommended allocating most compute to model size.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 01**
- **cs336 Lecture 09**
- **cs336 Lecture 09**

## Related Concepts

- [[Scaling Laws]] (instance of) — Chinchilla is a specific application of scaling law analysis
- [[IsoFLOP Curves]] (related to) — Chinchilla used isoFLOP methodology to derive optimal model size
- [[Scaling Recipe]] (part of) — Chinchilla scaling is one component of a complete scaling recipe
- [[Inference-Optimal Scaling]] (contrasts with) — Production models are often over-trained relative to compute-optimal
