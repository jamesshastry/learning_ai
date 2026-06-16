---
aliases: ["Visual RAG"]
tags: [RAG, multimodal, application]
type: concept
first_seen: llm-agents-f24/03
sources:
  - course: llm-agents-f24
    lecture: "03"
    timestamps: ["44:19", "49:53", "51:04"]
---
# Multimodal RAG

An extension of retrieval-augmented generation that handles visual data (charts, diagrams, images in documents) by extracting text summaries linked to image chunks, enabling text embedding models to index visual content that is then fed to multimodal LLMs during synthesis.

## Key Points from Sources

- **llm-agents-f24 Lecture 03**

## Related Concepts

- [[Agentic RAG]] (foundation of) — Multimodal RAG provides the retrieval layer for agentic reasoning over visual data.
- [[Hierarchical Indexing]] (uses) — Multimodal RAG relies on hierarchical indexing to link summaries to source elements.
