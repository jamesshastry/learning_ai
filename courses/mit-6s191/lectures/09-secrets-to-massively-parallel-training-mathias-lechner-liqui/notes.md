---
type: Lecture Notes
title: "Secrets to Massively Parallel Training"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "09"
video: https://youtube.com/watch?v=UZZD9d9YqnQ
tags: [distributed-training, gpu, parallelism, scaling-laws, data-parallel, tensor-parallel, pipeline-parallel]
timestamp: 2026-06-15T00:00:00Z
---

# Secrets to Massively Parallel Training

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=UZZD9d9YqnQ)

## TL;DR
Mathias Lechner (CTO, Liquid AI) explains how to scale neural network training across thousands of GPUs. The lecture covers why we train on GPUs (1000x advantage over CPUs), scaling laws (bigger models + more data = better performance), GPU memory breakdown, and the full toolkit of parallelism strategies: data parallel, activation checkpointing, FSDP/DeepSpeed Zero sharding, pipeline parallelism, tensor parallelism, sequence/context parallelism, and expert parallelism. Real examples show how these combine into 4D/5D parallelism for 2000+ GPU training runs.

## Key Takeaways
- GPUs provide ~1000x speedup over CPUs for neural network training due to massive parallelism in matrix multiplications
- Scaling laws: more parameters AND more data both independently improve model performance (power law relationship)
- Training a 1B parameter model requires ~28 GB GPU memory (parameters + gradients + optimizer states + activations); a 70B model needs ~2 TB
- Data parallelism is the simplest scaling strategy: replicate model, distribute batches, synchronize gradients. Limited by large batch size degrading generalization
- Activation checkpointing trades ~33% extra compute for ~4x memory reduction by recomputing intermediate activations during backward pass
- FSDP (Fully Sharded Data Parallel) and DeepSpeed Zero shard parameters, gradients, and optimizer states across GPUs, gathering only when needed
- Pipeline parallelism splits model by depth across nodes; micro-batching reduces idle GPU time (pipeline bubbles)
- Tensor parallelism splits weight matrices within layers (column + row parallelism); used within high-bandwidth nodes (NVLink)
- Mixture of Experts (MoE) scales model capacity without proportional compute increase via sparse routing
- In practice, these strategies compose as 4D/5D parallelism: tensor parallel within nodes, pipeline parallel across nodes, data parallel across groups, expert parallel for MoE layers

## Detailed Notes

### Why GPUs? [02:28-04:51]
AlexNet (2011) trained on 2 Nvidia GTX 580 GPUs for 2 weeks. Training is dominated by matrix multiplications. CPU in 2011: ~0.1 TFLOPS; GPU: 1.6 TFLOPS (16x). Modern H100: ~1000x the GTX 580. GPU architecture is specifically suited for the parallel computations required by neural network training.

### Scaling Laws [04:51-07:16]
Llama 2 training curves show: more training tokens → lower loss (better fit). Larger models (7B → 70B) on same data → lower loss. Both relationships follow power laws, systematically studied in scaling papers. Industry trend: GPT-3 (175B params, 300B tokens) → Llama 2 (70B, 2T tokens) → LFM 2.5 (1.2B, 28T tokens). Models getting smaller due to inference cost dominance, but data scaling continues aggressively. Distillation from larger teacher models helps smaller models learn faster.

### GPU Memory Breakdown [11:37-13:22]
For 1B parameter model: parameters (2 GB at FP16) + gradients (2 GB) + optimizer states (8 GB for Adam at FP32: 2 variables per parameter) + activations (16 GB for batch=16, 256 layers, 1K hidden). Total: ~28 GB. 70B model: ~2 TB -- far exceeds any single GPU (200-400 GB max).

### Activation Checkpointing [13:29-15:04]
Store activations only at every Nth layer (e.g., every 4th). During backward pass, recompute activations from nearest checkpoint. ~4x memory reduction with only ~33% extra compute (one additional forward pass). Widely used because GPU compute is cheaper than memory.

### CPU Offloading [15:17-16:58]
Push infrequently used data (optimizer states, inactive layers, activations) to host CPU memory. Bottleneck: PCIe bandwidth is much slower than GPU HBM. Used for niche scenarios: single-GPU fine-tuning of large models, very long context training (DeepSpeed Ulysses). Not practical for large-scale pretraining.

### GPU Cluster Architecture [17:05-19:03]
Scale-up: 8 GPUs per node connected via NVLink (high bandwidth). Scale-out: multiple nodes connected via InfiniBand with RDMA (lower bandwidth). GPU-to-GPU communication within a node is much faster than across nodes -- this hierarchy drives parallelism strategy choices.

### Sharding: FSDP and DeepSpeed Zero [19:03-22:00]
Optimizer sharding (Zero Stage 1): split optimizer states across GPUs, reducing memory from 12→8 GB in example. Gradient sharding (Zero Stage 2): also shard gradient buffers. Full sharding (Zero Stage 3 / FSDP): shard parameters too, gathering them on-demand for forward/backward passes. FSDP wraps PyTorch modules; when execution enters a layer, parameters are all-gathered; when it exits, they're discarded back to shards.

### Pipeline Parallelism [22:00-23:57]
Split model depth across nodes (layers 0-31 on GPU 0, 32-63 on GPU 1, etc.). Problem: pipeline bubbles -- when GPU 0 computes forward pass, other GPUs idle. Solution: micro-batching splits the batch into smaller units processed in overlapping fashion. Advanced schedules: Llama 3's bidirectional overlap, DeepSeek V3's "1F1B" schedule separating backward-to-input from backward-to-weight.

### Tensor Parallelism [24:27-26:20]
Split weight matrices within layers across GPUs. Column parallelism: replicate input, partition output. Row parallelism: partition input, partition output. For transformer MLPs: stack column-parallel first layer + row-parallel second layer = only one all-reduce communication per two-layer block. Requires high-bandwidth interconnect (NVLink), so used within nodes.

### Sequence and Context Parallelism [26:27-27:38]
Split input sequence across GPUs. For independent layers (MLPs, LayerNorms): no communication needed. For attention layers: context parallelism with ring attention to handle KV cache distribution. Primarily used for long-context training phases (extending from 8K to 128K+ tokens).

### Mixture of Experts Parallelism [27:52-30:35]
MoE layers split weight matrices into "experts" with a learned router. Scale model capacity without proportional compute (only activated experts compute). Expert parallelism: place different experts on different GPUs. Load balancing is critical: imbalanced routing wastes GPU compute and destabilizes training. Liquid AI's LFM-2 8B-A1B: 8.3B total parameters, only 1.5B active at inference.

### Frameworks: DeepSpeed vs FSDP vs Megatron-LM [30:54-35:20]
DeepSpeed (Microsoft): config-file driven, one-line code change, supports offloading. FSDP (Meta/PyTorch): PyTorch-native, module wrapper approach. Megatron-LM (Nvidia): most features for parallelism, most custom code required. Google uses JAX instead of PyTorch. In practice, teams combine frameworks (e.g., Liquid AI uses FSDP + forked Megatron).

### Putting It All Together: 5D Parallelism [35:20-41:33]
For 2000+ GPU runs: activate all strategies simultaneously. Memory: activation checkpointing + mixed precision + FSDP sharding. Throughput: data parallel (across groups) + tensor parallel (within nodes, TP=8) + pipeline parallel (across 4 nodes) + expert parallel (for MoE) + sequence parallel. Match communication intensity to network topology: cache → HBM → NVLink → InfiniBand. Configuration varies by model size (1B vs 70B vs 1T requires different strategies).

## Notable Quotes
- "Training of a neural network is essentially just a bunch of matrix multiplications." [03:07]
- "More training data means a better loss... this has been systematically and scientifically analyzed in scaling laws." [05:51]
- "Even though the model is small, we need a lot of GPU memory just to train it." [13:04]
- "Activation checkpointing... doesn't blow up the compute... compute tends to be cheaper than memory." [14:57]
- "There's no single strategy... the idea is really that in practice you combine multiple of them." [41:06]

## Concepts Introduced
- [[Data Parallelism]] -- replicate model across GPUs, distribute batches, synchronize gradients
- [[Activation Checkpointing]] -- trade compute for memory by recomputing intermediate activations
- [[FSDP]] -- Fully Sharded Data Parallel; PyTorch-native parameter/gradient/optimizer sharding
- [[Pipeline Parallelism]] -- split model depth across nodes with micro-batching
- [[Tensor Parallelism]] -- split weight matrices within layers across GPUs
- [[Mixture of Experts]] -- sparse routing to scale capacity without proportional compute
- [[Scaling Laws]] -- power-law relationships between model/data size and performance
- [[5D Parallelism]] -- composing data, tensor, pipeline, expert, and sequence parallelism

## Connections to Other Lectures
- Scaling laws connect to Lecture 06's emergent abilities discussion
- Matrix multiplication foundation from Lecture 01 explains GPU advantage
- MoE relates to dropout from Lecture 01 (sparse activation patterns)
- Bitter lesson from Lecture 08 motivates the scaling imperative
- Liquid AI models demonstrated in Lecture 01 are products of these training methods

## Open Questions
- Can decentralized training across data centers become practical for pretraining (not just data parallel)?
- What are the theoretical limits on batch size scaling for generalization?
- How will hardware co-evolution (AMD, Qualcomm NPUs) change optimal parallelism strategies?
