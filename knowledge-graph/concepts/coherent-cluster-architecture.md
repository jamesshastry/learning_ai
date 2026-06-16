---
aliases: ["Single-Cluster Data Center"]
tags: [infrastructure, architecture, compute]
type: concept
first_seen: mse435/03
sources:
  - course: mse435
    lecture: "03"
    timestamps: ["16:16", "16:20", "16:32"]
---
# Coherent Cluster Architecture

Data center design where all GPUs across multiple buildings are interconnected on the same high-performance backend network, enabling one training job to run on all chips across the entire campus. This is the architecture used for Project Stargate in Abilene.

## Key Points from Sources

- **mse435 Lecture 03**

## Related Concepts

- [[Data Center Cost Stack]] (related to) — Networking costs ($4M/MW) are driven by the requirement for coherent cluster interconnection.
