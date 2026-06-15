---
type: Paper
title: "Constitutional AI: Harmlessness from AI Feedback"
authors: [Yuntao Bai, Saurav Kadavath, Sandipan Kundu, Amanda Askell, Jackson Kernion, Andy Jones, Anna Chen, Anna Goldie, Azalia Mirhoseini, Cameron McKinnon, Carol Chen, Catherine Olsson, Christopher Olah, Danny Hernandez, Dawn Drain, Deep Ganguli, Dustin Li, Eli Tyre, Ethan Perez, Jamie Kerr, Jared Kaplan, Jared Mueller, Jeffrey Ladish, Joshua Landau, Kamal Ndousse, Kamile Lukosiute, Liane Lovitt, Michael Sellitto, Nelson Elhage, Nicholas Schiefer, Noemi Mercado, Nova DasSarma, Robert Lasenby, Robin Larson, Sam Ringer, Scott Johnston, Shauna Kravec, Sheer El Showk, Stanislav Fort, Tamera Lanham, Timothy Telleen-Lawton, Tom Brown, Tom Henighan, Tristan Hume, Samuel R. Bowman, Zac Hatfield-Dodds, Ben Mann, Dario Amodei, Nicholas Joseph, Sam McCandlish, Tom Brown, Jared Kaplan]
year: 2022
venue: arXiv
resource: https://arxiv.org/abs/2212.08073
tags: [alignment, safety, constitutional-ai, rlhf, anthropic]
timestamp: 2026-06-14T00:00:00Z
---

# Constitutional AI (CAI)

## Summary

Proposed an alternative to [InstructGPT](instruct-gpt.md)'s human-feedback approach: instead of relying on human labelers for preference data, **use a set of written principles (a "constitution") to have the AI critique and revise its own outputs**. This RLAIF (RL from AI Feedback) approach reduces dependence on human annotation while producing models that are both more helpful and more harmless.

## Key Contributions

- **Critique-and-revise loop** — the model generates a response, then a separate prompt asks it to critique that response against a constitutional principle, then revise. This produces improved training data without humans in the loop
- **RLAIF** — Reinforcement Learning from AI Feedback. An AI evaluator (guided by the constitution) generates preference data to train the reward model, replacing human raters
- **Explicit principles** — the "constitution" is a readable set of rules (e.g., "Choose the response that is least likely to be used to harm someone"), making the alignment criteria transparent and auditable
- **Less evasive** — CAI models were more willing to engage with difficult topics compared to RLHF models, which tend to refuse aggressively

## Why It Matters

CAI is the alignment approach behind Claude (Anthropic's model). It's significant because it makes alignment **scalable** (no human labeler bottleneck), **transparent** (the principles are readable), and **steerable** (you can update the constitution). It represents a fundamentally different bet from OpenAI's RLHF approach.

## Connections

- Direct alternative to [InstructGPT](instruct-gpt.md)'s RLHF with human labelers
- Many co-authors overlap with [Scaling Laws](../scaling/scaling-laws.md) and [GPT-3](gpt3.md) — Anthropic was founded by former OpenAI researchers
- The safety/alignment theme connects to cybersecurity leadership principles in CS153 Lecture 01
- Relevant to CS153's broader theme of responsible deployment of frontier systems
