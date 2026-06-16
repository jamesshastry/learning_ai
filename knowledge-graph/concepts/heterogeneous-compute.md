---
aliases: ["Multi-Chip Architecture", "Diverse Accelerator Fleet"]
tags: [architecture, infrastructure, compute]
type: concept
first_seen: mse435/05
sources:
  - course: mse435
    lecture: "05"
    timestamps: ["23:38", "23:46", "23:51", "24:17"]
---
# Heterogeneous Compute

The architectural principle that agentic AI workloads cannot be served economically on GPUs alone and require a mix of hardware: GPUs for training and complex inference, Cerebras for fast inference, memory- optimized chips for long-context workloads, and CPUs for orchestrating agentic workflows and tool calls.

## Key Points from Sources

- **mse435 Lecture 05**

## Related Concepts

- [[Agentic Compute DAG]] (enables) — Different DAG nodes are best served by different types of compute hardware.
- [[Compute Supply Chain Resilience]] (related to) — Heterogeneous compute inherently creates supply chain diversification.
