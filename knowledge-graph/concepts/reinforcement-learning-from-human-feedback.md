---
aliases: ["RLHF", "classic post-training", "Reinforcement Learning from Human Feedback"]
tags: [training, alignment, post-training, reinforcement-learning, llm]
type: concept
first_seen: cs294-agentic-f25/01
sources:
  - course: cs294-agentic-f25
    lecture: "01"
    timestamps: ["03:04", "01:08:16"]
  - course: cs336
    lecture: "15"
    timestamps: ["15:00"]
  - course: mit-6s191
    lecture: "05"
    timestamps: ["54:25", "55:01"]
---
# Reinforcement Learning from Human Feedback

A technique for aligning language models with human preferences by training a reward model from human feedback (thumbs up/down) and using it to fine-tune the LLM via reinforcement learning. Enables optimization beyond simple next-token prediction toward human-preferred outputs.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 01**
- **cs336 Lecture 15**
- **mit-6s191 Lecture 05**

## Related Concepts

- [[Supervised Fine-Tuning]] (builds on) — RLHF typically follows an initial SFT stage
- [[Reward Model]] (requires) — RLHF needs a reward model to score model outputs
- [[Transformer]] (related to) — Foundational concept in modern LLM development
- [[Policy Gradient]] (uses) — RLHF applies policy gradient methods to optimize language model outputs.
