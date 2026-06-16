---
type: Lecture Notes
title: "Data: Sources, Datasets — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "13"
video: https://youtube.com/watch?v=-qm0ln33G24
tags: [data, common-crawl, web-data, data-sources, data-processing, legal-issues, data-quality]
timestamp: 2026-06-15T00:00:00Z
---

# Data: Sources, Datasets — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=-qm0ln33G24)

## TL;DR
Percy Liang covers the data landscape for LLM pre-training: web crawls (Common Crawl), books, code (GitHub), papers, and their processing pipelines. Discusses data quality, legal/licensing concerns, the transformation from raw HTML/PDF to training text, and the composition of major training datasets like The Pile, RedPajama, and FineWeb.

## Key Takeaways
- **[[Common Crawl]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Data Pipeline]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Training Data Composition]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Data Licensing]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Web Crawl Processing]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Percy Liang covers the data landscape for LLM pre-training: web crawls (Common Crawl), books, code (GitHub), papers, and their processing pipelines. Discusses data quality, legal/licensing concerns, the transformation from raw HTML/PDF to training text, and the composition of major training datasets like The Pile, RedPajama, and FineWeb. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers Common Crawl, Data Pipeline, Training Data Composition. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between Common Crawl and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[Common Crawl]]
- [[Data Pipeline]]
- [[Training Data Composition]]
- [[Data Licensing]]
- [[Web Crawl Processing]]
- [[The Pile]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
