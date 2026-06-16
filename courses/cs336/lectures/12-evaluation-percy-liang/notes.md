---
type: Lecture Notes
title: "Evaluation — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "12"
video: https://youtube.com/watch?v=JpAxdTWQJxM
tags: [evaluation, benchmarks, perplexity, contamination, lm-eval, helm, chatbot-arena, llm-as-judge]
timestamp: 2026-06-15T00:00:00Z
---

# Evaluation — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=JpAxdTWQJxM)

## TL;DR
Percy Liang covers LLM evaluation: internal metrics (perplexity, bits-per-byte) for model development vs external benchmarks for reporting. Discusses benchmark contamination, HELM evaluation framework, Chatbot Arena for human preference, LLM-as-judge, and the tension between diverse evaluation and single-number rankings.

## Key Takeaways
- **[[Perplexity]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Bits Per Byte]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Benchmark Contamination]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[HELM]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Chatbot Arena]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Percy Liang covers LLM evaluation: internal metrics (perplexity, bits-per-byte) for model development vs external benchmarks for reporting. Discusses benchmark contamination, HELM evaluation framework, Chatbot Arena for human preference, LLM-as-judge, and the tension between diverse evaluation and single-number rankings. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers Perplexity, Bits Per Byte, Benchmark Contamination. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between Perplexity and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[Perplexity]]
- [[Bits Per Byte]]
- [[Benchmark Contamination]]
- [[HELM]]
- [[Chatbot Arena]]
- [[LLM-as-Judge]]
- [[Evaluation Taxonomy]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
