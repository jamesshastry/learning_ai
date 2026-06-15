---
type: Paper
title: "ReAct: Synergizing Reasoning and Acting in Language Models"
authors: [Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao]
year: 2023
venue: ICLR 2023
resource: https://arxiv.org/abs/2210.03629
tags: [agents, reasoning, tool-use, planning, chain-of-thought]
timestamp: 2026-06-14T00:00:00Z
---

# ReAct

## Summary

Proposed interleaving **Reasoning** traces and **Actions** in LLMs — the model thinks about what to do (chain-of-thought), takes an action (e.g., search, lookup), observes the result, then reasons again. This Thought → Action → Observation loop grounds the model's reasoning in external information, reducing hallucination and enabling multi-step task completion.

## Key Contributions

- **Thought-Action-Observation loop** — a structured framework where reasoning (internal) and acting (external) synergize. Actions retrieve real information; thoughts interpret and plan
- **Grounded reasoning** — by acting in an environment (searching Wikipedia, browsing), the model's reasoning is anchored in facts rather than purely generating from parametric memory
- **Reduced hallucination** — on knowledge-intensive tasks, ReAct significantly outperformed pure CoT because it could verify claims against external sources
- **Interpretable** — the reasoning traces make the agent's decision process transparent and debuggable

## Why It Matters

ReAct is the conceptual ancestor of every modern AI agent framework (LangChain, AutoGPT, Claude's tool use). The Thought → Action → Observation pattern became the standard loop for LLM agents. If [Chain-of-Thought](chain-of-thought.md) taught models to think, ReAct taught them to *do things* in the world while thinking.

## Connections

- Extends [Chain-of-Thought](chain-of-thought.md) — adds actions to reasoning
- The agent loop it defines is the core pattern studied in your LLM Agents courses (cs294-agentic-f25, llm-agents-f24, llm-agents-sp25)
- [RAG](rag.md) can be seen as a single-action special case (Retrieve → Generate)
- Relies on [GPT-3](../language-models/gpt3.md)-class in-context learning to follow the Thought/Action/Observation format
- Shunyu Yao (first author) also contributed to the "Tree of Thoughts" follow-up
