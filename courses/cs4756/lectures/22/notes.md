---
type: Lecture Notes
title: "Transfer Learning"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "22"
slide_url: https://drive.google.com/file/d/10slHQvkci8T402pU8Ig3z7a1VbRhl8L5/view?usp=sharing
tags: [transfer-learning, domain-adaptation, sim-to-real, domain-randomization, meta-learning, fine-tuning, continual-learning]
timestamp: 2026-04-14T00:00:00Z
---

## TL;DR

Transfer learning reuses knowledge from a source task $\mathcal{T}_a$ to bootstrap a target task $\mathcal{T}_b$, assuming no access to $\mathcal{D}_a$ at transfer time. The lecture covers three related but distinct settings: (1) **transfer learning** via fine-tuning and modular networks, including the challenge of catastrophic forgetting in continual learning; (2) **domain adaptation**, specifically unsupervised feature alignment using adversarial training (DANN) to bridge sim-to-real gaps; and (3) **meta-learning** ("learning to learn"), which explicitly optimizes for fast adaptability — either through optimization-based methods (MAML) or context-based methods (one-shot imitation, PEARL).

---

## Key Takeaways

1. **Transfer learning is sequential; multi-task learning is simultaneous.** Transfer learning is needed when $\mathcal{D}_a$ is large or inaccessible and you only care about $\mathcal{T}_b$ at the end. Transfer learning solves multi-task learning but not vice versa.

2. **Fine-tuning design choices matter.** Use a smaller learning rate, freeze early layers (generic features), reinitialize the final classification head, and unfreeze more layers as target data grows.

3. **Modular networks enable compositional transfer.** Decomposing a policy into robot-specific and task-specific modules allows unseen robot-task combinations to be assembled from trained components.

4. **Continual learning must solve catastrophic forgetting.** Sequential gradient updates overwrite weights needed for earlier tasks.

5. **Domain adaptation bridges the sim-to-real gap without target labels.** Adversarial feature alignment (DANN) trains an encoder to fool a domain classifier, making source and target representations indistinguishable at population level.

6. **Meta-learning explicitly optimizes for transferability.** MAML finds an initialization $\theta$ such that a single gradient step from $\theta$ reaches a good solution for any task in the training distribution.

7. **Two meta-learning families:** optimization-based (MAML — model-agnostic, no need to store task data) vs. context-based (one-shot imitation, PEARL — faster inference, more interpretable, less hyperparameter-sensitive).

---

## Detailed Notes

### Slides 3–4 | Agenda

Three topics:
1. Transfer Learning
2. Domain Adaptation
3. Meta-Learning

---

### Slide 5 | Multi-Task Learning vs. Transfer Learning

| | Multi-Task Learning | Transfer Learning |
|---|---|---|
| Timing | Simultaneous | Sequential |
| Goal | $\min_\theta \sum_{i=1}^{N} \mathcal{L}_i(\theta, \mathcal{D}_i)$ | Learn $\mathcal{T}_b$ after $\mathcal{T}_a$ |
| Source data at transfer? | Yes | **No** (common assumption) |

Transfer learning is needed when:
- $\mathcal{D}_a$ is very large or inaccessible (e.g., ImageNet-scale pre-training)
- You don't need to solve $\mathcal{T}_a$ and $\mathcal{T}_b$ simultaneously

Transfer learning solves multi-task learning (use the transferred model on all tasks), but multi-task learning does not solve transfer learning (source data may be unavailable).

---

### Slide 6 | Transfer Learning via Fine-Tuning

The core update rule:

$$\theta_b \leftarrow \theta_a - \alpha \nabla_\theta \mathcal{L}(\theta, \mathcal{D}_b)\big|_{\theta = \theta_a}$$

$\theta_a$ = parameters pre-trained on source data $\mathcal{D}_a$; fine-tuned using target data $\mathcal{D}_b$.

**Common design choices:**
- Fine-tune with a **smaller learning rate** (e.g., $\tfrac{1}{10}$ of original LR)
- **Freeze earlier layers** (low-level feature detectors generalize); **gradually unfreeze** as target dataset grows
- **Reinitialize the last layer** (task-specific classification head is incompatible across tasks)

---

### Slide 7 | Fine-Tuning with Deep Neural Networks (ImageNet Example)

VGG-like CNN (Conv-64 through Conv-512, MaxPool, FC-4096 × 2, FC-1000):

- **Small target dataset (C classes):** Reinitialize and train only FC-C; freeze all conv layers.
- **Larger target dataset:** Train FC-C + upper FC layers; freeze lower conv layers. Use $\tfrac{1}{10}$ original LR when fine-tuning.

The intuition: early conv layers detect edges/textures (universal); later FC layers encode task-specific semantics (target-specific).

---

### Slide 8 | Fine-Tuning in Robotics

**Pre-training on Task A:** Full CNN + FC layers trained end-to-end for a manipulation task.

**Fine-tuning on Task B:**
- CNN encoder: **frozen** (stop gradients)
- FC policy head: **trained** on Task B data

This preserves perceptual features learned from richer data and adapts only the decision-making layers using limited target data.

---

### Slides 9–10 | Transfer Learning with Modular Networks

**Key idea:** Decompose the policy into:
- A **task module** $g(\cdot)$ — encodes what object/goal to manipulate
- A **robot module** $f(\cdot)$ — encodes how to move the robot body

Architecture: Image → Conv1 → Conv1 → Spatial Softmax + Expectation → FC1 → FC2 → FC3 → Torques, with the task module injected at the spatial expectation stage and the robot module covering the FC layers.

**Transfer procedure:**
- Train on seen (robot, task) combinations: e.g., (Robot 1, Task 1), (Robot 2, Task 1), (Robot 1, Task 2)
- At test time, combine **Robot 2 module** + **Task 2 module** for unseen world $w_4$

This compositional approach enables $O(R \times T)$ combinations from $O(R + T)$ learned modules.

---

### Slides 11–12 | Continual Learning

| | Multi-Task | Transfer | Continual |
|---|---|---|---|
| Data arrival | Simultaneous | Incremental | Incremental |
| Goal | All tasks | Last task only | **All tasks** |

*Lifelong Learning* is used interchangeably with Continual Learning, emphasizing learning over a lifetime.

**Two core challenges:**

1. **Non-stationary data distributions:** The distribution of observations changes over time (sensor drift, changing environments), violating the i.i.d. assumption.

2. **Catastrophic forgetting:** When a model trains on Task $N$, gradient updates overwrite weights that were critical for Tasks $1, \ldots, N-1$.

---

### Slides 13–14 | Domain Adaptation — Problem Setup

**Goal:** Perform well on target domain $p_T(x, y)$ using training data from source domain $p_S(x, y)$.

Domain adaptation is a form of transfer learning with access to **target domain data during training** ("transductive" learning).

Three variants:
- **Unsupervised DA:** only unlabeled target data
- **Semi-supervised DA:** unlabeled + some labeled target data
- **Supervised DA:** labeled target data available

The lecture focuses on **unsupervised domain adaptation** — the most practically relevant setting (e.g., sim-to-real where real labels are expensive).

---

### Slide 15 | The Toy Domain Adaptation Problem

**Setup:**
- Source domain $p_S(x)$: simulated robot images, abundant labeled data
- Target domain $p_T(x)$: real robot images, little/no labeled data
- $p_S(x) \neq p_T(x)$: distributions shifted (different visual appearance)

**Problem:** A classifier trained on $p_S(x)$ assigns low density to examples typical under $p_T(x)$. Features learned in simulation don't generalize to real-world appearance.

**Question:** How do we learn a classifier that performs well on $p_T(x)$?

---

### Slides 16–18 | Domain Adaptation via Feature Alignment (DANN)

**Core idea:** Learn a feature encoder $f_\theta(x)$ such that encoded representations of source and target data are **indistinguishable at the population level**.

If a domain discriminator cannot tell source from target in feature space, then $f_\theta$ has aligned the distributions: $f(x), x \sim p_S(\cdot)$ is indistinguishable from $f(x), x \sim p_T(\cdot)$.

**Architecture (Ganin et al., JMLR 2015):**
- **Feature encoder** $f_\theta(x)$: shared for both domains
- **Label classifier** $g_{\theta_g}(y \mid f(x))$: trained on source labels only
- **Domain classifier** $c_\phi(d = \text{source} \mid f(x))$: tries to distinguish source vs. target

**Objective:** Minimize label prediction error + maximize "domain confusion"

**Full DANN algorithm:**
1. Randomly initialize $f_\theta$, $g_{\theta_g}$, $c_\phi$
2. Update domain classifier:

$$\min_\phi \mathcal{L}_c = -\mathbb{E}_{x \sim D_S}[\log c_\phi(f(x))] - \mathbb{E}_{x \sim D_T}[1 - \log c_\phi(f(x))]$$

3. Update label classifier and encoder:

$$\min_{\theta,\, \theta_g} \mathbb{E}_{(x,y) \sim D_S}\!\left[L\!\left(g_{\theta_g}(f_\theta(x)),\, y\right)\right] - \lambda \mathcal{L}_c$$

4. Repeat steps 2 & 3.

**Gradient reversal:** The $-\lambda \frac{d\mathcal{L}_c}{d\theta}$ term applied to the encoder reverses the gradient from the domain classifier, implementing the adversarial game in a single backward pass. The encoder tries to fool the domain classifier while the domain classifier tries to distinguish source from target.

---

### Slide 19 | Domain Adaptation via Feature Alignment: Robotics Example

**Paper:** Bousmalis et al., "Using Simulation and Domain Adaptation to Improve Efficiency of Deep Robotic Grasping," ICRA 2018.

- Source: simulated grasping scenes with labeled grasp quality
- Target: real-world grasping scenes (unlabeled)
- Domain classifier at intermediate feature layers distinguishes sim vs. real
- Adversarial training aligns sim and real feature spaces
- Result: grasp predictor trained in simulation transfers to real robot without real labels

---

### Slide 20 | Multi-Task Domain Adaptation

**Paper:** Fang, Bai, Hinterstoisser, Savarese, Kalakrishnan, "Multi-Task Domain Adaptation," ICRA 2018.

The framework simultaneously learns:
- **Indiscriminate grasping** from both real (labeled) and simulated data
- **Instance grasping** from simulated data only (no real labels available)

A shared encoder with adversarial domain alignment bridges the sim-to-real gap while multi-task supervision provides richer training signal. This combines domain adaptation with multi-task learning.

---

### Slides 21–22 | From Transfer Learning to Meta-Learning

**Transfer learning:** Use learned weights $\theta_a$ to initialize the model for $\mathcal{T}_b$. Hope that this initialization helps.

**Meta-learning:** Explicitly *optimize* for transferability — learn an initialization $\theta$ such that $\mathcal{D}_i^{tr} \to \theta$ works well for *small* $\mathcal{D}_i^{tr}$.

**The meta-learning question:** Given many training tasks, can we learn to learn new tasks (from the same distribution) quickly?

$$\text{Learning a task: } \mathcal{D}_i^{tr} \to \theta \quad \text{(optimize this function for small } \mathcal{D}_i^{tr}\text{)}$$

---

### Slides 23–25 | Optimization-Based Meta-Learning (MAML)

**Paper:** Finn et al., "Model-Agnostic Meta-Learning," ICML 2017.

**Fine-tuning (test-time adaptation):**

$$\phi \leftarrow \theta - \alpha \nabla_\theta \mathcal{L}(\theta, \mathcal{D}^{tr})$$

**MAML meta-objective (train the initialization):**

$$\min_\theta \sum_{\text{task } i} \mathcal{L}\!\left(\theta - \alpha \nabla_\theta \mathcal{L}(\theta, \mathcal{D}_i^{tr}),\; \mathcal{D}_i^{ts}\right)$$

**Key idea:** Learn $\theta$ such that one gradient step from $\theta$ reaches a good $\phi_i^*$ for each task $i$. The outer loss is evaluated on the *test* split $\mathcal{D}_i^{ts}$ after one adaptation step — this forces $\theta$ to be placed where one step suffices.

**Geometric intuition (slide 24):** $\theta$ is placed at the "center" of a loss landscape where gradient steps from $\theta$ toward each $\nabla \mathcal{L}_i$ all lead to low-loss regions $\phi_i^*$.

**Meta-Training Algorithm:**

Repeat until convergence:
1. Sample task $T_i = (D_i^{tr}, D_i^{ts})$
2. Compute adapted parameters (inner loop, **function of $\theta$**): $\phi_i \leftarrow \theta - \alpha \nabla_\theta L(\theta, D_i^{tr})$
3. Update meta-parameters (outer loop, requires **second-order gradients**): $\theta \leftarrow \theta - \beta \nabla_\theta L(\phi_i, D_i^{ts})$

**Meta-Testing:**
1. Given task $T = (D^{tr}, D^{ts})$
2. Adapt: $\phi \leftarrow \theta - \alpha \nabla_\theta L(\theta, D^{tr})$
3. Make predictions on $D^{ts}$ using $\phi$

Step 3 of meta-training requires **second-order gradients** (gradient through the adaptation gradient), which is computationally expensive but can be approximated with first-order MAML.

---

### Slides 26–27 | Context-Based Meta-Learning: Nonparametric (One-Shot Imitation)

**Paper:** Duan et al., "One-Shot Imitation Learning," NeurIPS 2017.

**Setup:** Instead of adapting parameters via gradient steps, condition the policy on a *context* (a demonstration of the new task) at test time — no gradient computation needed.

**Architecture:**
- **Demonstration Network:** Processes a demonstration trajectory with temporal convolution, neighborhood attention, and temporal dropout → produces per-timestep embeddings
- **Context Network:** Attention over the demonstration → context embedding (what matters in the demo)
- **Manipulation Network:** Takes current observation + context embedding; attention over current state → outputs action

At test time, given a *single* demonstration of task F, the one-shot imitator directly outputs the correct policy for that task by conditioning on the demonstration as context.

---

### Slides 28–29 | Context-Based Meta-Learning: Probabilistic (PEARL)

**Paper:** Rakelly and Zhou et al., "Efficient Off-Policy Meta-Reinforcement Learning via Probabilistic Context Variables," ICML 2019.

**Setup:** Learn a latent context variable $z$ encoding task-specific information.

**Components:**
- **Inference network** $q_\phi(z \mid c)$: encodes past transitions $(s, a, s', r)$ into a Gaussian posterior over $z$; regularized toward $\mathcal{N}(0, I)$ via KL divergence: $D_{\text{KL}}(q_\phi(z \mid c) \| \mathcal{N}(0, I))$
- **Policy** $\pi_\theta(a \mid s, z)$: conditioned on both state and latent context
- **Q-function** $Q_\theta(s, a, z)$: also conditioned on $z$; trained with critic loss $\mathcal{L}_{\text{critic}}$
- Actor trained with loss $\mathcal{L}_{\text{actor}}$

**Meta-Testing Algorithm (PEARL):**

```
Initialize context c^T = {}
For k = 1, ..., K do:
    Sample z ~ q_φ(z | c^T)
    Roll out π_θ(a | s, z) to collect D_k^T = {(s_j, a_j, s'_j, r_j)}_{j:1...N}
    Accumulate context: c^T = c^T ∪ D_k^T
```

This is an **online inference** loop: the agent collects experience, updates its belief about $z$, acts better, collects more experience, and so on.

---

### Slide 30 | Optimization-Based vs. Context-Based Meta-Learning

| | Optimization-Based (MAML) | Context-Based (PEARL, One-Shot) |
|---|---|---|
| **Advantages** | Model-agnostic; no need to store target task data | Simple and fast inference; interpretable (decisions based on explicit comparisons); less sensitive to hyperparameters |
| **Adaptation mechanism** | Gradient step at test time | Forward pass through inference network |
| **Compute at test time** | Higher (requires gradient computation) | Lower (single forward pass) |

---

### Slide 31 | Summary of Problem Settings

| Setting | Data Access | Goal |
|---|---|---|
| Multi-Task Learning | All tasks simultaneously | Learn $\mathcal{T}_1, \ldots, \mathcal{T}_N$ |
| Transfer Learning | Source then target; $\mathcal{D}_a$ unavailable at transfer | Learn $\mathcal{T}_b$ |
| Domain Adaptation | Source (labeled) + target (unlabeled) simultaneously | Perform well on $p_T(x, y)$ |
| Meta-Learning | Many source tasks; few-shot target | Learning to learn (fast adaptation) |

---

## Key References

- Ganin et al. "Domain-Adversarial Training of Neural Networks." JMLR 2015.
- Bousmalis et al. "Using Simulation and Domain Adaptation to Improve Efficiency of Deep Robotic Grasping." ICRA 2018.
- Fang, Bai, Hinterstoisser, Savarese, Kalakrishnan. "Multi-Task Domain Adaptation." ICRA 2018.
- Finn et al. "Model-Agnostic Meta-Learning." ICML 2017.
- Duan et al. "One-Shot Imitation Learning." NeurIPS 2017.
- Rakelly and Zhou et al. "Efficient Off-Policy Meta-Reinforcement Learning via Probabilistic Context Variables." ICML 2019.
