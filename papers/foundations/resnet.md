---
type: Paper
title: "Deep Residual Learning for Image Recognition"
authors: [Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun]
year: 2015
venue: CVPR 2016
resource: https://arxiv.org/abs/1512.03385
tags: [cnn, residual-connections, architecture, computer-vision, deep-learning]
timestamp: 2026-06-14T00:00:00Z
---

# ResNet

## Summary

Introduced **residual connections** (skip connections), allowing networks to be trained to unprecedented depth (152 layers vs. the ~20-layer limit of prior architectures). The key insight: instead of learning a desired mapping H(x) directly, learn the residual F(x) = H(x) − x, making it easy for layers to learn the identity function if they have nothing useful to add.

## Key Contributions

- **Skip connections** — short-circuit paths that let gradients flow directly through the network, solving the vanishing gradient problem at depth
- **Extreme depth** — successfully trained networks up to 1,202 layers (though 152-layer ResNet was the practical sweet spot)
- **Batch normalization throughout** — combined with skip connections for stable training of very deep networks
- **Won ImageNet 2015** — 3.57% top-5 error, surpassing human-level performance (5.1%) for the first time

## Why It Matters

Skip connections are now ubiquitous. The Transformer architecture in [Attention Is All You Need](attention-is-all-you-need.md) uses residual connections around every sub-layer — without them, deep Transformers cannot train. The principle that "depth + skip connections > width" influenced how [scaling laws](../scaling/scaling-laws.md) were later understood.

## Connections

- Built on the foundation laid by [AlexNet](alexnet.md) — deeper, with the degradation problem solved
- Residual connections are a critical component of the [Transformer](attention-is-all-you-need.md) architecture
- The depth-scaling insight connects to [Scaling Laws](../scaling/scaling-laws.md) — more parameters help, if you can train them
