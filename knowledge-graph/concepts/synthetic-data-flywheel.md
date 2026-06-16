---
aliases: ["AI-Generated Training Data"]
tags: [training, data, optimization]
type: concept
first_seen: mse435/06
sources:
  - course: mse435
    lecture: "06"
    timestamps: ["22:08", "22:10", "46:01", "46:21"]
---
# Synthetic Data Flywheel

The use of AI models to generate training data for the next generation of models, exploiting the generator-verifier gap (e.g., generating code problems and verifying solutions via unit tests). As models improve, synthetic data quality improves, creating a flywheel. This is increasingly replacing human data labeling for RL training.

## Key Points from Sources

- **mse435 Lecture 06**

## Related Concepts

- [[Pre-Training Data Wall]] (contrasts with) — Synthetic data helps overcome natural data scarcity.
- [[RLVR (RL with Verifiable Rewards)]] (enables) — Synthetic data can generate the tasks and environments needed for RLVR training.
