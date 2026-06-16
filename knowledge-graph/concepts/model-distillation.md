---
aliases: ["Knowledge Distillation", "Teacher-Student"]
tags: [training, optimization, enterprise]
type: concept
first_seen: llm-agents-f24/04
sources:
  - course: llm-agents-f24
    lecture: "04"
    timestamps: ["44:28", "45:29", "47:12"]
---
# Model Distillation

A technique where a large teacher model generates labels (soft or hard) on training data, and a smaller student model learns to reproduce those outputs, enabling cost-effective deployment of smaller, faster models without extensive human labeling.

## Key Points from Sources

- **llm-agents-f24 Lecture 04**

## Related Concepts

- [[LoRA Fine-Tuning]] (complementary) — Distillation creates smaller models; LoRA adapts existing models.
