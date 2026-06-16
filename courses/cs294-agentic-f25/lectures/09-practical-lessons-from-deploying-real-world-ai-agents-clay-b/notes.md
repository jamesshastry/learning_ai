---
type: Lecture Notes
title: "Practical Lessons from Deploying Real-World AI Agents"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "09"
video: https://youtube.com/watch?v=sfJM4LaiYsM
tags: [deployment, customer-agents, enterprise, outcomes-pricing, guardrails, production]
timestamp: 2026-06-15T00:00:00Z
---

# Practical Lessons from Deploying Real-World AI Agents

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=sfJM4LaiYsM)

## TL;DR
Clay Bavor (Sierra, ex-Google) shares hard-won lessons from deploying customer-facing AI agents at scale across hundreds of companies serving hundreds of millions of customers. Key insights: building agents is an iceberg problem (90% of complexity is below the surface), outcomes-based pricing aligns incentives, conversation is the universal UI, and the 1997 analogy — we are still in the very early days of getting agents to work reliably.

## Key Takeaways
- Three categories of agents: personal assistants (ChatGPT), role-based (coding, legal), and customer-facing (Sierra's focus)
- Agents will collapse multi-channel support (phone, chat, email) into a single AI that meets customers wherever they are
- Outcomes-based pricing: Sierra only charges when an agent successfully resolves a customer's problem — deeply aligns incentives
- Building agents is an iceberg: model selection is the tip; below the surface are version control, release management, observability, hallucination prevention, compliance (financial/healthcare), latency, prompt injection defense, and more
- Conversation is the new UI — the interface we are all born with, requiring no learning
- Current state feels like "1997 for building agents" — early, messy, but with enormous potential
- Real-world agents handle everything from returning shoes to sending satellite signals from space

## Detailed Notes

### 00:00 — Sierra Overview
Founded March 2023 by Bavor and Bret Taylor (Salesforce co-CEO, OpenAI board chair). Works with hundreds of companies including Fortune 10/20/100. Agents handle chat, voice, email for OluKai (shoes), ADT (home security), SiriusXM (satellite radio).

### 02:55 — Three Categories of Agents
Personal agents (ChatGPT, Gemini), role-based agents (Cursor, Harvey), customer-facing agents (Sierra). Every business will eventually have a customer-facing agent for product recommendations, troubleshooting, subscription management, and more.

### 05:00 — Channel Collapse
Companies currently have separate teams for phone, chat, and email support. These will collapse into a single agent deployed everywhere. Teams will rebrand as "AI architects" who shape agent behavior.

### 06:29 — Conversation as Interface
Natural conversation is the UI — no apps to navigate, no menus to learn. This is a genuine breakthrough for business-customer interaction.

### 06:55 — Outcomes-Based Pricing
New business model: pay only for successful resolutions. Unlike SaaS subscriptions or consumption-based pricing, this deeply aligns Sierra's incentives with customer success.

### 08:03 — The Iceberg Problem
Engineers think building an agent = choose model + add RAG + connect APIs. Reality: need version control, release management, observability, hallucination prevention, compliance guardrails, latency optimization, accent/tonality handling, prompt injection defense, and much more.

### 09:47 — The 1997 Analogy
Current agent development feels like building websites in 1997 — we know the potential is enormous but the tools and best practices are primitive. Rapid iteration and learning from production failures is essential.

## Notable Quotes
- "We think that agents are to AI as the website was to the internet and apps are to mobile."
- "When you put your scuba tanks on and go under the surface of the ocean, you discover there's just like a whole lot of stuff that you need to get right."
- "Today, it very much feels like the 1997 era for building agents."
- "Conversation is the interface we're all born with. We don't have to think about using it."

## Concepts Introduced
- [[Outcomes-Based Pricing]] — Charging only for successful agent resolutions
- [[Customer-Facing Agent]] — AI agent deployed as a company's customer interface
- [[Channel Collapse]] — Unification of phone/chat/email into a single agent
- [[Agent Iceberg Problem]] — Vast hidden complexity beneath simple agent interfaces
- [[AI Architect]] — New role in companies that shapes and manages agent behavior

## Connections to Other Lectures
- Lecture 02 (Yangqing Jia) covers infrastructure challenges; Bavor shows application-layer challenges
- Lecture 12 (Dawn Song) covers the security concerns Bavor mentions (prompt injection, compliance)
- Lecture 05 (Weizhu Chen) covers training-side challenges; Bavor shows deployment-side challenges

## Open Questions
- How do outcomes-based pricing models handle edge cases and ambiguous "resolution" definitions?
- What is the right balance between agent autonomy and human escalation in regulated industries?
- How do customer-facing agents maintain brand voice and consistency across millions of interactions?
