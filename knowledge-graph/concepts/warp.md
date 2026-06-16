---
aliases: ["warp of threads", "SIMT warp"]
tags: [hardware]
type: concept
first_seen: cs336/05
sources:
  - course: cs336
    lecture: "05"
    timestamps: ["12:00", "15:00"]
---
# Warp

A group of 32 GPU threads that execute the same instruction in lockstep (SIMT model). Warp divergence (different threads taking different branches) wastes compute. Matrix dimensions should be multiples of 32 to avoid partial warps.

## Key Points from Sources

- **cs336 Lecture 05**

## Related Concepts

- [[Streaming Multiprocessor]] (part of) — Warps are the basic scheduling unit within SMs
