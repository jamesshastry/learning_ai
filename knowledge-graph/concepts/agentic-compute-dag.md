---
aliases: ["Agent Compute Graph", "Complex Inference Pipeline"]
tags: [architecture, compute, application]
type: concept
first_seen: mse435/05
sources:
  - course: mse435
    lecture: "05"
    timestamps: ["19:02", "19:05", "20:28", "20:46"]
---
# Agentic Compute DAG

The directed acyclic graph describing modern agentic AI workloads: an inference call leads to tool calls, database queries, VM spin-ups for testing, observation of results, reasoning about output, and iteration — far more complex than simple chatbot (one node) or reasoning (multi-node inference) architectures.

## Key Points from Sources

- **mse435 Lecture 05**

## Related Concepts

- [[Heterogeneous Compute]] (enables) — Complex DAGs require different hardware for different nodes (GPUs for inference, CPUs for tools, etc.).
- [[Human as Bottleneck]] (enables) — Fully executing the DAG at speed is what makes the human the bottleneck rather than the AI.
