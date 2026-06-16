---
aliases: ["log-normalizer loss", "auxiliary normalizer loss"]
tags: [training, architecture]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["01:08:41", "01:09:23"]
---
# Z-Loss

A regularization term that penalizes the squared log-normalizer of the output softmax, encouraging it to stay near zero for numerical stability. Exploits the overparameterization of softmax (adding a constant to logits doesn't change output) to keep the normalizer well-behaved.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[QK Norm]] (related to) — Both target softmax stability from different angles
