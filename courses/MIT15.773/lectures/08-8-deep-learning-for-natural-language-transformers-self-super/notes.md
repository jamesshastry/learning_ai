---
type: Lecture Notes
title: "Deep Learning for Natural Language – Transformers, Self-Supervised Learning"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "08"
video: https://youtube.com/watch?v=v-lHsawHyaI
tags: [transformers, bert, gpt, self-supervised-learning, fine-tuning, masked-language-model]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Learning for Natural Language – Transformers, Self-Supervised Learning

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=v-lHsawHyaI)

## TL;DR
Self-supervised learning enables pretraining transformers on massive unlabeled text corpora using tasks like masked language modeling (BERT) and next-token prediction (GPT), creating powerful general-purpose language representations that can be fine-tuned for specific downstream tasks with minimal labeled data.

## Key Takeaways
1. **Self-supervised learning eliminates the labeled data bottleneck:** By creating training signals from the text itself (predicting masked words or next tokens), models learn from virtually unlimited unlabeled data.
2. **BERT reads bidirectionally; GPT reads left-to-right:** BERT uses encoder-only architecture with masked language modeling for understanding tasks; GPT uses decoder-only architecture with causal attention for generation tasks.
3. **Fine-tuning adapts pretrained models efficiently:** Add a task-specific head (e.g., classification layer) to a pretrained transformer and train on a small labeled dataset — orders of magnitude less data than pretraining.
4. **HuggingFace Hub democratizes access:** Thousands of pretrained models available via simple API calls; `from transformers import pipeline` makes state-of-the-art NLP accessible in a few lines of code.
5. **Contextual embeddings differ from static embeddings:** Unlike Word2Vec where "bank" always has the same vector, transformer embeddings vary based on surrounding context ("river bank" vs. "bank account").

## Detailed Notes

### Self-Supervised Learning Paradigm [00:00-15:00]
- Traditional supervised learning requires expensive labeled data
- Self-supervised learning: create labels from the data itself
- The text serves as both input and label — no human annotation needed
- Enables training on billions of words from the internet

### BERT: Bidirectional Encoder Representations from Transformers [15:00-35:00]
- Encoder-only transformer architecture
- Pretraining task: Masked Language Modeling (MLM) — mask 15% of tokens randomly, predict them
- Also uses Next Sentence Prediction (NSP) — predict if two sentences are consecutive
- Bidirectional: each token attends to both left and right context simultaneously
- Produces contextual embeddings: same word gets different vectors based on context
- Pretrained BERT available in base (110M params) and large (340M params) variants

### GPT: Generative Pre-trained Transformer [35:00-50:00]
- Decoder-only transformer architecture with causal (left-to-right) attention
- Pretraining task: next-token prediction — predict the next word given all preceding words
- Autoregressive generation: generate text one token at a time, feeding output back as input
- Better suited for text generation tasks; BERT better for understanding/classification

### Fine-Tuning Pretrained Models [50:00-01:10:00]
- Take a pretrained model (BERT, GPT, etc.), add a task-specific output layer
- Train on a small labeled dataset with a low learning rate to preserve pretrained knowledge
- Applications: sentiment analysis, named entity recognition, question answering, text classification
- Feature extraction alternative: freeze pretrained weights, only train the new head

### HuggingFace Ecosystem [01:10:00-01:17:00]
- Model Hub: thousands of pretrained models for download
- Transformers library: unified API across model architectures
- Pipeline API: `pipeline('sentiment-analysis')` — instant inference in one line
- Datasets library: curated datasets for training and evaluation
- Integration with Keras/TensorFlow and PyTorch

## Notable Quotes
> "BERT and GPT showed us that you can learn incredibly powerful language representations without any labeled data." — Instructor

> "HuggingFace has done for NLP what ImageNet and Keras did for computer vision — democratized access." — Instructor

## Concepts Introduced
- [[Self-Supervised Learning]] — learning from unlabeled data by creating training signals from the data itself
- [[Masked Language Modeling]] — BERT's pretraining task of predicting randomly masked tokens
- [[BERT]] — bidirectional encoder transformer pretrained via masked language modeling
- [[GPT]] — autoregressive decoder transformer pretrained via next-token prediction
- [[Fine-Tuning]] — adapting a pretrained model to a specific task with minimal labeled data
- [[Contextual Embeddings]] — word representations that vary based on surrounding context
- [[HuggingFace]] — platform providing pretrained models, datasets, and NLP tooling

## Connections to Other Lectures
- Builds on transformer architecture from Lecture 7
- Fine-tuning paradigm extends to LLM adaptation in Lecture 10 (PEFT/LoRA)
- GPT architecture scales to large language models in Lecture 9
- HuggingFace introduced here for computer vision in Lecture 4

## Open Questions
- When should you use BERT-style vs. GPT-style models for a new task?
- How much labeled data do you need for effective fine-tuning?
- What are the computational costs of pretraining vs. fine-tuning?
