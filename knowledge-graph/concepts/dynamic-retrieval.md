---
aliases: ["Intelligent Retrieval", "Selective Grounding"]
tags: [RAG, optimization, enterprise]
type: concept
first_seen: llm-agents-f24/04
sources:
  - course: llm-agents-f24
    lecture: "04"
    timestamps: ["53:33", "53:48"]
---
# Dynamic Retrieval

An optimization technique where the system intelligently determines when to invoke external search based on the LLM's response, rather than always searching — balancing cost and quality since search API costs remain relatively fixed.

## Key Points from Sources

- **llm-agents-f24 Lecture 04**

## Related Concepts

- [[Grounding with Search]] (optimizes) — Dynamic retrieval reduces unnecessary search calls in grounding.
