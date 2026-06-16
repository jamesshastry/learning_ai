---
type: Lecture Notes
title: "GPUs, TPUs — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "05"
video: https://youtube.com/watch?v=izZba4UA7iY
tags: [gpus, tpus, hardware, streaming-multiprocessors, warps, tensor-cores, memory-hierarchy, flash-attention]
timestamp: 2026-06-15T00:00:00Z
---

# GPUs, TPUs — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=izZba4UA7iY)

## TL;DR
Tatsu provides a deep dive into GPU architecture — streaming multiprocessors, warps, tensor cores, memory hierarchy (registers, shared memory, L1/L2 cache, HBM), and how these hardware details explain performance patterns. Covers why matrix dimensions should be multiples of specific values, how tiling works, and how Flash Attention emerges from applying GPU-aware optimization principles to attention computation.

## Key Takeaways
- **GPUs execute in warps of 32 threads — matrix dimensions should be multiples of 32 (or 64/128 for tensor cores)** to avoid wasted compute and achieve peak utilization.
- **Memory hierarchy is the key performance bottleneck** — registers (fastest) > shared memory/L1 > L2 > HBM (slowest); Flash Attention exploits this by keeping attention computation in SRAM.
- **Tensor cores perform matrix multiply-accumulate on small tiles (e.g., 16x16x16)** — achieving much higher throughput than scalar CUDA cores; all modern training uses tensor cores.
- **Flash Attention is tiling + fusion + recomputation applied to attention** — processes attention block-by-block in SRAM, never materializing the full N×N attention matrix in HBM.
- **TPUs differ from GPUs in systolic array design and different memory hierarchy** — understanding GPU principles transfers conceptually to TPU optimization.

## Detailed Notes

### GPU Architecture Overview [00:05–02:20]
Systems is the most "reasonable" part of the stack — logical steps lead to results. Understanding hardware is essential even for non-systems researchers, since architecture decisions require understanding execution efficiency.

### Streaming Multiprocessors and Warps [02:20–25:00]
GPUs have ~100-200 SMs. Each SM has registers (256KB), shared memory/L1 (~128-228KB), and connects to L2 cache and HBM. Thread execution happens in warps of 32. Warp divergence wastes compute. Block scheduling assigns thread blocks to SMs. Occupancy: ratio of active warps to maximum warps per SM.

### Tensor Cores and Matrix Multiply [25:00–45:00]
Tensor cores perform small matrix multiply-accumulate (e.g., 16×16×16 in BF16). Larger matmuls are tiled into tensor core operations. Matrix dimensions must align to tile sizes for peak performance — explains the staircase throughput pattern. WMMA (Warp Matrix Multiply-Accumulate) API. Throughput plateaus once arithmetic intensity exceeds accelerator intensity.

### Memory Hierarchy Deep Dive [45:00–01:05:00]
Register: fastest, per-thread. Shared memory: programmable SRAM, per-SM, used for inter-thread communication within a block. L1 cache: same physical memory as shared memory, hardware-managed. L2 cache: chip-wide, larger. HBM: off-chip DRAM, highest capacity but slowest. Data movement dominates runtime for memory-bound operations.

### Flash Attention [01:05:00–01:17:08]
Standard attention materializes N×N matrix in HBM — O(N²) memory. Flash Attention tiles the computation: process Q,K,V blocks in SRAM, accumulate softmax online (log-sum-exp trick), never write full attention matrix. Backward pass: recompute attention from checkpoints instead of storing. Result: O(N) memory, significant wall-clock speedup from reduced HBM traffic. Constant factor improvement, not asymptotic — but constant factors matter enormously.

## Notable Quotes
- "Constant factors really matter — Flash Attention is just a constant factor improvement but it's transformative."
- "I want you to really understand why we do those things — not cargo cult 32 multipliers for your matrices."
- "Without understanding your systems, you will never be efficient at using your resources."

## Concepts Introduced
- [[Streaming Multiprocessor]] — GPU compute unit with own registers and shared memory
- [[Warp]] — group of 32 threads executing in lockstep
- [[Tensor Cores]] — specialized matrix multiply-accumulate hardware
- [[Flash Attention]] — tiled attention computation in SRAM
- [[Memory Hierarchy]] — registers > shared memory > L1 > L2 > HBM

## Connections to Other Lectures
- Builds on arithmetic intensity and roofline from Lecture 02
- Directly enables kernel writing in Lecture 06
- Flash Attention is foundational for efficient training at scale (Lectures 07-08)
- Memory considerations central to parallelism design

## Open Questions
- How will next-generation GPU architectures change the compute-memory balance?
- Can attention alternatives eliminate the need for Flash Attention?
- What is the optimal tile size for different model configurations?
