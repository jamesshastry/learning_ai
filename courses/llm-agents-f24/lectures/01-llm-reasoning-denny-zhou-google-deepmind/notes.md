---
type: Lecture Notes
title: "LLM Reasoning"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "01"
video: https://youtube.com/watch?v=QL-FS_Zcmyo
tags: [reasoning, chain-of-thought, prompting, self-consistency, LLM-limitations]
timestamp: 2026-06-15T00:00:00Z
---

# LLM Reasoning — Denny Zhou (Google DeepMind)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=QL-FS_Zcmyo)

## TL;DR
Denny Zhou presents the foundational research on LLM reasoning, tracing the evolution from intermediate-step generation to chain-of-thought prompting, self-consistency, and analogical reasoning. He demonstrates that generating intermediate steps is the single most important technique for improving LLM performance, provides rigorous mathematical justification for why it works, and exposes critical limitations including sensitivity to irrelevant context, inability to self-correct reasoning, and dependence on premise order.

## Key Takeaways
1. **Intermediate steps are the key insight:** Whether through training, fine-tuning, or prompting, providing intermediate reasoning steps dramatically improves LLM performance — the method of delivery matters less than their presence.
2. **Self-consistency leverages probabilistic sampling:** By sampling multiple reasoning paths and selecting the most frequent final answer (not reasoning path), performance improves substantially — rooted in marginal inference principles from machine learning.
3. **Chain-of-thought decoding works without prompting:** Pre-trained LLMs already contain step-by-step reasoning paths among their top-k token generations, with higher confidence scores on reasoning paths versus direct answers.
4. **LLMs cannot self-correct reasoning:** Prompting models to review and correct their answers risks changing correct answers to incorrect ones; oracle feedback is needed for effective self-correction.
5. **Premise order significantly impacts reasoning:** Simply reordering premises in logical inference tasks causes 30+ point performance drops across all frontier LLMs, revealing models solve problems sequentially rather than understanding structure.

## Detailed Notes

### Course Introduction & Agent Framework Overview [00:00–09:10]
- Dawn Song introduces the course on LLM agents — the next frontier beyond simple text-in, text-out models
- LLM agents use language models as the "brain" for reasoning and planning, interacting with external environments, tools, databases, and knowledge bases
- Key challenges: improving reasoning/planning, embodiment, continuous learning, multi-modal understanding, safety/privacy, and human interaction
- Course covers model capabilities, agent frameworks, application domains, and safety/ethics

### Why Reasoning Matters for AI [09:28–14:00]
- Denny Zhou's career insight: traditional ML failed at data-efficient learning; reasoning is what humans use to learn from few examples
- The "last letter concatenation" toy problem demonstrates the gap: ML models need massive labeled data, while LLMs with reasoning steps achieve 100% accuracy from one demonstration
- Standard few-shot prompting (input-output pairs) fails on this task; adding explicit reasoning steps (chain-of-thought) solves it perfectly

### Evolution of Intermediate Step Methods [19:40–23:30]
- 2017: Google DeepMind paper used natural language rationales to solve math problems with trained models
- 2021: OpenAI's GSM8K dataset followed with intermediate steps for fine-tuning GPT-3
- 2021: Google Brain independently discovered "scratchpads" for program synthesis
- 2022: Chain-of-thought prompting extensively evaluated the approach through prompting alone
- **Core lesson:** The method (training vs. fine-tuning vs. prompting) is secondary — intermediate steps are what matter

### Least-to-Most Prompting & Decomposition [24:30–29:00]
- Inspired by Polya's "How to Solve It" — decompose complex problems into simpler subproblems
- Achieved 99.7% accuracy on the SCAN compositional generalization task with only 0.1% demonstration examples
- Dynamic least-to-most prompting: uses 1% of data to outperform prior specialized architectures that used all training data

### Zero-Shot and Analogical Reasoning [33:00–37:00]
- "Let's think step by step" (zero-shot CoT) triggers reasoning without demonstrations but is worse than few-shot
- Analogical reasoning: model generates its own relevant examples and knowledge for each problem, outperforming both zero-shot and manual CoT
- Key idea: adaptively generate relevant examples per problem rather than using a fixed set

### Chain-of-Thought Without Prompting [38:00–43:00]
- Pre-trained LLMs contain reasoning paths in their generation space — no prompt needed
- Method: examine top-k tokens at the first decoding step; longer generation paths correlate with reasoning
- Sentence probabilities are remarkably well-calibrated: direct answers get low confidence (~0.05) while reasoned answers reach ~0.978
- CoT decoding significantly outperforms greedy decoding

### Self-Consistency [46:00–51:00]
- Mathematically derived from first principles: maximize P(answer|problem) by marginalizing over reasoning paths
- Implementation: sample multiple reasoning paths, take majority vote on final answers (not paths)
- Critical distinction: reasoning paths are latent variables; only the answer is what we're optimizing
- When consistency exceeds 80%, accuracy approaches 100%
- Quiz insights: self-consistency with direct answers is pointless (just argmax of single token); using greedy decoding instead of sampling defeats the purpose

### LLM Limitations [51:27–01:03:00]
- **Irrelevant context distraction:** Adding irrelevant sentences (e.g., "Maria's monthly rent is $10") to math problems significantly decreases accuracy; adding "ignore irrelevant context" partially helps
- **Self-correction failure:** Models can correct wrong answers but also change correct answers to incorrect ones; net effect is negative or neutral across GSM8K, CommonSenseQA, HotpotQA; multi-LLM debate cannot outperform self-consistency
- **Self-debug with unit tests:** Natural oracle feedback (unit tests) enables genuine self-correction for coding
- **Premise order sensitivity:** Reordering sentences in GSM8K problems causes ~10 point drops; random reordering of relevant rules in logical inference causes 30+ point drops across all frontier LLMs

## Notable Quotes
1. "Humans can learn from just few examples because humans can reason, not because of data statistics."
2. "It doesn't matter if you train, fine-tune, or prompt models. What really matters here — intermediate steps. That's the key."
3. "Self-consistency — we simply crushed state-of-the-art results in the literature at that time, and it's really just about your idea."
4. "LLMs are probabilistic models of generating next tokens. They are not humans. Keep this in mind."
5. "The most important challenge is defining a right problem to work on and solving it from the first principles."

## Concepts Introduced
- [[Chain-of-Thought Prompting]]
- [[Self-Consistency]]
- [[Least-to-Most Prompting]]
- [[Analogical Reasoning]]
- [[Chain-of-Thought Decoding]]
- [[Premise Order Sensitivity]]

## Connections to Other Lectures
- Lecture 02 (Shunyu Yao) builds on reasoning to develop the ReAct framework combining reasoning with acting
- Lecture 05 (Omar Khattab) addresses prompt optimization through DSPy, automating the chain-of-thought engineering discussed here
- Lecture 08 (Yuandong Tian) explores neural-symbolic reasoning and search-augmented approaches related to intermediate step generation

## Open Questions
1. Can we develop reasoning strategies that are robust to premise order variations?
2. How can self-correction be made reliable without oracle feedback?
3. What is the fundamental computational limit that chain-of-thought overcomes in transformers?
4. How do we build LLMs that can distinguish relevant from irrelevant context at arbitrary scale?
