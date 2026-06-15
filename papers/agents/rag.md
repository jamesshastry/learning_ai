---
type: Paper
title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks"
authors: [Patrick Lewis, Ethan Perez, Aleksandra Piktus, Fabio Petroni, Vladimir Karpukhin, Naman Goyal, Heinrich Küttler, Mike Lewis, Wen-tau Yih, Tim Rocktäschel, Sebastian Riedel, Douwe Kiela]
year: 2020
venue: NeurIPS 2020
resource: https://arxiv.org/abs/2005.11401
tags: [retrieval, generation, knowledge, nlp, agents]
timestamp: 2026-06-14T00:00:00Z
---

# RAG (Retrieval-Augmented Generation)

## Summary

Combined a **pre-trained retriever** (DPR — Dense Passage Retrieval) with a **pre-trained generator** (BART) into an end-to-end model that retrieves relevant documents from a knowledge base before generating an answer. This lets the model access up-to-date, factual information beyond what's stored in its parameters.

## Key Contributions

- **Retrieve-then-generate architecture** — a neural retriever finds relevant passages from a corpus; these are prepended to the input before the generator produces output
- **End-to-end training** — both the retriever and generator are fine-tuned jointly, so the retriever learns what information the generator actually needs
- **RAG-Sequence vs. RAG-Token** — two variants: one retrieves once per output sequence, the other can attend to different documents at each output token
- **Outperformed purely parametric models** — achieved SOTA on open-domain QA, fact verification, and knowledge-grounded dialogue

## Why It Matters

RAG is the most widely deployed pattern in production LLM applications. When companies say they're "adding AI" to their product, they usually mean RAG — retrieving from their own documents and feeding them to an LLM. It addresses the core limitation of LLMs (knowledge cutoff, hallucination) without retraining. Your learning-ai project's `learn ask` command (Q&A against lecture transcripts) is conceptually a RAG pipeline.

## Connections

- Can be viewed as a single-step version of [ReAct](react.md)'s Retrieve action
- The generator component uses [Transformer](../foundations/attention-is-all-you-need.md) architecture
- Factual grounding reduces hallucination, complementing alignment work in [InstructGPT](../language-models/instruct-gpt.md) and [Constitutional AI](../language-models/constitutional-ai.md)
- Studied extensively in the LLM Agents courses (cs294-agentic-f25, llm-agents-sp25)
- Your `learn ask` and `learn synthesize` commands implement a RAG-like pattern over lecture transcripts
