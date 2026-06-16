---
aliases: ["Fully Sharded Data Parallel", "DeepSpeed Zero"]
tags: [distributed-training, memory, framework]
type: concept
first_seen: mit-6s191/09
sources:
  - course: mit-6s191
    lecture: "09"
    timestamps: ["19:03", "22:00"]
---
# FSDP

A distributed training strategy that shards model parameters, gradients, and optimizer states across GPUs, gathering them on-demand during forward/backward passes. PyTorch-native implementation wraps nn.Modules; DeepSpeed Zero provides equivalent functionality with config-file approach. Stages: Zero-1 (optimizer), Zero-2 (+gradients), Zero-3/FSDP (+parameters).

## Key Points from Sources

- **mit-6s191 Lecture 09**

## Related Concepts

- [[Data Parallelism]] (extends) — FSDP adds memory sharding on top of data parallel training.
