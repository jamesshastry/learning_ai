---
aliases: ["Robust fault detection and recovery", "High availability"]
tags: [architecture, optimization, infrastructure, training, hardware]
type: concept
first_seen: cs153/02
sources:
  - course: cs153
    lecture: "02"
    timestamps: ["04:03", "04:10", "10:05", "11:16", "12:50", "13:03"]
---
# Extreme Reliability (for AI Workloads)

The paramount importance of robust systems that minimize failures and enable rapid recovery, especially for large-scale synchronous AI computations where a single node failure can halt the entire process.

## Key Points from Sources

- **cs153 Lecture 02**

## Related Concepts

- [[AI Workload Reliability Shift]] (contrasts with) — While AI training often accepts *more downtime* for *more capacity*, it still demands *extreme reliability* at the individual node level because single failures are catastrophic for synchronous jobs.
- [[Optical Circuit Switching (OCS)]] (enables) — OCS contributes to extreme reliability by allowing rapid, programmatic recovery from rack failures.
- [[Value per Gigawatt]] (part of) — Essential for extracting maximum value from deployed compute capacity.
- [[Operational Resilience]] (related to) — Concept of ensuring continuous operation despite failures.
