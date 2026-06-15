---
type: Paper
title: "ImageNet Classification with Deep Convolutional Neural Networks"
authors: [Alex Krizhevsky, Ilya Sutskever, Geoffrey E. Hinton]
year: 2012
venue: NeurIPS 2012
resource: https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html
tags: [cnn, computer-vision, deep-learning, architecture]
timestamp: 2026-06-14T00:00:00Z
---

# AlexNet

## Summary

Won the 2012 ImageNet Large Scale Visual Recognition Challenge by a dramatic margin (15.3% top-5 error vs. 26.2% for the runner-up), demonstrating that deep convolutional neural networks trained on GPUs could vastly outperform hand-engineered feature extractors. This result is widely credited with igniting the modern deep learning revolution.

## Key Contributions

- **GPU training at scale** — trained a 60-million-parameter CNN on two GTX 580 GPUs, proving that commodity hardware could power deep networks
- **ReLU activation** — popularized Rectified Linear Units over tanh/sigmoid, enabling faster training of deep networks
- **Dropout regularization** — introduced dropout as a practical technique to reduce overfitting in large networks
- **Data augmentation** — used image translations, reflections, and PCA-based color augmentation to artificially expand the training set

## Why It Matters

Before AlexNet, the ML community was largely skeptical of deep neural networks. This single result shifted the entire field. Ilya Sutskever, a co-author, would later co-found OpenAI. The lesson — that more data + more compute + a general architecture beats domain-specific engineering — presaged [The Bitter Lesson](../scaling/the-bitter-lesson.md) by seven years.

## Connections

- Led directly to deeper architectures like [ResNet](resnet.md)
- The GPU-training paradigm it validated is the foundation of the GPU economy discussed in MSE435
- Precursor to the "scaling beats engineering" thesis formalized in [The Bitter Lesson](../scaling/the-bitter-lesson.md)
