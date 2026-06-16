---
type: Lecture Notes
title: "Safe AI Agents + Evidence-based AI Policy"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "12"
video: https://youtube.com/watch?v=QAgR4uQ15rc
tags: [safety, adversarial-attacks, AI-policy, trustworthy-AI, agent-safety, jailbreaking]
timestamp: 2026-06-15T00:00:00Z
---

# Safe AI Agents + Evidence-based AI Policy — Dawn Song (UC Berkeley)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=QAgR4uQ15rc)

## TL;DR
Dawn Song provides a comprehensive overview of AI safety challenges for LLM agents, covering the full spectrum of adversarial attacks (jailbreaking, prompt injection, backdoors, privacy attacks), agent-specific safety concerns (expanded attack surface from tools, credentials, and real-world actions), and proposes a science-based multi-stakeholder approach to AI policy through the understanding-ai-safety.org initiative.

## Key Takeaways
1. **Agent safety is fundamentally harder than model safety:** Agents can take real-world actions through tools and services, making adversarial attacks more dangerous than text-only model attacks.
2. **Jailbreak attacks continuously evolve:** Transfer attacks from open-source to closed-source models, cipher-based encoding, many-shot jailbreaking, and multi-modal attacks persistently bypass safety alignment.
3. **Prompt injection is critical for agents:** Malicious instructions embedded in retrieved content, tool outputs, or user queries can hijack agent behavior — the agent safety analog of code injection.
4. **Safety alignment is fragile:** Adversarial fine-tuning with very few examples can completely break safety training; safety is a surface-level behavior rather than a deep property.
5. **Representation engineering offers new control mechanisms:** Directly manipulating internal model representations provides a different approach to model control beyond RLHF-based alignment.
6. **Evidence-based AI policy is needed:** Multi-stakeholder consensus-building through empirical measurement, with ~200 institutions contributing to a blueprint for AI governance responses.

## Detailed Notes
The lecture covers the broad spectrum of AI risks (hallucination, bias, toxicity, privacy, adversarial attacks), detailed taxonomy of jailbreak attacks and defenses, privacy risks including training data extraction and membership inference, agent-specific safety challenges (credential misuse, tool abuse, cascading failures), the DecodingTrust benchmark for comprehensive trustworthiness evaluation, representation engineering for model control, and the understanding-ai-safety.org initiative for evidence-based AI policy with multi-stakeholder convenings.

## Notable Quotes
1. "When agents can actually take real-world actions, adversarial attacks can become even more severe."
2. "Safety alignment can be very easily broken through adversarial fine-tuning — just including very few adversarial examples during fine-tuning."
3. "We hope to conduct a process with multi-stakeholder convenings to build this blueprint of future AI policy."

## Concepts Introduced
- [[Agent Safety]], [[Jailbreak Attacks]], [[Prompt Injection]], [[Representation Engineering]], [[DecodingTrust]], [[Evidence-Based AI Policy]]

## Connections to Other Lectures
- Lecture 11 (Ben Mann) covers Anthropic's RSP approach to safety governance that this lecture's policy proposals complement
- Lecture 01 (Denny Zhou) discusses LLM limitations that create the vulnerabilities this lecture analyzes
- Lecture 02 (Shunyu Yao) introduces agent architectures whose safety properties this lecture examines

## Open Questions
1. Can safety alignment ever be made robust against adversarial fine-tuning?
2. How do we defend against prompt injection in multi-tool agent systems?
3. What governance frameworks can keep pace with rapidly evolving AI capabilities and attacks?
