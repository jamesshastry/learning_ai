---
type: Paper
title: "The Bitter Lesson"
authors: [Rich Sutton]
year: 2019
venue: Blog post
resource: http://www.incompleteideas.net/IncIdeas/BitterLesson.html
tags: [scaling, compute, philosophy, meta-lesson]
timestamp: 2026-06-14T00:00:00Z
---

# The Bitter Lesson

## Summary

Rich Sutton argues that **the biggest lesson from 70 years of AI research is that general methods leveraging computation are ultimately the most effective** — and that researchers' attempts to build in human domain knowledge consistently fail as compute scales up. Search and learning, the two most general methods, scale with Moore's Law while hand-engineering does not.

## Key Arguments

- **Pattern across decades** — in chess, Go, speech recognition, and computer vision, hand-crafted approaches initially dominated but were eventually swept away by general methods (search, learning) + more compute
- **The "bitter" part** — researchers invest years building in domain knowledge, only to see it outperformed by brute-force scaling. The lesson is bitter because it implies human cleverness is less important than compute
- **Implications for architecture** — favor general architectures (like [Transformers](../foundations/attention-is-all-you-need.md)) over task-specific ones; favor learning over engineering
- **Corollary** — the future of AI will be shaped by whoever has the most compute, not the cleverest algorithms

## Why It Matters

This 800-word blog post is cited more than most research papers. It predicted the LLM scaling paradigm years before GPT-3. It's the philosophical underpinning of the [Scaling Laws](scaling-laws.md) paper, the foundation for understanding why companies are building massive GPU clusters (CS153 Lecture 02: "Value per Gigawatt"), and the lens through which the MSE435 "AI Supercycle" economics make sense.

## Connections

- Formalized experimentally by [Scaling Laws for Neural Language Models](scaling-laws.md)
- [AlexNet](../foundations/alexnet.md) was an early demonstration — GPUs + data > hand-crafted features
- Referenced directly in CS153 Lecture 02 knowledge graph as "The Bitter Lesson (AI Scaling)"
- The GPU economy discussed in MSE435 Week 2 is the economic consequence of this thesis
- Drives the infrastructure buildout discussed in CS153 (energy bottlenecks, value per gigawatt)
