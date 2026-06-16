---
type: Lecture Notes
title: "Scaling Laws (cont.) — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "11"
video: https://youtube.com/watch?v=vTfEyOyzV9E
tags: [scaling-laws, muP, maximal-update-parametrization, learning-rate-transfer, inference-optimal, over-training]
timestamp: 2026-06-15T00:00:00Z
---

# Scaling Laws (cont.) — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=vTfEyOyzV9E)

## TL;DR
Tatsu continues scaling laws with muP (Maximal Update Parametrization) for hyperparameter transfer across scales, inference-aware scaling (training smaller models longer), learning rate and batch size scaling, and practical recipes for extrapolating from small experiments to large runs.

## Key Takeaways
- **[[muP]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Maximal Update Parametrization]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Inference-Optimal Scaling]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Learning Rate Transfer]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Critical Batch Size]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Tatsu continues scaling laws with muP (Maximal Update Parametrization) for hyperparameter transfer across scales, inference-aware scaling (training smaller models longer), learning rate and batch size scaling, and practical recipes for extrapolating from small experiments to large runs. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers muP, Maximal Update Parametrization, Inference-Optimal Scaling. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between muP and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[muP]]
- [[Maximal Update Parametrization]]
- [[Inference-Optimal Scaling]]
- [[Learning Rate Transfer]]
- [[Critical Batch Size]]
- [[Over-Training]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
