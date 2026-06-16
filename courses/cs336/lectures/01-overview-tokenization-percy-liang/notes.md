---
type: Lecture Notes
title: "Overview, Tokenization — Percy Liang"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "01"
video: https://youtube.com/watch?v=JuoVZkPBiKk
tags: [overview, tokenization, bpe, efficiency, course-intro]
timestamp: 2026-06-15T00:00:00Z
---

# Overview, Tokenization — Percy Liang

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=JuoVZkPBiKk)

## TL;DR
Percy Liang introduces CS336's "from scratch" philosophy, arguing that understanding language model internals is essential for fundamental research. The lecture covers the course structure (basics, systems, scaling laws, data, alignment), then dives into tokenization — specifically Byte Pair Encoding (BPE) — as the first technical topic, framing it through the lens of computational efficiency.

## Key Takeaways
- **The "from scratch" philosophy transfers mechanics and mindset, though intuitions about modeling decisions may not transfer across scales** — small-scale experiments can teach how things work and how to approach problems, but optimal design choices often change at frontier scale.
- **Efficiency is arguably more important at scale than at small scale** — a 44x algorithmic efficiency gain was observed on ImageNet from 2012-2019; the right interpretation of the "bitter lesson" is that algorithms that scale are what matter.
- **BPE tokenization is a data-driven heuristic that balances compression ratio against vocabulary sparsity** — common sequences become single tokens while rare sequences fragment into multiple tokens, enabling adaptive computation.
- **The course frames everything as "best model given fixed resources"** — data, compute, memory, and communication bandwidth are the resources to optimize across all design decisions.
- **Open-weight models (Llama, DeepSeek, Qwen) have made this course possible** — without published details on architectures and training, we'd have no way to glimpse how frontier models are built.

## Detailed Notes

### Course Philosophy and Motivation [00:04–10:28]
The third edition of CS336 maintains its "from scratch" philosophy. Researchers have become disconnected from underlying technology — moving from implementing models, to fine-tuning, to prompting. While prompting is powerful, abstractions are leaky. Full understanding requires tearing up the whole stack. Three types of transferable knowledge: mechanics (how things work), mindset (profiling, benchmarking, efficiency), and intuitions (what modeling decisions work). Mechanics and mindset transfer well; intuitions may not transfer across scales.

### Scale Challenges and the Bitter Lesson [05:54–10:55]
Frontier models cost potentially billions to train. At small scale, fraction of FLOPs in MLP is ~44% but scales to ~80% at 175B. Emergent behaviors appear only at critical scale. The bitter lesson's correct interpretation: algorithms that scale are what matters. Accuracy ≈ efficiency × resources. A 44x algorithmic efficiency gain on ImageNet between 2012–2019 demonstrates algorithms compound with hardware improvements.

### Language Model History and Open Ecosystem [11:50–17:30]
History from Shannon's entropy measurements through N-grams, LSTMs, seq-to-seq, attention, transformers, to GPT scaling. The open model ecosystem (Llama series, Mistral, DeepSeek, Qwen) has been transformative — open weights approaching closed model performance. Projects like AI2, Nvidia, and Moraine provide not just weights but code, data, and papers. The fundamentals (GPUs, SGD, transformers, attention) haven't changed much despite evolving demands.

### Course Structure: Five Assignments [27:22–01:02:54]
1. **Basics** — tokenizer, transformer, optimizer, training from scratch
2. **Systems** — kernels (Triton), parallelism, inference optimization
3. **Scaling Laws** — scaling recipes, compute-optimal training, hyperparameter transfer
4. **Data** — evaluation, web crawl processing, filtering, deduplication, synthetic data
5. **Alignment** — SFT, RLHF/GRPO, DPO, RL systems challenges

### Tokenization Deep Dive [01:05:07–01:18:58]
Tokenizers convert between strings and integer sequences. Character-level tokenizers have 150K vocab but poor compression; byte-level tokenizers have 256 vocab but compression ratio of 1; word-level tokenizers have unbounded vocab with UNK tokens. BPE solves these by training on raw text: start with bytes, iteratively merge the most frequent adjacent pair, creating new tokens. The algorithm shrinks sequences while growing vocabulary. Compression ratio (bytes/token) captures efficiency — larger is better since attention is quadratic. Modern tokenizers have 100K–200K tokens for multilingual support.

### Efficiency as Unifying Theme [01:02:54–01:04:46]
All design decisions map to efficiency: systems → compute efficiency; tokenization → sequence compression; architecture → memory/FLOPs reduction; data filtering → avoiding wasted gradients; scaling laws → effective hyperparameter tuning at small scale.

## Notable Quotes
- "We offer no explanation. We attribute their success to divine benevolence." — Noam Shazeer on SwiGLU, quoted by Percy Liang
- "The wrong interpretation [of the bitter lesson] is that scale is all that matters, algorithms don't matter. The right interpretation is that algorithms that scale are what matters."
- "Full understanding of how language models work is really necessary for fundamental research. And the way that we're going to get our understanding is by building."
- "If you're really interested in fundamental research, by simply prompting a model, you're vastly constraining the set of options, the design space you're looking at."
- "Even like a 5% improvement might be a big deal" — on efficiency mattering more at large scale

## Concepts Introduced
- [[Byte Pair Encoding]] — data-driven tokenization via iterative merging
- [[Compression Ratio]] — bytes per token metric for tokenizer quality
- [[Scaling Laws]] — predicting large-scale performance from small experiments
- [[Model Flops Utilization]] — actual vs. promised GPU throughput
- [[Adaptive Computation]] — variable token granularity for different input regions
- [[Bitter Lesson]] — algorithms that scale are what matter

## Connections to Other Lectures
- Tokenization implementation continues in Assignment 1
- Resource accounting and FLOPs introduced here are formalized in Lecture 02
- Architecture decisions previewed here are detailed in Lectures 03–04
- Scaling laws overview connects to Lectures 09 and 11
- Data and alignment previews connect to Lectures 13–17

## Open Questions
- Will byte-level models (like H-Net) eventually eliminate the need for tokenizers?
- How do optimal design choices differ between small-scale class projects and frontier training?
- What is the right balance between compression ratio and vocabulary sparsity for multilingual models?
