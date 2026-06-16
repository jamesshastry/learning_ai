---
aliases: ["iso-FLOP analysis", "compute-matched comparison"]
tags: [training, theory]
type: concept
first_seen: cs336/09
sources:
  - course: cs336
    lecture: "09"
    timestamps: ["35:00"]
---
# IsoFLOP Curves

Experimental methodology where, for each fixed FLOPs budget, model size is swept to find the minimum loss. The optimal points across budgets are then fit with a power law to predict the best model size for a target compute budget.

## Key Points from Sources

- **cs336 Lecture 09**

## Related Concepts

- [[Chinchilla Scaling]] (enables) — IsoFLOP is the experimental method behind Chinchilla scaling laws
