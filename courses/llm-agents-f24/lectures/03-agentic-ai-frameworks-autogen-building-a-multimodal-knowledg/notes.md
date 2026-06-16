---
type: Lecture Notes
title: "Agentic AI Frameworks & AutoGen / Building a Multimodal Knowledge Assistant"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "03"
video: https://youtube.com/watch?v=OOdtmCMSOo4
tags: [AutoGen, LlamaIndex, multi-agent, RAG, multimodal, frameworks]
timestamp: 2026-06-15T00:00:00Z
---

# Agentic AI Frameworks — Chi Wang (AutoGen) & Jerry Liu (LlamaIndex)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=OOdtmCMSOo4)

## TL;DR
Chi Wang presents AutoGen's multi-agent conversation programming framework where agents with different roles collaborate through nested and group chats to solve complex tasks. Jerry Liu introduces LlamaIndex's approach to building multimodal knowledge assistants, covering the spectrum from basic RAG to agentic RAG with hierarchical indexing, report generation, and production deployment of agent workflows as microservices.

## Key Takeaways
1. **Multi-agent conversation is a powerful unifying abstraction:** AutoGen uses conversation as the central programming primitive, enabling agents to collaborate, nest chats, and build recursive complexity.
2. **Decomposing tasks across agents improves performance:** Multi-agent setups show 20%+ higher recall than single-agent setups, especially for weaker models and complex tasks.
3. **Multimodal RAG requires sophisticated data pipelines:** Document parsing quality is foundational — "garbage in, garbage out" applies even more to LLM applications than traditional ML.
4. **Agentic RAG adds reasoning on top of retrieval:** Moving beyond basic RAG to include query decomposition, tool use, and planning enables handling complex multi-hop and summarization questions.
5. **Production agents need event-driven orchestration:** Deploying agents as microservices with message queues and human-in-the-loop capabilities is necessary for real-world applications.

## Detailed Notes

### AutoGen: Agentic Programming Framework [00:00–37:03]
- Supply chain optimization example: three agents (commander, writer, safeguard) solve complex questions through nested conversations
- Key design: define agents, then get them to talk — two-step programming model
- Conversable agents abstract humans, tools, and LLMs behind a unified interface
- Conversation patterns: two-agent chat, sequential chat, nested chat, group chat with FSM constraints
- AutoBuild: automatically suggests agent teams for given tasks; Adaptive Build dynamically selects/creates agents per subtask
- Applications span software development, science (SciAgents for scientific discovery), web browsing (Agent-E achieves SOTA on WebVoyager)

### LlamaIndex: Multimodal Knowledge Assistant [37:06–01:04:46]
- Basic RAG pipeline: parse → chunk → embed → vector store → retrieve → synthesize
- Four limitations of basic RAG: primitive data processing, LLM used only for synthesis, one-shot/stateless, no personalization
- Better knowledge assistants need: multimodal retrieval, generalized output (reports, actions), agentic reasoning, deployment infrastructure
- Hierarchical indexing: extract multiple representations (summaries, sub-chunks) that point to source elements
- Multimodal RAG: text embeddings index image summaries, which dereference to actual images fed to multimodal LLMs
- Agentic RAG spectrum: constrained flows (router + tools + reflection) vs. unconstrained (ReAct with many tools) — tradeoff between reliability and expressiveness
- Production deployment: agents as microservices on Kubernetes with central message queue and human-in-the-loop

## Notable Quotes
1. "For GPT-4, the multi-agent setup has a 20% higher recall than single-agent setup. For GPT-3.5, the difference is even higher."
2. "Conversation is a way of making progress in learning and proving theorems."
3. "Any LLM or RAG or agent application is only as good as your data processing pipeline."
4. "A very rough definition of an agent is just a program that has nonzero LLM calls."
5. "The more complex the task and the weaker the model, there's a stronger need to have multi-agent workflows."

## Concepts Introduced
- [[AutoGen]], [[Conversable Agent]], [[Nested Chat]], [[Group Chat Manager]], [[AutoBuild]]
- [[Multimodal RAG]], [[Agentic RAG]], [[Hierarchical Indexing]]

## Connections to Other Lectures
- Lecture 02 (Shunyu Yao) provides the ReAct foundation that AutoGen's agents build upon
- Lecture 05 (Omar Khattab) offers DSPy as an alternative framework for compound AI systems
- Lecture 07 (Nicolas Chapados) extends enterprise agent workflows with TapeAgents and WorkArena

## Open Questions
1. What is the optimal multi-agent workflow for a given task complexity and model capability?
2. How do we evaluate and compare agentic AI frameworks systematically?
3. When should you use constrained vs. unconstrained agentic flows in production?
