---
type: Lecture Notes
title: "LLM Agents: History & Overview"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "02"
video: https://youtube.com/watch?v=RM6ZArd2nVc
tags: [agents, ReAct, reasoning, acting, memory, digital-automation]
timestamp: 2026-06-15T00:00:00Z
---

# LLM Agents: History & Overview — Shunyu Yao (Princeton)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=RM6ZArd2nVc)

## TL;DR
Shunyu Yao provides a comprehensive history and theoretical framework for LLM agents, defining the three levels of text agents, LM agents, and reasoning agents. He introduces ReAct as the key paradigm that synergizes reasoning and acting, explains how reasoning is a fundamentally new type of internal action with infinite space, discusses long-term memory as a form of learning, and outlines five future research directions: training, interface design, robustness, human-in-the-loop, and benchmarking.

## Key Takeaways
1. **Reasoning agents are fundamentally different:** Unlike symbolic AI or deep RL agents that use fixed representations, reasoning agents use natural language as an intermediate representation — an infinite action space that changes only the agent's own context.
2. **ReAct synergizes reasoning and acting:** Reasoning helps guide actions (planning, replanning, error recovery) while acting provides external knowledge and feedback to improve reasoning.
3. **Long-term memory enables a new form of learning:** Instead of gradient descent, agents can learn by updating language-based memories (reflections, code skills, event logs), persisting knowledge across tasks.
4. **Robustness matters more than capability:** Real-world deployment requires solving tasks reliably 1000/1000 times (fail@k), not just once out of 1000 (pass@k) — a fundamentally different challenge.
5. **Agent-computer interface design is an underexplored research area:** Optimizing environments for LLM agents (e.g., showing 10 search results at once vs. one at a time) can improve performance without changing the agent.

## Detailed Notes

### What is an LM Agent? [00:00–04:07]
- Three definitional levels: text agent (language observations and actions), LM agent (uses LMs to act), and reasoning agent (uses LMs to reason before acting)
- Historical text agents: rule-based (ELIZA, 1960s) and RL-based (text games) — both domain-specific and limited
- LLMs promise generality through next-token prediction on massive corpora

### The Paradigms of Reasoning and Acting [07:55–15:05]
- **Reasoning paradigm:** Chain-of-thought augments test-time compute but lacks external knowledge/tools
- **Acting paradigm:** Tool use, retrieval, code execution provide knowledge and computation but lack reasoning
- QA research revealed scattered, task-specific solutions; the need for unifying abstraction led to ReAct

### ReAct: Synergizing Reasoning and Acting [15:18–20:56]
- Core idea: interleave thought (reasoning) and action in a single trajectory
- Prompt consists of human-written example trajectories showing think-act-observe loops
- GPT-4 example: answering "Can I buy Apple, Nvidia, and Microsoft with $7 trillion?" via iterative Google searches
- Reasoning enables plan adjustment and error recovery when search results are unexpected
- Works across QA, games, household tasks — generalizes beyond question answering

### Reasoning as an Internal Action [23:00–25:40]
- Traditional agents: action space defined by environment (left, right, up, down)
- Reasoning agents: augmented action space includes "thinking" — infinite space of language
- Thinking changes only the agent's context/memory, not the external world
- This infinite internal action space enables inference-time scaling

### Long-Term Memory [26:14–35:20]
- Short-term memory = context window: append-only, limited size, limited attention, not persistent
- Long-term memory types: episodic (event logs in generative agents), semantic (reflections about others), procedural (code skills in Voyager)
- **Reflexion:** After task failure, agent reflects on mistakes and persists insights for future attempts — a new form of learning through language rather than gradient descent
- Language model weights themselves can be viewed as long-term memory (via fine-tuning)
- **KOALA framework:** Any agent can be expressed through memory (where info is stored), action space (what agent can do), and decision procedure (how to choose actions)

### New Applications: Digital Automation [43:49–52:00]
- LLM agents enable practical digital automation (code writing, web interaction, scientific discovery)
- WebShop: first large-scale web shopping environment built from 1M+ Amazon products
- SWE-bench: real-world software engineering tasks (resolve GitHub issues)
- CHEM-A: agents proposing new chromophores with physical lab synthesis feedback
- Before LLM agents, digital assistant benchmarks were synthetic grid-worlds

### Agent Paradigm History [38:23–43:25]
- Symbolic AI agents → Deep RL agents → LLM reasoning agents
- Key difference: symbolic agents use symbolic state, RL agents use neural embeddings, reasoning agents use language
- Language representation is general, requires minimal setup (prompting), and enables infinite-length reasoning

### Future Directions [54:57–01:08:26]
- **Training:** Build synergy between model training and agent capabilities; prompted agents generate trajectories for fine-tuning
- **Interface:** Design agent-optimized environments (SWE-agent showed search returning 10 results beats 1-at-a-time)
- **Robustness:** Pass@k vs. fail@k — τ-bench shows all models have decreasing robustness with more samples
- **Human-in-the-loop:** Agents interacting with humans (simulated users in τ-bench customer service)
- **Benchmarks:** Need more practical, scalable benchmarks reflecting real-world tasks

## Notable Quotes
1. "Reasoning is an internal action for agents and reasoning has a very special property because it's an infinite space of language."
2. "If you can solve something remarkable but if you cannot remember it, then you have to solve it again — it's really a shame."
3. "It's not really acting helping reasoning — obviously acting is helping reasoning to get realtime information, but also reasoning is constantly guiding the acting to plan and replan."
4. "The most important work is sometimes the most simple work. Simple is good because simple means general."
5. "What you care about is not can you solve it one time out of a thousand times — you care about whether you can solve it a thousand times out of a thousand times."

## Concepts Introduced
- [[ReAct]]
- [[Reasoning Agent]]
- [[Long-Term Memory]]
- [[Reflexion]]
- [[WebShop]]
- [[Digital Automation]]

## Connections to Other Lectures
- Lecture 01 (Denny Zhou) provides the reasoning foundation that ReAct builds upon
- Lecture 03 (Chi Wang) implements multi-agent conversations in AutoGen, extending the single-agent ReAct paradigm
- Lecture 06 (Graham Neubig) applies these agent concepts specifically to software development with SWE-agent and OpenHands
- Lecture 09 (Jim Fan) extends the embodiment and long-term memory ideas to robotics with Voyager

## Open Questions
1. How should we define the boundary between internal memory and external environment for digital agents?
2. Can language-based learning (Reflexion-style) match or exceed gradient-based fine-tuning?
3. What is the optimal balance between agent autonomy and human oversight in production systems?
4. How do we build benchmarks that properly evaluate robustness rather than just capability?
