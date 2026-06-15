---
type: Paper
title: "Adam: A Method for Stochastic Optimization"
authors: [Diederik P. Kingma, Jimmy Lei Ba]
year: 2015
venue: ICLR 2015
resource: https://arxiv.org/abs/1412.6980
tags: [optimization, adam, gradient-descent, adaptive-learning-rate, training]
timestamp: 2026-06-15T00:00:00Z
---

# Adam: A Method for Stochastic Optimization

## Summary

Proposed **Adam (Adaptive Moment Estimation)**, an optimizer that combines the benefits of two earlier methods: AdaGrad's per-parameter learning rates and RMSProp's moving average of squared gradients. Adam maintains exponentially decaying running averages of both the first moment (mean) and second moment (uncentered variance) of the gradient, with bias correction to account for their initialization at zero. The result is an optimizer that adapts learning rates per parameter, requires minimal tuning, and works well across a wide range of architectures and problems.

## Key Contributions

- **Combined momentum and adaptive learning rates** — unified first-moment estimates (momentum/SGD direction) with second-moment estimates (per-parameter scaling), getting the benefits of both
- **Bias correction** — introduced correction terms for the initialization bias of the moment estimates, which is critical in early training steps and was missing from prior adaptive methods
- **Robust default hyperparameters** — the recommended defaults (lr=0.001, β₁=0.9, β₂=0.999, ε=10⁻⁸) work well across most deep learning problems, dramatically reducing tuning effort
- **Theoretical convergence analysis** — provided regret bounds for online convex optimization showing Adam converges at the optimal rate, with advantages in sparse gradient settings

## Why It Matters

Adam became the default optimizer for deep learning. From small research experiments to training GPT-4, Adam (or its variants like AdamW) is used in virtually every major neural network. Its "just works" property — good performance with default hyperparameters across CNNs, RNNs, Transformers, and GANs — made it an essential piece of infrastructure that quietly powers most of modern AI.

## Connections

- Used to train the models in [AlexNet](alexnet.md) and [ResNet](resnet.md) era architectures, replacing hand-tuned SGD schedules
- The default optimizer for training Transformers in [Attention Is All You Need](attention-is-all-you-need.md) (as AdamW variant)
- Enables stable training of the deep networks made possible by [Batch Normalization](batch-norm.md)
