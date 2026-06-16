---
aliases: ["SM", "compute unit"]
tags: [hardware]
type: concept
first_seen: cs336/05
sources:
  - course: cs336
    lecture: "05"
    timestamps: ["05:00", "10:00"]
---
# Streaming Multiprocessor

The fundamental compute unit of an Nvidia GPU, containing its own registers, shared memory, L1 cache, warp schedulers, and tensor cores. Modern GPUs have 100-200 SMs. Thread blocks are scheduled onto SMs for execution.

## Key Points from Sources

- **cs336 Lecture 05**

## Related Concepts

- [[Warp]] (part of) — Each SM schedules and executes warps of 32 threads
