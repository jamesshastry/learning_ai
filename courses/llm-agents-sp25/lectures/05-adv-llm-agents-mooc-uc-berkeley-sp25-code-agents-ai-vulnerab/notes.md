---
type: Lecture Notes
title: "Code Agents & AI Vulnerability Detection"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "05"
video: https://youtube.com/watch?v=JCk6qJtaCSU
tags: [code-agents, SWE-bench, security, vulnerability-detection, fuzzing, LLM-security]
timestamp: 2026-06-15T00:00:00Z
---

# Code Agents & AI Vulnerability Detection

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=JCk6qJtaCSU)

## TL;DR
Charles Sutton (Google DeepMind) covers two interrelated topics: coding agents (SWE-bench style systems for automated software engineering) and AI for computer security (vulnerability detection using LLMs). He argues for cross-disciplinary thinking — understanding both ML capabilities and the security domain deeply. Interactive tools (debuggers, sanitizers) substantially assist LLM agents in finding real-world security vulnerabilities.

## Key Takeaways
- Coding agents (SWE-bench) must handle entire repositories, not just single functions — requiring navigation, understanding, and multi-file editing
- The gap between benchmark performance and real-world utility remains large for coding agents
- For security vulnerability detection, interactive tools (fuzzers, sanitizers, debuggers) are critical — LLMs alone are insufficient
- Google's Big Sleep project demonstrated LLM agents finding real zero-day vulnerabilities in production software (SQLite)
- Cross-disciplinary knowledge (ML + security domain) is essential for building effective AI security tools
- The attack surface grows as AI systems become more capable — agents that browse the web are particularly vulnerable

## Detailed Notes

### [00:00-30:00] Coding Agents
Overview of SWE-bench and coding agent architectures. Discussion of how agents navigate codebases, localize bugs, generate patches, and verify fixes. Importance of tool use (search, file editing, test execution) in agent workflows. Current limitations in handling large, complex repositories.

### [30:00-60:00] AI for Computer Security
Motivation for using AI in security: huge codebase surface area, shortage of security experts. LLMs can assist in vulnerability detection, patch generation, and security analysis. Interactive tools (fuzzers, sanitizers, debuggers) provide critical external feedback that pure LLM reasoning cannot replace.

### [60:00-87:00] Big Sleep and Interactive Vulnerability Detection
From Naptime to Big Sleep: Google Project Zero's work on LLM agents for finding real vulnerabilities. Agent architecture: code browsing, hypothesis generation, targeted fuzzing, crash analysis. Successfully found a real vulnerability in SQLite that traditional fuzzers missed. Key insight: combining LLM reasoning with program analysis tools is more powerful than either alone.

## Notable Quotes
- "Your career is very long — technologies change and you want to learn how to change with them"
- "If you know only the machine learning part and you don't think deeply about what problem you're trying to solve, you're kind of missing a trick"
- "Interactive tools substantially assist LM agents in finding security vulnerabilities"

## Concepts Introduced
- [[SWE-bench]]
- [[Coding Agents]]
- [[Big Sleep (LLM Vulnerability Detection)]]
- [[Interactive Tool-Assisted Security]]
- [[Fuzzing with LLM Guidance]]

## Connections to Other Lectures
- Lecture 01 covers inference-time techniques that underlie coding agent reasoning
- Lecture 12 (Dawn Song) addresses broader AI safety/security concerns
- Lecture 04 (Tulu) covers code data in training recipes

## Open Questions
- Can LLM agents find vulnerability classes that are fundamentally beyond traditional fuzzing?
- How to scale interactive vulnerability detection across entire software ecosystems?
- What are the dual-use risks of making vulnerability detection more accessible via AI?
