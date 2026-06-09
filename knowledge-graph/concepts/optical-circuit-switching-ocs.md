---
aliases: []
tags: [architecture, hardware, infrastructure, optimization]
first_seen: cs153/02
sources:
  - course: cs153
    lecture: "02"
    timestamps: ["31:38", "31:56", "32:00", "32:23", "32:41", "33:00", "33:14", "34:41", "35:46"]
---
# Optical Circuit Switching (OCS)

A networking technology utilized by Google to provide programmable network topology in data centers, enabling rapid reconfiguration (e.g., in seconds) to maintain network coherence, recover from failures, and create direct high-bandwidth connections for specific jobs without human intervention.

## Key Points from Sources

- **cs153 Lecture 02**

## Related Concepts

- [[Programmable Topology]] (enables) — OCS is the core technology behind programmable topology.
- [[Extreme Reliability (for AI Workloads)]] (enables) — OCS allows for rapid recovery of network topology after failures, enhancing reliability for synchronous workloads.
- [[Torus Topology]] (related to) — OCS is used to maintain and reconfigure a torus topology for ML training.
