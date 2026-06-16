---
type: Lecture Notes
title: "Towards a Unified Framework of Neural and Symbolic Decision Making"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "08"
video: https://youtube.com/watch?v=wm9-7VBpdEo
tags: [reasoning, planning, search, neural-symbolic, optimization, decision-making]
timestamp: 2026-06-15T00:00:00Z
---

# Towards a Unified Framework of Neural and Symbolic Decision Making — Yuandong Tian (Meta FAIR)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=wm9-7VBpdEo)

## TL;DR
Yuandong Tian presents Meta FAIR's work on unifying neural and symbolic approaches to reasoning and planning. Key contributions include Searchformer (training LLMs to output A* search traces, achieving 10x better sample efficiency), Dualformer (learning to switch between fast direct solutions and slow search-trace reasoning), and SurCo (using neural networks as differentiable surrogates for combinatorial optimization). The work suggests that training on search traces teaches genuine algorithmic reasoning, not just pattern matching.

## Key Takeaways
1. **Search-augmented models dramatically improve scaling:** Training LLMs to predict search traces before solutions achieves 10x better sample efficiency than solution-only training with 10x smaller models.
2. **Dualformer learns dual thinking modes:** A single model learns when to use fast (direct solution) vs. slow (search-trace) thinking, analogous to Kahneman's System 1/System 2.
3. **Neural networks can discover symbolic solutions:** Given reasoning tasks, trained networks converge to solutions that are equivalent to known symbolic algorithms.
4. **SurCo enables differentiable combinatorial optimization:** Neural networks serve as continuous surrogates for discrete optimization problems, enabling gradient-based solutions.
5. **Gradient descent may not be the only path:** Algebraic/geometric constructions may provide alternative paths to solutions, potentially making gradient descent obsolete for some problems.

## Detailed Notes
Key topics include the Beyond A* paper showing search-augmented LLMs for planning, the Searchformer architecture and its scaling law improvements, the Dualformer model for adaptive reasoning depth, SurCo's approach to combinatorial optimization through learned surrogates, and the theoretical implications of neural-symbolic convergence for the future of AI reasoning.

## Notable Quotes
1. "With search-augmented models of only 15 million parameters, 10x smaller than solution-only models, you see a training curve that is much better."
2. "Maybe in the future, we don't need gradient descent anymore — we just need geometric constructions to combine small solutions to larger solutions."

## Concepts Introduced
- [[Searchformer]], [[Dualformer]], [[SurCo]], [[Search-Augmented LLMs]], [[Neural-Symbolic Reasoning]]

## Connections to Other Lectures
- Lecture 01 (Denny Zhou) covers chain-of-thought reasoning; this lecture shows how to train models to generate systematic search traces
- Lecture 05 (Omar Khattab) discusses compound AI systems; search-augmented models represent a different approach to improving LLM reasoning
- Lecture 09 (Jim Fan) applies reinforcement learning for robotics, complementing this lecture's planning focus

## Open Questions
1. Can search-augmented training scale to real-world planning problems beyond mazes and Sokoban?
2. How does the Dualformer's fast/slow switching compare to OpenAI's o1 approach?
3. Will neural-symbolic convergence extend to more complex reasoning domains?
