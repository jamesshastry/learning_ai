---
type: Lecture Notes
title: "Agents for Software Development"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "06"
video: https://youtube.com/watch?v=f9L9Fkq-8K4
tags: [software-engineering, SWE-bench, coding-agents, OpenHands, agent-computer-interface]
timestamp: 2026-06-15T00:00:00Z
---

# Agents for Software Development — Graham Neubig (CMU)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=f9L9Fkq-8K4)

## TL;DR
Graham Neubig presents the landscape of AI agents for software development, covering the SWE-bench benchmark for real-world GitHub issue resolution, the critical importance of Agent-Computer Interface (ACI) design, and the OpenHands open-source platform. He demonstrates that interface design matters as much as model capability, discusses CodeAct for action representation, and highlights challenges including benchmark contamination, human-agent interaction modes, and evaluation beyond pure coding.

## Key Takeaways
1. **Software is eating the world, AI is eating software:** Agents for software development could be the most impactful AI application since nearly every industry depends on software.
2. **SWE-bench is the gold standard:** Real GitHub issues with automated verification through test suites provide rigorous evaluation — but contamination is a growing concern.
3. **Agent-Computer Interface (ACI) design matters enormously:** SWE-agent showed that custom search/edit commands (e.g., showing 10 results at once) dramatically improve performance without changing the underlying model.
4. **CodeAct represents actions as executable code:** Using Python code instead of JSON tool calls enables more flexible, composable agent behavior with access to the full Python ecosystem.
5. **Human-agent interaction is underexplored:** Interactive modes where humans can watch, pause, and redirect agents may be more effective than fully autonomous operation, but lack evaluation benchmarks.
6. **Benchmark contamination is real:** LiveCodeBench shows some models overfit to HumanEval; temporal data splits are essential for honest evaluation.

## Detailed Notes

### Why Software Development Agents Matter [00:00–03:00]
- Marc Andreessen's "Software is eating the world" (2011) — every major business runs on software
- Software development is uniquely suited for AI agents: well-defined tasks, automated verification (tests), rich textual environment

### Coding Benchmarks & Evaluation [03:00–22:00]
- HumanEval/MBPP: function-level generation with test cases — simple but widely used
- SWE-bench: resolve real GitHub issues by generating patches; 2294 instances from 12 Python repos
- SWE-bench Verified: human-validated subset addressing noisy test cases
- LiveCodeBench: continuously updated to prevent contamination; reveals overfitting
- Design2Code: multimodal coding from website screenshots
- Key challenge: training data contamination as benchmarks become popular

### Agent-Computer Interface Design [22:00–35:00]
- SWE-agent: custom commands for file search (show 10 results), editing (linting feedback), navigation
- Interface design can matter more than model improvements — same model, different interface, different results
- Humans and models have different interface needs: models benefit from more context at once (larger working memory)
- OpenHands sandbox: Docker-based execution environment with browser, terminal, file editor

### CodeAct & Action Representation [35:00–45:00]
- Traditional approach: JSON-based tool calls (restrictive, limited composability)
- CodeAct: actions as executable Python code — enables loops, conditionals, variable reuse, library access
- Agent can install packages, run experiments, chain operations naturally
- More natural for software development tasks than predefined tool schemas

### OpenHands Platform [45:00–55:00]
- Open-source coding agent platform (formerly OpenDevin); integrates browsing, coding, execution
- Micro-agent architecture: specialized agents for different subtasks
- Supports multiple LLM backends; sandboxed Docker execution
- Community-driven development with focus on practical usability

### Open Challenges [55:00–01:00:22]
- Human-agent interaction: autonomous vs. interactive vs. guided modes — no good benchmarks
- Broader software tasks beyond coding: project management, testing, deployment
- Multi-modal coding: generating code from visual designs
- Evaluation of the full software development lifecycle

## Notable Quotes
1. "More and more major businesses and industries are being run on software — and AI agents for software could be incredibly impactful."
2. "The interface matters as much as the model — same model, different interface, dramatically different performance."
3. "We really don't know the best modality for human-agent interaction and we don't have any good evaluation benchmarks to evaluate it."

## Concepts Introduced
- [[SWE-bench]], [[Agent-Computer Interface]], [[OpenHands]], [[CodeAct]], [[SWE-agent]]

## Connections to Other Lectures
- Lecture 02 (Shunyu Yao) introduces the agent-environment interface concept that ACI specializes for coding
- Lecture 05 (Omar Khattab) provides compound AI system frameworks applicable to multi-step coding pipelines
- Lecture 07 (Nicolas Chapados) extends agent benchmarking to enterprise workflows beyond software

## Open Questions
1. What is the optimal human-agent interaction paradigm for software development?
2. How do we prevent benchmark contamination while maintaining meaningful evaluation?
3. Can coding agents handle the full software lifecycle (design, implementation, testing, deployment)?
