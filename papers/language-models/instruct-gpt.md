---
type: Paper
title: "Training language models to follow instructions with human feedback"
authors: [Long Ouyang, Jeff Wu, Xu Jiang, Diogo Almeida, Carroll L. Wainwright, Pamela Mishkin, Chong Zhang, Sandhini Agarwal, Katarina Slama, Alex Ray, John Schulman, Jacob Hilton, Fraser Kelton, Luke Miller, Maddie Simens, Amanda Askell, Peter Welinder, Paul Christiano, Jan Leike, Ryan Lowe]
year: 2022
venue: NeurIPS 2022
resource: https://arxiv.org/abs/2203.02155
tags: [rlhf, alignment, instruction-following, language-models, fine-tuning]
timestamp: 2026-06-14T00:00:00Z
---

# InstructGPT

## Summary

Showed how to make language models **actually useful and safe** by fine-tuning [GPT-3](gpt3.md) with **Reinforcement Learning from Human Feedback (RLHF)**. A 1.3B-parameter InstructGPT model was preferred by human evaluators over the 175B-parameter GPT-3, demonstrating that alignment matters more than raw scale for user-facing applications.

## Key Contributions

- **Three-step RLHF pipeline**: (1) supervised fine-tuning on human demonstrations, (2) train a reward model on human preference comparisons, (3) optimize the policy with PPO against the reward model
- **Small aligned > large unaligned** — 1.3B InstructGPT beat 175B GPT-3 on human preference, a striking result
- **Reduced harmful outputs** — InstructGPT produced less toxic, more truthful, and less biased text while maintaining task performance
- **"Alignment tax" is small** — RLHF didn't significantly degrade performance on standard NLP benchmarks

## Why It Matters

InstructGPT is the bridge between "impressive demo" (GPT-3) and "useful product" (ChatGPT). The RLHF technique became the standard alignment approach for virtually every commercial LLM. Without this paper, there's no ChatGPT, no Claude, no Gemini-as-a-product. The alignment paradigm it established also sparked the [Constitutional AI](constitutional-ai.md) alternative from Anthropic.

## Connections

- Fine-tunes [GPT-3](gpt3.md) — builds directly on in-context learning with human alignment
- RLHF borrows adversarial ideas from [GANs](../foundations/gan.md) (reward model as learned discriminator)
- Alternative approach: [Constitutional AI](constitutional-ai.md) replaces human labelers with AI feedback
- The "1000x Engineer" in CS153 Lecture 03 relies on aligned, instruction-following models
- Anthropic (co-authors Amodei, Askell) went on to publish [Constitutional AI](constitutional-ai.md)
