---
type: Lecture Notes
title: "Multimodal Autonomous AI Agents"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "06"
video: https://youtube.com/watch?v=RPINOYM12RU
tags: [multimodal-agents, web-agents, Mind2Web, WebArena, VisualWebArena, tree-search, safety]
timestamp: 2026-06-15T00:00:00Z
---

# Multimodal Autonomous AI Agents

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=RPINOYM12RU)

## TL;DR
Ruslan Salakhutdinov (CMU/Meta) surveys multimodal autonomous AI agents, focusing on web navigation. He covers benchmark evolution (Mind2Web → WebArena → VisualWebArena), representation strategies (HTML, set-of-marks, coordinate-based), agent architectures, and tree search methods. Key findings: multimodal perception improves over text-only by ~2x; tree search can significantly boost performance but raises safety/irreversibility concerns; adversarial attacks can hijack agents through manipulated web content.

## Key Takeaways
- Web agents require both visual understanding and text/HTML processing — multimodal models outperform text-only by ~2x
- Set-of-marks representation (bounding boxes on clickable elements) provides useful visual grounding for agent actions
- Performance on WebArena is still far below human level (~18% vs ~78% for humans)
- Tree search improves agent performance but is impractical in real environments due to irreversible actions (purchases, account changes)
- Adversarial attacks can hijack web agents by embedding malicious instructions in image captions on web pages
- Agent robustness and safety are critical unsolved problems — 80% accuracy is unacceptable for booking flights or making purchases

## Detailed Notes

### [00:00-20:00] Introduction and Motivation
2025-2026 as the year of agents. Agents should automate laborious computer tasks (AWS setup, slide creation, Excel operations). Focus on web agents: foundation models + text understanding + visual encoding.

### [20:00-45:00] Benchmarks and Representations
Mind2Web: first large-scale web agent benchmark with real websites. WebArena: self-hosted web environment for reproducible evaluation. VisualWebArena: adds visual understanding requirements. Three representation types: HTML (cluttered), set-of-marks (bounding boxes with IDs), coordinate-based (predict click coordinates).

### [45:00-75:00] Agent Architectures and Tree Search
Agent loop: observe state → generate chain-of-thought → predict action (click, type, scroll). Tree search for language model agents: maintain search frontier with value estimates, backtrack to explore alternatives. Significant performance gains but high computational cost and safety concerns.

### [75:00-79:00] Safety and Adversarial Concerns
Adversarial image captioning can hijack agents — modified images cause captioning system to inject malicious instructions. Claude's computer use: accidental wrong actions lead to unrecoverable states (stopped recordings, browsed Yellowstone photos during coding). Need for human-in-the-loop and robust error recovery.

## Notable Quotes
- "I don't want a system that 80% books the right stuff and 20% books the wrong planes for me — that's unacceptable"
- "Claude accidentally took a break from our coding demo and began to use photos of Yellowstone National Park"

## Concepts Introduced
- [[Mind2Web]]
- [[WebArena]]
- [[VisualWebArena]]
- [[Set-of-Marks Representation]]
- [[Tree Search for Web Agents]]
- [[Adversarial Web Agent Attacks]]

## Connections to Other Lectures
- Lecture 03 (Yu Su) introduces WebDreamer as model-based planning alternative to tree search
- Lecture 07 (Caiming Xiong) extends multimodal agent work with AGUVIS and OSWorld
- Lecture 12 (Dawn Song) covers adversarial attacks on agents in depth

## Open Questions
- How to build reliable error recovery for agents that take irreversible actions?
- Can coordinate-based action prediction eliminate the need for HTML parsing entirely?
- How to defend against adversarial content injection on web pages targeting AI agents?
