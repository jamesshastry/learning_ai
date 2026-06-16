---
type: Lecture Notes
title: "Parallelism — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "07"
video: https://youtube.com/watch?v=SzpOcwdIL0Y
tags: [parallelism, data-parallelism, model-parallelism, collective-operations, allreduce, distributed-training]
timestamp: 2026-06-15T00:00:00Z
---

# Parallelism — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=SzpOcwdIL0Y)

## TL;DR
Percy Liang introduces distributed training fundamentals: collective operations (gather, reduce, all-reduce, all-to-all), data parallelism with gradient synchronization, and model parallelism concepts. Covers communication primitives and bandwidth analysis.

## Key Takeaways
- **[[Data Parallelism]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[All-Reduce]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Collective Operations]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Communication Bandwidth]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Ring All-Reduce]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Percy Liang introduces distributed training fundamentals: collective operations (gather, reduce, all-reduce, all-to-all), data parallelism with gradient synchronization, and model parallelism concepts. Covers communication primitives and bandwidth analysis. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers Data Parallelism, All-Reduce, Collective Operations. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between Data Parallelism and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[Data Parallelism]]
- [[All-Reduce]]
- [[Collective Operations]]
- [[Communication Bandwidth]]
- [[Ring All-Reduce]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
