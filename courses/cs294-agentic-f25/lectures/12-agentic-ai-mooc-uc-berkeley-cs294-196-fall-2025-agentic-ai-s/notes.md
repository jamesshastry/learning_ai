---
type: Lecture Notes
title: "Agentic AI Safety & Security"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "12"
video: https://youtube.com/watch?v=CvZDJxd4LKM
tags: [safety, security, attacks, prompt-injection, defense, risk-assessment, misuse, cyber-security]
timestamp: 2026-06-15T00:00:00Z
---

# Agentic AI Safety & Security

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=CvZDJxd4LKM)

## TL;DR
Dawn Song (UC Berkeley) presents a comprehensive framework for agentic AI safety and security. She covers the relationship between AI safety and security, the expanded attack surface of hybrid agent systems compared to traditional software, a taxonomy of attacks (prompt injection, data poisoning, privilege escalation), evaluation/risk assessment methodologies, defense strategies, and the dual-use risk of AI agents in cybersecurity offense.

## Key Takeaways
- AI safety (preventing system harm to external world) and AI security (protecting system from external threats) are distinct but interrelated — alignment must be resilient to adversarial attacks
- Agentic AI systems are hybrid systems: traditional software + neural components (LLMs), creating unique attack surfaces at their intersection
- Attack surface increases along every flexibility dimension: workflow dynamism, action space, tool diversity, memory persistence, autonomy level
- Six model output threat vectors: user-facing content (info leakage), parameters for further invocation (compounding errors), branch conditions (altered control flow), function call parameters (SQL injection, SSRF), direct code execution (arbitrary code execution)
- The security goals CIA triad (Confidentiality, Integrity, Availability) extends to include AI-specific targets: model parameters, prompts, interaction history, API keys
- Agentic AI cyber-offense capabilities are growing rapidly — AI agents can autonomously discover and exploit vulnerabilities
- International AI Safety Report (Bengio et al., ~100 scholars from 30 countries) lays out the broad risk spectrum

## Detailed Notes

### 00:00 — Context and Motivation
Year of agents + rapid AI advancement (ARC-AGI 2 broken). History shows attackers always follow new technology. As AI controls more systems, attack incentives and consequences both increase. International AI Safety Report provides framework.

### 01:56 — Safety vs Security Definitions
AI safety: preventing harm to external environment. AI security: protecting system from external exploitation. Safety needs to consider adversarial settings — alignment mechanisms must be resilient and secure against malicious attacks.

### 03:18 — Agentic AI System Architecture
Agent systems are hybrid: traditional software (symbolic components) + neural components (LLMs). Walk-through: host deploys model → user sends request → system processes → model invoked → model interacts with system → system interacts with external world → response to user → continuous execution.

### 07:00 — Agent Design Space Taxonomy
Dimensions: workflow (static chatbot → fully dynamic autonomous), input space, action space (no actions → read → write/execute), tools (none → static → dynamic discovery), memory (none → transient → persistent), autonomy (human-in-loop → fully automated), UI (text → interactable interfaces). Each dimension's increase in flexibility increases attack surface.

### 11:00 — Security Goals
CIA triad extended for agentic AI: Confidentiality (system secrets, user data, model parameters, prompts), Integrity (model parameters, data, system state), Availability (model performance, service reliability). Additional target: AI safety (preventing harm to external world).

### 14:00 — Attack Surface Analysis
Model outputs as attack vectors: (1) external-facing content → info leakage, unsafe content; (2) parameters for further model calls → compounding errors; (3) branch/jump conditions → unexpected behavior; (4) function call parameters → SQL injection, SSRF; (5) direct code execution → arbitrary code execution. Each output pathway creates a distinct attack chain.

### 15:10 — Model Security Levels
Vulnerable to: prompt engineering attacks, prompt leakage, hallucination-induced unexpected behavior, embedded backdoors from data poisoning. Multiple vulnerability layers compound in agentic systems.

### 20:00 — Defense Strategies
Input validation/sanitization, output filtering, principle of least privilege for tool access, sandboxing execution environments, monitoring and anomaly detection, human-in-the-loop for critical actions, red-teaming and continuous security assessment.

### 25:00 — Cyber Security Misuse Risks
AI agents can autonomously discover vulnerabilities, generate exploits, and conduct attacks. Dual-use nature means defensive AI capabilities directly translate to offensive capabilities. The community must develop responsible disclosure frameworks for AI-discovered vulnerabilities.

## Notable Quotes
- "History has shown that attackers always follow the footsteps of new technology development — or sometimes even lead."
- "As AI becomes more and more capable, the consequence of misuse by attackers will also become more and more severe."
- "The increase in flexibility of the agent along each dimension also increases the attack surface."
- "The overall agentic system safety and security is much more complex than just the model level."

## Concepts Introduced
- [[Hybrid Agent System]] — System combining traditional software with neural (LLM) components
- [[Agent Attack Surface]] — Set of potential vulnerability points in agentic AI systems
- [[CIA Triad for AI]] — Confidentiality, Integrity, Availability extended to AI-specific targets
- [[Prompt Injection]] — Attack that manipulates model behavior via crafted inputs
- [[Model Output Attack Vectors]] — Six pathways through which model outputs can enable attacks

## Connections to Other Lectures
- Lecture 09 (Clay Bavor) discusses practical guardrail challenges in deployed agents
- Lecture 03 (Jiantao Jiao) covers verifiable agents — verification as implicit defense against incorrect outputs
- Lecture 04 (Evaluation) discusses benchmark hackability — related to adversarial robustness

## Open Questions
- How do we build agent systems that are secure-by-default rather than requiring extensive hardening?
- Can formal verification methods scale to provide safety guarantees for agentic AI systems?
- How do we balance agent flexibility (needed for utility) with attack surface reduction (needed for security)?
- What governance frameworks are needed for AI-discovered cybersecurity vulnerabilities?
