---
aliases: ["Model FLOPs Utilization", "MFU"]
tags: [metrics, training, hardware, optimization]
type: concept
first_seen: cs153/04
sources:
  - course: cs153
    lecture: "04"
    timestamps: ["27:11", "27:50", "30:32"]
  - course: cs336
    lecture: "02"
    timestamps: ["36:54", "37:20"]
---
# Model FLOPs Utilization

A metric measuring the percentage of theoretical peak FLOPs consumed during model training or inference. Jensen Huang argues it is misleading because low MFU can indicate smart overprovisioning to avoid Amdahl's Law bottlenecks, and high MFU during decode is undesirable.

## Key Points from Sources

- **cs153 Lecture 04**
- **cs336 Lecture 02**

## Related Concepts

- [[Tokens Per Watt]] (contrasts with) — MFU measures compute utilization; tokens per watt measures useful output per energy unit.
- [[Arithmetic Intensity]] (related to) — Low arithmetic intensity operations reduce overall MFU
