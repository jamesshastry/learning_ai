---
type: Lecture Notes
title: "Deep Learning for Natural Language – Transformers"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "07"
video: https://youtube.com/watch?v=IeF7aATDaw4
tags: [transformers, attention, self-attention, positional-encoding, sequence-modeling]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Learning for Natural Language – Transformers

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=IeF7aATDaw4)

## TL;DR
The transformer architecture uses self-attention to process all tokens simultaneously, computing relevance scores between every pair of words to capture long-range dependencies without sequential processing. This lecture covers the "Attention Is All You Need" paper's core ideas: Query-Key-Value projections, multi-head attention, positional encoding, and the encoder-decoder structure.

## Key Takeaways
1. **Self-attention computes pairwise relevance:** Each token produces Query, Key, and Value vectors; attention scores are computed as softmax(QK^T/√d)V, determining how much each word should attend to every other word.
2. **Multi-head attention captures multiple relationship types:** Running several attention heads in parallel lets the model simultaneously track syntactic, semantic, and positional relationships.
3. **Positional encoding injects sequence order:** Since attention is inherently position-agnostic, sinusoidal or learned positional encodings are added to embeddings to preserve word order information.
4. **Transformers scale better than RNNs:** Parallel processing of all tokens (vs. sequential) enables efficient GPU utilization and captures long-range dependencies without the vanishing gradient problem of RNNs.
5. **The architecture consists of encoder and decoder stacks:** Each block contains multi-head self-attention, feed-forward networks, layer normalization, and residual connections.

## Detailed Notes

### Motivation: Beyond Sequential Processing [00:00-10:00]
- RNNs process tokens sequentially — slow and struggle with long-range dependencies
- Attention mechanism allows each token to "look at" all other tokens simultaneously
- "Attention Is All You Need" (Vaswani et al., 2017) — eliminated recurrence entirely

### Self-Attention Mechanism [10:00-30:00]
- Each input token embedding is projected into three vectors: Query (Q), Key (K), Value (V)
- Attention scores: softmax(QK^T / √d_k) — dot product of queries with keys, scaled, softmaxed
- Output: weighted sum of Value vectors using attention scores as weights
- Intuition: Q = "what am I looking for?", K = "what do I contain?", V = "what do I provide?"
- Scaling by √d_k prevents softmax from becoming too peaked for large dimensions

### Multi-Head Attention [30:00-42:00]
- Run h parallel attention heads with different learned Q, K, V projections
- Each head can specialize in different relationship types (syntactic, semantic, positional)
- Concatenate outputs and project through a final linear layer
- Typical: 8-16 heads; each head operates on d_model/h dimensions

### Positional Encoding [42:00-50:00]
- Attention treats input as a set (unordered) — must explicitly encode position
- Sinusoidal encoding: use sin/cos functions at different frequencies for each position and dimension
- Alternative: learned positional embeddings (used in many modern models)
- Added to token embeddings before attention computation

### Full Transformer Architecture [50:00-01:17:00]
- Encoder: N stacked blocks of (multi-head self-attention + feed-forward network)
- Decoder: N stacked blocks with masked self-attention (can only see past tokens) + cross-attention to encoder
- Residual connections: add input to output of each sub-layer (prevents vanishing gradients)
- Layer normalization: normalizes activations within each layer for training stability
- Feed-forward network: two dense layers with ReLU, applied independently to each position

## Notable Quotes
> "Attention is all you need — those four words changed the field of AI." — Instructor

> "The transformer is just a particular kind of neural network architecture, much like CNNs for vision." — Instructor

## Concepts Introduced
- [[Self-Attention]] — mechanism where each token computes attention over all other tokens
- [[Multi-Head Attention]] — parallel attention heads capturing different relationship types
- [[Positional Encoding]] — sinusoidal or learned signals encoding token position in a sequence
- [[Query-Key-Value]] — three projections per token enabling the attention computation
- [[Transformer Architecture]] — encoder-decoder architecture based entirely on attention
- [[Residual Connections]] — skip connections adding layer input to output for gradient flow
- [[Layer Normalization]] — normalizing activations across features within each layer

## Connections to Other Lectures
- Builds on embeddings from Lecture 6 (token embeddings are the transformer input)
- Self-attention is the key mechanism behind BERT and GPT (Lecture 8)
- Softmax from Lecture 3 is used in attention score computation
- Architecture principles extend to LLMs at massive scale (Lecture 9)

## Open Questions
- How does cross-attention in the decoder differ from self-attention?
- What are the computational limits of self-attention (quadratic in sequence length)?
- How do modern efficient attention variants (Flash Attention, sparse attention) scale transformers?
