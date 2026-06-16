---
aliases: ["Human-in-Flow Design Goal"]
tags: [application, architecture, theory]
type: concept
first_seen: mse435/05
sources:
  - course: mse435
    lecture: "05"
    timestamps: ["22:48", "22:52", "23:06", "23:13"]
---
# Human as Bottleneck

OpenAI's design target where AI infrastructure is fast enough that the human becomes the rate-limiting factor — agents complete tasks so quickly that users are constantly being asked for next steps, creating a flow state of human-AI collaboration rather than waiting for AI to finish.

## Key Points from Sources

- **mse435 Lecture 05**

## Related Concepts

- [[Agentic Compute DAG]] (enables) — Fast execution of the full agentic DAG is what makes the human the bottleneck.
- [[Prefill Latency Dominance]] (related to) — Reducing prefill latency is critical to achieving the human-as-bottleneck target.
