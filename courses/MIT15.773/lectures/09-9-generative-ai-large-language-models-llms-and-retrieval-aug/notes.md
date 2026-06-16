---
type: Lecture Notes
title: "Generative AI – Large Language Models (LLMs) and Retrieval Augmented Generation (RAG)"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "09"
video: https://youtube.com/watch?v=KGDe1QvfKJ8
tags: [llm, gpt, prompting, rag, in-context-learning, emergent-abilities, rlhf]
timestamp: 2026-06-15T00:00:00Z
---

# Generative AI – Large Language Models (LLMs) and RAG

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=KGDe1QvfKJ8)

## TL;DR
Large language models scale transformer decoders to billions of parameters trained on internet-scale text, exhibiting emergent abilities like in-context learning and chain-of-thought reasoning. RAG (Retrieval Augmented Generation) extends LLMs by connecting them to external knowledge sources, reducing hallucination and overcoming knowledge cutoff limitations.

## Key Takeaways
1. **LLMs exhibit emergent abilities at scale:** Capabilities like zero-shot reasoning, in-context learning, and instruction following appear only when models reach sufficient scale (billions of parameters), not predicted by smaller model performance.
2. **Prompting is the new programming paradigm:** Zero-shot, few-shot, and chain-of-thought prompting replace explicit programming for many tasks — the quality of the prompt determines the quality of the output.
3. **RAG grounds LLM responses in retrieved documents:** By embedding documents in a vector database, retrieving relevant passages at query time, and injecting them into the prompt, RAG reduces hallucination and provides up-to-date knowledge.
4. **RLHF aligns models with human preferences:** Reinforcement Learning from Human Feedback fine-tunes models to generate responses that humans rate as helpful, harmless, and honest, bridging the gap between next-token prediction and usefulness.
5. **Subword tokenization eliminates the OOV problem:** Byte Pair Encoding (BPE) breaks words into subword units, handling any input including novel words, typos, and code — unlike word-level tokenization that collapses unknowns to UNK.

## Detailed Notes

### Scaling Transformers to LLMs [00:00-20:00]
- GPT architecture: decoder-only transformer with causal attention
- Scale: GPT-3 has 175B parameters, trained on hundreds of billions of tokens
- Training objective: next-token prediction on massive internet text
- Emergent abilities: capabilities that appear suddenly at scale thresholds
- The "scaling laws" — predictable relationship between compute, data, parameters, and loss

### Prompting and In-Context Learning [20:00-40:00]
- Zero-shot: describe the task in the prompt, no examples
- Few-shot: provide 2-5 input/output examples in the prompt
- Chain-of-thought: instruct the model to "think step by step" for reasoning tasks
- In-context learning: models learn to perform new tasks from prompt examples alone, without weight updates
- Prompt engineering: systematic craft of prompts for reliable outputs

### Subword Tokenization (BPE) [40:00-50:00]
- Byte Pair Encoding: iteratively merge most frequent character pairs into subword tokens
- "unhappiness" → ["un", "happiness"] or ["un", "happ", "iness"]
- Vocabulary typically 30K-50K subword tokens (vs. word-level which needs much larger vocabularies)
- Handles any text: new words, misspellings, code, mathematical notation
- Eliminates the OOV problem that plagued word-level tokenization

### RLHF: Aligning Models with Human Preferences [50:00-01:05:00]
- Pretrained LLM generates diverse outputs; humans rank them by quality
- Train a reward model to predict human preferences
- Use PPO (Proximal Policy Optimization) to fine-tune the LLM to maximize the reward
- Result: models that are more helpful, less harmful, and more honest
- InstructGPT/ChatGPT: RLHF-tuned version of GPT that follows instructions naturally

### RAG: Retrieval Augmented Generation [01:05:00-01:17:00]
- Problem: LLMs hallucinate facts and have knowledge cutoff dates
- Solution: retrieve relevant documents from external sources and include in prompt context
- Pipeline: query → embed → search vector database → retrieve top-K passages → augment prompt → generate
- Vector database: documents split into chunks, embedded, stored with similarity search
- Benefits: updatable knowledge, source attribution, domain-specific accuracy
- Limitations: retrieval quality bounds generation quality; context window limits

## Notable Quotes
> "Prompting is the new programming — instead of writing code, you write prompts." — Instructor

> "These emergent abilities — nobody predicted them. They just appeared when models got big enough." — Instructor

> "RAG is the practical answer to hallucination for enterprise applications." — Instructor

## Concepts Introduced
- [[Large Language Model]] — billion-parameter transformer trained on internet-scale text
- [[In-Context Learning]] — performing new tasks from prompt examples without weight updates
- [[Chain-of-Thought Prompting]] — eliciting step-by-step reasoning via prompt instructions
- [[RAG]] — augmenting LLM generation with retrieved external documents
- [[Vector Database]] — storage system for embedding vectors with similarity search
- [[RLHF]] — aligning models with human preferences via reinforcement learning
- [[Subword Tokenization]] — BPE-based tokenization that handles any input text
- [[Prompt Engineering]] — systematic design of prompts for reliable LLM outputs

## Connections to Other Lectures
- GPT architecture built on transformer decoder from Lecture 7-8
- Embeddings from Lecture 6 underpin vector databases in RAG
- Fine-tuning discussed here is expanded with PEFT methods in Lecture 10
- Softmax from Lecture 3 is the core output mechanism (52K-way softmax per token)

## Open Questions
- What are the limits of in-context learning as model scale increases?
- How can RAG systems handle conflicting information from multiple sources?
- Will scaling laws continue to hold, or will new architectures be needed?
