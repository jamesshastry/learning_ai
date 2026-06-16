---
type: Lecture Notes
title: "Inference — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "10"
video: https://youtube.com/watch?v=EfM546A79aM
tags: [inference, kv-cache, prefill, decode, speculative-decoding, quantization, batching, vllm]
timestamp: 2026-06-15T00:00:00Z
---

# Inference — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=EfM546A79aM)

## TL;DR
Percy Liang covers LLM inference optimization, which has grown critically important in the agentic era. The lecture analyzes the prefill-decode split (compute-bound vs memory-bound phases), KV cache management, and multiple optimization strategies: model compression (quantization, pruning, distillation), speculative decoding, and systems-level techniques (continuous batching, PagedAttention/vLLM). Key insight: inference is fundamentally different from training because tokens must be generated sequentially, making it memory-bound.

## Key Takeaways
- **Inference cost exceeds training cost in deployment** — OpenAI generates ~8.6 trillion tokens/day, matching DeepSeek V4's entire 32T-token training set in under 4 days.
- **Prefill is compute-bound (like training); decode is memory-bound (matrix-vector products)** — the autoregressive nature of generation prevents sequence-dimension parallelism during decode.
- **Three inference speed metrics serve different use cases** — TTFT (time to first token) for interactive UX, latency (per-user token rate), and throughput (system-wide tokens/second for batch processing).
- **Speculative decoding uses a cheap model to guess ahead, then verifies in parallel with the full model** — if guesses are accepted, you get multi-token speedup while maintaining exact output distribution.
- **PagedAttention (vLLM) applies virtual memory concepts to KV cache management** — eliminates memory fragmentation from variable-length sequences, dramatically improving serving efficiency.

## Detailed Notes

### Why Inference Matters Now [00:05–04:00]
Inference shows up everywhere: chatbots, code completion, agents, batch processing, evaluation, RL rollouts. Training is one-time cost; inference is repeated daily. In the agentic world, most generated tokens are not for human reading — they're thinking/reasoning tokens with no upper bound on compute needs.

### Inference Metrics [05:02–07:06]
TTFT (Time To First Token): critical for interactive UX. Latency: tokens/second for a single query — important for streaming. Throughput: total tokens/second across all queries — important for batch workloads. Latency and throughput can trade off (batching increases throughput but may increase individual latency).

### The Fundamental Challenge [07:06–08:15]
Training processes all tokens at once (sequence is just a tensor dimension). Inference generates tokens one at a time due to autoregressive nature. This makes inference inherently harder to utilize GPU compute — matrix-vector products instead of matrix-matrix products.

### Prefill vs Decode [08:15–25:00]
Prefill phase: process prompt tokens in parallel, build KV cache. Compute-bound like training. Decode phase: generate one token at a time, reading entire KV cache each step. Memory-bound — each step reads all model parameters plus KV cache but computes very little. Arithmetic intensity during decode: much lower than training.

### Model Compression Techniques [25:00–45:00]
Quantization: reduce weight/activation precision (INT8, INT4, FP8). Post-training quantization vs quantization-aware training. Pruning: remove weights or structures. Distillation: train smaller model to mimic larger one. All reduce model size → faster memory-bound decode.

### Speculative Decoding [45:00–55:00]
Use a small draft model to generate K candidate tokens. Feed candidates to full model for parallel verification. Accept longest prefix that matches full model distribution. If draft model is good (high acceptance rate), get ~K× speedup. Maintains exact output distribution — no approximation. MTP (Multi-Token Prediction from DeepSeek V3) builds draft model into architecture.

### Systems Optimizations [55:00–01:15:00]
Continuous batching: dynamically add/remove requests as they start/finish (vs static batching). PagedAttention (vLLM): KV cache stored in non-contiguous pages like OS virtual memory. Eliminates fragmentation from variable-length sequences. Enables KV cache sharing across requests with common prefixes. Prefix caching: reuse KV cache for shared system prompts.

## Notable Quotes
- "Training is a one-time cost. Inference is a repeated cost — you incur them every single day."
- "OpenAI is estimated to produce 8.6 trillion tokens a day."
- "In the agentic world, there's no kind of limit to how much value you can get out of squeezing more out of inference."
- "Inference is fundamentally different from training because you can't parallelize across the sequence dimension."

## Concepts Introduced
- [[KV Cache]] — cached key-value pairs for efficient autoregressive generation
- [[Prefill vs Decode]] — two inference phases with different computational profiles
- [[Speculative Decoding]] — draft model verification for multi-token speedup
- [[Quantization]] — reducing numerical precision for faster inference
- [[Continuous Batching]] — dynamic request scheduling for inference servers
- [[PagedAttention]] — virtual-memory-inspired KV cache management (vLLM)

## Connections to Other Lectures
- Arithmetic intensity analysis builds on Lecture 02
- GQA from Lecture 03 reduces KV cache size for inference
- MTP from DeepSeek V3 (Lecture 04) enables built-in speculative decoding
- Inference speed affects RL training throughput (Lectures 15-16)

## Open Questions
- How will inference optimization change as context lengths reach millions of tokens?
- Can speculative decoding work well with MoE models where routing is unpredictable?
- What is the optimal quantization strategy per model architecture?
