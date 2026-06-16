---
type: Lecture Notes
title: "Learning to Reason with LLMs"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "02"
video: https://youtube.com/watch?v=_MNlLhU33H0
tags: [self-rewarding, reasoning, reinforcement-learning, DPO, chain-of-thought, system-2-thinking]
timestamp: 2026-06-15T00:00:00Z
---

# Learning to Reason with LLMs

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=_MNlLhU33H0)

## TL;DR
Jason Weston (Meta) traces the history from early neural language models through RLHF to modern self-improving reasoning models. He presents the self-rewarding language model paradigm where LLMs act as their own judges, iterative reasoning preference optimization (IRPO) for chain-of-thought training with verifiable rewards, meta-rewarding for improving evaluation ability, and Thinking LLM-as-a-Judge. The key insight: simple reward signals on final answers let models discover sophisticated reasoning strategies autonomously, as demonstrated by DeepSeek R1.

## Key Takeaways
- System 1 (direct neural net output) vs System 2 (chain-of-thought reasoning) — both can be improved through self-training
- Self-rewarding language models use LLM-as-a-Judge to create preference pairs iteratively, improving both instruction following and evaluation ability
- Verifiable rewards (correct/incorrect final answer matching) enable training chain-of-thought reasoning for math without intermediate supervision
- DeepSeek R1 confirmed that simple outcome-based rewards plus large-scale RL can produce O1-level reasoning
- DPO training requires negative examples — supervised fine-tuning alone on positive examples does not work for reasoning improvement
- Meta-rewarding (judging judgments) creates a virtuous cycle that sustains improvement beyond where self-rewarding plateaus
- COCONUT explores continuous vector "thoughts" instead of text tokens, showing promise on search tasks

## Detailed Notes

### [00:00-06:00] The AI Moment and Historical Context
AI is transforming daily life. Chain-of-thought is only from 2022 — the field is extremely young. Neural language modeling traces back to Shannon (1950s), Bengio et al. (2003), Collobert & Weston (2008 — NLP with neural nets, "bullshit to prescient"), transformers (2017), BERT (2018).

### [06:00-22:00] From Language Models to Instruction Following
Scaling hypothesis from Sutskever et al. (2014): big data + big neural net = success. Self-feeding chatbot (2019): early reward-model-based self-training. BlenderBot (2020): SFT on dialogue data. InstructGPT (2022): RLHF with human preference pairs. DPO as simpler alternative to PPO — directly optimizes preferences without separate reward model.

### [22:00-35:00] System 2 Reasoning via Prompting
Chain-of-thought prompting: few-shot and zero-shot ("let's think step by step"). Chain-of-Verification: draft → self-question → verify → correct — reduces hallucination 3x. System 2 Attention: rewrite instructions to remove bias/sycophancy. Branch-Solve-Merge: decompose evaluation into independent criteria branches for better LLM-as-a-Judge.

### [35:00-54:00] Self-Rewarding Language Models and Iterative Reasoning
Self-rewarding LMs: model generates tasks (self-instruct), generates multiple responses, scores them (LLM-as-a-Judge), creates DPO pairs, and iterates. LLAMA-2-70B improved from 10% to 20% win rate on AlpacaEval 2.0 over 3 iterations. Iterative Reasoning Preference Optimization (IRPO): same pipeline but with chain-of-thought + verifiable rewards for math — 10% gain on GSM8K over 4 iterations.

### [54:00-01:05:00] DeepSeek R1 and Modern Reasoning
DeepSeek R1 uses GRPO with verifiable rewards at massive scale (671B params). Simple recipe: prompt for thinking, extract final answer, match against ground truth. "Wait, wait, wait" aha moments emerge naturally. Thought Preference Optimization (TPO): extends chain-of-thought training to non-verifiable tasks using LLM-as-a-Judge rewards.

### [01:05:00-01:16:00] Meta-Rewarding and Future Directions
Meta-rewarding: LLM judges its own judgments to improve evaluation ability, creating preference pairs over judgments. Thinking LLM-as-a-Judge: generates evaluation plans with chain-of-thought for better reward modeling. COCONUT: continuous latent reasoning instead of text tokens — promising on search tasks. Future: improve system 1 architecture, self-evaluation, learning from interaction.

## Notable Quotes
- "We went from bullshit to prescient in that number of years, and that's kind of how the field changed"
- "I personally love the simplicity of it — we didn't have to do really complicated things in the middle. It's just rewarding the end"
- "It needs to be absurdly optimistic to be able to achieve absurd goals" — on DeepSeek R1's random number overthinking
- "If you have a large big data set and you train a very big neural network, then success is guaranteed" — Sutskever et al. 2014

## Concepts Introduced
- [[Self-Rewarding Language Models]]
- [[LLM-as-a-Judge]]
- [[Iterative Reasoning Preference Optimization]]
- [[Meta-Rewarding]]
- [[Thinking LLM-as-a-Judge]]
- [[Thought Preference Optimization]]
- [[COCONUT (Continuous Chain of Thought)]]
- [[System 1 vs System 2 Reasoning]]

## Connections to Other Lectures
- Lecture 01 (Xinyun Chen) covers inference-time techniques that this lecture extends with training-time methods
- Lecture 04 (Hanna Hajishirzi) presents Tulu 3's RLVR which parallels IRPO and DeepSeek R1 approaches
- Lecture 12 (Dawn Song) addresses safety implications of self-improving AI systems

## Open Questions
- Can self-rewarding models achieve genuine superhuman performance, or do they plateau?
- How far can continuous latent reasoning (COCONUT) scale compared to text-based chain-of-thought?
- What prevents models from "reward hacking" their own LLM-as-a-Judge evaluations?
