---
type: Lecture Notes
title: "Post-Training Verifiable Agents"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "03"
video: https://youtube.com/watch?v=3l0Zxus34es
tags: [verifiable-agents, post-training, reinforcement-learning, evaluation, benchmarks, GRPO]
timestamp: 2026-06-15T00:00:00Z
---

# Post-Training Verifiable Agents

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=3l0Zxus34es)

## TL;DR
Jiantao Jiao (NVIDIA / UC Berkeley) presents the three pillars of building verifiable agentic models: (1) getting good training data with diverse environments, tools, and verifiers, (2) holistic evaluation that tests generalization beyond training distribution, and (3) training well via SFT + RL with emphasis on entropy preservation, difficulty curriculum, and diverse sampling. He draws compelling analogies between human learning and LLM training.

## Key Takeaways
- Agentic models differ from chatbots by aligning with environment feedback and verifiable rewards, not just human preference
- Training data needs three components: environments (state of the world), tools (APIs the agent can call), and verifiers (correctness checkers)
- The community has not converged on the right RL algorithm — current approaches are "hacks" that work but lack theoretical grounding
- Entropy collapse during RL training is a critical failure mode — models converge to single answers and stop exploring
- SFT should be "light" to preserve exploration diversity for subsequent RL; heavy SFT kills out-of-distribution generalization
- On-policy RL (learning from your own mistakes) outperforms off-policy (learning from others' demonstrations)

## Detailed Notes

### 00:00 — Agentic vs Traditional LLMs
Traditional RLHF aligns with human preference for engaging conversation. Agentic models must additionally maximize verifiable rewards — producing correct answers for task completion where wrong answers crash the system.

### 06:55 — Three Core Steps
Step 1: Get good verifiable training data. Step 2: Build robust evaluation. Step 3: Train effectively. All three require extensive ongoing research.

### 11:49 — Training Data Components
Environments (code repos, math problems, enterprise software), tools (APIs, Python interpreter, database queries), and verifiers (unit tests, math checkers, state comparisons). Coverage across all three dimensions is critical.

### 18:30 — Verifier Quality Challenges
Even simple math verification has pitfalls (equivalent fractions, formatting requirements). False positives and false negatives in verifiers directly limit model improvement ceiling. Building high-quality verifiers is as hard as building the models.

### 22:00 — Evaluation Philosophy
Good evaluation must test generalization: many tools, many use cases, vaguely specified instructions, multiple software systems, robustness to errors. Benchmarks must maintain hardness, separability, and diversity. If 1 billion benchmarks existed covering everything, overfitting all of them would essentially constitute AGI.

### 38:00 — SFT Stage
SFT = imitation learning on demonstration trajectories. Must be light and diverse to preserve exploration ability. Heavy SFT kills model's ability to discover novel solutions during RL. Think of it as a professor showing example solutions without requiring memorization.

### 45:50 — RL Stage: Three Pillars
(1) Train longer: prevent entropy collapse via on-policy training, decoupled clipping (DAPO), or explicit entropy loss. (2) Train on harder prompts: balance difficulty — too easy teaches nothing, too hard causes wasted compute. (3) Sample better: parallel reasoning (GenSelect), confidence-weighted majority voting (DeepConf).

### 58:00 — Entropy Collapse
As RL training progresses, the model becomes increasingly confident in single answers, destroying diversity. On-policy training and entropy regularization help maintain exploration capability, critical for continued learning.

## Notable Quotes
- "If the LLM is not strong enough in producing essentially right answers, it's very, very hard to build a reliable system, even after you do lots of software engineering on top."
- "SFT is just here to discourage meaningless and low-quality rollout attempts, and RL is here to truly reinforce intelligence."
- "We are actually absolutely at the infancy of the area. We really haven't figured out what's the right way to train those systems."
- "If the community has collectively produced 1 billion benchmarks covering essentially everything... then maybe you have already achieved AGI."

## Concepts Introduced
- [[Verifiable Agent]] — Agent trained to maximize verifiable correctness rewards
- [[Entropy Collapse]] — Training failure where model loses exploration diversity
- [[GRPO]] — Group Relative Policy Optimization for agentic RL
- [[On-Policy vs Off-Policy RL]] — Learning from own outputs vs others' demonstrations

## Connections to Other Lectures
- Lecture 01 (Yann Dubois) covers the SFT and RL pipeline foundations
- Lecture 04 (Evaluation lecture) dives deeper into benchmark design and grading agent evaluation
- Lecture 05 (Weizhu Chen) shares practical experience with rubric-based evaluation for non-verifiable tasks

## Open Questions
- Can RL training algorithms be redesigned to better match machine learning theory rather than relying on empirical hacks?
- How do we build strong verifiers for open-ended tasks beyond math and coding?
- Is there a principled curriculum learning approach for selecting training difficulty?
