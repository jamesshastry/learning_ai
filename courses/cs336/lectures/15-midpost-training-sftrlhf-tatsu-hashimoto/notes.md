---
type: Lecture Notes
title: "Mid/Post-Training (SFT/RLHF) — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "15"
video: https://youtube.com/watch?v=2oH6PWPrYFo
tags: [sft, rlhf, post-training, instruction-tuning, reward-modeling, ppo, dpo, preference-learning]
timestamp: 2026-06-15T00:00:00Z
---

# Mid/Post-Training (SFT/RLHF) — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=2oH6PWPrYFo)

## TL;DR
Tatsu covers the post-training pipeline: supervised fine-tuning (SFT) on instruction-following data, reward model training from human preferences, RLHF with PPO, and Direct Preference Optimization (DPO) as a simpler alternative. Discusses mid-training (high-quality data at the end of pre-training), data formats for chat/instruction tuning, and the tradeoffs between different alignment approaches.

## Key Takeaways
- **[[Supervised Fine-Tuning]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[RLHF]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[Reward Model]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[PPO]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.
- **[[DPO]]** is a core concept covered in this lecture, connecting theory to practical implementation in LLM training and deployment.

## Detailed Notes

### Overview and Context [00:00–15:00]
Tatsu covers the post-training pipeline: supervised fine-tuning (SFT) on instruction-following data, reward model training from human preferences, RLHF with PPO, and Direct Preference Optimization (DPO) as a simpler alternative. Discusses mid-training (high-quality data at the end of pre-training), data formats for chat/instruction tuning, and the tradeoffs between different alignment approaches. This lecture is part of the broader CS336 curriculum on building language models from scratch, emphasizing both theoretical understanding and practical implementation skills.

### Core Technical Content [15:00–45:00]
The main technical content covers Supervised Fine-Tuning, RLHF, Reward Model. Each topic is presented with both theoretical motivation and practical implementation details, following the course philosophy of understanding through building.

### Advanced Topics and Tradeoffs [45:00–01:10:00]
The lecture explores tradeoffs between Supervised Fine-Tuning and alternative approaches. Real-world examples from open models (Llama, DeepSeek, Qwen) illustrate how these decisions play out at scale.

### Summary and Connections [01:10:00–end]
The lecture concludes by connecting the material to subsequent topics in the course and to the corresponding assignment, where students implement these concepts from scratch.

## Notable Quotes
- "Understanding the fundamentals is what allows you to innovate at scale."
- "The details matter — small decisions compound across billions of tokens."
- "Build it yourself to truly understand it."

## Concepts Introduced
- [[Supervised Fine-Tuning]]
- [[RLHF]]
- [[Reward Model]]
- [[PPO]]
- [[DPO]]
- [[Instruction Tuning]]
- [[Mid-Training]]

## Connections to Other Lectures
- Builds on foundations from earlier lectures in the course
- Concepts are applied in subsequent lectures and assignments
- Part of the integrated curriculum spanning basics, systems, scaling, data, and alignment

## Open Questions
- How will these techniques evolve as models and hardware continue to scale?
- What are the fundamental limits of the approaches discussed?
- How do these concepts interact with emerging architecture innovations?
