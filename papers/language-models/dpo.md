---
type: Paper
title: "Direct Preference Optimization: Your Language Model is Secretly a Reward Model"
authors: [Rafael Rafailov, Archit Sharma, Eric Mitchell, Stefano Ermon, Christopher D. Manning, Chelsea Finn]
year: 2023
venue: NeurIPS 2023
resource: https://arxiv.org/abs/2305.18290
tags: [alignment, rlhf, preference-optimization, fine-tuning, dpo]
timestamp: 2026-06-15T00:00:00Z
---

# Direct Preference Optimization: Your Language Model is Secretly a Reward Model

## Summary

Showed that the standard RLHF objective (fitting a reward model, then optimizing a policy against it with PPO) can be **reparameterized as a simple classification loss on preference pairs**. By deriving a closed-form mapping between the optimal policy and the reward function, DPO eliminates the need to train a separate reward model and run reinforcement learning entirely. The resulting algorithm is a single-stage supervised learning procedure that directly optimizes a language model on human preference data.

## Key Contributions

- **Mathematical reparameterization** — proved that the optimal policy under a KL-constrained reward maximization objective can be expressed directly in terms of the policy itself, eliminating the reward model
- **Simple binary cross-entropy loss** — reduced alignment training to a classification problem: increase probability of preferred completions, decrease probability of dispreferred ones, with an implicit KL penalty
- **Stability and simplicity** — removed the need for PPO's reward model fitting, advantage estimation, and multi-phase training, dramatically reducing hyperparameter sensitivity and implementation complexity
- **Competitive performance** — matched or exceeded PPO-based RLHF on summarization and dialogue tasks while being substantially simpler to implement and train

## Why It Matters

DPO changed the economics of alignment. RLHF with PPO required training three models (base, reward, policy) with complex RL infrastructure; DPO requires only the base model and a preference dataset. This made alignment accessible to smaller labs and open-source projects, and DPO (along with variants like IPO and KTO) became the dominant post-training alignment method by 2024.

## Connections

- Directly simplifies the RLHF pipeline introduced by [InstructGPT](instruct-gpt.md)
- Offers an alternative to the AI-feedback approach in [Constitutional AI](constitutional-ai.md) — both reduce dependence on human labelers but via different mechanisms
- Referenced in LLM Agents SP25 course materials on alignment and post-training
