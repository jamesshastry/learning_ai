---
type: Lecture Notes
title: "Data: Filtering, Deduplication, Mixing, Synthetic Data — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "14"
video: https://youtube.com/watch?v=5sxHosTLPF8
tags: [data-filtering, deduplication, minhash, data-mixing, synthetic-data, data-quality]
timestamp: 2026-06-15T00:00:00Z
---

# Data: Filtering, Deduplication, Mixing, Synthetic Data — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=5sxHosTLPF8)

## TL;DR
Percy covers data processing techniques: quality filtering (classifier-based, heuristic), deduplication (exact via hashing, fuzzy via MinHash/LSH), data mixing strategies across domains, and synthetic data generation for pre-training and post-training. Assignment 4 tasks students with processing raw Common Crawl data.

## Key Takeaways
- **[[Quality Filtering]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[MinHash]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Fuzzy Deduplication]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Data Mixing]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Synthetic Data]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Percy covers data processing techniques: quality filtering (classifier-based, heuristic), deduplication (exact via hashing, fuzzy via MinHash/LSH), data mixing strategies across domains, and synthetic data generation for pre-training and post-training. Assignment 4 tasks students with processing raw Common Crawl data. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers Quality Filtering, MinHash, Fuzzy Deduplication. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between Quality Filtering and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[Quality Filtering]]
- [[MinHash]]
- [[Fuzzy Deduplication]]
- [[Data Mixing]]
- [[Synthetic Data]]
- [[Perplexity Filtering]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
