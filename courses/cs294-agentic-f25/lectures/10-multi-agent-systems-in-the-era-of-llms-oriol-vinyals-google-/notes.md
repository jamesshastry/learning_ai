---
type: Lecture Notes
title: "Multi-Agent Systems in the Era of LLMs"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "10"
video: https://youtube.com/watch?v=ntjOxjZMaac
tags: [multi-agent, AlphaStar, StarCraft, self-play, Gemini, gaming, population-based-training]
timestamp: 2026-06-15T00:00:00Z
---

# Multi-Agent Systems in the Era of LLMs

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=ntjOxjZMaac)

## TL;DR
Oriol Vinyals (Google DeepMind, AlphaStar lead) presents a retrospective connecting AlphaStar (StarCraft AI) to modern LLM agents. He shows how many current LLM agent challenges — partial observability, complex action spaces, multi-turn planning, self-play, population diversity — were already encountered and solved in game AI years ago. The lecture bridges classical RL agent design with the modern agent harness paradigm and explores multi-agent system implications.

## Key Takeaways
- AlphaStar used a single neural network to play StarCraft at grandmaster level — controlling strategy, tactics, and micro all from one model
- Ideas from game AI recirculate in LLM agents: self-play, population-based training, curriculum learning, partial observability handling
- The agent paradigm has shifted: from single environment with clear reward to agent harness + rich digital environment + human user
- StarCraft's challenges (partial observability, real-time continuous actions, strategic + tactical planning) map directly to agentic LLM challenges
- Population-based training was critical for AlphaStar — maintaining diverse strategies prevents rock-paper-scissors-style cycling
- The "environment" concept has become more diffuse in modern LLM agents: it includes computers, networks, tools, and human users
- Game AI deployed in the wild (BlizzCon 2019) provided unique insights about human-AI interaction

## Detailed Notes

### 00:00 — Retrospective Framing
Many current LLM agent ideas trace back to game AI. Vinyals recovered his AlphaStar slide deck to show how solutions from 6+ years ago remain relevant, and what current LLM agents still cannot do that game agents could.

### 02:00 — Agent Definition Evolution
Classical: agent with goals, observations, actions in single environment. Modern: agent harness controlling LLM calls, interacting with rich environments (digital computers, networks, tools) and human users. The loop is no longer simple.

### 05:25 — StarCraft as AI Domain
Real-time strategy game with partial observability, continuous action space, resource management, strategic + tactical planning. Pioneered esports in South Korea. Seemed impossible for a single neural net in 2011; AlphaStar achieved grandmaster in 2019.

### 09:29 — AlphaStar Achievement
Reached top-100 (grandmaster) ranking by playing online anonymously. Deployed at BlizzCon 2019 for public exhibition matches including against professional player Serral. First DeepMind AI system deployed "in the wild."

### 12:00 — Single Neural Network Design
AlphaStar was trained as one network issuing all commands — from high-level strategy to individual unit micro-management. This contrasts with modular approaches and parallels the trend toward end-to-end LLM agents.

### 15:00 — Population-Based Training
Critical insight: maintaining a diverse population of strategies prevents rock-paper-scissors dynamics. If you only train against one opponent style, you become vulnerable to others. Population diversity is essential for robust agents.

### 20:00 — Connections to Modern LLM Agents
Imitation learning from human replays → SFT on demonstrations. Self-play → RL with verifiable rewards. Population diversity → ensemble/debate approaches. Partial observability → context window limitations. These parallels suggest game AI techniques may unlock LLM agent improvements.

## Notable Quotes
- "Many of the current issues but also solutions that we're using in modern LLMs trace back further before."
- "It's useful to revisit these ideas to see them with perspective and also realize what are the things that we did back then that currently we can't do at the same level in LLMs."
- "Imagine playing video games at work. That was pretty fun."

## Concepts Introduced
- [[Population-Based Training]] — Maintaining diverse strategy populations to prevent cycling
- [[AlphaStar]] — DeepMind's StarCraft agent achieving grandmaster via single neural net
- [[Agent Harness]] — Orchestration layer controlling LLM calls and environment interaction
- [[Partial Observability in Agents]] — Handling incomplete state information in decision making
- [[Imitation Learning to RL Pipeline]] — Pre-train on demonstrations then improve via self-play

## Connections to Other Lectures
- Lecture 06 (Noam Brown) covers game-theoretic foundations of self-play and equilibrium
- Lecture 11 (Peter Stone) continues the embodied agent perspective with robotics
- Lecture 01 (Yann Dubois) covers the SFT→RL pipeline that parallels imitation→self-play

## Open Questions
- Can population-based training techniques from game AI improve LLM agent robustness?
- How do we handle the much larger and more ambiguous action spaces of LLM agents vs game agents?
- What game AI techniques are we currently underutilizing in the LLM agent paradigm?
