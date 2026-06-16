---
type: Lecture Notes
title: "Class 1: Where's the Money in AI?"
course: MSE435 Economics of the AI Supercycle
university: Stanford
lecture_id: "01"
video: https://youtube.com/watch?v=-ubIUNA-zRA
tags: [ai-economics, supercycle, value-chain, consumer-ai, monetization]
timestamp: 2026-06-15T00:00:00Z
---

# Class 1: Where's the Money in AI?

**Course:** Economics of the AI Supercycle
**Video:** [YouTube](https://youtube.com/watch?v=-ubIUNA-zRA)

## TL;DR
Apoorv Agrawal (Altimeter) introduces the central question of the course: where does value accrue in the AI ecosystem? The AI value chain is shaped like an inverted triangle compared to cloud — semis (Nvidia) capture ~75% of revenue with the highest margins, while apps remain small. Unlike software's near-zero marginal cost, AI has expensive per-user economics. The course will explore whether and when this triangle flips, as it did for cloud over ~8 years. Consumer AI usage is growing but monetization lags behind social/utility apps, and ads may be the key unlock.

## Key Takeaways
- The AI ecosystem revenue (~$450B) is concentrated at the bottom of the stack (semis), opposite to the mature cloud ecosystem shape
- Software ate the world with near-zero marginal costs; AI's marginal cost per user is significant due to GPU compute requirements
- Nvidia captures ~$300B+ of AI revenue with ~75% gross margins, while app-layer margins range 0-30%
- The cloud ecosystem took ~8 years (AWS 2004 → Netflix migration 2010 → full shift 2012) to flip its triangle
- ChatGPT has ~1B users monetized at ~$10/user/year vs. Google at $100/user/year and Meta at $70/user/year
- Consumer AI is tracking closer to "niche app" scale (Spotify/Twitter) than "mandatory utility" scale (WhatsApp/Chrome)
- Ads may be critical for AI monetization — better intent data, logged-in users, stronger attribution
- ~40% of Nvidia's GPU fleet is used for inference, 60% for training; inference share expected to grow
- Every major tech supercycle (internet, mobile, cloud) had a dominant vertically integrated winner (Google, Apple, etc.)

## Detailed Notes

### [00:00-05:00] Course Introduction and Instructor Background
Apoorv Agrawal introduces himself — background at Palantir, Stanford grad school, now leads AI investing at Altimeter Capital ($15B+ AUM). Course is designed as 3 hours/week including readings, with guest speakers every class under Chatham House rules. Grading is 50% attendance, 50% final assignment.

### [05:00-12:00] The Central Question: The AI Value Chain Triangle
The core thesis of the course: the AI ecosystem is shaped like an inverted triangle compared to cloud. In cloud, apps/SaaS capture the most revenue (top-heavy). In AI, semis (primarily Nvidia) capture ~75% of all revenue. This is due to: (1) early stage of the cycle, (2) Nvidia's monopoly position, (3) fundamentally different economics where each AI user requires real compute cost. Unlike software where marginal distribution cost was near zero, AI applications face significant per-user costs from GPU inference.

### [12:00-18:00] When Does the Triangle Flip?
AWS took 8 years from first CapEx (2004) to full ecosystem maturity (2012). The AI triangle may stay inverted longer than expected due to hardware complexity. Two potential catalysts: (1) breakout success of an ASIC program (Google TPU, Meta MTIA, etc.) which would reprice the semis layer; (2) hyperscalers stopping their CapEx guidance increases, signaling the current equilibrium doesn't work. ASIC competition is the biggest potential disruptor of Nvidia's dominance.

### [18:00-24:00] Training vs. Inference Economics
Nvidia reports ~40% of GPU fleet used for inference, 60% for training. Training workloads are predictable and high-utilization; inference is bursty and follows human usage patterns (drops on holidays). The shift toward inference will be critical for the triangle to flip. On profitability, semis layer earns ~75% gross margin while apps range 0-30% — from a profitability lens the concentration is even more extreme.

### [24:00-31:00] Interactive Quiz
Class quiz covering AI industry knowledge — identifying companies by revenue hints. All correct answers are CEOs coming as guest speakers. Nvidia, Crusoe Energy identified as key companies.

### [31:00-39:00] Consumer AI Usage and Monetization
ChatGPT has surpassed "niche app" scale (Spotify, Twitter ~500M users) but hasn't reached "social app" scale (Instagram, TikTok ~1.5-2B users). The question is whether AI can reach "mandatory utility" scale (WhatsApp, Chrome ~3B+ users). Knowledge work may not be universal enough — not everyone actively asks questions of technology. The monetization gap: Google monetizes at ~$100/user/year, Meta at ~$70, ChatGPT at ~$10. Subscription alone won't close this; ads with superior intent understanding and attribution could be the unlock.

### [39:00-39:51] Preview and Wrap
Course will explore these themes across the full stack with speakers from Nvidia, Anthropic, OpenAI, infrastructure companies, and application builders over the next 9 weeks.

## Notable Quotes
- "Software ate the world because the marginal cost of running that software was close to zero. That is not the case with this new economic model of AI."
- "AWS started in 2004. AWS has its first customer in Netflix in 2010. Eight years from breaking ground, eight years from first CapEx investment cycle."
- "The most profitable part of the stack is the semis layer by a long shot. Nvidia's data center revenues earn at most margin of about 75%."
- "Half of you are going to start an AI company. The other half are going to fund it. At least you should know where to spend the series A money."
- "In 5 years everybody's going to ask you, 'Hey, did you see it coming? You were at the start of it.'"

## Concepts Introduced
- [[AI Value Chain Triangle]] — Revenue distribution across semis, infra, models, and apps
- [[Marginal Cost of Intelligence]] — Unlike software, each AI user has real compute cost
- [[Supercycle Comparison]] — Internet, mobile, cloud as analogies for AI's development trajectory
- [[Consumer AI Monetization]] — Subscription vs. ads models for AI applications
- [[CapEx Cycle Dynamics]] — Timing mismatch between infrastructure investment and application revenue
- [[Training vs Inference Split]] — How GPU fleet allocation between training and inference affects economics

## Connections to Other Lectures
- Lecture 02: Brad Gerstner and Sunny Mudra discuss inference economics and Groq/Nvidia dynamics
- Lecture 03: Chase Lochmiller (Crusoe) covers data center economics — the physical infrastructure behind the semis layer
- Lecture 04: Ali Ghodsi (Databricks) challenges whether the triangle will flip and argues value accrues to apps
- Lecture 05: Sachin Katti (OpenAI) details compute scaling and the revenue-compute correlation
- Lecture 06: Yash Bottle (Applied Compute) discusses post-training and enterprise model specialization

## Open Questions
- How long until the AI value chain triangle resembles the cloud ecosystem shape?
- Will ads or subscriptions dominate AI monetization?
- Can any ASIC program break Nvidia's ~75% gross margin dominance?
- Is knowledge work universal enough for AI to reach 3B+ user scale?
- What is the stable equilibrium of this industry — does it ever fully flip?
