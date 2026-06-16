---
type: Lecture Notes
title: "LLM Agent Evaluations & Project Overview"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "04"
video: https://youtube.com/watch?v=VfOA2a0dj4w
tags: [evaluation, benchmarks, grading-agents, green-agents, SWE-bench, task-validity]
timestamp: 2026-06-15T00:00:00Z
---

# LLM Agent Evaluations & Project Overview

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=VfOA2a0dj4w)

## TL;DR
Course instructors present a comprehensive guide to LLM agent evaluation: types of evaluation (closed/open-ended, verifiable/non-verifiable, static/dynamic), evaluation methods (human eval, LLM-as-judge), benchmark design principles, and case studies (CyberBench, TauBench, GDPEval, CRM Arena). The second half covers the course project: building "green agents" (evaluation/benchmark agents) using either existing benchmarks or novel ones.

## Key Takeaways
- LLM agent evaluation is more complex than LLM evaluation due to tool use, planning, memory, and multi-step reasoning requirements
- Two validity dimensions: task validity (does success reflect target capability?) and outcome validity (does the metric faithfully capture success?)
- Dynamic benchmarks resist contamination and stay relevant but are harder to build than static ones
- LLM-as-judge is much cheaper than human evaluation but requires careful validation for consistency, bias, and hackability
- SWE-bench Verified filtered out 68.3% of original SWE-bench samples as low quality — a cautionary tale for benchmark trust
- Green agents orchestrate the entire evaluation pipeline: environment setup, task distribution, result collection, and metric computation

## Detailed Notes

### 00:00 — Why Evaluation Matters
Evaluation is needed at every stage: training loss, validation, model selection, deployment, and publication. Benchmarks drive field progress — from ImageNet to MMLU to agent-specific benchmarks.

### 06:00 — LLM vs Agent Evaluation
LLMs are static text-in/text-out. Agents operate in complex environments with tools, planning, memory, and multi-step reasoning. This makes evaluation fundamentally harder.

### 07:00 — Evaluation Taxonomy
Closed-ended (multiple choice, yes/no — easy to score) vs open-ended (free-form text). Open-ended splits into verifiable (math proofs, code with unit tests) and non-verifiable (storytelling, writing style). Static benchmarks (fixed test cases) vs dynamic benchmarks (periodically regenerated).

### 14:00 — Human Evaluation vs LLM-as-Judge
Human eval is the gold standard but slow, expensive, and suffers from inter/intra-annotator disagreement. LLM-as-judge is cheaper and surprisingly consistent with human preference, but can be biased, random, or hackable (invisible text exploits).

### 28:00 — What Makes a Good Benchmark
Task validity + outcome validity. Principles: real-world relevance, difficulty levels, contamination resistance, saturation resistance. Case studies: CyberBench (reproducing CVEs), TauBench/Tau-squared (API agent evaluation with dual control), GDPEval (expert-graded real work tasks), CRM Arena (Salesforce enterprise workflows).

### 51:00 — SWE-bench → SWE-bench Verified
Original SWE-bench had 38.3% under-specified descriptions and 61.1% unfair unit tests. SWE-bench Verified filtered to 500 high-quality samples. GPT-4o went from 16% to 33.2% resolve rate — prior benchmarks underestimated model capability due to data quality issues.

### 01:05:00 — Green Agent Architecture
Green agents (evaluation agents) orchestrate: prepare environment → distribute tasks → collect results → verify environment ran correctly → gather metrics → report. Two types: Type 1 (integrate existing benchmark) and Type 2 (build new benchmark).

## Notable Quotes
- "Benchmark is really the key that determines the future progress of the whole field."
- "If you cannot measure it, you cannot learn. That's the most important thing."
- "We don't want the benchmark to just allow agents to climb from 10-20% to suddenly 80-90% to almost make the benchmark obsolete."

## Concepts Introduced
- [[Task Validity]] — Whether benchmark success reflects the target capability
- [[Outcome Validity]] — Whether metrics faithfully capture task success
- [[Green Agent]] — Evaluation orchestration agent that manages the benchmark pipeline
- [[Dynamic Benchmark]] — Benchmark with periodically regenerated test cases
- [[LLM-as-Judge]] — Using LLMs to evaluate open-ended model outputs

## Connections to Other Lectures
- Lecture 03 (Jiantao Jiao) covers verifier design and benchmark quality from the training perspective
- Lecture 07 (Sida Wang) provides statistical analysis of benchmark reliability
- Lecture 09 (Clay Bavor) shows real-world evaluation challenges in deployed agents

## Open Questions
- How do we build reliable LLM-as-judge systems that are robust to adversarial manipulation?
- Can dynamic benchmarks maintain consistency for longitudinal comparisons?
- What is the right balance between benchmark difficulty and model accessibility?
