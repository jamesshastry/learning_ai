---
type: Lecture Notes
title: "Generative AI – Adapting LLMs with Parameter-Efficient Fine-Tuning"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "10"
video: https://youtube.com/watch?v=d-tngNnaG4U
tags: [fine-tuning, peft, lora, qlora, llm-adaptation, quantization]
timestamp: 2026-06-15T00:00:00Z
---

# Generative AI – Adapting LLMs with Parameter-Efficient Fine-Tuning

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=d-tngNnaG4U)

## TL;DR
Parameter-efficient fine-tuning (PEFT) methods like LoRA enable adapting large language models to specific tasks by training only a tiny fraction (0.1-1%) of parameters, making customization feasible on consumer hardware while matching or exceeding full fine-tuning performance.

## Key Takeaways
1. **LoRA trains only 0.1-1% of parameters:** Low-Rank Adaptation inserts small trainable matrices (rank 4-64) alongside frozen attention weight matrices, dramatically reducing compute and memory requirements.
2. **Quantization reduces memory footprint dramatically:** QLoRA combines LoRA with 4-bit quantization of the base model, enabling fine-tuning of 65B+ parameter models on a single GPU.
3. **PEFT makes fine-tuning accessible on consumer GPUs:** What previously required clusters of A100 GPUs can now be done on a single consumer GPU, democratizing LLM customization.
4. **Task-specific adapters can be swapped without retraining:** Multiple LoRA adapters (different tasks) can share one base model, loaded/swapped at inference time — enabling efficient multi-task deployment.
5. **Full fine-tuning risks catastrophic forgetting:** Updating all parameters on new task data can degrade the model's general capabilities; PEFT's frozen base preserves pretrained knowledge.

## Detailed Notes

### The Fine-Tuning Challenge [00:00-15:00]
- Full fine-tuning: update all parameters on task-specific data
- Problem at LLM scale: 7B-70B+ parameters require massive GPU memory and compute
- Even with sufficient hardware, full fine-tuning risks catastrophic forgetting
- Need: methods that adapt efficiently while preserving general capabilities

### LoRA: Low-Rank Adaptation [15:00-40:00]
- Key insight: weight updates during fine-tuning have low intrinsic dimensionality
- Instead of updating full weight matrix W (d×d), add ΔW = BA where B (d×r) and A (r×d), r << d
- Rank r typically 4-64 vs. dimensions of thousands — massive parameter reduction
- Applied to attention projection matrices (Q, K, V, O) in each transformer layer
- At inference: merge ΔW into W for zero additional latency
- Matches full fine-tuning performance on most benchmarks

### QLoRA: Quantized LoRA [40:00-55:00]
- Quantize base model weights to 4-bit precision (NF4 — Normal Float 4)
- LoRA adapters remain in full precision (16-bit) for training stability
- Double quantization: quantize the quantization constants themselves
- Paged optimizers: use CPU RAM as overflow for GPU memory spikes
- Result: fine-tune a 65B model on a single 48GB GPU

### Practical Fine-Tuning Pipeline [55:00-01:17:00]
- Dataset preparation: instruction-following format (instruction, input, output)
- Choose base model from HuggingFace (Llama, Mistral, etc.)
- Configure LoRA: target modules, rank, alpha scaling
- Training: typically 1-3 epochs with small learning rate
- Merge adapter weights into base model for deployment
- Evaluation: compare against base model on task-specific benchmarks
- Tools: HuggingFace PEFT library, `transformers`, `bitsandbytes` for quantization

### Other PEFT Methods [covered briefly]
- Prefix tuning: prepend trainable tokens to each layer's input
- Prompt tuning: learn soft prompt embeddings prepended to input
- Adapter layers: insert small feed-forward networks between transformer layers
- LoRA most popular due to simplicity, performance, and zero inference overhead

## Notable Quotes
> "LoRA is probably the single most important practical technique for anyone wanting to customize an LLM." — Instructor

> "What used to require a cluster of A100s, you can now do on your laptop." — Instructor on QLoRA

## Concepts Introduced
- [[LoRA]] — low-rank decomposition of weight updates for efficient fine-tuning
- [[QLoRA]] — combining 4-bit quantization with LoRA for extreme memory efficiency
- [[Parameter-Efficient Fine-Tuning]] — family of methods training <1% of model parameters
- [[Quantization]] — reducing numerical precision of weights (32-bit → 4-bit) to save memory
- [[Catastrophic Forgetting]] — loss of pretrained knowledge during full fine-tuning
- [[Adapter Modules]] — small trainable networks inserted into frozen pretrained models
- [[Low-Rank Adaptation]] — approximating weight updates as products of low-rank matrices

## Connections to Other Lectures
- Extends fine-tuning concepts from Lecture 8 (BERT fine-tuning) to LLM scale
- Transfer learning from Lecture 4 (freeze pretrained layers, train head) is the same principle
- LLM architecture from Lecture 9 provides the models being adapted
- LoRA adapters use the attention mechanisms taught in Lecture 7

## Open Questions
- What rank r should be used for different tasks and model sizes?
- When is PEFT insufficient and full fine-tuning actually necessary?
- How do different PEFT methods compare on diverse downstream tasks?
