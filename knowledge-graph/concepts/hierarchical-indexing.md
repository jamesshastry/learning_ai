---
aliases: ["Multi-Representation Indexing"]
tags: [RAG, architecture, data]
type: concept
first_seen: llm-agents-f24/03
sources:
  - course: llm-agents-f24
    lecture: "03"
    timestamps: ["48:24", "49:06"]
---
# Hierarchical Indexing

A RAG indexing strategy where multiple derived representations (summaries, sub-chunks, extracted metadata) point to source document elements, enabling more effective retrieval by matching queries against diverse representations while returning original content.

## Key Points from Sources

- **llm-agents-f24 Lecture 03**

## Related Concepts

- [[Multimodal RAG]] (enables) — Hierarchical indexing is essential for indexing visual elements in multimodal RAG.
- [[Agentic RAG]] (supports) — Better retrieval through hierarchical indexing improves agentic RAG quality.
