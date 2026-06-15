---
type: Paper
title: "Playing Atari with Deep Reinforcement Learning"
authors: [Volodymyr Mnih, Koray Kavukcuoglu, David Silver, Alex Graves, Ioannis Antonoglou, Daan Wiestra, Martin Riedmiller]
year: 2013
venue: NIPS 2013 Deep Learning Workshop
resource: https://arxiv.org/abs/1312.5602
tags: [reinforcement-learning, deep-learning, dqn, games, agents]
timestamp: 2026-06-14T00:00:00Z
---

# DQN (Deep Q-Network)

## Summary

Demonstrated that a single deep neural network could learn to play **seven Atari 2600 games** directly from raw pixel inputs, reaching human-level performance on three of them — with no game-specific engineering. Combined deep learning ([AlexNet](../foundations/alexnet.md)-style CNNs) with Q-learning, using two key innovations to stabilize training.

## Key Contributions

- **Deep RL from pixels** — a CNN processes raw game frames and outputs Q-values for each possible action, learning entirely through reward signals (game score)
- **Experience replay** — stores transitions in a replay buffer and trains on random mini-batches, breaking temporal correlations that destabilize neural network training
- **Target network** — a periodically-updated copy of the Q-network provides stable targets, preventing oscillation and divergence
- **One architecture, multiple games** — the same network architecture and hyperparameters worked across Breakout, Pong, Space Invaders, etc.

## Why It Matters

DQN kicked off the deep reinforcement learning revolution, leading to AlphaGo (2016) and AlphaFold (2020). The experience replay and target network techniques are still standard. More broadly, it demonstrated that general deep learning methods could solve sequential decision-making problems — a prerequisite for the agentic AI systems studied in your courses.

## Connections

- Uses CNN architecture pioneered by [AlexNet](../foundations/alexnet.md) for visual processing
- Another vindication of [The Bitter Lesson](../scaling/the-bitter-lesson.md) — a general learning method with more compute beat hand-engineered game-specific AI
- The sequential decision-making framework connects to [ReAct](../agents/react.md)'s agent loop
- PPO (used in [InstructGPT](../language-models/instruct-gpt.md)'s RLHF) descended from the RL lineage DQN established
- Relevant to MIT 6.S191 (deep learning fundamentals) and the agent-focused courses
