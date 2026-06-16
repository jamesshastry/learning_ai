---
type: Lecture Notes
title: "Autonomous Agents: Embodiment, Interaction, and Learning"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "11"
video: https://youtube.com/watch?v=iDhzzugMOLA
tags: [robotics, embodiment, autonomous-agents, robot-soccer, reinforcement-learning, sim-to-real]
timestamp: 2026-06-15T00:00:00Z
---

# Autonomous Agents: Embodiment, Interaction, and Learning

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=iDhzzugMOLA)

## TL;DR
Peter Stone (UT Austin / Sony AI) presents the broader view of autonomous agents with emphasis on physical embodiment (robotics). He traces the agent concept through 30 years of AI research, demonstrates multi-agent robot soccer (RoboCup), and shows how sim-to-real transfer, reinforcement learning, and multi-agent coordination in embodied settings connect to and extend the current agentic AI paradigm. The lecture grounds the "agentic AI" buzzword in its deeper intellectual roots.

## Key Takeaways
- "Autonomous agent" has been a core AI concept for 30+ years — it is not a new buzzword
- An agent is an intelligent system interacting with an environment through sensors and effectors; a robot is an agent in the physical environment
- RoboCup goal: humanoid robot team beats World Cup champions by 2050 — requiring perception, cognition, and action
- Sim-to-real transfer is critical: train in simulation, deploy on physical hardware. Gap remains a major challenge
- Multi-agent coordination (teamwork, opponent modeling) is essential for embodied agents just as for LLM agents
- The "intelligent complete agent" has three modules: perception (sensing/modeling), cognition (planning/deciding), and action (executing)
- Robots recently played their first game alongside humans — showing both progress and remaining gaps

## Detailed Notes

### 00:00 — Broad View of Agents
Agent = intelligent system interacting with environment through sensors and effectors. Robot = agent in the physical environment. All robots are agents, not all agents are robots. This definition has been stable for 30+ years in AI research.

### 02:00 — Intelligent Complete Agent Architecture
Three modules: (1) Perception — sensing and modeling the world from raw sensors, (2) Cognition — planning, multi-agent coordination, opponent/teammate modeling, (3) Action — translating decisions into motor commands. This architecture applies to both software and physical agents.

### 05:00 — Research Philosophy
Core question (unchanged since 1998 PhD thesis): "To what degree can autonomous, intelligent agents learn in the presence of teammates and/or adversaries in real-time dynamic domains?" Publishes across autonomous agents, multi-agent systems, robotics, and reinforcement learning.

### 08:00 — Robot Soccer (RoboCup)
From Sony AIBO robots (20 years ago) to humanoid robots. Teams of fully autonomous robots sense, decide, and act without remote control. Goal: beat World Cup champions by 2050. Recent milestone: first human-vs-robot game at competition.

### 12:00 — Gran Turismo Racing (Sony AI)
Trained RL agent to race in Gran Turismo at superhuman level. Demonstrates transfer from simulation to a game with realistic physics. Published in Nature. Shows how sim-to-real and RL can produce expert-level embodied behavior.

### 18:00 — Sim-to-Real Transfer
Training in simulation is orders of magnitude cheaper than physical training. SLAC (Simulation-pretrained Latent Action Space) approach: learn latent action representations in simulation, fine-tune with limited real-world data. Critical for making robot learning practical.

### 25:00 — Multi-Agent Coordination
Robot teams must coordinate without central control — distributed sensing, distributed decision-making. Opponent modeling, role assignment, formation control all emerge from the multi-agent systems research tradition.

## Notable Quotes
- "This question was the core question of my PhD thesis back in 1998 and has appeared in almost every talk I've given since then. And it has included this term agent."
- "Autonomous agents have been a focus of study in AI for at least three decades — much longer than this year's buzzword of agentic AI."
- "The robot just turned around and kicked it between the RoboCup president's legs. I tried to get the robot to give me a hi-five afterwards; it didn't."

## Concepts Introduced
- [[Embodied Agent]] — Agent that operates in the physical world via sensors and actuators
- [[Sim-to-Real Transfer]] — Training in simulation and deploying on physical hardware
- [[RoboCup]] — International robot soccer competition targeting 2050 human-beating goal
- [[Intelligent Complete Agent]] — Agent with perception, cognition, and action modules
- [[SLAC]] — Simulation-pretrained Latent Action Space for efficient real-world learning

## Connections to Other Lectures
- Lecture 06 (Noam Brown) covers game-theoretic multi-agent foundations applied to software agents
- Lecture 10 (Oriol Vinyals) covers multi-agent systems from the gaming/simulation perspective
- Lecture 01 (Yann Dubois) covers the training pipeline; Stone shows embodied analogs

## Open Questions
- Can foundation models serve as universal perception/cognition modules for embodied agents?
- How do we bridge the sim-to-real gap as robot tasks become more complex and contact-rich?
- Will the RoboCup 2050 goal be achieved, and what will it take?
