---
type: Lecture Notes
title: "Post-Training — RLVR — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "16"
video: https://youtube.com/watch?v=dIFAi87Ws4E
tags: [rlvr, reinforcement-learning, grpo, verifiable-rewards, reasoning, test-time-compute, chain-of-thought]
timestamp: 2026-06-15T00:00:00Z
---

# Post-Training — RLVR — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=dIFAi87Ws4E)

## TL;DR
Tatsu covers RL with Verifiable Rewards (RLVR) — using automated verification (math, code execution) instead of learned reward models. Covers GRPO (Group Relative Policy Optimization), DeepSeek-R1 approach, test-time compute scaling, chain-of-thought reasoning, and the systems challenges of RL training (inference + training server coordination, on-policy vs off-policy tradeoffs).

## Key Takeaways
- **[[GRPO]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[RLVR]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Verifiable Rewards]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Test-Time Compute]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Chain of Thought]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Tatsu covers RL with Verifiable Rewards (RLVR) — using automated verification (math, code execution) instead of learned reward models. Covers GRPO (Group Relative Policy Optimization), DeepSeek-R1 approach, test-time compute scaling, chain-of-thought reasoning, and the systems challenges of RL training (inference + training server coordination, on-policy vs off-policy tradeoffs). This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers GRPO, RLVR, Verifiable Rewards. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between GRPO and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[GRPO]]
- [[RLVR]]
- [[Verifiable Rewards]]
- [[Test-Time Compute]]
- [[Chain of Thought]]
- [[On-Policy vs Off-Policy]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
