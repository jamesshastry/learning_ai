---
aliases: ["MD", "MD Simulation"]
tags: [simulation, ai-for-science, biology]
type: concept
first_seen: mit-6s191/08
sources:
  - course: mit-6s191
    lecture: "08"
    timestamps: ["41:40", "43:01"]
---
# Molecular Dynamics

A computational method simulating atomic motion over time by integrating Newton's second law step-by-step. Requires quantum force calculations at each femtosecond time step, but biologically interesting events occur on millisecond scales, creating a curse of sequentiality requiring 10^6 to 10^15 sequential steps.

## Key Points from Sources

- **mit-6s191 Lecture 08**

## Related Concepts

- [[Deep Learning Emulator]] (accelerated by) — Emulators replace expensive quantum force calculations at each MD step.
