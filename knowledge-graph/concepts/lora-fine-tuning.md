---
aliases: ["Low-Rank Adaptation", "Parameter-Efficient Fine-Tuning", "PEFT"]
tags: [training, optimization, enterprise]
type: concept
first_seen: llm-agents-f24/04
sources:
  - course: llm-agents-f24
    lecture: "04"
    timestamps: ["41:06", "42:12", "42:45"]
---
# LoRA Fine-Tuning

A parameter-efficient fine-tuning method that freezes base model weights and learns small low-rank adapter matrices, achieving near full-fine-tuning performance with much less compute, data, and storage — the dominant enterprise fine-tuning approach.

## Key Points from Sources

- **llm-agents-f24 Lecture 04**

## Related Concepts

- [[Model Distillation]] (complementary) — LoRA fine-tunes existing models; distillation creates smaller models from larger ones.
- [[Grounding with Search]] (alternative to) — Fine-tuning improves model knowledge; grounding provides external knowledge.
