---
type: Lecture Notes
title: "Class 2: The Economics of Inference"
course: MSE435 Economics of the AI Supercycle
university: Stanford
lecture_id: "02"
video: https://youtube.com/watch?v=4faCRNl9Bi4
tags: [inference, groq, nvidia, altimeter, compute-economics, tokens]
timestamp: 2026-06-15T00:00:00Z
---

# Class 2: The Economics of Inference

**Course:** Economics of the AI Supercycle
**Video:** [YouTube](https://youtube.com/watch?v=4faCRNl9Bi4)

## TL;DR
Brad Gerstner (Altimeter founder/CEO) and Sunny Mudra (Groq president, now at Nvidia) discuss the economics of inference, the Nvidia-Groq acquisition story, and why compute demand is accelerating. Key themes: inference demand will go 1 billion X; Groq's deterministic SRAM-based chip delivers 2.5x more tokens per watt when combined with Nvidia GPUs via NVLink Fusion; Anthropic added $10B in annualized revenue in a single month (March 2026), proving the AI business model works; the cost of inference has dropped ~99% in 2.5 years while willingness to pay has surged. We are moving from AI as "answers" to AI as "actions" via agents, which multiplies token consumption by orders of magnitude.

## Key Takeaways
- Groq was acquired by Nvidia for $20B after demonstrating NVLink Fusion prototype — only ~30 days from working demo to deal
- Groq's architecture is deterministic with a compiler that predetermines all calculations; uses SRAM (not HBM) for much higher memory bandwidth
- NVLink Fusion allows Groq chips to communicate with Nvidia GPUs, producing 2.5x more tokens for the same power footprint
- Anthropic went from $3.5B → $8B → $10.5B in annualized revenue across Jan/Feb/Mar 2026 — the "Oppenheimer moment" proving product-market fit
- OpenAI and Anthropic went from negative gross margins to very positive gross margins in ~2 years as inference costs dropped and intelligence improved
- Jensen's benchmark for Nvidia engineers: don't show up unless it's 100x improvement
- Inference cost has dropped ~99% over 2.5 years; three inputs drive unit cost: supply chain (TSMC), engineering innovation, and power
- The constraint is power and memory, not just chip speed
- Models are trending toward 1-10 trillion parameters, increasing compute per token even as hardware improves
- Mark Andreessen noted developers spending $100-$1,000/day on token consumption via Claude Code
- Brad predicts Nvidia will be the first $10 trillion company
- IQ gets commoditized; EQ (persuasion, leadership, networking) becomes super valuable

## Detailed Notes

### [00:00-05:00] Introductions
Apoorv introduces the premise: software had near-zero marginal distribution cost; AI does not. Brad Gerstner is introduced — Altimeter founder ($15B AUM), early investor in Google, Meta, Snowflake, OpenAI, Anthropic, Nvidia. Also founded Invest America (federal investment accounts for every child born in the US). Sunny Mudra introduced via Claude-generated bio — serial entrepreneur (Extreme Labs → Pivotal, Autonomic → Ford, Definitive Intelligence → Groq → Nvidia $20B acquisition).

### [05:00-12:00] GDP, Innovation, and the Compute Foundation
Brad presents 2,000-year GDP per capita chart: nothing happened for 1,800 years, then exponential growth. GDP doubles now every 25 years, correlating with lower poverty, higher literacy, more democracy. Technology has grown from 5% to 13% of global GDP. NASDAQ has compounded earnings at 15%/year vs 6% for non-tech. Demis Hassabis: AI will be "10x the impact of the industrial revolution at 10x the speed, unfolding in a decade rather than a century."

### [12:00-20:00] Groq Architecture and NVLink Fusion
Groq's origin: Jonathan Ross created the TPU at Google, left to bring fast inference chips to the broader market. Groq's chip uses a data flow architecture that is fully deterministic — the compiler predetermines where all calculations happen. Key difference vs GPUs: GPUs have lots of compute + external HBM (slow); Groq has lots of SRAM (10x+ faster bandwidth). Insight: disaggregate inference into prefill and decode phases; within decode, separate compute-intensive from memory-bandwidth-intensive operations. NVLink Fusion connects Groq chips to Nvidia GPUs, yielding 2.5x more tokens for the same power footprint. The email to Jensen led to a working prototype in weeks, acquisition in ~30 days.

### [20:00-30:00] The Revenue Inflection — "Oppenheimer Moment"
Bill Gurley and skeptics called it an AI bubble. Sam Altman had $1.4 trillion in spending commitments on $13B revenue. Then Anthropic's revenue exploded: $3.5B (Jan) → $8B (Feb) → $10.5B annualized (Mar) — added the equivalent of Databricks + Palantir combined revenue in one month, without a salesforce — purely product-driven pull. This proved intelligence has crossed a capability threshold. OpenAI and Anthropic went from negative to very positive gross margins. Anthropic's Mythos model found 26 vulnerabilities in Safari browser; Project Glasswing consortium for sandboxing before public release.

### [30:00-40:00] From Answers to Actions — The Agent Economy
First inning: AI as answers (autocomplete, better Google). Second inning: AI as actions (agents that build apps, resolve customer service, book hotels). Agents consume 10x+ more tokens but deliver 100x more value, so willingness to pay surges. Nvidia's internal personal assistant connects to Slack, Teams, email, files — autonomously handles daily task items. "Someone else's agent is emailing you and your agent is emailing them back."

### [40:00-55:00] Society, Distribution, and Rapid Fire
Brad: we're near the "end of the exponential" — Jensen, Sam, Dario, Elon all agree. Anthropic and OpenAI will add more compute this year than all labs combined over the last decade, doubling again next year. The wealth accumulation ahead requires solving distribution problems — hence Invest America. On Apple: privacy constraints limit on-device AI; an 8B parameter model burns out an iPhone battery in 30 minutes. Brad is "long EQ" — IQ gets commoditized, emotional intelligence and human connection become more valuable. Nvidia at $4.5T trades at 13x earnings, "very cheap" at half market multiple growing 70%. Brad predicts Nvidia will be first $10T company.

## Notable Quotes
- "Inference is about to 1 billion X. Not 10x, not 100x, not a million x — a billion X." — Jensen Huang (via Brad)
- "Anthropic in the month of March just added $10 billion in annualized revenue in a single month. That is the total amount of annual revenue for Databricks plus Palantir combined."
- "Most of the people I talk to are somewhere between a hundred and a thousand dollars now a day on token consumption." — Marc Andreessen (via Brad)
- "IQ gets commoditized and EQ becomes super valuable."
- "The next 20 years of Silicon Valley is going to be producing technologies to drive down the cost of intelligence." — Marc Andreessen

## Concepts Introduced
- [[NVLink Fusion]] — Protocol connecting Groq SRAM chips to Nvidia GPUs for 2.5x token throughput
- [[Deterministic Chip Architecture]] — Groq's compiler-based approach vs GPU's general-purpose flexibility
- [[Prefill-Decode Disaggregation]] — Separating inference into prefill and decode phases for hardware optimization
- [[Inference Cost Deflation]] — ~99% cost reduction over 2.5 years across hardware, software, and algorithms
- [[Agent Token Multiplier]] — Agentic workloads consume 10x+ tokens but deliver 100x value
- [[Digital Labor]] — Tokens as units of work that augment or replace human labor
- [[IQ Commoditization]] — Raw intelligence becomes cheap; human EQ becomes the differentiator

## Connections to Other Lectures
- Lecture 01: Establishes the AI value chain triangle that inference economics shapes
- Lecture 03: Chase Lochmiller details the physical data center infrastructure that powers inference
- Lecture 05: Sachin Katti (OpenAI) discusses Cerebras integration and heterogeneous compute for inference

## Open Questions
- Will Groq's architecture maintain its advantage as Nvidia integrates the technology?
- How far can inference cost deflation continue (99% every 2.5 years)?
- When do agent token economics become net-positive for enterprises?
- Is the "$10B in one month" revenue trajectory sustainable for Anthropic?
