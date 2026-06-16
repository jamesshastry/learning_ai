---
aliases: ["GPU memory levels"]
tags: [hardware, optimization]
type: concept
first_seen: cs336/05
sources:
  - course: cs336
    lecture: "05"
    timestamps: ["45:00", "55:00"]
---
# Memory Hierarchy

The layered memory system in GPUs: registers (fastest, per-thread) > shared memory/L1 (programmable SRAM, per-SM) > L2 cache (chip-wide) > HBM (off-chip DRAM, highest capacity). Data movement between levels dominates runtime for memory-bound operations.

## Key Points from Sources

- **cs336 Lecture 05**

## Related Concepts

- [[Flash Attention]] (enables) — Flash Attention exploits memory hierarchy by keeping computation in SRAM
