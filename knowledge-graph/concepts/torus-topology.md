---
aliases: []
tags: [architecture, network, training]
type: concept
first_seen: cs153/02
sources:
  - course: cs153
    lecture: "02"
    timestamps: ["32:51", "33:47", "34:47", "36:51", "37:04"]
---
# Torus Topology

A specific network topology, often three-dimensional, used for ML training clusters where nodes are connected in a grid-like fashion with wrap-around connections, particularly efficient for all-reduce collective operations.

## Key Points from Sources

- **cs153 Lecture 02**

## Related Concepts

- [[Optical Circuit Switching (OCS)]] (related to) — OCS is used to maintain and reconfigure the torus topology for reliability.
- [[Extreme Reliability (for AI Workloads)]] (related to) — Maintaining the integrity of the torus topology is critical for synchronous ML training reliability.
