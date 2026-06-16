---
type: Lecture Notes
title: "Some Challenges and Lessons from Training Agentic Models"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "05"
video: https://youtube.com/watch?v=xNxrBHZPDvM
tags: [agentic-training, rubrics, data-synthesis, grading, efficiency, coding-agents]
timestamp: 2026-06-15T00:00:00Z
---

# Some Challenges and Lessons from Training Agentic Models

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=xNxrBHZPDvM)

## TL;DR
Weizhu Chen (Microsoft) shares practical industry lessons from training agentic models, using coding agents as the primary example. He covers the critical importance of rubric-based evaluation for non-verifiable tasks, scalable data synthesis as the key differentiator, and the massive infrastructure challenges of running RL training at scale with environment simulators requiring 10x more CPUs than GPUs.

## Key Takeaways
- Real agentic training involves multi-turn conversations between the model and environment simulators, not single-shot generation
- Rubrics (detailed, structured scoring criteria with 50+ criteria per question) are essential for evaluating non-verifiable tasks like writing and style
- Data synthesis is the most scalable approach — the best talent should be assigned to data generation, not treated as "dirty work"
- Training efficiency at GPU scale (thousands of GPUs) is a defining constraint — stability and utilization matter enormously
- Agentic training requires goal-orientation, tool usage, planning, reasoning, and user interaction capabilities simultaneously
- Environment simulators for code execution run on CPUs at 10x the scale of the GPU training cluster

## Detailed Notes

### 00:00 — Agentic Model Training Overview
Using coding agents as example: model receives GitHub issue + codebase, communicates multi-turn with environment simulator (sandbox), runs tests, generates pull requests, handles user feedback. Core capabilities needed: goal-orientation, tool usage, planning, reasoning, user interaction.

### 07:00 — Verifiable vs Non-verifiable Data
Verifiable: math, coding (unit tests), multiple choice. Non-verifiable: code style, writing quality, safety judgments, creative tasks. Most real product tasks are non-verifiable, requiring sophisticated evaluation approaches.

### 08:27 — Rubrics for Non-verifiable Evaluation
Expert human annotators write 50+ detailed criteria per question (spending hours to days per rubric). Each criterion is structured, scorable (0/1), and comprehensive enough to cover all aspects of any possible answer. Quality matters more than quantity — a small number of high-quality rubric-annotated examples can be generalized via LLM synthesis.

### 09:50 — Data Synthesis
Data synthesis is the most scalable and important capability. Best researchers are assigned to data synthesis pipelines. The approach: start with small expert-annotated seed data, then use LLMs to generate variations at scale while maintaining quality controls.

### 11:00 — Training Infrastructure
Running thousands of GPUs requires extreme attention to efficiency and stability. Environment simulators (CPU-based sandboxes for code execution) often require 10x the CPU count vs GPU count. Multi-turn agent-environment communication creates complex orchestration challenges.

## Notable Quotes
- "I put the best person, best talent, in the team to build up the data. How to synthesize the data actually is the most important thing to make the model much better."
- "If you cannot measure it, you cannot learn. That's the most important thing."
- "Quality is more important. Most of this, actually, we don't need so many. We ask the language model to do a lot of generalizations."

## Concepts Introduced
- [[Rubric-Based Evaluation]] — Structured multi-criteria scoring for open-ended tasks
- [[Data Synthesis]] — Scalable generation of training data using LLMs from expert seeds
- [[Environment Simulator]] — CPU-based sandbox for executing agent actions during training
- [[Multi-Turn Agentic Training]] — Training via iterative model-environment conversations

## Connections to Other Lectures
- Lecture 01 (Yann Dubois) provides the foundational training pipeline
- Lecture 03 (Jiantao Jiao) covers the theoretical RL framework; Chen provides practical counterpoint
- Lecture 04 (Evaluation lecture) discusses evaluation theory that Chen implements in practice

## Open Questions
- How do rubrics scale to truly novel or creative tasks where criteria cannot be pre-specified?
- What is the optimal ratio of expert-annotated seed data to synthesized data?
- Can environment simulators be made more efficient to reduce the CPU overhead?
