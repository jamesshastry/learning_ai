---
type: Lecture Notes
title: "Predictable Noise in LLM"
course: cs294-agentic-f25 Agentic AI
university: UC Berkeley
lecture_id: "07"
video: https://youtube.com/watch?v=HV8pugcFVO0
tags: [benchmarks, statistics, evaluation, noise, reliability, sampling, error-bars]
timestamp: 2026-06-15T00:00:00Z
---

# Predictable Noise in LLM

**Course:** Agentic AI
**Video:** [YouTube](https://youtube.com/watch?v=HV8pugcFVO0)

## TL;DR
Sida Wang (Meta) presents a rigorous statistical analysis of LLM benchmark reliability. Using exploratory data analysis across multiple benchmarks, he shows that even "hard" problems exhibit significant inconsistency — weak models can solve hard problems and strong models fail easy ones. He argues that small benchmarks with complex questions are not statistically reliable, demonstrates the importance of standard error analysis, and introduces the concept of "predictable noise" from a super-population sampling perspective.

## Key Takeaways
- Benchmarks are getting harder but smaller: MNIST 10K, ImageNet 100K, HumanEval 164, SWE-bench ~500
- Even weak models have 30% chance of solving some "hard" problems — inconsistency undermines difficulty-based reliability claims
- The first percent of pass rate on a problem is most impressive; increasing from 30% to 90% reliability may not indicate genuine capability improvement
- Standard error of the mean scales as 1/sqrt(N); for small N benchmarks, this produces large uncertainty
- Paired comparison (model A vs B on same questions) reduces variance compared to unpaired evaluation
- Statistical significance is often ignored in LLM papers — many reported improvements are within noise

## Detailed Notes

### 00:05 — Context
Wang's background in code LLMs and benchmarks. He observes that while creating benchmarks is busy work with many practical considerations, there is very little reflection on their statistical properties.

### 02:00 — Benchmark Size Trends
Benchmark sizes are shrinking as complexity increases. HumanEval: 164. SWE-bench: hundreds. Agentic evaluations need hours per problem. Counterpoint: each complex question should be more informative than a true/false question.

### 05:00 — Exploratory Data Analysis
Heatmaps of model-vs-question performance across Math-500, HumanEval, MBPP, SWE-bench, LiveCodeBench. Clear patterns of easy/hard questions and good/bad models, but significant inconsistency — strong models fail easy problems, weak models solve hard ones.

### 10:00 — Inconsistency Problem
If a model can write a very hard proof but cannot define basic concepts, you should be suspicious. In benchmarks, this inconsistency suggests models aren't truly "solving" hard problems — they may have some probability of getting any answer right, making difficulty less meaningful.

### 13:00 — First Percent Matters Most
For verifiable problems, once you have any chance of getting a correct answer, you can use repeated sampling + verification to boost reliability. The difference between 0% and 1% pass rate is profound; 30% to 90% may just reflect better test-taking strategy.

### 16:00 — Statistical Framework
Super-population perspective: benchmark questions are samples from a distribution. Empirical mean estimates the true capability. Standard error = sigma/sqrt(N). For small N with binary outcomes, maximum standard error is 1/(2*sqrt(N)) — giving immediate upper bounds on reliability.

### 20:00 — Paired Comparisons
Comparing model A and B on the same questions (paired test) dramatically reduces variance because question difficulty factors cancel out. This is "almost free" — just compute the per-question difference and test whether it's significantly nonzero.

## Notable Quotes
- "Are small benchmarks not reliable even if they contain hard, complex questions, or can we somehow get more out of these complex questions?"
- "My kettle was broken... it says 'oh, it appears to be a robot.' So I would trust its later advice a lot less."
- "Probably statistical analysis is still important now."

## Concepts Introduced
- [[Predictable Noise]] — Quantifiable statistical uncertainty in benchmark evaluations
- [[Super-Population Sampling]] — Viewing benchmark questions as samples from a latent distribution
- [[Paired Comparison Testing]] — Evaluating models on identical questions to reduce variance
- [[Standard Error of the Mean]] — Uncertainty measure scaling as 1/sqrt(N) for N questions

## Connections to Other Lectures
- Lecture 04 (Evaluation) covers benchmark design principles from a qualitative perspective; Wang adds rigor
- Lecture 03 (Jiantao Jiao) discusses benchmark quality and contamination from the training side
- Lecture 05 (Weizhu Chen) covers the practical challenges of measuring model quality

## Open Questions
- Should the field adopt mandatory confidence intervals for benchmark reporting?
- How do we design benchmarks that maintain statistical power as questions become more complex?
- Can item response theory (IRT) provide better calibration of question difficulty?
