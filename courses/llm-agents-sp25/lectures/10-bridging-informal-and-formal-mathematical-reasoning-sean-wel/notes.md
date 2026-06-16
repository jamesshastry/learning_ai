---
type: Lecture Notes
title: "Bridging Informal and Formal Mathematical Reasoning"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "10"
video: https://youtube.com/watch?v=Gy5Nm17l9oo
tags: [Lean-STaR, informal-reasoning, formal-proofs, miniCTX, ImProver, theorem-proving, draft-sketch-prove]
timestamp: 2026-06-15T00:00:00Z
---

# Bridging Informal and Formal Mathematical Reasoning

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=Gy5Nm17l9oo)

## TL;DR
Sean Welleck (CMU) presents three approaches to bridging informal and formal mathematical reasoning: (1) Lean-STaR — training models to generate informal "thoughts" before formal tactics, (2) Draft-Sketch-Prove and ImProver — using informal proofs as sketches to guide formal proof search, and (3) miniCTX — a benchmark for real-world Lean project formalization. The central insight: informal mathematical thinking can be a powerful intermediate representation that improves formal proof generation.

## Key Takeaways
- Informal math (text, LaTeX) is flexible but unverifiable; formal math (Lean) is rigid but guaranteed correct — bridging them is the key challenge
- Lean-STaR: models trained to generate informal thoughts before each formal tactic step improve theorem proving success by ~5%
- Draft-Sketch-Prove: generate informal proof → extract formal sketch → fill gaps with tactic generation
- ImProver: agent-based proof optimization that rewrites formal proofs to be shorter, more modular, or use different techniques
- miniCTX: benchmark based on real Lean projects (not just Mathlib) that tests long-context theorem proving with project-specific definitions
- Gap between AI benchmark performance and real formalization tools remains significant
- All methods, data, and models are open source

## Detailed Notes

### [00:00-15:00] Informal vs Formal Math
Informal math: text/images, flexible, no correctness guarantees. Formal math: Lean/Coq, rigid, machine-verified. The "unreliability gap" of informal AI math outputs. Three approaches to bridge the gap: incorporate informal thoughts, use informal proofs as sketches, tackle real-world formalization projects.

### [15:00-40:00] Lean-STaR: Thinking Before Proving
Train model to generate informal natural language thought before each Lean tactic. Two training stages: (1) prompt model for thoughts, filter for improvement, (2) reinforce thoughts that lead to successful proofs. Results: ~5% improvement on Lean theorem proving benchmarks. Key insight: models that "think" informally generate better formal tactics.

### [40:00-65:00] Draft-Sketch-Prove and ImProver
Draft-Sketch-Prove: informal proof → formal sketch with "sorry" holes → fill holes with tactic generation. ImProver: agent that rewrites existing proofs with objectives like shortening, modularizing, or changing proof technique. Uses retrieval of relevant proof examples and iterative refinement.

### [65:00-72:00] miniCTX and Real-World Formalization
miniCTX: 228 theorems from real Lean projects beyond Mathlib. Requires understanding project-specific definitions in long context. Proprietary models (GPT-4) use full file context; open models use extracted premises. Significant gap between benchmark performance and practical utility.

## Notable Quotes
- "For math in particular, how you represent the math is actually extremely important to think about"
- "We still have a gap between the AI advances and tools that people can use"

## Concepts Introduced
- [[Lean-STaR]]
- [[Draft-Sketch-Prove]]
- [[ImProver]]
- [[miniCTX]]
- [[Informal-to-Formal Bridge]]

## Connections to Other Lectures
- Lecture 08 (AlphaProof) provides the RL-based approach; this lecture offers LLM-based alternatives
- Lecture 09 (Yang) covers LeanDojo data extraction that underpins these methods
- Lecture 11 (Chaudhuri) extends to mathematical and scientific discovery

## Open Questions
- Can informal thoughts be learned without any human informal proof annotations?
- How to scale formal verification assistance to research-level mathematics papers?
- What role should informal reasoning play as formal provers become stronger?
