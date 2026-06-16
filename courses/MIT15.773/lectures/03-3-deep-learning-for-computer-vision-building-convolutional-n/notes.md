---
type: Lecture Notes
title: "Deep Learning for Computer Vision – Building CNNs from Scratch"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "03"
video: https://youtube.com/watch?v=8QuyDcMIdRc
tags: [computer-vision, cnn, keras, tensorflow, training, overfitting, softmax]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Learning for Computer Vision – Building CNNs from Scratch

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=8QuyDcMIdRc)

## TL;DR
This lecture covers two hands-on Keras collabs — training a neural network on tabular heart disease data and building an image classifier on Fashion MNIST — while introducing epochs, batch sizes, overfitting/early stopping, tensors, TensorFlow/Keras architecture, softmax for multi-class classification, and the transition from structured to unstructured data.

## Key Takeaways
1. **Epoch vs. batch:** An epoch is one full pass through all training data; within each epoch, SGD processes multiple mini-batches (e.g., 32 samples each), updating weights after every batch.
2. **Overfitting is detected via validation:** Split training data into train + validation sets; monitor validation loss — when it stops improving or starts climbing, stop training (early stopping).
3. **Tensors generalize numbers/vectors/matrices:** Rank-0 = number, rank-1 = vector, rank-2 = table, rank-3 = cube (e.g., color image), rank-4 = video. TensorFlow processes tensors flowing through networks.
4. **Softmax for multi-class classification:** Converts K arbitrary numbers to K probabilities that sum to 1 via exp(a_i)/Σexp(a_j). GPT-4 uses a 52,000-way softmax for next-word prediction.
5. **Images are flattened for simple networks:** A 28×28 image becomes a 784-element vector for dense layers, achieving ~88% accuracy on Fashion MNIST.

## Detailed Notes

### Training Flow Recap: Epochs and Batches [00:16-10:00]
- Gradient descent: one weight update per epoch using all data
- SGD: multiple weight updates per epoch, one per mini-batch
- Batch size typically 32 or 64 (aligns with GPU hardware)
- Number of batches per epoch = ceil(training_size / batch_size)
- Example: 194 patients / 32 = 7 batches (first 6 have 32, last has 2)

### Overfitting and Regularization [11:00-14:48]
- More layers → more parameters → more risk of overfitting
- Early stopping: monitor validation loss across epochs; stop when it flattens/rises
- Jeff Hinton called early stopping a "beautiful free lunch"
- Dropout: covered in next lecture — randomly drops neurons during training
- Training checklist: design network → pick loss function → choose optimizer → apply regularization → train

### Introduction to Tensors [15:25-23:00]
- Tensor = generalization of number/vector/table to arbitrary dimensions
- Rank-0: scalar (number), Rank-1: vector, Rank-2: matrix, Rank-3: cube, Rank-4: video
- Color images: 3 tables (RGB channels) = rank-3 tensor
- Any tensor of rank N is a list of rank-(N-1) tensors
- Einstein originated the tensor concept

### TensorFlow and Keras [23:00-27:00]
- TensorFlow: automatic gradient computation, parallelization, GPU/TPU support
- Keras: high-level API on top of TensorFlow; provides layers, models, training utilities
- Three Keras APIs: Sequential, Functional (most used), Subclassing
- PyTorch alternative exists but Keras chosen for accessibility

### Keras Collab: Heart Disease Prediction [27:00-58:02]
- Data preprocessing: one-hot encoding categorical variables, normalizing numerics
- Split before normalization to prevent data leakage
- Convert pandas DataFrames to numpy arrays for Keras
- `model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])`
- `model.fit(x, y, epochs=300, batch_size=32, validation_split=0.2)`
- 83.6% test accuracy vs. 72.6% baseline (always predict majority class)
- Training vs. validation loss divergence indicates overfitting

### Softmax for Multi-Class Classification [01:08:12-01:13:04]
- Binary: sigmoid output (one probability); Multi-class: softmax output (K probabilities summing to 1)
- Softmax: P(class_i) = exp(a_i) / Σ_j exp(a_j)
- GPT-4 does a 52,000-way softmax for each generated token
- Loss function pairing: binary → binary cross-entropy; sparse labels → sparse categorical cross-entropy; one-hot labels → categorical cross-entropy

### Fashion MNIST Collab [01:04:25-01:16:59]
- 70,000 grayscale 28×28 images across 10 clothing categories
- Flatten 28×28 to 784-element vector → Dense(256, relu) → Dense(10, softmax)
- Baseline: 10% accuracy (random guess); network achieves ~88%

## Notable Quotes
> "Do the simple stuff first and do complicated things only if the simple doesn't work." — Instructor [39:26]

> "Every word GPT-4 emits, it's actually doing a 52,000-way softmax." — Instructor [01:10:27]

> "If you don't know the details... you will not actually be able to think new and creative thoughts for a new problem." — Instructor [06:02]

## Concepts Introduced
- [[Epoch]] — one complete pass through the entire training dataset
- [[Mini-Batch]] — small subset of training data used per gradient update in SGD
- [[Tensor]] — generalized multi-dimensional array (scalar, vector, matrix, and beyond)
- [[Softmax]] — activation that converts K numbers to K probabilities summing to 1
- [[Early Stopping]] — regularization technique: halt training when validation loss stops improving
- [[Overfitting]] — model memorizing training data noise rather than learning general patterns

## Connections to Other Lectures
- Epochs/batches/SGD concepts from Lecture 2 are operationalized in Keras collabs
- Fashion MNIST classifier is improved with CNNs in Lecture 4
- Softmax output layer is used in transformers (Lectures 7-8) and LLMs (Lecture 9)

## Open Questions
- How does dropout work as a regularization technique? (covered in Lecture 4)
- Can CNNs improve Fashion MNIST accuracy beyond 88%? (answered in Lecture 4: yes, ~90.5%)
- How to handle highly imbalanced classification problems in deep learning?
