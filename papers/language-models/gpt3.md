---
type: Paper
title: "Language Models are Few-Shot Learners"
authors: [Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, Prafulla Dhariwal, Arvind Neelakantan, Pranav Shyam, Girish Sastry, Amanda Askell, Sandhini Agarwal, Ariel Herbert-Voss, Gretchen Krueger, Tom Henighan, Rewon Child, Aditya Ramesh, Daniel M. Ziegler, Jeffrey Wu, Clemens Winter, Christopher Hesse, Mark Chen, Eric Siber, Mateusz Litwin, Scott Gray, Benjamin Chess, Jack Clark, Christopher Berner, Sam McCandlish, Alec Radford, Ilya Sutskever, Dario Amodei]
year: 2020
venue: NeurIPS 2020
resource: https://arxiv.org/abs/2005.14165
tags: [language-models, few-shot-learning, scaling, gpt, in-context-learning]
timestamp: 2026-06-14T00:00:00Z
---

# GPT-3

## Summary

Scaled the autoregressive Transformer language model to **175 billion parameters** and demonstrated that sufficiently large models exhibit **in-context learning** — the ability to perform new tasks from just a few examples in the prompt, without any gradient updates or fine-tuning. This was a paradigm shift from the [BERT](bert.md)-era "pre-train + fine-tune" approach.

## Key Contributions

- **In-context learning** — GPT-3 can perform tasks (translation, arithmetic, code generation) by conditioning on a natural language prompt with examples, no weight updates required
- **Few-shot, one-shot, zero-shot** — systematically evaluated performance across these regimes, showing capability scales with model size
- **Scale reveals capabilities** — many abilities (arithmetic, unscrambling words, using novel words) appear only at sufficient scale, hinting at emergent phenomena
- **175B parameters** — 100× larger than GPT-2 (1.5B), validated [Scaling Laws](../scaling/scaling-laws.md) predictions

## Why It Matters

GPT-3 was the "oh shit" moment for AI. It showed that language models aren't just text predictors — at scale, they become general-purpose few-shot learners. This realization launched the LLM application ecosystem, led to [InstructGPT](instruct-gpt.md) and ChatGPT, and fueled the massive GPU investment cycle documented in MSE435.

## Connections

- Direct validation of [Scaling Laws](../scaling/scaling-laws.md) — built by many of the same authors
- Decoder-only variant of [Attention Is All You Need](../foundations/attention-is-all-you-need.md)
- Competing paradigm with [BERT](bert.md) — autoregressive (GPT) won for generative tasks
- Led to [InstructGPT](instruct-gpt.md) — fine-tuning GPT-3 with human feedback
- In-context learning enabled [Chain-of-Thought](../agents/chain-of-thought.md) prompting
- The AI-Native Company discussed in CS153 Lecture 03 ("1000x Engineer") is built on GPT-class models
