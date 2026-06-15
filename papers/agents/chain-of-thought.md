---
type: Paper
title: "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"
authors: [Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou]
year: 2022
venue: NeurIPS 2022
resource: https://arxiv.org/abs/2201.11903
tags: [prompting, reasoning, chain-of-thought, in-context-learning, agents]
timestamp: 2026-06-14T00:00:00Z
---

# Chain-of-Thought Prompting

## Summary

Demonstrated that simply adding **step-by-step reasoning examples** to a prompt dramatically improves LLM performance on arithmetic, commonsense, and symbolic reasoning tasks. Rather than prompting a model to jump straight to an answer, chain-of-thought (CoT) prompting shows the model *how to think through* a problem, and the model generalizes this reasoning pattern.

## Key Contributions

- **Chain-of-thought prompting** — include intermediate reasoning steps in few-shot examples; the model learns to generate its own reasoning chains for new problems
- **Emergent with scale** — CoT prompting has little effect on small models but produces large improvements at 100B+ parameters, suggesting reasoning is an emergent capability
- **No fine-tuning needed** — pure prompting technique; works with any sufficiently large LLM out of the box
- **Broad applicability** — improved performance on GSM8K (math), SVAMP (arithmetic), CSQA (commonsense), and more

## Why It Matters

CoT is the foundation of modern "reasoning" models (o1, Claude's extended thinking). It showed that LLMs can reason — they just need to be prompted to show their work. This insight was a prerequisite for the agentic AI paradigm: agents that plan multi-step actions use CoT-like reasoning at every step. The [ReAct](react.md) paper directly builds on this.

## Connections

- Built on [GPT-3](../language-models/gpt3.md)'s in-context learning — CoT is a form of few-shot prompting
- Foundation for [ReAct](react.md) — interleaving reasoning (CoT) with actions
- Relevant to the LLM Agents courses (cs294-agentic-f25, llm-agents-f24, llm-agents-sp25) — agent architectures use CoT for planning
- The "AI-Native Company" in CS153 Lecture 03 relies on models that can reason through multi-step workflows
