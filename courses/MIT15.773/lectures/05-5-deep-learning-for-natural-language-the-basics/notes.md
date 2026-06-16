---
type: Lecture Notes
title: "Deep Learning for Natural Language – The Basics"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "05"
video: https://youtube.com/watch?v=duBLxHjaecQ
tags: [nlp, text-vectorization, bag-of-words, tokenization, classification]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Learning for Natural Language – The Basics

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=duBLxHjaecQ)

## TL;DR
This lecture introduces NLP fundamentals: why text processing is critical, how to convert text to numbers via tokenization and vectorization, the bag-of-words model and its limitations, and a hands-on collab classifying song lyrics into genres (hip-hop, rock, pop) using Keras TextVectorization.

## Key Takeaways
1. **Text must be numericalized:** Neural networks only process numbers, so text must be converted to numerical vectors via tokenization (splitting text into tokens) and vectorization (mapping tokens to numbers).
2. **Bag-of-words ignores word order:** BoW represents text as a vector of word counts/frequencies, losing sequential information but providing a surprisingly effective baseline for classification.
3. **Vocabulary and OOV handling matter:** The vocabulary is built from training data; out-of-vocabulary (OOV/UNK) words in new text are collapsed into a single unknown token, losing distinguishing information.
4. **Keras TextVectorization automates preprocessing:** Handles tokenization, vocabulary building, and encoding as a model layer, keeping preprocessing inside the model pipeline.
5. **Start simple:** Bag-of-words with a dense network is a reasonable first attempt for text classification before moving to more sophisticated approaches like embeddings and transformers.

## Detailed Notes

### Why NLP Matters [00:16-02:00]
- Human knowledge, internet content, communication, and cultural production are predominantly text
- Text is also how humans think and reason — central to intelligence
- Course roadmap: vectorization/BoW → embeddings → transformers → LLMs

### Tokenization [02:00-20:00]
- Token: atomic unit of text (word, subword, or character)
- Word-level tokenization: split on spaces and punctuation
- Vocabulary: set of all unique tokens in training data, mapped to integer indices
- Text → integer sequence: "the cat sat" → [2, 45, 103]
- OOV (out-of-vocabulary) problem: unseen words replaced by UNK token — Romeo, Juliet, Hamlet all become the same UNK

### Bag-of-Words Model [20:00-39:00]
- Represent text as fixed-length vector where each position = a vocabulary word
- Multi-hot encoding: 1 if word present, 0 if absent (binary BoW)
- Count encoding: number of times each word appears
- TF-IDF: weight by term frequency × inverse document frequency
- Key limitation: word order completely lost — "dog bites man" = "man bites dog"
- Despite limitations, effective default for many classification tasks

### Song Genre Classification Collab [39:00-01:17:00]
- Dataset: song lyrics labeled as hip-hop, rock, or pop
- Keras TextVectorization layer handles tokenization and encoding
- Architecture: TextVectorization → Dense(64, relu) → Dense(3, softmax)
- Achieves reasonable accuracy distinguishing genres from lyric vocabulary
- Demonstrates complete pipeline: raw text → preprocessing → model → prediction

## Notable Quotes
> "Text forms not just a big chunk of all the media that's out there but it also happens to be the way in which we think." — Instructor [01:43]

> "Bag of words is actually a really good default for many NLP tasks." — Instructor [39:21]

> "In the spirit of do the simple stuff first and do complicated things only if the simple doesn't work." — Instructor [39:26]

## Concepts Introduced
- [[Tokenization]] — splitting text into atomic units (words, subwords, or characters)
- [[Bag-of-Words]] — text representation as unordered word count/frequency vectors
- [[Text Vectorization]] — converting text strings into numerical tensors for neural networks
- [[Vocabulary]] — the fixed set of known tokens built from training data
- [[Out-of-Vocabulary]] — tokens not in the vocabulary, collapsed to a single UNK token

## Connections to Other Lectures
- Sets foundation for embeddings (Lecture 6) which address BoW limitations
- Tokenization concepts evolve into subword tokenization for LLMs (Lecture 9)
- Classification pipeline pattern reused throughout NLP lectures

## Open Questions
- How can we preserve word order information? (addressed by embeddings and sequence models)
- How do modern LLMs handle the OOV problem? (subword tokenization like BPE)
- When is bag-of-words sufficient vs. when do you need more sophisticated methods?
