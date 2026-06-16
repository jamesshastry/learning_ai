---
type: Lecture Notes
title: "Deep Generative Modeling"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "04"
video: https://youtube.com/watch?v=R8V8CbuxryI
tags: [generative-models, vae, gan, unsupervised-learning, latent-variables, autoencoders]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Generative Modeling

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=R8V8CbuxryI)

## TL;DR
Ava Amini introduces generative modeling as an unsupervised learning paradigm focused on learning probability distributions over data. The lecture covers autoencoders (self-encoding for representation learning), variational autoencoders (VAEs) with probabilistic latent spaces, and generative adversarial networks (GANs) with adversarial training. Key innovations include the reparameterization trick for VAE training and CycleGANs for unpaired domain translation.

## Key Takeaways
- Generative models learn probability distributions over data, enabling both density estimation and new sample generation
- Autoencoders compress data into a low-dimensional latent space Z via an encoder, then reconstruct via a decoder; trained with reconstruction loss only (no labels needed)
- VAEs introduce probabilistic latent variables by learning mean and variance per latent dimension, enabling sampling and generation
- The reparameterization trick offsets stochasticity to random epsilon variables, making VAE training differentiable
- VAE regularization uses KL divergence against a normal prior to enforce continuous, complete latent spaces
- GANs pit a generator (noise → fake data) against a discriminator (real vs fake classification) in adversarial training
- GANs excel at sample generation but are tricky to train stably; VAEs provide interpretable latent features
- Applications include debiasing facial detection systems, outlier detection, image/audio/video generation, and drug discovery

## Detailed Notes

### Supervised vs Unsupervised Learning [02:58-04:25]
Supervised learning maps labeled data (X, Y) pairs via functional mappings. Unsupervised learning works with unlabeled data X to learn underlying structure and probability distributions. Generative modeling captures P(data) to enable density estimation and sample generation.

### Autoencoders [11:58-16:46]
Architecture: encoder maps high-dimensional input X to low-dimensional latent Z, decoder maps Z back to reconstructed X-hat. Loss = pixel-wise difference between X and X-hat. No labels required -- this is self-supervised through reconstruction. The bottleneck forces compression, learning the most important features. Limitation: deterministic, no variability for generation.

### Variational Autoencoders [17:55-34:01]
Replace deterministic Z with probabilistic sampling: encoder learns mean (mu) and variance (sigma) per latent dimension. Loss = reconstruction loss + KL divergence regularization (comparing learned distribution to normal prior). Regularization ensures continuous (nearby points decode similarly) and complete (all latent regions meaningful) latent spaces. Reparameterization trick: Z = mu + sigma * epsilon (epsilon ~ N(0,1)), enabling backpropagation through the sampling operation. Latent dimensions encode interpretable features that can be perturbed for controlled generation.

### Generative Adversarial Networks [34:52-47:07]
Generator maps random noise to fake data instances. Discriminator classifies inputs as real or fake. Adversarial objective: generator minimizes probability of being caught; discriminator maximizes detection accuracy. Training alternates between improving G and D. Optimal outcome: G reproduces true data distribution exactly. CycleGANs extend to unpaired domain-to-domain translation (e.g., voice conversion) using cyclic consistency loss.

## Notable Quotes
- "The fundamental goal is to take training samples from some distribution and learn a model that represents that probability distribution." [04:25]
- "It really amazes me that even at very advanced levels, people often don't realize that this is really the core fundamental principle of generative modeling: capturing and learning probability distributions over data." [04:44]
- "This idea of self-encoding the input data... we can train the model in this unsupervised way by just reconstructing the input." [12:02]
- "The core idea is can the generator produce better and better fake instances to try to fool the discriminator?" [37:11]

## Concepts Introduced
- [[Autoencoder]] -- encoder-decoder for unsupervised representation learning via reconstruction
- [[Variational Autoencoder]] -- probabilistic autoencoder with learned latent distributions
- [[Latent Space]] -- compressed low-dimensional representation of data
- [[Reparameterization Trick]] -- making sampling differentiable by offsetting stochasticity
- [[KL Divergence]] -- distributional distance measure used for VAE regularization
- [[Generative Adversarial Network]] -- two competing networks for sample generation
- [[CycleGAN]] -- GAN variant for unpaired domain translation
- [[Density Estimation]] -- learning the probability distribution underlying observed data

## Connections to Other Lectures
- Builds on Lecture 01's loss functions and Lecture 03's CNN architectures
- VAE debiasing connects directly to Lab 2 (facial detection systems)
- Diffusion models in Lecture 06 address GANs' training instability
- RL preference alignment in Lecture 05 relates to discriminator-like reward models

## Open Questions
- How do diffusion models compare to VAEs and GANs in sample quality and training stability?
- Can VAE latent spaces be made more disentangled for better interpretability?
- What determines the optimal latent space dimensionality for a given problem?
