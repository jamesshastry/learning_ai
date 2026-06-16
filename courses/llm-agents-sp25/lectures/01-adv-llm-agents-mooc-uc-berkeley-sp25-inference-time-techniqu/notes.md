---
type: Lecture Notes
title: "Inference-Time Techniques for LLM Reasoning"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "01"
video: https://youtube.com/watch?v=g0Dwtf3BH-0
tags: [inference-time-compute, chain-of-thought, self-consistency, tree-search, prompt-engineering, reasoning]
timestamp: 2026-06-15T00:00:00Z
---

# Inference-Time Techniques for LLM Reasoning

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=g0Dwtf3BH-0)

## TL;DR
Xinyun Chen (Google DeepMind) presents three families of inference-time techniques for scaling LLM reasoning: (1) basic prompting techniques that increase token budget per solution (chain-of-thought, analogical prompting, OPRO), (2) search and selection from multiple candidates (self-consistency, AlphaCode clustering, tree-of-thought), and (3) iterative self-improvement (self-debugging, self-correction). The lecture shows how to balance parallel vs. sequential generation for compute-optimal inference.

## Key Takeaways
- Chain-of-thought enables variable computation adapted to problem difficulty — harder problems naturally produce longer reasoning traces
- Self-consistency (majority voting over sampled solutions) is simple but remarkably effective and scales better than probability-based ranking
- LLMs cannot self-correct reasoning without external feedback — self-correction without an oracle verifier degrades performance
- Tree-of-thought search with step-level evaluation can outperform flat sampling when the evaluator is reliable
- The optimal balance between parallel sampling and sequential refinement depends on task difficulty and model capability
- Prompt optimization via LLMs (OPRO) can discover prompts that match or exceed human-designed few-shot CoT

## Detailed Notes

### [00:00-04:00] Course Introduction and LM Agents Framework
The course "Advanced Large Language Model Agents" is co-taught by Xinyun Chen, Dawn Song, and Kaiyu Yang. The core of an LM agent is a language model performing reasoning and planning, taking actions, receiving feedback, and revising internal memory. 2025 is called "the year of agents," with code generation, computer use, personal assistants, and robotics as key applications.

### [04:00-12:00] The Rise of Reasoning Models
Rapid progress from O1 to O3, Gemini 2.0 Flash Thinking, DeepSeek R1, and Qwen QwQ. On ARC-AGI, O3 achieved 87.5% at $1000/problem compute. The shared core idea: trigger long chain-of-thought generation before concluding with a final solution.

### [12:00-34:00] Part 1 — Basic Prompting Techniques
- **Chain-of-thought prompting**: Few-shot exemplars with reasoning steps; performance scales with model capability
- **Zero-shot CoT**: "Let's think step by step" — convenient but weaker than few-shot CoT
- **Analogical prompting** (ICLR 2024): Model self-generates relevant exemplars, outperforming both zero-shot and manual few-shot CoT
- **OPRO** (ICLR 2024): LLM-as-optimizer iteratively improves prompts; discovered "take a deep breath and work on this problem step-by-step" beating human-designed prompts
- **Least-to-most prompting**: Explicit decomposition into subproblems enables easy-to-hard generalization (near-perfect on SCAN benchmark)
- **Self-Discover** (NeurIPS 2024): Model composes task-specific reasoning structures from a menu of strategies

### [34:00-58:00] Part 2 — Search and Selection from Multiple Candidates
- **Self-consistency**: Sample multiple solutions, select the most frequent final answer via majority voting; scales better than log-probability ranking
- **AlphaCode**: Filters programs by given test cases, then clusters by execution consistency on model-generated test inputs
- **Universal self-consistency**: LLM-based consistency selection for free-form generation tasks
- **Trained verifiers**: Outcome-supervised reward models (ORM) and process-supervised reward models (PRM); PRM scales better but requires step-level annotations
- **Tree-of-thought**: BFS/DFS with step-level LLM evaluation; enables pruning of unpromising paths early

### [58:00-01:21:00] Part 3 — Iterative Self-Improvement
- **Reflexion/Self-Refine**: Generate → reflect → refine loop using external signals
- **Self-debugging**: Code generation with unit test feedback, code explanation, or execution trace feedback
- **Self-correction limitations**: Without oracle feedback, LLMs often flip correct answers to incorrect ones — multi-agent debate also does not outperform self-consistency given equal token budget
- **Compute-optimal allocation**: For easy problems, self-correction helps more; for hard problems, a mix of parallel and sequential generation is optimal
- **Model size tradeoff**: With a fixed inference budget, lighter models can generate more samples — optimal model size depends on available budget

## Notable Quotes
- "Take a deep breath and work on this problem step-by-step" — the LLM-optimized prompt that outperformed human-designed prompts by 8%
- "We want to develop methods that can continue to scale with increased computation" — paraphrasing Sutton's Bitter Lesson
- "We want to teach the model to discover, not what we have discovered" — on the principle of scalable reasoning
- "Self-consistency is an incredibly simple idea but it is actually very effective"

## Concepts Introduced
- [[Chain-of-Thought Prompting]]
- [[Self-Consistency Decoding]]
- [[Analogical Prompting]]
- [[OPRO (Optimization by PROmpting)]]
- [[Least-to-Most Prompting]]
- [[Tree-of-Thought]]
- [[Self-Debugging]]
- [[Process Reward Model]]
- [[Inference-Time Compute Scaling]]
- [[Universal Self-Consistency]]

## Connections to Other Lectures
- Lecture 02 (Jason Weston) extends training-time reasoning with self-rewarding and iterative DPO
- Lecture 04 (Hanna Hajishirzi) covers RLVR and test-time scaling with budget forcing (s1)
- Lecture 08 (AlphaProof) applies tree search with RL to formal mathematics

## Open Questions
- How to design reliable step-level evaluators that generalize across tasks?
- Can inference-time techniques eventually replace training-time reasoning improvements?
- What is the theoretical limit of self-consistency scaling with sample count?
