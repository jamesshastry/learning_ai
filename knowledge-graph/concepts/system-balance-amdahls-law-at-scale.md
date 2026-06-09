---
aliases: []
tags: [architecture, hardware, optimization, infrastructure, theory]
first_seen: cs153/02
sources:
  - course: cs153
    lecture: "02"
    timestamps: ["14:13", "14:40", "14:49", "16:00", "17:08", "18:04"]
---
# System Balance (Amdahl's Law at Scale)

The critical need to balance all components of a large-scale compute system (flops, HBM, SRAM, network bandwidth, storage, CPU) according to application needs, to avoid bottlenecks and wasted investment, extending Amdahl's Law to modern distributed AI infrastructure.

## Key Points from Sources

- **cs153 Lecture 02**

## Related Concepts

- [[Amdahl's Law]] (related to) — This concept is an extension of Amdahl's Law to modern, large-scale distributed systems.
- [[Value per Gigawatt]] (prerequisite for) — Achieves higher value per gigawatt by ensuring efficient use of all resources.
- [[Goodput]] (enables) — System balance directly improves goodput by eliminating resource starvation.
- [[Hardware Specialization (TPUs)]] (related to) — Specialization often involves designing chips with specific balance points for particular workloads (e.g., AI/AT).
