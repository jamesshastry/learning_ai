---
aliases: ["MoE", "sparse models", "sparse mixture of experts", "Sparse Mixture of Experts"]
tags: [architecture, efficiency, optimization, distributed-training]
type: concept
first_seen: cs294-agentic-f25/02
sources:
  - course: cs294-agentic-f25
    lecture: "02"
    timestamps: ["16:04"]
  - course: cs336
    lecture: "04"
    timestamps: ["34:25", "35:31"]
  - course: mit-6s191
    lecture: "09"
    timestamps: ["27:52", "29:31"]
---
# Mixture of Experts

A neural network architecture that scales model capacity without proportional compute increase by splitting weight matrices into multiple "experts" with a learned router that activates only a subset per input. Expert parallelism places different experts on different GPUs. Load balancing is critical for both training stability and GPU utilization.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 02**
- **cs336 Lecture 04**
- **mit-6s191 Lecture 09**

## Related Concepts

- [[Test-Time Scaling]] (complementary to) — MoE improves training efficiency; test-time scaling improves inference quality
- [[Expert Collapse]] (contrasts with) — MoE training must prevent expert collapse via load balancing
- [[Expert Parallelism]] (enables) — MoE provides natural sharding axis for distributed training
- [[Tensor Parallelism]] (related to) — Expert parallelism is a form of tensor parallelism specialized for MoE layers.
