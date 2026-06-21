---
type: Lecture Notes
title: "Sequence Models: RNN, Transformer, and Transformer Policy"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "25"
slide_url: https://drive.google.com/file/d/1E-7eeX--IgET1CALeAiI-Ct9zsdNcLyh/view?usp=sharing
tags: [RNN, transformer, attention, decision-transformer, sequence-modeling]
timestamp: 2026-04-23T00:00:00Z
---

## TL;DR

Sequence modeling is the backbone of modern robot learning: given a history of observations (or states and actions), how do we aggregate them into a useful representation? The lecture traces the progression from naive pooling, to RNNs, to transformers. RNNs process tokens one step at a time through a hidden state but suffer from limited parallelism, poor long-range memory, and vanishing/exploding gradients. Transformers fix this with scaled dot-product attention — every token attends directly to every other token in $O(1)$ path length, at the cost of $O(n^2 d)$ compute. The lecture closes by showing how transformers are deployed as robot policies: the Scene Memory Transformer maintains an episodic observation buffer for POMDP navigation, the Decision Transformer recasts RL as sequence modeling over $(R, s, a)$ triples with a causal mask, and Action Chunking with Transformers (ACT) uses a CVAE to predict coherent multi-step action chunks.

---

## Key Takeaways

1. **Sequence data** is any data where element order matters; robot trajectories, video frames, and language are all examples.
2. **Naive aggregation** (pooling or concatenation) is either too coarse or computationally intractable.
3. **RNNs** compress history into a fixed hidden state $h_t = f_\theta(h_{t-1}, x_t)$, enabling constant-size memory but forcing sequential computation and causing vanishing/exploding gradients over long horizons.
4. **Dot-product (scaled) attention** lets each token directly aggregate information from all others, parameterized by Query, Key, and Value projections: $\text{Attention}(Q, K, V) = \text{Softmax}\!\left(\tfrac{QK^\top}{\sqrt{d_k}}\right)V$.
5. **Multi-head attention** runs $h$ independent attention heads and concatenates results, capturing multiple relationship types simultaneously.
6. **A transformer block** = multi-head self-attention + feed-forward network + residual connections + layer normalization; stacking blocks yields the full transformer.
7. **Positional encoding** must be added explicitly because self-attention is permutation-invariant.
8. **Masking** controls information flow: fully-visible, causal, or causal-with-prefix, depending on the task.
9. **Vision Transformer (ViT)** applies transformers to images by treating fixed-size patches as tokens.
10. **Transformer policies** (SMT, Decision Transformer, ACT) apply these ideas directly to robot learning, with the transformer handling history, conditioning, and action generation.

---

## Detailed Notes

### Slide 2 — Agenda

Topics covered in order:
1. Sequence Modeling
2. Attention Mechanism
3. Transformer
4. Vision Transformer
5. Transformer Policy

---

### Slides 3–7 — Sequence Modeling

**Sequence data** (slide 3): data where the order of elements is significant and each element's position provides crucial context. Examples shown: text autocomplete, video frames of a cooking task, a robot arm manipulation sequence.

**Sequence modeling** (slide 3): encode a sequence into useful predictions or decisions.

**Tokenization** (slide 4): break input into tokens; map each token $i$ to a learned embedding vector:

$$x_i = \text{Embed}(\text{token}_i)$$

The embedding function $\psi$ is shared across positions. For the phrase "Welcome to the real world," this produces embeddings $x_0, x_1, x_2, x_3, x_4$.

**The core challenge** (slide 5): given embeddings $x_0, x_1, \ldots, x_n$, combine them into a representation useful for prediction $y$. The central design question is **how tokens should exchange information**.

**Naive approach 1 — max pooling** (slide 6): apply max-pooling over all embeddings to get a summary $h$, then predict $y = g(h)$. Simple but too coarse for most sequence tasks; order information is discarded.

**Naive approach 2 — concatenation** (slide 7): concatenate all embeddings into one long vector before predicting. Intractable computation for long sequences and poor generalization to different lengths.

---

### Slides 8–12 — Recurrent Neural Network (RNN)

**Core idea** (slide 8): process tokens one step at a time. Maintain a hidden state $h_t$ that summarizes all past tokens. Use $h_t$ to make predictions.

$$h_t = f_\theta(h_{t-1},\, x_t)$$
$$y_t = g_\theta(h_t)$$

The hidden state is initialized to $0$ (or a learned vector), and the same parameters $\theta$ are reused at every step (weight sharing).

**Unrolled view** (slide 9): the RNN applied to "Welcome to the real world" produces a chain $0 \to h_0 \to h_1 \to h_2 \to h_3 \to h_4$, each step consuming one new token.

**Challenge 1 — Limited parallelism** (slide 10): because $h_t$ depends on $h_{t-1}$, steps must execute sequentially. For a sequence of length $T$ this forces $O(T)$ sequential operations, making training slow on modern parallel hardware.

**Challenge 2 — Long-range dependencies** (slide 11): information from early tokens (e.g., $x_0$, $x_1$) must pass through every intermediate hidden state to reach $h_T$. For long sequences the signal attenuates, making it hard for the model to use context from many steps back.

**Challenge 3 — Vanishing and exploding gradients** (slide 12): during backpropagation through time (BPTT), the gradient of the loss with respect to early parameters involves a product of Jacobians over all time steps:

$$\frac{\partial \mathcal{L}}{\partial \theta} \propto \prod_{t=1}^{T} \frac{\partial h_t}{\partial h_{t-1}}$$

If the spectral norm of each factor is $< 1$, the product goes to zero exponentially fast (**vanishing gradient**). If $> 1$, it goes to infinity (**exploding gradient**). Both make optimization difficult.

---

### Slide 13 — Rethinking Sequence Modeling

Desired properties for a better sequence model:
- **Direct interaction** between tokens (no bottleneck hidden state)
- **Easy optimization** (short gradient paths)
- **Efficient parallelization** (no sequential dependency)

This motivates the attention mechanism.

---

### Slides 14–20 — Dot-Product Attention Mechanism

**Basic idea** (slide 14): instead of compressing the past into one hidden state, let each token directly look at other tokens. Update embedding $x_i$ as a weighted sum of all embeddings:

$$h_i = \sum_j w_{i,j}\, x_j$$

The weight $w_{i,j}$ captures the relationship between token $i$ and token $j$.

**Value projection** (slide 15): for greater expressiveness, first project each embedding to a **value** $V_j$ via a linear map before summing:

$$h_i = \sum_j w_{i,j}\, V_j$$

**Query–Key formulation** (slides 16–18): to compute $w_{i,j}$ in a learned, content-dependent way, define:
- **Query** $Q_i$: "what is token $i$ looking for?"
- **Key** $K_j$: "what information does token $j$ contain?"

The weight $w_{i,j}$ is derived from the dot product $Q_i \cdot K_j$. All pairwise weights form the **attention matrix** $W \in \mathbb{R}^{n \times n}$, computed from $Q$ and $K$.

**Scaled dot-product attention** (slide 19): project inputs into three matrices and compute:

$$Q \in \mathbb{R}^{n_q \times d_k}, \quad K \in \mathbb{R}^{n_k \times d_k}, \quad V \in \mathbb{R}^{n_k \times d_v}$$

$$\text{Attention}(Q, K, V) = \text{Softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right) V$$

The $\sqrt{d_k}$ scaling prevents the dot products from growing large and saturating the softmax. Computation: MatMul $\to$ Scale $\to$ optional Mask $\to$ Softmax $\to$ MatMul with $V$.

> Reference: Vaswani et al. "Attention Is All You Need." 2017.

**Multi-head attention** (slide 20): run $h$ independent attention heads, each with its own learned projections $W_i^Q, W_i^K, W_i^V$, then concatenate and project:

$$\text{head}_i = \text{Attention}(Q W_i^Q,\, K W_i^K,\, V W_i^V)$$

$$\text{MultiHead}(Q, K, V) = \text{Concat}(\text{head}_1, \ldots, \text{head}_h)\, W^O$$

Multiple heads allow the model to simultaneously attend to different types of relationships (e.g., syntactic vs. semantic) at different positions.

---

### Slides 21–30 — Transformer

**Transformer block** (slide 21): the building block of the full transformer contains:
1. Multi-head self-attention
2. Add & Norm (residual connection + layer normalization)
3. Feed-forward network (position-wise MLP)
4. Add & Norm

Stacking many such blocks gives the **Transformer Model**. Residual connections allow gradients to flow directly and help with deep network training. Layer normalization stabilizes activations.

**Transformer as sequence-to-sequence** (slide 22): a transformer maps an input sequence $x_0, \ldots, x_n$ to an output sequence $y_0, \ldots, y_n$. Each output token $y_i$ is computed using repeated self-attention and feed-forward layers over the entire input.

**Positional encoding** (slide 23): self-attention is **permutation-invariant** — shuffling the input tokens produces the same output embeddings. To inject order information, a positional encoding vector is added to each token embedding before feeding into the transformer. Positional encodings can be:
- **Fixed**: sinusoidal functions of position (original "Attention Is All You Need")
- **Learned**: trainable embeddings per position
- **Absolute** vs. **relative** (relative encodings encode distance between tokens rather than absolute index)

**Masking** (slides 24–28): controls which tokens each output token is allowed to attend to.

- **Fully-visible mask** (slide 24): every token can attend to all tokens. Appropriate when the entire input sequence is available at once (e.g., encoder-only models like BERT).
- **Causal mask** (slides 25–27): token $y_t$ can only depend on inputs $x_{t'}$ for positions $t' \le t$. This enforces autoregressive generation — future tokens are hidden. The attention matrix is lower-triangular.
- **Causal mask with prefix** (slide 28): a prefix of the sequence is fully visible (bidirectional attention), while tokens beyond the prefix are generated causally. Useful for sequence-to-sequence tasks where the prompt is known.

**CLS token** (slide 29): when a single global representation of the sequence is needed (e.g., for classification), prepend a special `[CLS]` token to the input. After transformer processing, its output embedding $y_\text{CLS}$ aggregates information from the entire sequence via self-attention and serves as the global representation.

**Computational complexity** (slide 30): self-attention compares every token with every other token, leading to quadratic cost in sequence length $n$:

| Layer Type | Complexity per Layer | Sequential Ops | Max Path Length |
|---|---|---|---|
| Self-Attention | $O(n^2 \cdot d)$ | $O(1)$ | $O(1)$ |
| Recurrent | $O(n \cdot d^2)$ | $O(n)$ | $O(n)$ |
| Convolutional | $O(k \cdot n \cdot d^2)$ | $O(1)$ | $O(\log_k n)$ |
| Self-Attention (restricted) | $O(r \cdot n \cdot d)$ | $O(1)$ | $O(n/r)$ |

The key advantage of self-attention: $O(1)$ maximum path length means any two tokens can interact directly in a single layer, enabling excellent long-range dependency modeling despite the quadratic compute cost.

---

### Slides 31–32 — Vision Transformer (ViT)

**ViT** (slide 31): extends transformers to images by treating image patches as tokens.

1. Split the image into fixed-size patches (e.g., 16×16 pixels).
2. Linearly embed (flatten + project) each patch.
3. Add learned position embeddings.
4. Prepend a learnable `[CLS]` token.
5. Feed the resulting sequence to a standard transformer encoder.
6. Use the `[CLS]` output for classification via an MLP head.

> Reference: Dosovitskiy et al. "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale." 2020.

**Learned representations** (slide 32): visualizations from ViT-L/16 show:
- The RGB embedding filters (first 28 PCA components) resemble Gabor-like edge detectors — structure emerges from data without convolutional inductive bias.
- Position embedding similarity has a grid-like structure where nearby patches have similar embeddings, showing the model learns 2D spatial layout.
- Early layers exhibit short mean attention distances; later layers have longer attention distances, suggesting hierarchical processing similar to CNNs.

---

### Slides 33–36 — Transformer Policy

**Motivation** (slide 33): in a POMDP setting, the robot cannot observe the full state. The policy must reason over a **history of observations** to infer the hidden state and act correctly.

#### Scene Memory Transformer (SMT) — slides 33–34

> Reference: Fang et al. "Scene Memory Transformer for Embodied Agents in Long-Horizon Tasks." CVPR 2019.

**Architecture**:
1. Encode each observation (image $I_t$, pose $p_t$, previous action $a_{t-1}$) into an embedding using a CNN encoder.
2. Store embeddings from all previous time steps in a **scene memory** buffer $[o_1, o_2, \ldots, o_t]$.
3. Feed the memory to a transformer encoder–decoder:
   - The encoder attends over all stored observations.
   - The decoder attends over the encoded memory to produce an action.
4. An FC layer maps the decoder output to an action.

**Tasks**: Roaming, Coverage, and Search in indoor 3D environments. The transformer allows the policy to attend selectively to the most relevant past observations, regardless of how far back they occurred.

#### Decision Transformer — slide 35

> Reference: Chen and Lu et al. "Decision Transformer: Reinforcement Learning via Sequence Modeling." NeurIPS 2021.

**Core idea**: recast offline RL as a **sequence modeling** problem. No value functions, no Bellman equations — just supervised learning on trajectories.

**Input sequence**: interleave return-to-go $\hat{R}_t$, state $s_t$, and action $a_t$ for each timestep:

$$\hat{R}_{t-1},\, s_{t-1},\, a_{t-1},\, \hat{R}_t,\, s_t,\, a_t, \ldots$$

Each modality ($\hat{R}$, $s$, $a$) gets its own linear embedding. A **positional + episodic timestep encoding** is added.

**Transformer**: a causal transformer (GPT-style) processes the token sequence with a lower-triangular causal mask.

**Output**: a linear decoder predicts actions autoregressively from the state token at each position. At inference, specify the desired return-to-go to condition the policy on performance level.

#### Action Chunking with Transformers (ACT) — slide 36

> Reference: Zhao et al. "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware." RSS 2023.

**Motivation**: imitation learning for dexterous manipulation is hard because human demonstrations are multimodal (multiple valid action trajectories). Predicting one action at a time can cause compounding errors and mode-switching artifacts.

**ACT architecture** — a Conditional VAE (CVAE):

- **CVAE encoder** (used only during training):
  - Input: `[CLS]` token, joint states, action sequence (with positional embeddings).
  - Output: a **style latent variable** $z$ capturing the action style of the demonstration.

- **CVAE decoder / policy** (used at inference):
  - Input: visual observations from multiple cameras (processed by CNN + positional embedding), joint states, latent $z$.
  - Transformer encoder processes these inputs.
  - Transformer decoder (with fixed positional embeddings) autoregressively generates a **chunk** of $k$ future actions.
  - At inference, $z = 0$ (mean of the prior).

**Key insight**: predicting an entire action chunk (e.g., 100 steps) rather than one action at a time reduces the effective decision frequency, smoothing out execution and handling multimodality via the CVAE latent.

---

## Summary

| Architecture | Key Mechanism | Strengths | Weaknesses |
|---|---|---|---|
| RNN | Recurrent hidden state | Constant memory, online | Sequential, vanishing gradients |
| Transformer | Scaled dot-product attention | Parallel, O(1) path length | $O(n^2)$ cost in sequence length |
| ViT | Patch tokenization | No conv. inductive bias | Needs large data |
| SMT | Episodic scene memory | Handles POMDP history | Memory grows with episode |
| Decision Transformer | Return-conditioned seq. modeling | Offline RL as supervised learning | No dynamic programming |
| ACT | CVAE + action chunking | Handles multimodal demos | Chunk length is a hyperparameter |
