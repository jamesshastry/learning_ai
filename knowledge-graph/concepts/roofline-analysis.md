---
aliases: ["roofline model", "roofline plot"]
tags: [hardware, optimization]
type: concept
first_seen: cs336/02
sources:
  - course: cs336
    lecture: "02"
    timestamps: ["54:51"]
---
# Roofline Analysis

A visualization that plots achieved FLOPs/s against arithmetic intensity for a given accelerator. Shows two regimes — a sloped memory-bound region (limited by bandwidth) and a flat compute-bound region (limited by peak FLOPs). Used to diagnose bottlenecks.

## Key Points from Sources

- **cs336 Lecture 02**

## Related Concepts

- [[Arithmetic Intensity]] (part of) — Roofline analysis uses arithmetic intensity as the independent variable
