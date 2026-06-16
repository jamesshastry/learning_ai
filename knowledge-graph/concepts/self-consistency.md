---
aliases: ["Majority Voting", "Marginal Inference"]
tags: [reasoning, optimization, theory]
type: concept
first_seen: llm-agents-f24/01
sources:
  - course: llm-agents-f24
    lecture: "01"
    timestamps: ["46:25", "47:07", "48:06", "49:54"]
---
# Self-Consistency

A decoding strategy that samples multiple reasoning paths from an LLM and selects the most frequent final answer via majority vote, grounded in the machine learning principle of maximum marginal inference over latent reasoning paths.

## Key Points from Sources

- **llm-agents-f24 Lecture 01**

## Related Concepts

- [[Chain-of-Thought Prompting]] (requires) — Self-consistency requires intermediate reasoning steps to generate diverse paths.
- [[Chain-of-Thought Decoding]] (related to) — Both leverage multiple generation paths; CoT decoding explores via top-k tokens.
