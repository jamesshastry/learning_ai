---
type: Lecture Notes
title: "Deep Sequence Modeling"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "02"
video: https://youtube.com/watch?v=d02VkQ9MP44
tags: [sequence-modeling, rnn, recurrent-neural-networks, attention, transformer, nlp]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Sequence Modeling

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=d02VkQ9MP44)

## TL;DR
Ava Amini introduces sequence modeling, building from feed-forward networks to recurrent neural networks (RNNs) with internal state, then progressing to the attention mechanism and transformers. The lecture covers design criteria for sequence models (numerical encoding, variable-length inputs, long-range dependencies, order sensitivity), RNN training via backpropagation through time, vanishing/exploding gradients, and the self-attention mechanism that powers modern transformers.

## Key Takeaways
- Sequential data is everywhere: text, audio, video, medical signals, financial time series, biological sequences
- RNNs maintain an internal hidden state h(t) that carries information across time steps via a recurrence relation
- RNNs use the same weight matrices at every time step (weight sharing), enabling variable-length sequence processing
- Backpropagation through time (BPTT) propagates gradients across time steps, but suffers from vanishing and exploding gradient problems
- The attention mechanism eliminates the need for recurrence by learning which parts of an input are most important via query-key-value decomposition
- Self-attention computes similarity scores between all positions in a sequence using scaled dot-product, enabling parallel processing
- Transformers stack multiple attention heads to learn different patterns of importance simultaneously
- Positional encodings preserve order information when processing all tokens in parallel

## Detailed Notes

### Sequential Data and Motivation [00:11-03:25]
Sequential data requires temporal context for prediction. A ball's next position is unpredictable from a single frame but obvious from a trajectory. Sequential data spans audio waveforms, text, medical signals, stock markets, biological sequences, weather, and video. Key tasks include sequence classification (sentiment analysis), one-to-many (image captioning), and many-to-many (machine translation).

### From Perceptrons to RNNs [06:13-13:18]
Feed-forward networks process each time step independently with no information flow between steps. RNNs introduce an internal state variable h(t) that is maintained and updated at each time step. The prediction at time t depends on both the current input x(t) and the past state h(t-1). This recurrence relation links computations across time.

### RNN Formalization [14:00-19:20]
The hidden state update: h(t) = tanh(W_hh * h(t-1) + W_xh * x(t)). The output: y(t) = W_hy * h(t). Three weight matrices (W_xh, W_hh, W_hy) are learned and reused at every time step. The forward pass computes predictions at each step; losses are summed across the sequence for an aggregate loss.

### Design Criteria for Sequence Models [22:57-30:31]
1. Handle numerical encoding of non-numeric data (embeddings, tokenization that captures semantic relationships)
2. Process variable-length sequences (RNNs handle this via step-by-step processing)
3. Capture long-range dependencies (words early in a sentence affect predictions far downstream)
4. Respect order (changing word order changes meaning entirely)

### Training RNNs: BPTT and Gradient Problems [30:35-36:39]
Backpropagation through time extends standard backprop across time steps. Gradients require repeated multiplication by the weight matrix W_hh. Large weights cause exploding gradients (mitigated by gradient clipping). Small weights cause vanishing gradients, biasing the model toward short-term dependencies. LSTM (Long Short-Term Memory) was a pioneering solution for controlling information flow in state updates.

### Attention Mechanism [38:21-54:04]
RNN limitations: encoding bottleneck (all history compressed into fixed-size h), slow sequential processing, and limited long-term memory. Attention asks: which parts of the input are most important? Formalized via query (Q), key (K), and value (V) matrices learned from positional embeddings. Attention score = softmax(Q·K^T / sqrt(d)). Output = attention weights × V. This is highly parallelizable, unlike RNNs. Multiple attention heads learn different importance patterns simultaneously.

### Transformers and Beyond [54:50-56:06]
The transformer architecture, built on self-attention, powers GPT, BERT, and modern LLMs. It extends beyond NLP to biology (protein/DNA sequences), vision (Vision Transformers), and other domains. The T in GPT stands for Transformer.

## Notable Quotes
- "The core idea behind many sequence modeling problems is that we have data resolved in time and we want to make a prediction about the state of the system." [02:16]
- "This core idea of maintaining an internal state h(t), updating it per individual time steps... is the core intuitive idea behind recurrent neural networks." [13:20]
- "What if we eliminated the need for recurrence entirely?" [40:48]
- "The foundational mechanism behind these transformers is the attention operation." [42:58]
- "The T in all of these acronyms stands for transformer." [42:53]

## Concepts Introduced
- [[Recurrent Neural Network]] -- neural network with internal state and temporal recurrence
- [[Hidden State]] -- internal memory variable maintained across time steps
- [[Backpropagation Through Time]] -- extending backprop across sequential time steps
- [[Vanishing Gradient Problem]] -- gradient signal decay in deep/long sequences
- [[Attention Mechanism]] -- learning to identify important parts of input via Q/K/V
- [[Self-Attention]] -- attention applied within a single sequence
- [[Transformer]] -- architecture built on self-attention, replacing recurrence
- [[Positional Encoding]] -- encoding position information for parallel sequence processing
- [[Tokenization]] -- converting text/data into numerical representations

## Connections to Other Lectures
- Builds directly on Lecture 01's perceptron and backpropagation foundations
- Attention mechanism reappears in Lecture 03 as Vision Transformers
- Next-word prediction connects directly to Lecture 06's LLM discussion
- Music generation application connects to Software Lab 1

## Open Questions
- How do positional encodings scale to very long contexts (100K+ tokens)?
- What are the fundamental limits of attention-based models compared to state-space models?
- Can attention mechanisms be made sub-quadratic without sacrificing quality?
