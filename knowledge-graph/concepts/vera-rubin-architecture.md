---
aliases: ["Vera Rubin"]
tags: [hardware, architecture, agents]
type: concept
first_seen: cs153/04
sources:
  - course: cs153
    lecture: "04"
    timestamps: ["35:52", "36:02", "37:12"]
---
# Vera Rubin Architecture

NVIDIA's GPU generation designed specifically for agentic AI workloads. Features storage connected directly to the GPU fabric for long-term agent memory and extremely low-latency CPUs optimized for single-threaded tool-call execution, avoiding the bottleneck of a multi-billion dollar GPU system waiting for one CPU.

## Key Points from Sources

- **cs153 Lecture 04**

## Related Concepts

- [[Agentic Computing]] (enables) — Vera Rubin is purpose-built for the compute patterns of agentic AI systems.
- [[NVLink72]] (related to) — Vera Rubin builds on the rack-scale innovations introduced with Grace Blackwell NVLink72.
