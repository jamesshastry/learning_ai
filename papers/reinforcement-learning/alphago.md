---
type: Paper
title: "Mastering the Game of Go with Deep Neural Networks and Tree Search"
authors: [David Silver, Aja Huang, Chris J. Maddison, Arthur Guez, Laurent Sifre, George van den Driessche, Julian Schrittwieser, Ioannis Antonoglou, Veda Panneershelvam, Marc Lanctot, Sander Dieleman, Dominik Grewe, John Nham, Nal Kalchbrenner, Ilya Sutskever, Timothy Lillicrap, Madeleine Leach, Koray Kavukcuoglu, Thore Graepel, Demis Hassabis]
year: 2016
venue: Nature
resource: https://doi.org/10.1038/nature16961
tags: [reinforcement-learning, go, mcts, deep-learning, alphago, game-playing]
timestamp: 2026-06-15T00:00:00Z
---

# Mastering the Game of Go with Deep Neural Networks and Tree Search

## Summary

Introduced **AlphaGo**, the first computer program to defeat a professional human Go player. The system combined deep convolutional neural networks with **Monte Carlo Tree Search (MCTS)**: a **policy network** trained on expert games to predict moves, a **value network** trained on self-play to evaluate board positions, and MCTS to search ahead using both networks for guidance. AlphaGo defeated European champion Fan Hui 5-0 and world champion Lee Sedol 4-1, achieving what was considered a decade-away milestone.

## Key Contributions

- **Policy network from expert data** — trained a 13-layer CNN on 30 million positions from expert games to predict human moves with 57% accuracy, providing strong move priors for tree search
- **Value network from self-play** — trained a separate network via reinforcement learning (self-play) to predict the winner from any board position, replacing Monte Carlo rollouts with learned evaluation
- **Integration with MCTS** — combined the policy network (to narrow the search breadth) and value network (to reduce search depth) with Monte Carlo Tree Search, achieving effective search in Go's 10¹⁷⁰ state space
- **Superhuman performance** — defeated the world champion at Go, a game long considered intractable for AI due to its enormous branching factor and reliance on intuition

## Why It Matters

AlphaGo was a cultural and scientific watershed. It proved that deep learning combined with search could master a domain that resisted classical AI for decades. The subsequent AlphaGo Zero and AlphaZero papers showed the expert data was unnecessary — pure self-play sufficed — and the approach generalized to chess and shogi. The lineage extends to AlphaProof (2024), which applied similar ideas to mathematical theorem proving.

## Connections

- Built on the deep RL foundation of [DQN](dqn.md), which showed deep networks could learn from game-playing
- A prime example of [The Bitter Lesson](../scaling/the-bitter-lesson.md) — search + learning beat decades of hand-crafted Go heuristics
- Referenced in LLM Agents SP25 Lecture 8 on AlphaProof and reasoning via search
