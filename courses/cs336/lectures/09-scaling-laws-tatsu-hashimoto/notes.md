---
type: Lecture Notes
title: "Scaling Laws — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "09"
video: https://youtube.com/watch?v=Q15rhEWZPQ4
tags: [scaling-laws, chinchilla, compute-optimal, power-laws, hyperparameter-transfer, scaling-recipes]
timestamp: 2026-06-15T00:00:00Z
---

# Scaling Laws — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=Q15rhEWZPQ4)

## TL;DR
Tatsu presents scaling laws as empirical tools for extrapolating small-scale experiments to predict large-scale performance. Covers the historical connection to generalization bounds, Kaplan (OpenAI) vs Hoffmann (Chinchilla) approaches to compute-optimal training, power law fitting methodology, and the critical insight that scaling laws are engineering tools that must be "willed into existence" through careful recipe construction, not natural phenomena.

## Key Takeaways
- **Scaling laws are empirical sample complexities** — they connect to classical generalization bounds from learning theory, with the key insight dating back to Cortes and Vapnik at Bell Labs in 1993.
- **The Chinchilla insight: tokens and parameters should scale roughly equally** — Kaplan (OpenAI) suggested allocating most compute to model size, but Hoffmann showed 20× tokens per parameter is closer to compute-optimal.
- **Scaling laws must be "willed into existence"** — they require careful construction of scaling recipes with predictable hyperparameter transfer; they are not automatic phenomena.
- **IsoFLOP curves are the fundamental experimental tool** — for each FLOPs budget, sweep model sizes to find the minimum loss, then fit a power law to the optimal points across budgets.
- **Predictability is at least as important as optimality** — a slightly suboptimal but predictable scaling recipe is more valuable than an optimal but unpredictable one.

## Detailed Notes

### Motivation: The Big Run Problem [00:05–04:03]
Scenario: you have 10,000 B200s for a month. Training a frontier model is millions of dollars — you can't do hyperparameter tuning at full scale. Scaling laws let you optimize at small scale and extrapolate to large scale with confidence. The key is finding simple, robust connections between small-scale and large-scale behavior.

### Historical Roots in Learning Theory [04:03–10:00]
Scaling laws are "empirical generalization bounds." Classical bounds give loss ≤ training_loss + complexity/sqrt(N). The concept dates to 1993 (Cortes & Vapnik at Bell Labs): fit classifiers on small samples, extrapolate error curves to estimate full-dataset performance. Power law behavior (L = aN^(-b) + c) observed across many domains. The irreducible error c represents entropy of the data distribution.

### Kaplan et al. (OpenAI 2020) Neural Scaling Laws [15:00–30:00]
First systematic study of LLM scaling. Key finding: loss follows power law in model parameters, dataset size, and compute budget. Recommended allocating most compute to model size (large models, less data). Fixed hyperparameters across scales (no HP transfer). Used fixed training duration (limited tokens). Criticized for potentially confounding early stopping with data scaling.

### Hoffmann et al. (Chinchilla/DeepMind 2022) [30:00–45:00]
Corrected Kaplan's methodology: tokens and parameters should scale equally. IsoFLOP approach: for each FLOPs budget, sweep model sizes to find optimal. Rule of thumb: ~20 tokens per parameter (70B model → 1.4T tokens). Key methodological difference: varied training budget properly. This shifted the field from undertrained large models (GPT-3 style) to properly trained models (Llama style).

### Scaling Recipes and Hyperparameter Transfer [45:00–01:00:00]
A scaling recipe maps FLOPs budget → full hyperparameter config. Must extrapolate — hyperparameters at small scale should predict (or be identical to) large-scale values. Predictability is as important as optimality. Challenge: learning rate behavior across scales. muP (Maximal Update Parametrization) addresses this — covered in Lecture 11.

### Inference-Aware Scaling [01:00:00–01:10:00]
Compute-optimal ≠ inference-optimal. Many production models are "over-trained": smaller models trained on more data than Chinchilla-optimal because inference cost scales with model size. Llama 3: 8B model trained on 15T tokens (1875:1 tokens:params ratio, far above Chinchilla's 20:1). The optimal point shifts when you account for total lifecycle cost (training + serving).

### Practical Scaling Methodology [01:10:00–end]
Procedure: (1) Choose candidate scaling recipes, (2) Run many small experiments across FLOPs budgets, (3) Fit power law L(C) = aC^(-b) + c, (4) Select recipe with best predicted loss at target scale, (5) Run hero training. Assignment 3 simulates this process via a training API that returns cached losses for different hyperparameter configs.

## Notable Quotes
- "Scaling laws can sometimes be quite tricky objects... it's almost a belief."
- "How do you make sure that your big run is actually successful?"
- "You can't just copy the choices of others and get something better than state of the art."
- "Scaling laws are not laws of nature — you kind of have to will them into existence."
- "Predictability is actually at least as important as optimality."

## Concepts Introduced
- [[Chinchilla Scaling]] — compute-optimal balance of model size and data
- [[IsoFLOP Curves]] — experimental methodology for finding optimal model size at each compute level
- [[Scaling Recipe]] — function mapping FLOPs budget to full hyperparameter configuration
- [[Power Law]] — mathematical form L = aN^(-b) + c governing scaling behavior
- [[Hyperparameter Transfer]] — requirement that HP choices at small scale predict large-scale values
- [[Compute-Optimal Training]] — allocating compute budget optimally between model size and data

## Connections to Other Lectures
- Builds on resource accounting and 6ND formula from Lecture 02
- Hyperparameter forgiving ranges from Lecture 03 provide baseline for scaling recipes
- muP and advanced scaling covered in Lecture 11
- Inference-optimal scaling connects to inference lecture (10)
- Assignment 3 directly implements these concepts

## Open Questions
- How do MoE scaling laws differ from dense model scaling laws?
- Can scaling laws predict downstream task performance (not just loss)?
- How should scaling laws account for data quality differences?
