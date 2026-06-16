---
type: Lecture Notes
title: "Architectures, Hyperparameters — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "03"
video: https://youtube.com/watch?v=lVynu4bo1rY
tags: [architecture, transformer, rms-norm, rope, swiglu, gqa, hyperparameters, stability]
timestamp: 2026-06-15T00:00:00Z
---

# Architectures, Hyperparameters — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=lVynu4bo1rY)

## TL;DR
Tatsu Hashimoto surveys modern transformer architecture decisions by examining dozens of open models. The lecture covers consensus choices (pre-norm placement, RMS norm, SwiGLU activations, RoPE embeddings), hyperparameter conventions (4x FF ratio, ~100 aspect ratio), stability techniques (QK norm, Z-loss, logit soft capping), and inference-motivated changes like Grouped Query Attention and sliding window attention.

## Key Takeaways
- **Pre-norm (layer norm outside residual stream) is universal** — keeps the residual stream clean for gradient propagation and improves training stability; only OPT-350M used post-norm in residual stream.
- **SwiGLU/GeGLU gated activations consistently outperform ungated alternatives** — the 2/3 FF dimension adjustment keeps parameter count matched; this is a near-free win adopted by virtually all modern models.
- **RoPE position embeddings dominate post-2024 models** — relative position encoding via pairwise rotation of embedding dimensions; purely relative with no absolute cross-terms unlike sinusoidal embeddings.
- **Weight decay acts as an optimization intervention, not regularization** — in single-pass SGD there is no overfitting, yet weight decay combined with learning rate decay improves final loss.
- **GQA provides near-MHA performance with major inference speedups** — reducing KV heads while keeping query heads high dramatically reduces KV cache memory with minimal quality loss.

## Detailed Notes

### Layer Norm Placement [07:30–13:15]
Every modern model uses pre-norm (norm before computation, outside residual stream). Post-norm in residual stream causes gradient attenuation across depth. Clean residual stream principle: X propagates unchanged through the network, enabling gradient flow. Some models (Grok, Gemma 2, Olmo 2) add post-norm after computation as well. Stability trick: "sprinkle in layer norms everywhere" generally helps.

### RMS Norm and Bias Removal [14:00–18:35]
RMS norm drops mean subtraction and bias from layer norm. No expressiveness loss in practice but faster due to reduced memory movement. Layer norm is 0.17% of FLOPs but can be 25% of runtime due to low arithmetic intensity. Dropping bias terms from linear layers is also standard — simplifies architecture without quality loss.

### Activation Functions and Gated Linear Units [20:18–27:09]
Zoo of activations: ReLU, GELU, SwiGLU, GeGLU. The key innovation is gating: multiply activation output element-wise with a second projection (XV). GLU variants have 3 matrices instead of 2, so FF dimension reduced by 2/3 to match parameters. SwiGLU (Llama descendants) and GeGLU (Google models) dominate. Noam Shazeer's controlled experiments show consistent gains.

### Parallel vs Serial Transformer Blocks [27:28–29:19]
GPT-J and PaLM used parallel attention+MLP blocks. Systems advantage: can fuse operations. But effectively halves depth and recent models have abandoned this — serial blocks are now dominant.

### RoPE Position Embeddings [32:27–39:00]
Rotary Position Embedding encodes relative position by rotating embedding pairs. In 2D: rotate by angle proportional to position; inner products become relative-position-dependent. Extended to D dimensions by applying 2D rotations to pairs of coordinates with varying frequencies. Gemma 4 introduced P-RoPE (rotating only first two coordinates).

### Hyperparameters [43:41–01:04:56]
FF ratio: 4x hidden dim standard; 2/3 × 4 ≈ 2.67 for GLU variants; Llama uses 3.5x. Head dimension × num_heads ≈ model dimension (ratio ~1). Aspect ratio (width/depth): ~100 is standard across model sizes. Vocab size: 30K for monolingual, 100K-200K for multilingual. Weight decay: not regularization — interacts with optimizer to improve convergence when combined with LR decay. Dropout: largely abandoned for pre-training.

### Stability Techniques [01:05:01–01:13:52]
Softmax is the danger zone (exponentials + division). Z-loss: regularizer penalizing log Z deviation from zero on output softmax. QK norm: layer norm on queries and keys before attention softmax — controls attention degeneracies without quality loss. Logit soft capping: tanh-based hard cap on attention logits (Gemma models) — effective but can limit expressiveness.

### GQA and Sliding Window Attention [01:14:08–01:28:37]
Multi-Query Attention (MQA): share K,V across all heads — dramatic KV cache reduction but quality loss. Grouped Query Attention (GQA): intermediate — fewer KV heads than query heads, near-MHA quality with major inference gains. Sliding window attention: alternate full attention and local window attention across layers (Cohere, Llama 4, Gemma 4). Hybrid architectures with SSMs (Qwen 3.5 uses Gated DeltaNet) for cheap layers.

## Notable Quotes
- "Keep your residual stream clean." — common wisdom in architecture design
- "If you have stability issues, you can kind of sprinkle in layer norms everywhere, and that will generally improve stability."
- "Weight decay is actually an optimization intervention and not necessarily a regularization intervention."
- "The original transformer formulation has somewhat stood the test of time."
- "I will make it a point of pride to never know what a SwiGLU is." — Tatsu, before having to learn it

## Concepts Introduced
- [[RMS Norm]] — layer norm variant dropping mean subtraction
- [[SwiGLU]] — Swish-gated linear unit activation
- [[RoPE]] — rotary position embedding via pairwise rotation
- [[Grouped Query Attention]] — reduced KV heads for inference efficiency
- [[QK Norm]] — layer norm on Q and K before attention softmax
- [[Z-Loss]] — log-normalizer regularizer for softmax stability

## Connections to Other Lectures
- Builds on arithmetic intensity from Lecture 02 to justify RMS norm adoption
- Attention alternatives (linear attention, SSMs) covered in Lecture 04
- GQA and KV cache relate to inference optimization in Lecture 10
- Stability techniques connect to scaling law predictability in Lectures 09/11

## Open Questions
- Why does weight decay improve optimization when combined with learning rate decay?
- Is there a principled way to choose the GQA ratio (number of KV head groups)?
- Will sliding window + full attention hybrids stabilize as the standard architecture?
