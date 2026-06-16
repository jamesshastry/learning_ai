---
type: Lecture Notes
title: "Abstraction and Discovery with LLM Agents"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "11"
video: https://youtube.com/watch?v=IHc0TEMrEdY
tags: [scientific-discovery, mathematical-discovery, abstraction, concept-learning, symbolic-regression, formal-verification, LLM-evolution]
timestamp: 2026-06-15T00:00:00Z
---

# Abstraction and Discovery with LLM Agents

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=IHc0TEMrEdY)

## TL;DR
Swarat Chaudhuri (UT Austin) presents LLM agents as tools for scientific and mathematical discovery, with emphasis on abstraction — the ability to discover reusable concepts. He covers in-context learning agents for formal theorem proving, LLM-directed evolution for symbolic regression, and concept libraries that enable abstraction discovery. The key thesis: LLMs' ability to discover and reuse abstract concepts makes them uniquely powerful for accelerating scientific discovery beyond what pure search or pure reasoning can achieve.

## Key Takeaways
- Mathematical discovery involves modeling, conjecturing, proving, and iterating — AI can accelerate each stage
- In-context learning agents for Lean theorem proving achieve competitive results with minimal training, using just examples in the prompt
- LLM-directed evolution: LLMs propose mutations to candidate programs/proofs, evaluated against ground truth, iterated over generations
- Concept libraries: LLMs can discover reusable abstractions (like subroutines) that compress solution spaces and improve search efficiency
- Symbolic regression with learned concept libraries outperforms both pure neural and pure symbolic approaches
- The whole is greater than the sum of parts: combining LLM abstraction with evolutionary search creates synergy
- VLMs (vision-language models) can extend these approaches to visual/high-dimensional scientific domains

## Detailed Notes

### [00:00-18:00] Mathematical Discovery and AI
The process: modeling → conjecturing → proving → iterating. Dream of AI for math: automate and accelerate this process. Formal proof assistants (Lean) provide verifiability. Training data challenge: human formal proofs are scarce. RL approach (AlphaProof) vs LLM-based approach — both valid.

### [18:00-45:00] In-Context Learning Agent for Theorem Proving
Minimal approach: provide theorem proving examples in context, let LLM generate tactics. No training required — relies on pre-trained model's capabilities. Retrieval of relevant examples improves performance. Surprisingly competitive with trained models on standard benchmarks.

### [45:00-75:00] LLM-Directed Evolution for Scientific Discovery
FunSearch (DeepMind): LLM proposes program mutations, evaluated on fitness function, best retained. Application to symbolic regression: discover mathematical formulas from data. Key innovation: learned concept libraries that extract reusable abstractions from successful solutions. Concept compression: library of reusable functions reduces search space and enables compositional discovery.

### [75:00-87:00] Abstraction and Future Directions
LLMs' abstraction ability is their unique advantage — not just pattern matching but discovering reusable concepts. VLMs extend to visual/high-dimensional domains. Open challenges: verification of hypotheses, concept representations beyond language, scaling to larger search spaces. LLM agents (not just LLMs) combining queries with other machinery are extremely powerful for scientific discovery.

## Notable Quotes
- "LLM agents can be supremely powerful in mathematical discovery — and we are just in the early stages"
- "The whole is greater than the sum of the parts" — on combining LLM abstraction with evolutionary search
- "The future is very bright"

## Concepts Introduced
- [[LLM-Directed Evolution]]
- [[Concept Libraries]]
- [[Symbolic Regression with LLMs]]
- [[In-Context Learning for Theorem Proving]]
- [[Abstraction Discovery]]
- [[FunSearch]]

## Connections to Other Lectures
- Lecture 08 (AlphaProof) covers RL-based theorem proving; this lecture shows LLM-based alternatives
- Lecture 09-10 cover formal theorem proving; this lecture extends to broader mathematical and scientific discovery
- Lecture 05 (Sutton) covers coding agents; concept libraries relate to program synthesis

## Open Questions
- Can concept libraries transfer across mathematical domains?
- How to verify LLM-generated scientific hypotheses at scale?
- Can abstraction discovery lead to genuinely novel mathematical definitions and conjectures?
