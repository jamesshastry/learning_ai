---
type: Lecture Notes
title: "Attention Alternatives and Mixture of Experts — Tatsu Hashimoto"
course: CS336 Language Modeling from Scratch
university: Stanford
lecture_id: "04"
video: https://youtube.com/watch?v=cKSwj_qZ8Jg
tags: [linear-attention, state-space-models, mamba, gated-deltanet, mixture-of-experts, moe, routing, sparse-attention]
timestamp: 2026-06-15T00:00:00Z
---

# Attention Alternatives and Mixture of Experts — Tatsu Hashimoto

**Course:** Language Modeling from Scratch
**Video:** [YouTube](https://youtube.com/watch?v=cKSwj_qZ8Jg)

## TL;DR
Tatsu covers two major architectural advances beyond vanilla transformers: (1) linear-time attention alternatives (linear attention, Mamba 2, Gated DeltaNet) that enable efficient long-context processing through RNN-attention duality, and (2) Mixture of Experts (MoE) that decouple parameter count from compute cost via sparse expert routing. Both are now deployed at scale in frontier models like Qwen 3.5, DeepSeek V3, and NeMo Tron 3.

## Key Takeaways
- **Linear attention via associativity: Q(K^T V) instead of (QK^T)V changes complexity from O(N²D) to O(ND²)** — dropping softmax enables matrix reordering, and the resulting computation has an equivalent RNN form for efficient inference.
- **No fully linear-time model matches pure attention at scale — all successful deployments are hybrids** (e.g., 7:1 linear:full attention in Minimax M1, 3:1 Gated DeltaNet:attention in Qwen 3.5).
- **MoE provides more parameters without proportional compute cost** — token-level top-K routing selects a subset of experts per token, giving ~2x training speedup over dense models at matched FLOPs.
- **Expert collapse is the core MoE training challenge, solved by load-balancing auxiliary losses** — without balancing, tokens concentrate on 1-2 experts and most parameters are wasted.
- **DeepSeek's MoE design (shared + fine-grained experts, device-level balancing) has become the standard** — copied by Qwen, GLM, and most modern MoE models.

## Detailed Notes

### Linear Attention via Associativity [01:00–09:52]
Context lengths growing exponentially (1K to 1M+ tokens). Attention cost is O(N²D_K). Key insight: drop softmax, reorder multiplication — Q(K^T V) is O(ND_V D_K). The K^T V product can be computed incrementally as an RNN: S_t = S_{t-1} + K_t V_t^T, Y_t = Q_t S_t. Dense form for training (parallel), RNN form for inference (constant memory).

### Mamba 2 and Gated DeltaNet [11:31–22:49]
Mamba 2 adds input-dependent forget gate gamma_t to linear attention recurrence. Gated DeltaNet adds both forget (gamma) and input (beta) gates plus a projection term that erases previous information in the key direction before writing new info. Both maintain training/inference duality. Qwen 3.5 uses 3:1 GDN:attention hybrid. Rule of thumb: gates must be input-dependent (not state-dependent) to preserve parallelizability.

### DeepSeek Sparse Attention (DSA) [22:49–29:24]
Alternative to linear attention: lightweight indexer selects top-K tokens, then full attention on subset. Indexer uses low-precision QK inner products. Can be bolted on during long-context extension phase rather than pre-training. DeepSeek V3.2 and GLM 5 both adopt this approach with minimal quality loss.

### MoE Fundamentals [34:25–39:42]
Replace FFN with multiple expert FFNs. Router assigns tokens to top-K experts. More parameters at same FLOPs budget. Increasing experts consistently improves loss at fixed compute. ~2x training speedup vs dense. Expert parallel provides additional parallelization axis.

### MoE Routing and Design [49:09–57:58]
Token-choice top-K routing dominates (vs expert-choice or global assignment). Router is a simple linear projection — inner product between token embedding and per-expert weight vector. DeepSeek innovation: shared experts (always on) + fine-grained routed experts. Shared experts handle common processing; routed experts specialize. Hash routing works surprisingly well but isn't used in production.

### Training MoE: Load Balancing [58:55–01:09:48]
Core problem: rich-get-richer expert collapse without intervention. Solution: auxiliary loss multiplying fraction-of-tokens-dispatched × probability-mass-allocated per expert. Gradient pushes down popular experts' routing probability. DeepSeek adds device-level balancing for systems utilization. Without load balancing: tokens collapse to 1-2 experts, training loss degrades significantly.

### MoE Systems and Stability [01:11:39–01:22:11]
Expert parallel enables additional sharding axis. Block-diagonal sparsity for efficient GPU matmuls. Down-project activations before cross-device communication (NeMo Tron 3 trick). Token dropping eliminated by dropless implementations (MegaBlocks). MoE softmax router introduces another stability risk — FP32 routing and Z-loss help. MoE fine-tuning prone to overfitting due to parameter count — freeze experts, fine-tune attention.

### DeepSeek Evolution and Multi-Token Prediction [01:22:11–01:25:41]
V1: shared + fine-grained experts with auxiliary loss. V2: scaled up with device balancing. V3: aux-loss-free balancing via online learning + sigmoid/softmax hybrid routing. Multi-head latent attention (MLA): compress KV cache via low-dimensional latent bottleneck. Multi-token prediction (MTP): predict multiple future tokens simultaneously.

## Notable Quotes
- "Constant factors really, really matter."
- "No one has thus far really proven out fully linear time attention mechanisms at scale. Everything is a hybrid."
- "The hard thing about MOEs is that during training, you only have one or K experts active. So you don't know what happened with the rest of them."
- "Guess which one people use in practice... it's a collection of really interesting heuristics that end up working."
- "It would be very easy if we activated all the experts during training. The hard thing is that we only have K experts active."

## Concepts Introduced
- [[Linear Attention]] — attention without softmax via matrix associativity
- [[Gated DeltaNet]] — state-space model with forget and input gates
- [[Mixture of Experts]] — sparse expert routing for parameter-efficient scaling
- [[Expert Collapse]] — degenerate MoE training where tokens concentrate on few experts
- [[Load Balancing Loss]] — auxiliary loss preventing expert collapse
- [[DeepSeek Sparse Attention]] — top-K token selection for efficient long-context attention

## Connections to Other Lectures
- Builds on attention and architecture foundations from Lecture 03
- Expert parallelism connects to parallelism strategies in Lectures 07–08
- MoE inference connects to Lecture 10 on inference optimization
- Flash Attention (mentioned) is detailed in Lectures 05–06

## Open Questions
- Can fully linear-time models ever match hybrid architectures at frontier scale?
- Is there a principled alternative to heuristic load-balancing losses for MoE training?
- How do MoE scaling laws differ from dense model scaling laws?
