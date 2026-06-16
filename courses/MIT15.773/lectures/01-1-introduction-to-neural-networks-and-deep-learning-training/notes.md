---
type: Lecture Notes
title: "Introduction to Neural Networks and Deep Learning"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "01"
video: https://youtube.com/watch?v=kyQ0CRkYhy4
tags: [neural-networks, deep-learning, activation-functions, architecture, fundamentals]
timestamp: 2026-06-15T00:00:00Z
---

# Introduction to Neural Networks and Deep Learning

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=kyQ0CRkYhy4)

## TL;DR
This lecture introduces the landscape of AI — from traditional rule-based systems through machine learning to deep learning and generative AI — then builds up neural networks from logistic regression, explaining layers, weights, biases, activation functions (especially ReLU), and the concept of architecture.

## Key Takeaways
1. **Deep learning automatically learns representations:** Unlike traditional ML which requires manual feature engineering, deep learning learns useful representations from raw unstructured data (images, text, audio) automatically.
2. **Neural networks are repeated transformations:** A neural network is nothing more than repeatedly transformed inputs fed to a linear or logistic regression model at the end.
3. **ReLU is the hero of deep learning:** The Rectified Linear Unit activation function (max(0, x)) is the default choice for hidden layers due to its simplicity and effectiveness — it preserves gradients while injecting minimal non-linearity.
4. **Architecture is your design choice:** You choose the number of hidden layers, neurons per layer, and activation functions; the input and output are determined by your problem.
5. **Generative AI produces unstructured output:** While deep learning could consume unstructured data, generative AI extends this to also produce unstructured outputs (text, images, audio).

## Detailed Notes

### AI History and the Three Breakthroughs [00:16-04:20]
- AI originated in 1956 at Dartmouth (MIT well-represented: Minsky, McCarthy, Shannon)
- Three seminal breakthroughs: Traditional AI → Machine Learning → Deep Learning → Generative AI
- Traditional approach: hand-code expert rules (if-then); failed because of Polanyi's paradox ("we know more than we can tell") and inability to generalize
- Machine learning: learn from input-output examples using statistical techniques; linear regression is a form of ML

### Structured vs. Unstructured Data [04:45-12:01]
- ML works best with structured data (numericalized columns and rows of a spreadsheet)
- Unstructured data (images, text, audio): raw pixel values (0-255) have no intrinsic semantic meaning
- Feature engineering / feature extraction: manually structuring unstructured data (e.g., measuring beak length from bird images)
- This manual "representation" process was a massive human bottleneck limiting ML applicability

### Deep Learning: Automatic Representation Learning [12:01-17:06]
- Deep learning automatically learns representations from raw input — the keyword is "automatically"
- Pipeline: raw data → learned representations (multiple layers) → linear/logistic regression → output
- This simple idea is "incredibly powerful" — led to ChatGPT, AlphaGo, AlphaFold
- Confluence of three forces: new algorithms, lots of data, GPUs (parallel computing hardware)
- Practical application: attach deep learning behind any sensor (cameras, microphones) for detection, classification, prediction
- Example: smart binoculars that identify bird species; breast cancer detection from mammograms (Prof. Regina Barzilay at MIT)

### Generative AI [17:27-21:25]
- Traditionally could only predict structured outputs (numbers, probabilities)
- Generative AI can produce unstructured outputs: images, text, music, video
- Multimodal models accepting and producing mixed inputs/outputs are becoming the norm
- GPT-4 example: parsing a complex parking sign from a photo

### Building a Neural Network from Logistic Regression [24:47-36:15]
- Logistic regression: inputs → linear function → sigmoid → probability output
- Rewrite as a network diagram: input nodes → weighted edges → summation → sigmoid
- Terminology shift: coefficients → **weights**, intercepts → **biases**
- Key insight: writing as a network reveals we can insert transformations in the middle
- Insert stacks of linear functions between input and output
- Each linear function followed by a non-linear **activation function** — non-linearity is essential
- Each transformation gives the network capacity to learn interesting representations

### Neurons, Layers, and Architecture [38:19-48:05]
- **Neuron**: linear function + non-linear activation; takes many inputs, produces one output
- **Layer**: vertical stack of neurons
- **Input layer**: just the raw input (not really doing anything)
- **Output layer**: final thing producing predictions
- **Hidden layers**: everything in between
- **Fully connected / dense layer**: every neuron connects to every neuron in the next layer
- Logistic regression = neural network with zero hidden layers
- Deep learning = neural networks with many layers (e.g., ResNet: first to surpass human-level in image classification)

### Activation Functions [41:46-47:00]
- **Sigmoid**: maps any number to (0,1); used for output when predicting probabilities
- **Linear (identity)**: passes number unchanged; trivial
- **ReLU (Rectified Linear Unit)**: max(0, x) — if positive, pass through; if negative, output zero
  - Believed to be a key factor in deep learning's success
  - Many variants exist (Leaky ReLU, GELU, Swish) but ReLU is sufficient for practical use
- Rule of thumb: ReLU for hidden layers; output activation depends on output type (sigmoid for binary probability, softmax for multi-class)

### Design Choices and Parameter Counting [46:19-56:32]
- You choose: number of hidden layers, neurons per layer, hidden activation functions
- You're given: input size, output format
- Example: 2 inputs, 3 hidden ReLU neurons, 1 sigmoid output → 13 parameters (easily miscounted if you forget biases)
- Feedforward neural network: data flows left to right (vs. recurrent networks, which transformers have superseded)
- The arrangement of neurons, layers, and activations = the **architecture**
- Transformers and CNNs are specific architectures

## Notable Quotes
> "We know more than we can tell. This is called Polanyi's paradox." — Instructor [03:23]

> "A neural network is nothing more than repeatedly transformed inputs which are finally fed to a linear or logistic regression model." — Instructor [36:19]

> "ReLU — the hero of deep learning." — Instructor [43:28]

> "I've been doing deep learning for about 10 years now, and every time I look at it, I literally get goosebumps." — Instructor [11:50]

> "There are no long-term monopoly windows in the world. There are only short-term windows." — Instructor [16:58]

## Concepts Introduced
- [[Deep Learning]] — automatic representation learning from raw unstructured data
- [[Neural Network]] — repeatedly transformed inputs fed to a regression model
- [[Activation Function]] — non-linear function applied after each neuron's linear computation
- [[ReLU]] — max(0, x); the default hidden-layer activation function
- [[Feedforward Network]] — neural network where data flows strictly from input to output
- [[Polanyi's Paradox]] — humans know more than they can articulate, limiting rule-based AI

## Connections to Other Lectures
- Architecture concepts (layers, neurons) are foundational for CNNs (Lectures 3-4) and Transformers (Lectures 7-8)
- The idea of automatic representation learning motivates embeddings (Lecture 6)
- Generative AI concepts are explored in depth in Lectures 9-11

## Open Questions
- How exactly do we train these networks to find optimal weights? (covered in Lecture 2)
- Why must activation functions be non-linear? (briefly mentioned, elaborated in Lecture 2)
- How do we prevent overfitting with so many parameters? (addressed in Lectures 2-3)
- What is the precise relationship between neuroscience and artificial neural networks?
