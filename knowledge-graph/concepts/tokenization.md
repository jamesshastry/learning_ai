---
aliases: ["Text Tokenization", "Word Tokenization", "Token", "Embedding", "Encoding"]
tags: [data, data-processing, nlp]
type: concept
first_seen: MIT15.773/05
sources:
  - course: MIT15.773
    lecture: "05"
    timestamps: ["02:00", "10:00"]
  - course: mit-6s191
    lecture: "02"
    timestamps: ["24:10", "25:36"]
---
# Tokenization

The process of converting raw data (text, audio, etc.) into numerical representations suitable for neural network processing. Ideally captures semantic relationships so that similar concepts map to nearby points in the embedding space.

## Key Points from Sources

- **MIT15.773 Lecture 05**
- **mit-6s191 Lecture 02**

## Related Concepts

- [[Vocabulary]] (enables) — Tokenization produces tokens that form the vocabulary
- [[Text Vectorization]] (prerequisite for) — Tokenization must occur before text can be vectorized
- [[Transformer]] (prerequisite for) — Tokenization is the first step before feeding data into transformer models.
