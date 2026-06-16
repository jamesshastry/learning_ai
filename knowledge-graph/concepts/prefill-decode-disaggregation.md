---
aliases: ["Inference Phase Separation"]
tags: [architecture, optimization, compute]
type: concept
first_seen: mse435/02
sources:
  - course: mse435
    lecture: "02"
    timestamps: ["16:02", "16:07", "16:24"]
---
# Prefill-Decode Disaggregation

The technique of separating AI inference into distinct phases — prefill (processing the input context, compute-intensive) and decode (generating output tokens, memory-bandwidth-intensive) — and running each on optimized hardware, yielding significant efficiency gains.

## Key Points from Sources

- **mse435 Lecture 02**

## Related Concepts

- [[NVLink Fusion]] (enables) — Disaggregation is the key insight that led to the Groq-Nvidia NVLink Fusion architecture.
- [[Heterogeneous Compute]] (part of) — Prefill-decode separation is one form of heterogeneous compute optimization.
