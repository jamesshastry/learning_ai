---
type: Lecture Notes
title: "AlphaProof: When Reinforcement Learning Meets Formal Mathematics"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "08"
video: https://youtube.com/watch?v=3gaEMscOMAU
tags: [AlphaProof, formal-mathematics, Lean, reinforcement-learning, theorem-proving, IMO, AlphaGo]
timestamp: 2026-06-15T00:00:00Z
---

# AlphaProof: When Reinforcement Learning Meets Formal Mathematics

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=3gaEMscOMAU)

## TL;DR
Thomas Hubert (Google DeepMind) presents AlphaProof, which achieved silver-medal performance at IMO 2024 by combining reinforcement learning with formal mathematics in Lean. The key insight: formal proof languages provide a perfect training environment (like board games) where every step can be verified. AlphaProof bridges the gap between informal mathematical reasoning and formal verification through autoformalization, then applies RL self-play to discover proofs. The talk traces ideas from AlphaGo → AlphaZero → AlphaCode → AlphaProof.

## Key Takeaways
- Formal mathematics (Lean, Coq, Isabelle) provides machine-verifiable proofs where correctness is guaranteed by type-checking
- Lean's interactive proof environment is analogous to board games — complete state information, deterministic transitions, verifiable outcomes
- AlphaProof's key innovation: autoformalize IMO problems from natural language to Lean, then use RL to search for proofs
- Reinforcement learning in formal math benefits from the same principles as game-playing: self-play generates unlimited training data
- AlphaProof solved 4 of 6 IMO 2024 problems (silver medal level), with the algebra problems requiring days of compute
- The "unreasonable effectiveness of mathematics" extends to AI: formal verification could democratize rigorous reasoning
- Lean community is growing exponentially — formalization is becoming accessible and even fun ("positive reinforcement 14 hours a day")

## Detailed Notes

### [00:00-15:00] The Rise of Formal Mathematics
Galileo's insight: laws of nature are written in mathematics. Wigner's "unreasonable effectiveness." Formal proof systems (Lean, Coq) provide machine-checked certainty. Lean growing exponentially — Mathlib has 200K+ formal theorems. Formalization is interactive and gamified, making it accessible for education.

### [15:00-35:00] Lessons from Reinforcement Learning
AlphaGo (2016): neural networks + Monte Carlo tree search beat world champion at Go. AlphaZero: same algorithm for chess, shogi, Go — self-play without human knowledge. Key insight: games provide perfect training environments with clear rules, verifiable outcomes, and unlimited self-play data. AlphaCode/AlphaTensor applied similar ideas to programming and matrix multiplication.

### [35:00-55:00] AlphaProof Architecture
Three components: (1) Autoformalization — translate informal math to Lean using Gemini, (2) Proof search — tree search over Lean tactic space guided by trained policy/value networks, (3) RL training — self-play loop generating proofs, training on successes. The formal proof environment is like a game: complete state, deterministic transitions, verified outcomes.

### [55:00-74:00] IMO 2024 Results and Future
Solved problems 1 (algebra), 2 (algebra), 3 (combinatorics), and 6 (combinatorics) — 28/42 points (silver medal, near gold). Problem 6 was the hardest, solved by only 5 human contestants. Geometry problems remain challenging — require constructing auxiliary objects not in the problem statement. Future: broaden beyond competition math to research mathematics, democratize rigorous proof.

## Notable Quotes
- "It would be fantastic if we could democratize this idea of a proof and share that with every thinker"
- "It needs to be absurdly optimistic to be able to achieve absurd goals"
- "We had this belief that together it was impossible to fail"
- "I stumbled on this talk called 'The Future of Mathematics' and it started a chain of ineluctable events that basically takes me here today"

## Concepts Introduced
- [[AlphaProof]]
- [[Formal Mathematics]]
- [[Lean Proof Assistant]]
- [[Autoformalization]]
- [[RL for Theorem Proving]]
- [[Self-Play for Mathematics]]
- [[Mathlib]]

## Connections to Other Lectures
- Lecture 09 (Kaiyu Yang) covers LeanDojo and autoformalization from the NLP/LLM perspective
- Lecture 10 (Sean Welleck) bridges informal and formal reasoning with Lean-STaR and ImProver
- Lecture 11 (Chaudhuri) extends formal verification to scientific discovery

## Open Questions
- How to handle geometry problems requiring creative construction of auxiliary objects?
- Can AlphaProof scale to research-level mathematics beyond competition problems?
- How to autoformalize across diverse mathematical domains with different notation systems?
