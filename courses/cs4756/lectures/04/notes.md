---
type: Lecture Notes
title: "Deep Learning Tutorial"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "04"
slide_url: https://drive.google.com/file/d/163fP_eK6HrBOcHnPoXDPKsv-FFSU6d1w/view?usp=sharing
tags: [deep-learning, neural-networks, backpropagation, CNNs, pytorch, optimization, regularization]
timestamp: 2026-01-29T00:00:00Z
---

# Deep Learning Tutorial

**Course:** CS 4756/5756 Robot Learning
**Instructor:** Kuan Fang
**Slides:** [Google Drive](https://drive.google.com/file/d/163fP_eK6HrBOcHnPoXDPKsv-FFSU6d1w/view?usp=sharing)

## TL;DR
A foundational deep learning tutorial covering three areas: (1) ML review — linear classifiers, loss functions, regularization, distribution shift, and gradient descent; (2) deep neural networks — non-linearity motivation, network architecture, activation functions, and backpropagation via the chain rule; and (3) PyTorch basics — tensors, device management, defining `nn.Module` subclasses, and the canonical training loop. The lecture closes with the four key ingredients for deep learning success in robot learning contexts.

## Key Takeaways
1. **Linear classifiers learn a template per class:** $f(x, W) = Wx + b$ maps a raw input to class scores; the bias term $b$ shifts the decision boundary independently of the input.
2. **Cross-entropy loss + regularization controls overfitting:** Total loss $L(W) = \frac{1}{N}\sum_i L_i(f(x_i, W), y_i) + \lambda R(W)$; the $\lambda$ hyperparameter trades off data fit against model complexity.
3. **Distribution shift is the central challenge in robot learning:** Covariate shift (input distribution changes), label shift (label distribution changes), and concept shift (the labeling rule itself changes) all break trained models at deployment.
4. **Neural networks stack non-linearities to learn features:** A two-layer net is $f = W_2 \max(0, W_1 x)$; each additional hidden layer doubles expressivity without shrinking the problem via a linear subspace.
5. **Backpropagation = chain rule applied node-by-node:** Each node computes a local gradient $\partial z / \partial x$; the backward pass multiplies it by the upstream gradient $\partial L / \partial z$ to produce the downstream gradient $\partial L / \partial x$.
6. **ReLU is the default activation; avoid naive sigmoid:** ReLU ($\max(0,x)$) avoids saturated gradients, is cheap to compute, and converges faster. Sigmoid and tanh saturate and kill gradients at extremes.
7. **PyTorch training loop is always three lines:** `optimizer.zero_grad()` → `loss.backward()` → `optimizer.step()`.

## Detailed Notes

### Part 1: Machine Learning Review [Slides 4–16]

#### Linear Classifier [Slides 5–8]

A linear classifier maps an input $x$ to class scores through a weight matrix $W$ and bias $b$:

$$f(x, W) = Wx + b$$

- Example: a 32×32×3 image is flattened to a 3072-dimensional vector; $W \in \mathbb{R}^{10 \times 3072}$ produces 10 class scores.
- The bias $b \in \mathbb{R}^{10}$ allows the classifier to shift scores independently of the input.
- Training data: dataset of $N$ labeled pairs $\{(x_i, y_i)\}_{i=1}^N$.
- **Loss over the dataset** averages per-example losses:

$$L = \frac{1}{N} \sum_i L_i(f(x_i, W), y_i)$$

- **Cross-entropy loss** (per example) for the correct class $y_i$:

$$L_i = -\log\left(\frac{e^{s_{y_i}}}{\sum_j e^{s_j}}\right)$$

where $s_j$ are the raw class scores (logits). This is the negative log-probability of the correct class under a softmax distribution.

#### Overfitting vs. Underfitting [Slide 9]

- **High bias / underfitting:** Model too simple; poor fit even on training data (e.g., a linear boundary for a non-linear problem).
- **Low bias, low variance / good fit:** Model complexity matches problem; generalizes well.
- **High variance / overfitting:** Model memorizes training data; fails on test data.
- Shown for both classification (decision boundaries) and regression (price vs. size curves).

#### Regularization [Slide 10]

Adding a regularization term penalizes model complexity and reduces overfitting:

$$L(W) = \frac{1}{N} \sum_{i=1}^N L_i(f(x_i, W), y_i) + \lambda R(W)$$

- **Data loss:** Model predictions should match training data.
- **Regularization loss:** Prevents the model from doing *too* well on training data (e.g., L2: $R(W) = \sum_{k,l} W_{k,l}^2$).
- $\lambda$ is a hyperparameter controlling the strength of regularization.

#### Distribution Shift [Slides 11–13]

Distribution shift occurs when the test distribution differs from training. Three types:

| Type | Condition | Example |
|---|---|---|
| **Covariate Shift** | $P_\text{train}(y\|x) = P_\text{test}(y\|x)$, $P_\text{train}(x) \neq P_\text{test}(x)$ | Trained on daytime driving, tested at night |
| **Label Shift** | $P_\text{train}(x\|y) = P_\text{test}(x\|y)$, $P_\text{train}(y) \neq P_\text{test}(y)$ | Class frequencies change between train and test |
| **Concept Shift** | $P_\text{train}(y\|x) \neq P_\text{test}(y\|x)$, $P_\text{train}(x) = P_\text{test}(x)$ | The mapping from input to label changes (e.g., same car, different meaning) |

Distribution shift is especially critical in robotics, where deployed environments routinely differ from training environments.

#### Gradient Descent [Slides 14–16]

To minimize $L(W)$, compute the gradient and step in the negative direction:

$$\nabla_W L(W) = \frac{1}{N} \sum_{i=1}^N \nabla_W L_i(x_i, y_i, W) + \lambda \nabla_W R(W)$$

$$W := W - \eta \nabla_W L(W)$$

where $\eta$ is the **learning rate** (a key hyperparameter).

**Stochastic Gradient Descent (SGD):** Approximates the true gradient using a single sample or a **minibatch** of samples, drastically reducing compute per update at the cost of noisier gradient estimates.

**Optimization landscape challenges:**
- **Global minimum:** Lowest loss over the entire parameter space.
- **Local minimum:** Lower than all nearby points, but not globally lowest.
- **Saddle point:** Gradient is zero but not a local minimum or maximum — gradient descent stalls here.

**Learning rate sensitivity:**
- Very high: diverges or oscillates.
- High: converges fast but overshoots.
- Good: converges smoothly to a low loss.
- Low: converges but very slowly.
- **Learning rate decay:** Reduce $\eta$ at scheduled epochs to fine-tune after initial convergence (e.g., drop by 10× at epochs 30, 60, 90).

---

### Part 2: Deep Neural Networks [Slides 17–30]

#### Motivation: Non-linearity [Slide 18]

Linear classifiers cannot separate non-linearly separable data (e.g., points arranged in a ring). A feature transform $f(x,y) = (r(x,y), \theta(x,y))$ can map data to a space where linear separation is possible. Neural networks learn these transformations from data automatically.

#### Neural Network Architecture [Slide 19]

A two-layer neural network with one hidden layer of size $H$:

$$f = W_2 \max(0, W_1 x)$$

where $x \in \mathbb{R}^D$, $W_1 \in \mathbb{R}^{H \times D}$, $W_2 \in \mathbb{R}^{C \times H}$, and $\max(0, \cdot)$ is the ReLU activation applied element-wise.

A three-layer network (two hidden layers):

$$f = W_3 \max(0, W_2 \max(0, W_1 x))$$

- The **input layer** receives raw features.
- **Hidden layers** learn intermediate representations.
- The **output layer** produces class scores or regression outputs.
- Stacking layers without non-linearities collapses to a single linear transformation — non-linearities are essential.

#### Layer Size and Capacity [Slide 20]

More neurons = more model capacity = more complex decision boundaries:
- 3 hidden neurons: coarse, roughly linear boundaries.
- 6 hidden neurons: moderately curved boundaries.
- 20 hidden neurons: complex, fine-grained boundaries — risk of overfitting without regularization.

#### Regularization of Neural Networks [Slide 21]

Do **not** use network size as a regularizer (shrinking the network reduces capacity too bluntly). Instead, use a large network with **strong regularization** via $\lambda R(W)$:
- $\lambda = 0.001$: very flexible boundaries (overfitting risk).
- $\lambda = 0.01$: moderately smooth.
- $\lambda = 0.1$: very smooth, simpler boundary.

This allows the architecture to have sufficient capacity while the loss function controls complexity.

#### Activation Functions [Slide 22]

| Activation | Formula | Notes |
|---|---|---|
| **Sigmoid** | $\sigma(x) = \frac{1}{1+e^{-x}}$ | Saturates at extremes; kills gradients; outputs in $(0,1)$ |
| **tanh** | $\tanh(x)$ | Zero-centered; still saturates |
| **ReLU** | $\max(0, x)$ | Default choice; fast, no saturation for $x > 0$; "dying ReLU" for $x < 0$ |
| **Leaky ReLU** | $\max(0.1x, x)$ | Fixes dying ReLU by allowing small negative slope |
| **Maxout** | $\max(w_1^T x + b_1, w_2^T x + b_2)$ | Generalizes ReLU/Leaky ReLU; more parameters |
| **ELU** | $x$ if $x \geq 0$; $\alpha(e^x - 1)$ if $x < 0$ | Smooth, negative saturation |

**Practical advice:** Start with ReLU. Try Leaky ReLU or ELU if you encounter dying neurons. Avoid sigmoid/tanh in hidden layers for deep networks.

#### Backpropagation [Slides 23–30]

Backpropagation efficiently computes $\partial L / \partial W$ for all parameters by applying the **chain rule** through the computational graph.

For a node $f$ with inputs $x, y$ and output $z = f(x, y)$:

$$\frac{dz}{dx} = \frac{dz}{dy} \cdot \frac{dy}{dx} \quad \text{(chain rule)}$$

**Forward pass:** Compute the value of each neuron left-to-right.

**Backward pass:** Compute gradients right-to-left.

Each node stores:
- **Local gradients:** $\frac{\partial z}{\partial x}$ and $\frac{\partial z}{\partial y}$ — how the node's output changes with each input.
- **Upstream gradient:** $\frac{\partial L}{\partial z}$ — how the loss changes with the node's output (received from the next layer during the backward pass).
- **Downstream gradients** (what it sends backward):

$$\frac{\partial L}{\partial x} = \frac{\partial L}{\partial z} \cdot \frac{\partial z}{\partial x}, \qquad \frac{\partial L}{\partial y} = \frac{\partial L}{\partial z} \cdot \frac{\partial z}{\partial y}$$

The key insight: **each node only needs its local gradient and the upstream gradient** to compute downstream gradients. Modules are fully composable.

---

### Part 3: PyTorch Tutorial [Slides 31–39]

#### Tensors [Slides 32–33]

PyTorch's fundamental data structure is the **tensor** — a generalization of scalars, vectors, and matrices to N dimensions:

| Rank | Name | Example |
|---|---|---|
| 0 | Scalar | Loss value |
| 1 | Vector | A single sample's features |
| 2 | Matrix | Minibatch of 1-D samples |
| 3 | 3-way tensor | Image (H × W × C) or sequence minibatch |
| N | N-way tensor | Video, batched 3-D data |

Creating tensors:
```python
# From data (dtype inferred automatically)
data = [[1, 2], [3, 4]]
x_data = torch.tensor(data)

# From a NumPy array
np_array = np.array(data)
x_np = torch.from_numpy(np_array)
```

#### Device Management [Slide 34]

NumPy arrays always live on CPU RAM. PyTorch tensors can live on CPU or GPU:

```python
tensor.to("cuda")   # or tensor.cuda()   — move to GPU
tensor.to("cpu")    # or tensor.cpu()    — move to CPU
```

Moving data between devices has overhead; keep tensors on the same device for operations.

#### Defining Neural Networks [Slide 35]

Subclass `nn.Module` and define layers in `__init__`, forward computation in `forward`:

```python
class SimpleNeuralNetwork(nn.Module):

    def __init__(self, input_dim=10, output_dim=4, hidden_dim=256):
        super().__init__()
        self.fc1 = nn.Linear(10, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, hidden_dim)
        self.fc_output = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        x = torch.cat(x, dim=-1)
        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        output = F.tanh(self.fc_output(x))
        return output
```

- `nn.Linear(in, out)` defines a fully connected layer ($W \in \mathbb{R}^{out \times in}$, $b \in \mathbb{R}^{out}$).
- `F.relu` / `F.tanh` apply activation functions without learnable parameters.
- PyTorch builds the computational graph dynamically during `forward`; calling `.backward()` on the loss traverses this graph to compute all gradients.

#### Training Loop [Slide 36]

The canonical PyTorch training loop:

```python
net = (...).to("cuda")
dataset = ...
dataloader = ...
optimizer = ...
loss_fn = ...

for epoch in range(num_epochs):
    # Training
    net.train()
    for data, target in dataloader:
        data = torch.from_numpy(data).float().cuda()
        target = torch.from_numpy(data).float().cuda()

        prediction = net(data)
        loss = loss_fn(prediction, target)

        optimizer.zero_grad()   # clear gradients from last step
        loss.backward()         # backprop: compute all gradients
        optimizer.step()        # update weights

    net.eval()
    # Do evaluation...
```

**The three critical lines** (highlighted in slide):
1. `optimizer.zero_grad()` — gradients accumulate by default; reset before each backward pass.
2. `loss.backward()` — computes $\partial L / \partial \theta$ for all parameters via autograd.
3. `optimizer.step()` — applies the parameter update ($\theta := \theta - \eta \nabla L$).

#### Google Colab [Slide 37]

- Free cloud Jupyter environment with GPU access.
- Cells run independently; the network definition cell must run before the training loop cell.
- Supports the same PyTorch code as local environments.

#### Key Ingredients for Deep Learning Success [Slide 38]

1. **A dataset that sufficiently represents the testing distribution** — the model cannot generalize to distributions not covered by training data.
2. **A well-defined loss function that captures the objective** — the loss must align with what actually matters (e.g., task success vs. proxy metrics).
3. **A neural network architecture with sufficient capacity and inductive biases** — capacity to represent the solution; inductive biases (e.g., convolutions for spatial data) to learn efficiently.
4. **The necessary compute and optimization techniques to train efficiently** — GPU hardware, minibatch SGD, learning rate schedules, regularization.

---

## Resources [Slide 39]

- **PyTorch Tutorial:** https://pytorch.org/tutorials/
- **Deep Learning** — Goodfellow, Bengio, Courville: https://www.deeplearningbook.org/
- **The Matrix Cookbook** — Petersen and Pedersen: http://matrixcookbook.com/
