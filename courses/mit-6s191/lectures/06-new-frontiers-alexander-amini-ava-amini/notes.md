---
type: Lecture Notes
title: "New Frontiers"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "06"
video: https://youtube.com/watch?v=ev7cLSd-ySE
tags: [limitations, generalization, diffusion-models, llm, scaling, adversarial-attacks, bias]
timestamp: 2026-06-15T00:00:00Z
---

# New Frontiers

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=ev7cLSd-ySE)

## TL;DR
Ava Amini and Alexander Amini survey the frontiers and limitations of deep learning. The lecture covers the universal approximation theorem, generalization vs overfitting (with the random label experiment), adversarial attacks, algorithmic bias, data quality issues, and uncertainty quantification. It then introduces diffusion models as a new generative paradigm and provides foundations of large language models (tokenization, next-token prediction, cross-entropy loss, emergent abilities through scaling).

## Key Takeaways
- The universal approximation theorem guarantees a single-hidden-layer network can approximate any continuous function, but with no guarantees on layer size or generalization
- Neural networks can perfectly fit randomly labeled data (memorization), demonstrating the gap between training performance and generalization
- Adversarial attacks perturb inputs imperceptibly to fool models by computing gradients with respect to inputs (inverting gradient descent)
- Diffusion models generate samples iteratively by learning to remove noise step-by-step, avoiding GANs' training instability and mode collapse
- Forward process: progressively add Gaussian noise to data; reverse process: train neural network to predict and remove noise at each step
- LLMs are large neural networks trained on massive text corpora via next-token prediction using cross-entropy loss
- Emergent abilities appear at certain model scale thresholds: capabilities that only manifest when models cross critical size boundaries
- LLM limitations include hallucination (well-calibrated models necessarily hallucinate), jailbreaking, and challenges in long-term planning/logic

## Detailed Notes

### Universal Approximation Theorem [09:06-11:00]
A feed-forward network with one hidden layer can approximate any continuous function to arbitrary precision. Caveats: no guarantee on the required layer size, and no guarantee on generalization capacity. This theoretical result contextualizes why neural networks work but also why overfitting is a fundamental concern.

### Rethinking Generalization [13:09-16:09]
Landmark experiment: randomly reassign labels in ImageNet, train a deep network. Training accuracy remains near-perfect regardless of label randomization, but test accuracy degrades monotonically with randomization degree. This demonstrates neural networks are powerful function approximators that can memorize arbitrary mappings, reinforcing the importance of the train/test split.

### Limitations: Bias, Adversarial Attacks, Uncertainty [19:29-27:59]
Data bias: models trained on biased data reproduce those biases (e.g., colorizing dog tongues as always out, autonomous vehicle crashes from out-of-distribution scenarios). Adversarial attacks: compute gradient of loss w.r.t. input (not weights) to find imperceptible perturbations that flip predictions; extends to physical 3D objects. Algorithmic bias: systematic unfairness in model decisions due to training data imbalances. Uncertainty quantification remains an open challenge.

### Diffusion Models [29:01-42:01]
Unlike VAEs/GANs that generate in one shot, diffusion models decompose generation into iterative denoising steps. Forward process: add Gaussian noise progressively to training images. Reverse process: train a neural network to predict the noise difference between consecutive time steps (MSE loss). At inference: start from pure noise, iteratively denoise using the trained model. Text-to-image conditioning uses language embeddings to guide generation. Applications extend to molecular design (protein/drug discovery).

### Large Language Models [43:30-55:18]
LLMs are deep learning models trained on internet-scale text via next-token prediction. Pipeline: raw text → tokenization → numerical IDs → transformer processing → probability distribution over vocabulary → cross-entropy loss against true next token. No external labels needed; the structure of text itself provides the training signal. Instruction tuning and chat formatting make base models into interactive assistants. Emergent abilities: at certain scale thresholds, models exhibit step-change improvements in capabilities like reasoning, translation, and code generation.

## Notable Quotes
- "A neural network with a single hidden layer would be sufficient to approximate to some precision any continuous function." [09:18]
- "It didn't matter how much you randomized the data, if you trained your model long enough, you could still fit a very high classification model." [15:15]
- "Garbage in, garbage out... does deep learning even make sense in the first place as the approach to take?" [19:14]
- "Language models that are well calibrated will necessarily produce hallucinations." [51:08]
- "There is a hierarchy of abilities that can be unlocked as the models scale towards larger sizes." [53:47]

## Concepts Introduced
- [[Universal Approximation Theorem]] -- theoretical guarantee on neural network expressiveness
- [[Diffusion Model]] -- iterative denoising generative model
- [[Adversarial Attack]] -- input perturbation to fool neural networks
- [[Emergent Abilities]] -- capabilities appearing at scale thresholds
- [[Next-Token Prediction]] -- core LLM training objective
- [[Hallucination]] -- plausible but incorrect LLM outputs
- [[Algorithmic Bias]] -- systematic unfairness from training data

## Connections to Other Lectures
- Extends generative modeling foundations from Lecture 04 (VAEs, GANs)
- LLM section builds on Lecture 02's sequence modeling and attention
- Adversarial attacks invert Lecture 01's gradient descent (gradient w.r.t. input vs weights)
- Lab 3 provides hands-on LLM fine-tuning experience

## Open Questions
- Can diffusion models be made faster (fewer denoising steps) without sacrificing quality?
- How can we build reliable uncertainty estimates for LLMs?
- Will emergent abilities continue to appear at larger scales, or is there a ceiling?
