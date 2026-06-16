---
type: Lecture Notes
title: "Towards Safe & Secure Agentic AI"
course: llm-agents-sp25 Advanced Large Language Model Agents
university: UC Berkeley
lecture_id: "12"
video: https://youtube.com/watch?v=ti6yPE2VPZc
tags: [AI-safety, AI-security, prompt-injection, agent-attacks, privilege-separation, formal-verification, AgentPoison, DataSentinel, Progent]
timestamp: 2026-06-15T00:00:00Z
---

# Towards Safe & Secure Agentic AI

**Course:** Advanced Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=ti6yPE2VPZc)

## TL;DR
Dawn Song (UC Berkeley) presents a comprehensive overview of safety and security challenges in agentic AI systems. She distinguishes AI safety (preventing system harm to environment) from AI security (protecting system from external attacks), covering the full attack surface of agentic systems: supply chain attacks, prompt injection, tool misuse, and data poisoning. Defense mechanisms include privilege separation (Progent), anomaly detection (DataSentinel), information flow tracking, and formal verification. The lecture emphasizes that adversarial considerations are essential — history shows attackers always follow new technology.

## Key Takeaways
- AI safety (prevent harm to environment) vs AI security (protect system from attackers) — both are essential and interrelated
- Agentic AI has a vastly expanded attack surface compared to standalone LLMs: model, input, tool, output, and environment vulnerabilities
- Prompt injection remains the most critical threat: untrusted data in prompts can hijack agent behavior
- Supply chain attacks: models themselves can contain backdoors, poisoned weights, or malicious code
- AgentPoison: adversarial attacks that poison agent memory/RAG databases to trigger malicious behavior on specific queries
- Progent: programming-language-inspired privilege separation for agent systems — restrict tool access per agent component
- DataSentinel: fine-tuned detector for game-theoretic detection of prompt injection attacks
- Information flow tracking ("taint tracking") monitors how data moves through agent systems to prevent privacy leakage
- Formal verification for agentic systems: prove correct behavior under all possible inputs — a major open challenge

## Detailed Notes

### [00:00-10:00] AI Risk Landscape
International AI Safety Report (led by Yoshua Bengio, 100+ researchers, 30 countries). Attackers always follow new technology — with AI controlling more systems, stakes are higher. AI safety = prevent system harm to environment; AI security = protect system from external exploitation.

### [10:00-25:00] Agentic AI Attack Surface
Walk-through of hybrid agentic system vulnerabilities at each step: (1) Model deployment: supply chain attacks, backdoors, poisoned weights. (2) User request: malicious inputs, untrusted data sources. (3) Prompt assembly: insufficient input sanitization allows prompt injection. (4) Model interaction: generated outputs can contain malicious actions, unauthorized tool access. (5) Environment: state changes, irreversible actions, privacy leakage.

### [25:00-50:00] Specific Attacks
Prompt injection: direct (user injects malicious instructions) and indirect (third-party content contains hidden instructions). AgentPoison: optimized adversarial strings poisoned into RAG knowledge bases that trigger targeted malicious agent behavior. Jailbreaking: bypassing safety guardrails through adversarial prompts. Tool misuse: agents accessing tools beyond their intended scope.

### [50:00-80:00] Evaluation and Risk Assessment
Agent benchmarks for safety evaluation. Red-teaming approaches for agentic systems. Risk assessment frameworks considering both endogenous (agent incompetence) and exogenous (adversarial) risks.

### [80:00-110:00] Defense Mechanisms
Progent: privilege separation inspired by OS security — each agent component gets minimal tool/data access needed. DataSentinel: game-theoretic prompt injection detection using fine-tuned classifiers. Information flow tracking: monitor data movement through system to detect unauthorized access and privacy leakage. Formal verification: prove system behaves correctly under all inputs — major open challenge for hybrid agentic systems.

## Notable Quotes
- "History has shown that attackers always follow the footsteps of new technology development, sometimes even leads it"
- "As AI becomes more capable, the consequence of misuse by attackers will become more severe"
- "Alignment mechanisms need to be resilient and secure against attacks"

## Concepts Introduced
- [[AI Safety vs AI Security]]
- [[Prompt Injection (Direct and Indirect)]]
- [[AgentPoison]]
- [[Progent (Privilege Separation for Agents)]]
- [[DataSentinel]]
- [[Supply Chain Attacks on AI]]
- [[Information Flow Tracking for Agents]]
- [[Agentic AI Attack Surface]]

## Connections to Other Lectures
- Lecture 03 (Yu Su) raised agent safety concerns and attack surfaces
- Lecture 06 (Salakhutdinov) demonstrated adversarial web agent hijacking
- Lecture 05 (Sutton) covers AI for vulnerability detection — the offensive counterpart

## Open Questions
- How to scale formal verification to complex multi-agent systems with tool use?
- Can privilege separation prevent all classes of prompt injection, or are there inherent limitations?
- How to balance agent capability with safety constraints — overly restricted agents may be useless?
- How to handle adversarial attacks that evolve in response to deployed defenses?
