---
type: Lecture Notes
title: "Compound AI Systems & the DSPy Framework"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "05"
video: https://youtube.com/watch?v=JEMYuzrKLUw
tags: [DSPy, compound-AI-systems, prompt-optimization, modular-AI, programming]
timestamp: 2026-06-15T00:00:00Z
---

# Compound AI Systems & DSPy Framework — Omar Khattab (Stanford)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=JEMYuzrKLUw)

## TL;DR
Omar Khattab argues that monolithic LLMs are too hard to control, debug, and improve, and presents compound AI systems as the solution — modular programs with LLM-powered components. He introduces DSPy, a framework where developers write Python programs with natural language "signatures" (declaring what modules should do), and automated "optimizers" learn the prompts, demonstrations, and weights needed to make modules work well together on any given LLM.

## Key Takeaways
1. **Compound AI systems beat monolithic LLMs:** Modular programs with specialized LLM roles enable better quality, control, transparency, and inference-time scaling than end-to-end LLMs.
2. **Current prompts couple five roles that should be separate:** Signature (what), computation strategy (how), formatting, objective, and model-specific tuning are all tangled in today's prompts.
3. **DSPy separates declaration from optimization:** Developers declare module signatures (1-liners); optimizers automatically find effective prompts and demonstrations — analogous to neural network layers and gradient descent.
4. **MePro optimizer combines demonstrations and instruction search:** Uses bootstrapped examples, grounded instruction proposals, and Bayesian surrogate models for efficient credit assignment across multi-module programs.
5. **Small optimized models can beat large unoptimized ones:** DSPy enables sub-billion-parameter models to outperform frontier models through systematic optimization of the entire compound system.

## Detailed Notes

### The Problem with Monolithic LLMs [00:00–03:01]
- Impressive demos are easy; reliable AI systems are hard
- Monolithic LLMs are hard to control, debug, and improve
- Compound AI systems: LLMs play specialized modular roles inside larger architectures

### Examples of Compound AI Systems [03:01–08:36]
- RAG: retrieval + LLM synthesis — gains transparency and efficiency
- Multi-hop RAG: LLM decomposes questions, retrieves iteratively, synthesizes
- STORM: generates Wikipedia-style articles through brainstorming, outlining, retrieval, synthesis
- AlphaCodeium: iterative code generation with reflection, testing, ranking
- Inference-time scaling: intelligently spending more compute at test time

### The Five Roles Problem [09:47–12:13]
- Each prompt couples: signature (I/O spec), computation strategy (CoT, tools), formatting, objective (do's/don'ts), model-specific tuning
- Changing any one aspect invalidates the entire hand-crafted prompt
- Blocks portability between models, tasks, and pipelines

### DSPy: Programming with LM Modules [14:00–23:26]
- Language model programs: Python functions with fuzzy natural language modules
- Signatures: 1-liner declarations of module behavior (inputs → outputs)
- Modules/Predictors: inference strategies (ChainOfThought, ReAct) applied to signatures, like layers in neural networks
- Forward method defines program logic with standard Python (loops, conditionals, etc.)
- Optimization: given inputs + metric, find prompt settings that maximize program quality

### DSPy Optimizers [26:01–34:00]
- General pattern: guess initial prompt → rejection sampling for examples → update modules
- Three strategies: (1) bootstrap few-shot demonstrations via self-generation, (2) propose instructions via grounded language model (OPRO-style), (3) MePro: Bayesian optimization over joint instruction + demonstration space
- MePro grounds proposals in dataset summaries, program descriptions, and bootstrapped examples
- Surrogate model handles credit assignment across multiple modules efficiently

### Results and Impact [29:44–01:04:56]
- Multi-hop QA: small Llama 2 with optimization outperforms larger GPT-3.5 without; T5 (<1B params) competitive with frontier models
- University of Toronto won medical QA competition by 20-point margin using DSPy
- University of Maryland: 10 minutes of DSPy outperformed 20 hours of manual prompt engineering by 40-50%
- Production use: JetBlue, Databricks, Walmart, VMware, Replit, Sephora

## Notable Quotes
1. "We do know how to iteratively and controllably build systems and improve them in a modular way. That elusive concept is called programming."
2. "Language models are going to give you 20 different things and 19 of them are going to suck, but because we can try so many, we can strike gold fairly often."
3. "The biggest coolest thing in DSPy is that we've isolated signatures from optimizers, from adapters, from metrics, and from inference-time strategies."
4. "Show, don't tell — building good examples of the task automatically seems to be the most powerful approach."

## Concepts Introduced
- [[DSPy]], [[Compound AI Systems]], [[Signatures]], [[Prompt Optimization]], [[MePro Optimizer]], [[Bootstrap Few-Shot]]

## Connections to Other Lectures
- Lecture 01 (Denny Zhou) provides chain-of-thought and self-consistency — the reasoning strategies DSPy automates
- Lecture 03 (Chi Wang) offers AutoGen as a complementary framework focused on multi-agent conversations
- Lecture 04 (Burak Gokturk) covers manual fine-tuning approaches that DSPy's automated optimization can replace

## Open Questions
1. Can prompt optimization fully replace manual prompt engineering for all task types?
2. How do we build representative benchmarks for comparing compound AI system optimizers?
3. What is the right balance between instruction optimization and demonstration optimization?
