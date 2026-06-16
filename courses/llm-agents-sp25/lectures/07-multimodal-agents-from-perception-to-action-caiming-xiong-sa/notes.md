---
type: Lecture Notes
title: "Multimodal Agents: From Perception to Action"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "07"
video: https://youtube.com/watch?v=n__Tim8K2IY
tags: [multimodal-agents, OSWorld, AGUVIS, GUI-agents, computer-use, grounding, vision-language-models]
timestamp: 2026-06-15T00:00:00Z
---

# Multimodal Agents: From Perception to Action

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=n__Tim8K2IY)

## TL;DR
Caiming Xiong (Salesforce AI Research) presents advances in multimodal agents for computer use, introducing OSWorld (a comprehensive OS-level benchmark with 369 real-world tasks) and AGUVIS (a unified vision-language-action model that operates across platforms using only visual observation). Key finding: the pure vision paradigm for GUI agents has significant advantages, and improving grounding capabilities offers more headroom than improving reasoning alone.

## Key Takeaways
- Almost all AI benchmarks from the past 5 years are saturated — Human's Last Exam may be the final frontier
- OSWorld provides 369 real-world computer tasks across web, desktop, and multi-app workflows with execution-based evaluation
- Pure vision paradigm (no HTML/accessibility tree) is increasingly viable and has cross-platform advantages
- AGUVIS unifies grounding and reasoning in a two-stage training pipeline, achieving state-of-the-art across platforms
- Inner monologue (forced planning text) helps solve harder tasks, resolving ~20% of grounding errors
- Cross-platform transfer works: web+mobile training improves computer use performance without desktop-specific data
- Grounding improvement offers larger gains than reasoning improvement alone for GUI agents

## Detailed Notes

### [00:00-20:00] Motivation and Agent Landscape
Benchmarks are saturating — agents are the next frontier application. Multimodal agents should hear, see, speak, and interact across multiple apps. Current agent products (Cursor, Replit) demonstrate real-world utility.

### [20:00-45:00] OSWorld Benchmark
369 real-world computer tasks: 100 multi-app workflow tasks, 268 single-app tasks, 30 infeasible tasks. Execution-based evaluation scripts for reliable assessment. Custom evaluation metrics per task type. Built on real OS environments with proper state initialization.

### [45:00-75:00] AGUVIS Architecture
Two-stage training: Stage 1 trains visual grounding (element identification, coordinate prediction), Stage 2 adds planning and reasoning with inner monologue. Uses pure vision input — no HTML or accessibility trees. Cross-platform benefits: training on web+mobile data improves computer use without desktop-specific training.

### [75:00-88:00] Results and Analysis
AGUVIS achieves state-of-the-art on grounding tasks. Inner monologue helps solve harder tasks. Both grounding and reasoning stages are important, but grounding has more room for improvement. OpenAI's Operator validates the pure vision paradigm direction.

## Notable Quotes
- "Don't just try to improve reasoning. Actually, there is bigger space you need to improve in the grounding side"
- "Almost all the benchmarks get saturated. When we solve Human's Last Exam, we solved AGI — I'm not sure whether we can solve it this year"

## Concepts Introduced
- [[OSWorld]]
- [[AGUVIS]]
- [[Pure Vision Paradigm for GUI Agents]]
- [[Inner Monologue for Agents]]
- [[Visual Grounding]]
- [[Cross-Platform Agent Transfer]]

## Connections to Other Lectures
- Lecture 06 (Salakhutdinov) covers web-specific agent benchmarks that OSWorld extends to full OS-level
- Lecture 03 (Yu Su) discusses the embodiment and perception aspects of the agent framework

## Open Questions
- Can pure vision agents handle accessibility features and screen readers for inclusive computing?
- How to scale OSWorld-style evaluation to thousands of diverse real-world tasks?
- What is the optimal balance between grounding and reasoning training for GUI agents?
