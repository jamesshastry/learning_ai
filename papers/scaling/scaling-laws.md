---
type: Paper
title: "Scaling Laws for Neural Language Models"
authors: [Jared Kaplan, Sam McCandlish, Tom Henighan, Tom B. Brown, Benjamin Chess, Rewon Child, Scott Gray, Alec Radford, Jeffrey Wu, Dario Amodei]
year: 2020
venue: arXiv
resource: https://arxiv.org/abs/2001.08361
tags: [scaling-laws, compute, training, language-models]
timestamp: 2026-06-14T00:00:00Z
---

# Scaling Laws for Neural Language Models

## Summary

Empirically demonstrated that language model performance (measured by cross-entropy loss) follows **smooth power-law relationships** with three factors: model size (N), dataset size (D), and compute budget (C). Crucially, performance scales predictably across many orders of magnitude, and the relationships are remarkably clean — you can predict a model's loss before training it.

## Key Findings

- **Power-law scaling** — loss ∝ N^−0.076 (model params), D^−0.095 (dataset tokens), C^−0.050 (compute FLOPs). Each 10× increase yields a predictable improvement
- **Parameters matter most** — for a fixed compute budget, it's better to train a larger model for fewer steps than a smaller model for more steps (later revised by Chinchilla)
- **Architecture matters less** — within the Transformer family, the scaling curves are similar regardless of depth-vs-width tradeoffs
- **No sign of plateauing** — the power laws held across 7+ orders of magnitude with no observed ceiling

## Why It Matters

This paper gave the field a **roadmap**: if you want X performance, you need Y compute, and you can calculate Y in advance. It justified the massive capital expenditure on GPU clusters — the $443B in 2025 hyperscaler capex discussed in MSE435 is a direct consequence of these scaling laws. It also vindicated [The Bitter Lesson](the-bitter-lesson.md): general methods + compute wins.

## Connections

- Empirical validation of [The Bitter Lesson](the-bitter-lesson.md) — compute is the dominant variable
- The models studied are [Transformers](../foundations/attention-is-all-you-need.md), demonstrating the architecture scales
- Led to [GPT-3](../language-models/gpt3.md), which was trained using these scaling predictions
- Later refined by the Chinchilla paper (Hoffmann et al., 2022) which showed data should scale equally with parameters
- The economic implications are the core subject of MSE435 (AI Supercycle economics)
- CS153 Lecture 02 (Value per Gigawatt) discusses the infrastructure consequences
