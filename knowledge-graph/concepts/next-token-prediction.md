---
aliases: ["Autoregressive Language Modeling"]
tags: [training, llm]
type: concept
first_seen: mit-6s191/06
sources:
  - course: mit-6s191
    lecture: "06"
    timestamps: ["46:26", "47:02"]
---
# Next-Token Prediction

The core training objective of modern LLMs: given a sequence of tokens, predict the probability distribution over the next token. Trained using cross-entropy loss comparing predicted probabilities to the true next token. No external labels needed.

## Key Points from Sources

- **mit-6s191 Lecture 06**

## Related Concepts

- [[Cross-Entropy Loss]] (uses) — Next-token prediction uses cross-entropy to compare predicted and true token distributions.
