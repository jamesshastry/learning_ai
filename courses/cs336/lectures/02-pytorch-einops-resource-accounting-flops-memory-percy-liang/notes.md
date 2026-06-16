---
type: Lecture Notes
title: "PyTorch (einops), Resource Accounting (FLOPs, Memory) — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "02"
video: https://youtube.com/watch?v=kuYAsz7zspQ
tags: [pytorch, einops, flops, memory, mfu, arithmetic-intensity, resource-accounting]
timestamp: 2026-06-15T00:00:00Z
---

# PyTorch (einops), Resource Accounting (FLOPs, Memory) — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=kuYAsz7zspQ)

## TL;DR
Percy Liang introduces resource accounting as a core mindset for efficient LLM training. The lecture covers tensor data types (FP32, FP16, BF16, FP8, FP4), einops for clean tensor manipulation, FLOP counting for forward and backward passes (the 6ND formula), arithmetic intensity and roofline analysis for diagnosing memory vs compute bottlenecks, and memory-saving techniques like gradient accumulation and activation checkpointing.

## Key Takeaways
- **The 6ND formula: training FLOPs ≈ 6 × number_of_tokens × number_of_parameters** — forward pass costs 2ND (one matmul per layer), backward costs 4ND (two matmuls per layer), totaling 6ND.
- **BFloat16 is the sweet spot for training precision** — same dynamic range as FP32 but half the memory; FP16 risks underflow/overflow; FP8/FP4 are emerging for inference.
- **Arithmetic intensity determines whether computation is memory-bound or compute-bound** — element-wise ops (ReLU, GELU) are memory-bound (~0.25 intensity); matrix multiplications are compute-bound (~N/3 intensity for NxN matrices).
- **MFU (Model FLOPs Utilization) of ~0.5 is considered good** — actual throughput divided by spec sheet peak; GPU spec sheets often quote sparse (2x inflated) numbers.
- **Activation checkpointing trades compute for memory** — storing checkpoints at sqrt(L) layers balances memory and recomputation overhead.

## Detailed Notes

### Moraine Scaling Law Validation [00:09–00:58]
Percy reports that the Moraine project's scaling law prediction matched actual training loss within 0.05 — validating that small-scale experiments can predict large-scale performance.

### Tensor Data Types and Precision [05:56–15:05]
Float32: 1 sign + 8 exponent + 23 mantissa = 4 bytes. Float16: reduced dynamic range causes instability. BFloat16: same exponent bits as FP32 (8), less mantissa — same dynamic range, less resolution. Mixed precision training uses BF16 for parameters/activations/gradients and FP32 for optimizer states. FP8 has two variants (E4M3, E5M2). FP4 (NVFP4) uses block scaling — 4-bit values with per-block scale factors.

### Einops for Tensor Operations [18:16–27:19]
Einops replaces confusing transpose/reshape operations with named dimensions. `einsum("batch seq1 hidden, hidden seq2 -> batch seq1 seq2")` makes matmul semantics explicit. `reduce` generalizes sum/mean/max. `rearrange` handles dimension splitting/merging (e.g., separating heads from hidden dim). Dot-dot-dot notation handles arbitrary batch dimensions.

### FLOP Counting [27:29–01:06:24]
Matrix multiply FLOPs = 2 × B × D × K (multiply + add per element). Forward pass for linear layer: 2 × tokens × parameters. Backward pass requires two matmuls (gradient w.r.t. input and w.r.t. parameters), each costing 2×B×D×K — backward is exactly 2x forward. Total: 6 × tokens × parameters. For transformers, this approximation holds when context length isn't too large.

### Arithmetic Intensity and Roofline Analysis [40:37–57:03]
Arithmetic intensity = FLOPs / bytes_moved. H100 accelerator intensity ≈ 295 FLOPs/byte. ReLU: intensity ~0.25 (memory-bound). GELU: intensity ~5 (still memory-bound). Dot product: intensity ~0.5 (memory-bound). Matrix-vector: barely higher (memory-bound). Matrix-matrix (NxN): intensity ~N/3 (compute-bound for large N). This is why training (batch matmuls) saturates GPUs but inference (matrix-vector) is memory-bound.

### Memory Accounting and Optimization [01:06:24–01:17:16]
Parameters: 2 bytes each (BF16). Gradients: 2 bytes each (BF16). Optimizer state: 4 bytes/param (AdaGrad) or 8 bytes/param (Adam, FP32). Activations: 2 × batch × hidden × layers. Gradient accumulation: use micro-batches to simulate large batch sizes without storing all activations. Activation checkpointing: store activations at subset of layers, recompute missing ones in backward pass. Optimal checkpoint interval: sqrt(L) layers.

## Notable Quotes
- "Before you can optimize the computational efficiency, we need to understand the efficiency of a given computation."
- "No other operation you encounter is as expensive as matrix multiplication for large enough matrices."
- "If someone tells you your arithmetic intensity is 0.25, you should say, 'Oh, this is really bad.'"
- "In general, if you get about MFU of 0.5 for modern models, you should be pretty happy with yourself."

## Concepts Introduced
- [[Arithmetic Intensity]] — FLOPs per byte of data movement
- [[Model FLOPs Utilization]] — actual vs peak hardware throughput
- [[Roofline Analysis]] — diagnosing memory vs compute bottlenecks
- [[Activation Checkpointing]] — trading recomputation for memory savings
- [[Mixed Precision Training]] — BF16 compute with FP32 optimizer states

## Connections to Other Lectures
- Builds on efficiency mindset from Lecture 01
- Arithmetic intensity concepts used extensively in Lecture 05 (GPUs/TPUs)
- The 6ND formula underpins scaling law calculations in Lectures 09 and 11
- Memory accounting is prerequisite for parallelism strategies in Lectures 07–08

## Open Questions
- Can FP4 training become practical for pre-training, not just inference?
- Why can't accelerator designs better match memory bandwidth to compute capacity?
- How does the 6ND approximation break down for very long context lengths?
