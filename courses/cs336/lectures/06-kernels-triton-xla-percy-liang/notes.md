---
type: Lecture Notes
title: "Kernels, Triton, XLA — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "06"
video: https://youtube.com/watch?v=xnDHaNUvHBg
tags: [kernels, triton, xla, gpu-programming, fusion, tiling, benchmarking, profiling]
timestamp: 2026-06-15T00:00:00Z
---

# Kernels, Triton, XLA — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=xnDHaNUvHBg)

## TL;DR
Percy Liang dives into GPU kernel programming with Triton, covering operator fusion, tiling, benchmarking/profiling techniques, and XLA compilation. Students learn to write custom kernels that minimize data movement between HBM and SRAM.

## Key Takeaways
- **[[Kernel Fusion]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Triton]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Tiling]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[GPU Profiling]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[XLA Compilation]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Percy Liang dives into GPU kernel programming with Triton, covering operator fusion, tiling, benchmarking/profiling techniques, and XLA compilation. Students learn to write custom kernels that minimize data movement between HBM and SRAM. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers Kernel Fusion, Triton, Tiling. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between Kernel Fusion and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[Kernel Fusion]]
- [[Triton]]
- [[Tiling]]
- [[GPU Profiling]]
- [[XLA Compilation]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
