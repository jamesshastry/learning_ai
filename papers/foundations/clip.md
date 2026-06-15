---
type: Paper
title: "Learning Transferable Visual Models From Natural Language Supervision"
authors: [Alec Radford, Jong Wook Kim, Chris Hallacy, Aditya Ramesh, Gabriel Goh, Sandhini Agarwal, Girish Sastry, Amanda Askell, Pamela Mishkin, Jack Clark, Gretchen Krueger, Ilya Sutskever]
year: 2021
venue: ICML 2021
resource: https://arxiv.org/abs/2103.00020
tags: [multimodal, contrastive-learning, vision, language, zero-shot, clip]
timestamp: 2026-06-15T00:00:00Z
---

# Learning Transferable Visual Models From Natural Language Supervision

## Summary

Introduced **CLIP (Contrastive Language-Image Pre-training)**, which learns visual representations from natural language supervision by training an image encoder and a text encoder jointly to predict which (image, text) pairs go together. Trained on 400 million image-text pairs scraped from the internet, CLIP achieves **zero-shot transfer** to downstream vision tasks — matching the performance of a fully supervised ResNet-50 on ImageNet without seeing a single ImageNet training example.

## Key Contributions

- **Contrastive pre-training at scale** — jointly trained image and text encoders on 400M noisy image-text pairs using a contrastive objective that maximizes cosine similarity of matching pairs
- **Zero-shot visual classification** — cast image classification as image-text matching by converting class labels to natural language prompts (e.g., "a photo of a dog"), eliminating the need for task-specific training
- **Robust transfer across distributions** — demonstrated that CLIP's representations generalize across distribution shifts far better than ImageNet-trained models, performing well on adversarial and out-of-distribution benchmarks
- **Bridging vision and language** — created a shared embedding space for images and text, enabling open-vocabulary visual understanding without fixed label sets

## Why It Matters

CLIP proved that natural language can serve as a flexible, scalable supervision signal for vision. It became the backbone of text-to-image systems (DALL-E 2, Stable Diffusion), enabled open-vocabulary object detection, and established the multimodal pre-training paradigm. The idea that language supervision scales better than curated labels was a direct validation of scaling-first approaches.

## Connections

- Builds on the CNN architectures from [AlexNet](alexnet.md) and [ResNet](resnet.md) as image encoders
- Uses the Transformer from [Attention Is All You Need](attention-is-all-you-need.md) as the text encoder
- Shares the scaling-and-pre-training philosophy of [GPT-3](../language-models/gpt3.md) but applied to vision-language learning
- Directly enabled diffusion-based image generation (see [DDPM](ddpm.md) for the generative counterpart)
