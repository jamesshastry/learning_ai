---
type: Lecture Notes
title: "Intro to Deep Learning"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "01"
video: https://youtube.com/watch?v=II4giR4vOOo
tags: [deep-learning, neural-networks, perceptron, gradient-descent, backpropagation, optimization]
timestamp: 2026-06-15T00:00:00Z
---

# Intro to Deep Learning

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=II4giR4vOOo)

## TL;DR
Alexander Amini introduces the foundational building blocks of deep learning: the perceptron, activation functions, loss functions, gradient descent, backpropagation, and regularization. The lecture builds from a single neuron up to deep neural networks, covering both the mathematical foundations and practical training considerations like learning rates, mini-batch SGD, overfitting, dropout, and early stopping.

## Key Takeaways
- Deep learning enables learning features directly from data in a hierarchical fashion, eliminating the need for hand-engineered features
- The single neuron (perceptron) performs three operations: dot product, add bias, apply non-linearity -- this is the core building block of all neural networks
- Non-linear activation functions are essential because real-world data is non-linear; without them, stacking linear layers collapses to a single linear transformation
- Training involves defining a loss function, computing gradients via backpropagation (chain rule), and updating weights via gradient descent
- The learning rate is critical: too small gets stuck in local minima, too large causes divergence; adaptive optimizers like Adam are preferred in practice
- Mini-batch SGD balances computational efficiency with gradient accuracy
- Regularization techniques (dropout, early stopping) prevent overfitting and improve generalization

## Detailed Notes

### The AI / ML / DL Hierarchy [08:26-09:22]
AI is the broadest category: building algorithms to process information and inform decisions. Machine learning is a subset that learns from data without explicit programming. Deep learning is a further subset using deep neural networks. The class focuses on teaching computers to learn tasks directly from raw data.

### The Perceptron (Single Neuron) [15:27-18:14]
A single neuron takes m inputs, multiplies each by a corresponding weight, sums them, adds a bias term, and passes through a non-linear activation function. In vector form: Y = g(X·W + b). This three-step process (dot product, bias, activation) is the fundamental operation underlying all of deep learning.

### Activation Functions and Non-Linearity [18:14-21:05]
Sigmoid maps to [0,1] (useful for probabilities), ReLU maps negatives to 0 and keeps positives (introduces non-negativity). Non-linearity is essential because real-world data has non-linear decision boundaries. Without activation functions, any number of stacked linear layers reduces to a single linear transformation.

### Building Neural Networks [24:25-30:55]
Multi-output networks use multiple neurons sharing the same inputs but with different weights. Hidden layers transform input space through intermediate representations. Deep neural networks stack multiple layers, each applying the same dot-product-bias-activation pattern. Both TensorFlow and PyTorch implement this as Dense/Linear layers.

### Loss Functions and Training [32:34-35:42]
Loss quantifies the difference between prediction and ground truth. For classification: cross-entropy loss compares probability distributions. For regression: mean squared error or L1 loss compare continuous values. The goal is to find weights W that minimize the empirical average loss J(W) across the entire dataset.

### Gradient Descent and Backpropagation [37:37-46:01]
Gradient descent: randomly initialize weights, compute gradient of loss, take a small step in the opposite direction, repeat until convergence. Backpropagation computes gradients using the chain rule, propagating from output back to input. The learning rate (eta) controls step size -- adaptive methods like Adam adjust it based on gradient magnitude. Loss landscapes are highly non-convex in practice.

### Practical Training: SGD and Regularization [46:54-55:00]
Mini-batch SGD computes gradients over a subset of data (typically 32-128 samples) -- balances efficiency and accuracy. Overfitting occurs when the model memorizes training data details that don't generalize. Dropout randomly zeroes out neuron activations during training, forcing the network to learn robust features across different pathways. Early stopping monitors training vs. validation loss and stops when validation loss begins increasing.

## Notable Quotes
- "If there's a few things that you remember from this class, this is probably the most important thing... dot product, add a bias, and apply a non-linearity." [24:45]
- "A deep neural network is nothing more than a neural network that has more than usually three layers." [30:22]
- "Computing the gradient tells us exactly how to update our weights on every part of the iteration." [39:42]
- "Ideally, you want to use learning rates that are basically just large enough that you can skip over these kind of fake local minimums." [44:08]
- "You'd probably almost always use and change this line to something like Adam or another adaptive learning rate scheduler." [45:45]

## Concepts Introduced
- [[Perceptron]] -- the fundamental building block of neural networks
- [[Activation Function]] -- non-linear transformation (sigmoid, ReLU)
- [[Backpropagation]] -- computing gradients via the chain rule
- [[Gradient Descent]] -- iterative optimization by following negative gradients
- [[Loss Function]] -- quantifies prediction error (cross-entropy, MSE)
- [[Learning Rate]] -- step size in gradient descent
- [[Dropout]] -- stochastic regularization by randomly zeroing activations
- [[Early Stopping]] -- halting training when validation loss increases
- [[Mini-Batch SGD]] -- computing gradients over data subsets

## Connections to Other Lectures
- Lecture 02 extends to sequential data with RNNs and transformers
- Lecture 03 applies these concepts to 2D spatial data via CNNs
- The Adam optimizer mentioned here reappears in all subsequent training discussions
- Overfitting and regularization themes carry through to generative models (Lecture 04) and RL (Lecture 05)

## Open Questions
- How do modern large language models with billions of parameters avoid catastrophic overfitting despite massive capacity?
- What is the theoretical relationship between network depth and representational power beyond the universal approximation theorem?
- How do adaptive optimizers like Adam compare to newer alternatives (AdamW, LAMB) at large scale?
