---
type: Lecture Notes
title: "LMs for Autoformalization + Theorem Proving"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "09"
video: https://youtube.com/watch?v=cLhWEyMQ4mQ
tags: [autoformalization, theorem-proving, LeanDojo, Lean, expert-iteration, euclidean-geometry, formal-verification]
timestamp: 2026-06-15T00:00:00Z
---

# LMs for Autoformalization + Theorem Proving

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=cLhWEyMQ4mQ)

## TL;DR
Kaiyu Yang (Meta) covers formal reasoning meets LLMs, presenting LeanDojo (open-source toolkit for neural theorem proving) and work on autoformalization. Math and coding are central to the LLM arms race because they serve as proxies for complex reasoning with verifiable outputs. Key contributions: LeanDojo extracts training data from Lean proofs for step-by-step neural theorem proving; expert iteration improves provers by training on self-generated proofs; autoformalization of Euclidean geometry uses SMT solvers to verify statement equivalence and fill proof gaps.

## Key Takeaways
- Math and coding are highlighted in every major LLM release because they are proxies for reasoning with easy-to-evaluate outputs
- Neural theorem proving: tree search over proof states with LLM-generated tactics, using DFS or MCTS
- LeanDojo enables extracting human-written proofs from Lean as training data for next-step prediction models
- Expert iteration: use current prover to attempt new theorems, add successful proofs to training set, retrain — performance improves across iterations
- Data scarcity is the key limitation: formal proofs are much rarer than Python code on the internet
- Unlike games (Go), theorem proving lacks a clear "opponent" or training signal beyond proof completion
- Euclidean geometry autoformalization: use SMT solvers for statement equivalence checking and gap-filling based on "diagrammatic obviousness"

## Detailed Notes

### [00:00-12:00] Why Math and Coding Matter
Every major LLM (O1, Gemini, Grok) highlights math/coding benchmarks. Math and coding are proxies for reasoning and planning with verifiable outputs. AIMO prize ($10M for IMO gold medal AI), Frontier Math benchmark. O3 solved 20%+ of Frontier Math — surprising progress.

### [12:00-30:00] Neural Theorem Proving and LeanDojo
Typical pipeline: proof search tree with LLM generating candidate tactics at each node. LeanDojo: open-source toolkit for extracting state-tactic pairs from Lean proofs. Expert iteration: prover → attempt theorems → collect new proofs → retrain → iterate. Limitations: data scarcity (formal proofs are rare), no natural opponent/reward signal like in games.

### [30:00-52:00] Autoformalization
Translating informal math to formal statements/proofs. Two key challenges: evaluating statement correctness and filling proof gaps. Euclidean geometry domain: use Avigad's diagrammatic axioms for "obvousness in diagram." SMT solvers check statement equivalence and fill gaps. GPT-4V with diagram input slightly outperforms text-only GPT-4. Even with 5+ demonstrations, models achieve only ~20% accuracy — autoformalization remains very challenging.

## Notable Quotes
- "When Frontier Math benchmark was released, people thought it's going to take a few years for language models to make real progress. But after less than one year, we have groundbreaking results from OpenAI"
- "The amount of human written proofs on the internet is very limited compared to say Python code"

## Concepts Introduced
- [[LeanDojo]]
- [[Neural Theorem Proving]]
- [[Expert Iteration for Provers]]
- [[Autoformalization]]
- [[SMT Solver Verification]]
- [[Diagrammatic Obviousness]]

## Connections to Other Lectures
- Lecture 08 (AlphaProof) covers RL-based theorem proving; this lecture focuses on the LLM/data-driven approach
- Lecture 10 (Welleck) extends with Lean-STaR and miniCTX for bridging informal and formal reasoning
- Lecture 11 (Chaudhuri) covers broader mathematical discovery beyond theorem proving

## Open Questions
- How to scale autoformalization beyond Euclidean geometry to diverse mathematical domains?
- Can expert iteration achieve unbounded improvement or does it plateau?
- How to generate effective training data when human formal proofs are scarce?
