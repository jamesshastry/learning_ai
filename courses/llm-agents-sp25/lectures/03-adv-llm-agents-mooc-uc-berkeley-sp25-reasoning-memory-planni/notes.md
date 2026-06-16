---
type: Lecture Notes
title: "Reasoning, Memory & Planning of Language Agents"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "03"
video: https://youtube.com/watch?v=zvI4UN2_i-w
tags: [language-agents, memory, reasoning, planning, HippoRAG, grokking, world-models, web-agents]
timestamp: 2026-06-15T00:00:00Z
---

# Reasoning, Memory & Planning of Language Agents

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=zvI4UN2_i-w)

## TL;DR
Yu Su (Ohio State) presents a comprehensive framework for language agents organized around core competencies: memory, reasoning, and planning. He introduces HippoRAG (neurobiologically-inspired long-term memory using knowledge graphs and personalized PageRank), demonstrates that transformers learn implicit reasoning through grokking (not data size but data distribution matters), and shows how LLMs can serve as world models for model-based planning in web agents (WebDreamer).

## Key Takeaways
- Agent-first view (not LM-first): language agents are the latest evolution of AI agents, now upgraded with language-based reasoning and communication
- LLMs are highly receptive to external evidence even when it conflicts with parametric memory, enabling non-parametric memory (RAG)
- HippoRAG mimics hippocampal indexing theory: builds a knowledge graph index for pattern completion, outperforming dense retrievers on multi-hop QA
- Transformers can learn implicit reasoning through grokking — a phase transition from rote learning to generalization that depends on data distribution ratio, not data size
- Composition reasoning requires a staged circuit (two-hop retrieval) while comparison uses a parallel circuit — this explains why composition fails at OOD generalization
- LLMs can serve as approximate world models for web agents, enabling model-based planning that is safer and faster than tree search in real environments

## Detailed Notes

### [00:00-16:00] What Are Language Agents?
Two competing views: LM-first (scaffold around an LLM) vs agent-first (AI agents upgraded with language capability). Language agents uniquely combine universal language understanding with reasoning and communication. Conceptual framework: perception, memory, embodiment (bottom) → reasoning, world models → planning (top), with cross-cutting concerns of safety, evaluation, efficiency.

### [16:00-42:00] Memory — HippoRAG
Catastrophic forgetting makes parametric continual learning impractical. LLMs are receptive to external evidence (non-parametric memory via RAG). Standard embedding-based RAG fails on multi-hop queries requiring pattern completion across disparate passages. HippoRAG: inspired by hippocampal indexing theory — uses LLM for open information extraction to build a schemaless knowledge graph, then uses personalized PageRank from query concept nodes to find answers at graph intersections. Outperforms dense retrievers and iterative retrieval methods. HippoRAG V2 coming with competitive performance across all retrieval scenarios.

### [42:00-01:08:00] Reasoning — Grokking and Implicit Reasoning
Implicit reasoning (no chain-of-thought, single forward pass) matters because it is the default training mode and determines how well models acquire structured representations. Grokked Transformers: trained way beyond overfitting, transformers suddenly achieve near-perfect test accuracy via grokking. Critical finding: data distribution (ratio of inferred to atomic facts) matters, not data size. Mechanistic interpretation reveals composition uses a staged circuit (first-hop retrieval → bridge entity → delayed R2 processing → second-hop) while comparison uses a parallel circuit. OOD generalization of composition fails because the model has no incentive to store atomic facts in upper layers without having seen them composed. Fix: cross-layer parameter sharing enables OOD composition generalization.

### [01:08:00-01:32:00] Planning — WebDreamer
Language agents expand planning into expressive natural-language goals, open-ended action spaces, and fuzzy goal tests. Reactive planning (ReAct) is fast but greedy. Tree search enables backtracking but is unsafe/irreversible in real-world environments. Model-based planning uses LLMs as world models to simulate action outcomes before committing. WebDreamer: LLM simulates next web page states, value function evaluates progress, agent commits to highest-value action. Faster and safer than tree search; slightly trails tree search accuracy in sandbox environments.

## Notable Quotes
- "Memory is everything. Without it we are nothing" — Eric Kandel, quoted by Yu Su
- "AutoGPT was the fastest growing repository in GitHub history but it didn't take long for people to realize it was mostly a prototype"
- "The attack surface of language agents is scarily broad — for web agents it's essentially the entire internet"
- "We're really just standing at the dawn of a long journey"

## Concepts Introduced
- [[HippoRAG]]
- [[Hippocampal Indexing Theory]]
- [[Personalized PageRank]]
- [[Grokking]]
- [[Implicit Reasoning in Transformers]]
- [[Generalizing Circuits]]
- [[Model-Based Planning]]
- [[WebDreamer]]
- [[Agent-First View]]

## Connections to Other Lectures
- Lecture 01 covers inference-time reasoning; this lecture addresses the implicit reasoning foundation underneath
- Lecture 06 (Salakhutdinov) covers web agent benchmarks (WebArena, VisualWebArena) that WebDreamer builds upon
- Lecture 12 (Dawn Song) elaborates on the safety concerns Yu Su raises about agent attack surfaces

## Open Questions
- How to handle episodic memory with spatial-temporal aspects in language agents?
- Can O1/R1-style reasoning work for agents where rewards are fuzzy and environments are non-deterministic?
- How to balance reactive vs. model-based planning efficiently — simulate only for difficult decisions?
