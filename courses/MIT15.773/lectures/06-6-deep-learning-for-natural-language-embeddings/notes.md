---
type: Lecture Notes
title: "Deep Learning for Natural Language – Embeddings"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "06"
video: https://youtube.com/watch?v=LqFc0z-pQTg
tags: [nlp, embeddings, word2vec, semantic-similarity, dense-vectors]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Learning for Natural Language – Embeddings

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=LqFc0z-pQTg)

## TL;DR
Word embeddings map words to dense vectors where semantic similarity corresponds to geometric proximity, enabling neural networks to understand word meaning and relationships through learned representations. This lecture covers Word2Vec, pretrained embeddings (GloVe), embedding layers in Keras, and analogy arithmetic.

## Key Takeaways
1. **Embeddings capture semantic meaning in dense vectors:** Unlike sparse bag-of-words, embeddings map each word to a dense vector (e.g., 100-300 dimensions) where similar words cluster together geometrically.
2. **Pretrained embeddings transfer knowledge:** GloVe and Word2Vec embeddings trained on billions of words capture general language knowledge reusable across tasks.
3. **Embedding layers are trainable in Keras:** An `Embedding(vocab_size, embed_dim)` layer maps integer token IDs to dense vectors, trainable end-to-end or initialized from pretrained weights.
4. **Analogy arithmetic works:** Embedding spaces support vector arithmetic: king - man + woman ≈ queen, demonstrating captured relational structure.
5. **Embedding dimensions balance expressiveness vs. efficiency:** Typical choices are 50-300 dimensions; higher dimensionality captures more nuance but increases parameters.

## Detailed Notes

### From Sparse to Dense Representations [00:00-15:00]
- Bag-of-words vectors are extremely sparse (vocabulary-sized, mostly zeros)
- Embeddings compress words into dense, low-dimensional vectors (50-300 dimensions)
- Semantically similar words (king/queen, cat/dog) end up close in embedding space
- Cosine similarity measures semantic relatedness between embedding vectors

### Word2Vec [15:00-35:00]
- Two architectures: Skip-gram (predict context from word) and CBOW (predict word from context)
- Skip-gram: given a center word, predict surrounding context words within a window
- Training forces the model to learn vectors where co-occurring words are nearby
- Negative sampling: efficient training contrasting real context against random "negative" words
- Result: a vocabulary-sized lookup table of dense vectors

### Pretrained Embeddings and GloVe [35:00-50:00]
- GloVe (Global Vectors): trained on word co-occurrence statistics from massive corpora
- Available in various dimensions (50, 100, 200, 300) for download
- Can initialize Keras Embedding layer with pretrained weights and optionally freeze them
- Analogy arithmetic: king - man + woman ≈ queen; Paris - France + Italy ≈ Rome

### Using Embeddings in Keras [50:00-01:17:00]
- `keras.layers.Embedding(input_dim=vocab_size, output_dim=embed_dim)`
- Input: integer sequences (token IDs); Output: sequences of dense vectors
- Typical pipeline: tokenize → embed → process with dense/conv layers → classify
- Application to song genre classification: embeddings improve over bag-of-words baseline

## Notable Quotes
> "Embeddings are the atomic unit of all modern natural language processing." — Instructor [00:35]

> "King minus man plus woman approximately equals queen — that's when researchers knew embeddings were capturing something deep about language." — Instructor

## Concepts Introduced
- [[Word Embeddings]] — dense vector representations of words capturing semantic meaning
- [[Word2Vec]] — algorithm learning embeddings from context prediction (Skip-gram/CBOW)
- [[Pretrained Embeddings]] — embedding vectors trained on large corpora (GloVe) for reuse
- [[Embedding Layer]] — Keras layer mapping integer token IDs to trainable dense vectors
- [[Cosine Similarity]] — measure of angle between vectors, used to compare embeddings

## Connections to Other Lectures
- Bag-of-words from Lecture 5 is the baseline that embeddings improve upon
- Embeddings are foundational for transformer attention mechanisms (Lecture 7)
- Pretrained embeddings parallel transfer learning concepts from vision (Lecture 4)
- Token embeddings scale up to LLM vocabulary embeddings (Lecture 9)

## Open Questions
- How do contextual embeddings (BERT) differ from static Word2Vec embeddings?
- What embedding dimension is optimal for a given task?
- How well do embedding-based analogies work across languages and domains?
