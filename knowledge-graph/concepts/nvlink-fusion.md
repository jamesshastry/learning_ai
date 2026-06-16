---
aliases: ["Groq-Nvidia Integration"]
tags: [infrastructure, compute, architecture]
type: concept
first_seen: mse435/02
sources:
  - course: mse435
    lecture: "02"
    timestamps: ["17:05", "17:30", "19:02"]
---
# NVLink Fusion

A protocol enabling Groq's SRAM-based chips to communicate directly with Nvidia GPUs via NVLink, allowing disaggregated inference where memory-bandwidth-intensive decode operations run on Groq while compute-intensive operations run on GPUs, producing 2.5x more tokens for the same power footprint.

## Key Points from Sources

- **mse435 Lecture 02**

## Related Concepts

- [[Prefill-Decode Disaggregation]] (enables) — NVLink Fusion enables practical hardware-level disaggregation of inference phases.
- [[Deterministic Chip Architecture]] (part of) — Groq's deterministic architecture is what makes NVLink Fusion uniquely performant.
