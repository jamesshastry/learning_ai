---
aliases: ["RL Compute Scaling", "Post-Training Investment"]
tags: [training, compute, economics]
type: concept
first_seen: mse435/06
sources:
  - course: mse435
    lecture: "06"
    timestamps: ["31:37", "31:43", "32:13", "32:29"]
---
# Post-Training Scaling

The emerging paradigm of investing significantly more compute in post-training (RL, preference tuning) relative to pre-training. DeepSeek R1 used ~5% of V3 pre-training compute for RL, but this ratio is rapidly increasing as labs run data-center-wide RL runs. One of Jensen's "three scaling laws" alongside pre-training and test-time scaling.

## Key Points from Sources

- **mse435 Lecture 06**

## Related Concepts

- [[RLVR (RL with Verifiable Rewards)]] (enables) — RLVR is the primary technique driving the shift toward post-training compute investment.
- [[Inference Lifecycle Expansion]] (related to) — RL training is primarily an inference workload, blurring the training-inference boundary.
