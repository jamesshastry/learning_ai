---
type: Lecture Notes
title: "Training Deep NNs; Introduction to Keras/TensorFlow; Application to Tabular Data"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "02"
video: https://youtube.com/watch?v=3Lr8nVUDCpk
tags: [training, loss-functions, gradient-descent, backpropagation, keras, optimization]
timestamp: 2026-06-15T00:00:00Z
---

# Training Deep NNs; Introduction to Keras/TensorFlow

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=3Lr8nVUDCpk)

## TL;DR
This lecture covers how neural networks are trained: defining loss functions (MSE for regression, binary cross-entropy for classification), using gradient descent and its stochastic variant (SGD) to minimize loss, computing gradients efficiently via backpropagation on GPUs, and translating network designs into Keras code.

## Key Takeaways
1. **Training = finding optimal weights:** Training minimizes a loss function — the discrepancy between predictions and actual values — by adjusting weights and biases via gradient descent.
2. **Binary cross-entropy is the loss for classification:** Using -log(probability) penalizes confident wrong predictions harshly, with a smooth, differentiable function ideal for gradient-based optimization.
3. **SGD is simpler and better than full gradient descent:** Stochastic gradient descent uses random mini-batches (e.g., 32 samples) instead of all data, making it memory-efficient and paradoxically more effective by escaping local minima.
4. **Backpropagation makes gradient computation feasible:** Backprop organizes chain-rule calculations layer-by-layer from output to input, avoiding redundant computation and enabling matrix operations on GPUs.
5. **The learning rate controls step size:** Alpha determines how aggressively weights are updated; too large overshoots, too small converges slowly. Typically set to small values like 0.001.

## Detailed Notes

### Network Design Recap and Keras Introduction [00:21-08:00]
- Design choices: number of hidden layers, neurons per layer, activation functions
- Rule of thumb: start with simplest network; increase complexity only if needed
- Heart disease case study: Cleveland Clinic data, 13 variables → 29 features (after one-hot encoding), 16 ReLU neurons, sigmoid output
- Keras code: `keras.Input(shape=29)`, `keras.layers.Dense(16, activation='relu')`, final `Dense(1, activation='sigmoid')`
- Model defined in 4 lines; functional API connects layers via variable passing

### Loss Functions [19:58-32:06]
- Training = finding weights that minimize prediction error
- **Mean Squared Error (MSE)**: for regression; average of (predicted - actual)² across data points
- **Binary Cross-Entropy**: for classification; -[y·log(p) + (1-y)·log(1-p)]
  - When y=1: loss = -log(p); low probability → high loss (harsh penalty)
  - When y=0: loss = -log(1-p); high probability → high loss
  - Elegant: single expression handles both cases without if-then logic
  - Average across all N data points for overall loss
- Loss function creativity drives breakthroughs — hundreds of variants in the literature

### Gradient Descent [32:06-48:00]
- Core idea: calculate derivative, move w in the opposite direction of the gradient
- Update rule: w_new = w_old - α · ∂loss/∂w
- Invented by Cauchy in 1847 — the same algorithm behind GPT-4
- **Learning rate (α)**: controls step size; typically 0.001-0.1; part of the "IP" for training
- Multi-variable generalization: compute partial derivatives for each weight, stack into gradient vector (∇)
- Local minima concern: in high dimensions (billions of parameters), true local minima are statistically rare; saddle points are more common and "good enough"

### Backpropagation [56:50-01:12:00]
- Efficient gradient computation by organizing chain-rule calculations backward through the network
- Start at output layer, propagate gradients layer by layer toward input
- Advantages: eliminates redundant calculations; reduces to matrix multiplications
- GPUs (originally for video game rendering) accelerate matrix multiplications — the foundation of the deep learning revolution
- Without backprop + GPUs, "this class would not exist"
- AlexNet (2012) was the breakthrough moment that proved GPU-accelerated deep learning

### Stochastic Gradient Descent (SGD) [01:05:06-01:12:37]
- Full gradient descent is prohibitively expensive for large datasets
- SGD: randomly sample a mini-batch (e.g., 32 points), compute loss and gradient on just that batch, update weights
- One batch → one gradient step; cycle through all batches = one epoch
- Approximate gradient paradoxically helps: can escape local minima of the true loss function
- Adam optimizer: the default SGD variant used in practice
- Weights are initialized randomly using schemes like He or Xavier/Glorot initialization
- Bad initialization → exploding or vanishing gradients

### Weight Initialization and Open-Source Models [01:01:53-01:02:36]
- Weights initialized randomly but carefully (He initialization, Xavier/Glorot)
- Weights are the "crown jewel" — the result of expensive training
- Meta open-sourcing Llama 2 weights = sharing compressed knowledge worth millions of dollars

## Notable Quotes
> "GPT-4 is built using an algorithm invented in 1847." — Instructor [41:40]

> "If you're not getting goosebumps at the thought that this simple thing can do all these complicated things, we really need to talk offline." — Instructor [01:14:14]

> "Never use the word backpropagation again. Only use the word backprop." — Instructor [56:59]

> "It's almost like you work less and you do better. How many times does it happen in life?" — Instructor on SGD [01:08:30]

## Concepts Introduced
- [[Loss Function]] — function measuring discrepancy between predicted and actual values
- [[Binary Cross-Entropy]] — standard loss for binary classification using logarithmic penalty
- [[Gradient Descent]] — optimization algorithm: update weights in the direction that reduces loss
- [[Stochastic Gradient Descent]] — gradient descent using random mini-batches instead of full dataset
- [[Backpropagation]] — efficient backward computation of gradients through network layers
- [[Learning Rate]] — hyperparameter controlling the step size of weight updates

## Connections to Other Lectures
- Builds directly on Lecture 1's neural network architecture
- Loss function and optimizer choices are applied in Lecture 3's Keras collabs
- SGD concepts underpin all subsequent training (CNNs, transformers, LLMs)
- Backprop and GPUs are prerequisites for understanding training at scale (Lectures 9-10)

## Open Questions
- Why does SGD work so well despite only approximating the true gradient?
- What is the theoretical relationship between loss function landscape geometry and generalization?
- How do adaptive learning rate methods (Adam) improve on vanilla SGD?
