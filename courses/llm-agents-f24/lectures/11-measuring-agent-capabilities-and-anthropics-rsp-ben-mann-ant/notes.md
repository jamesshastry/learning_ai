---
type: Lecture Notes
title: "Measuring Agent Capabilities and Anthropic's RSP"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "11"
video: https://youtube.com/watch?v=6y2AnWol7oo
tags: [safety, evaluation, responsible-scaling, agent-capabilities, computer-use, Anthropic]
timestamp: 2026-06-15T00:00:00Z
---

# Measuring Agent Capabilities and Anthropic's RSP — Ben Mann (Anthropic)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=6y2AnWol7oo)

## TL;DR
Ben Mann, Anthropic co-founder, presents the Responsible Scaling Policy (RSP) — a framework tying AI deployment decisions to empirically measured capability thresholds (ASL levels 1-4+). He covers how Anthropic evaluates dangerous capabilities (CBRN weapons, cyber attacks, autonomous replication), the development of computer-use agents, and challenges of scaling AI governance including the novel Long-Term Benefit Trust for corporate control.

## Key Takeaways
1. **Measurement-based safety:** Deployment decisions should be tied to empirically measured capability thresholds, not arbitrary timelines or subjective judgments.
2. **ASL levels define escalating safety tiers:** ASL-1 (no meaningful risk) through ASL-4+ (expert-level across domains), with each level requiring specific safety measures before deployment.
3. **Four dangerous capability categories:** CBRN (weapons), cyber attacks, autonomous replication, and model autonomy — each evaluated through specific elicitation frameworks.
4. **Computer use agents are early but promising:** Claude can interact with desktop environments via screenshots and mouse/keyboard actions, but reliability is far below human-level.
5. **Elicitation vs. capability distinction:** A model may have latent dangerous capabilities that current elicitation techniques fail to reveal — mandatory if-then commitments help manage this uncertainty.
6. **Long-Term Benefit Trust:** Anthropic's novel governance structure that cedes corporate control to non-financially-interested board members as AI becomes more powerful.

## Detailed Notes
The lecture covers Anthropic's founding and research history, the motivation for measurement-based safety (vs. precautionary principle vs. unrestricted development), the ASL framework with detailed descriptions of each level, evaluation methodologies for CBRN/cyber/autonomy capabilities, the development story of Claude's computer use feature, challenges in building reliable agent evaluations, and the governance innovations including the Long-Term Benefit Trust.

## Notable Quotes
1. "Only an evil Clippy would try to break out of this box. But when you're doing sampling, there is a chance that you'll sample extremely low probability events."
2. "Having the right financial incentives for the people who have control over potentially one of the most powerful pieces of technology of our time is going to be really important."
3. "We don't think that we're there today — we haven't seen evidence that deceptive behavior would happen in the wild yet."

## Concepts Introduced
- [[Responsible Scaling Policy]], [[ASL Levels]], [[Computer Use Agent]], [[Capability Evaluation]], [[Long-Term Benefit Trust]]

## Connections to Other Lectures
- Lecture 12 (Dawn Song) provides complementary coverage of AI safety from the adversarial attack perspective
- Lecture 02 (Shunyu Yao) discusses agent robustness that RSP aims to measure and govern
- Lecture 06 (Graham Neubig) covers computer-use in the coding domain that Anthropic extends broadly

## Open Questions
1. How do we ensure elicitation techniques are comprehensive enough to reveal all dangerous capabilities?
2. Can ASL levels keep pace with rapid capability advances?
3. Will other AI companies adopt similar measurement-based safety frameworks?
