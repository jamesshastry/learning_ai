---
type: Lecture Notes
title: "Generative Models"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "24"
slide_url: https://drive.google.com/file/d/1CqSQlo5gbDymCE7FsJDrdjg0_8IjTM0l/view?usp=sharing
tags: [generative-models, VAE, diffusion, flow-matching, action-generation]
timestamp: 2026-04-21T00:00:00Z
---

## TL;DR

Generative models learn a distribution $p(x)$ over high-dimensional data and can draw novel samples from it. This lecture covers the three dominant families — VAEs, GANs, and Diffusion Models — then shows how all of them can be repurposed for robotic control by modeling action distributions conditioned on observations. The headline application is **Diffusion Policy** (Chi et al. 2023), which treats imitation learning as conditional denoising of action sequences and directly handles multimodal, temporally correlated robot behavior.

---

## Key Takeaways

1. **Latent variable models** decouple "what kind of sample" (latent $z$) from "how to render it" (decoder $g_\theta$), enabling structured sampling.
2. **VAE** adds a learned approximate posterior and the ELBO loss (reconstruction + KL) to make sampling from $p(z) = \mathcal{N}(0,I)$ tractable.
3. **GAN** sidesteps density estimation entirely: a generator fools a discriminator in a minimax game, producing sharp samples but suffering from mode collapse and training instability.
4. **Diffusion Models** are currently state-of-the-art for quality and diversity; their cost is slow (iterative) sampling. The forward process gradually adds Gaussian noise; the reverse process learns to denoise step by step.
5. **All generative models extend to conditional generation** $p_\theta(x \mid c)$, where $c$ can be text, image, pose, segmentation, etc.
6. **Stochastic policies are generative models**: $a \sim \pi_\theta(a \mid o)$ captures multimodal action distributions that a single MSE-minimizing policy cannot.
7. **Diffusion Policy** applies diffusion to action sequences conditioned on observation history, using action chunking to exploit temporal correlation and reduce myopic, noisy predictions.

---

## Detailed Notes

### Part 1 — Generative Model Basics (Slides 1–7)

#### Motivation (Slides 3–5)

The core problem: given a dataset $\mathcal{X}$ (e.g., cat images), learn to synthesize new samples $x \sim p(x)$.

One intuition: treat generation as a two-stage lookup. First sample a compact description (eyes, ears, fur type) from a **random number generator**, then index into the data manifold. This motivates introducing a **latent variable** $z$:

- Sample $z \in \mathcal{Z}$ from a simple prior.
- Decode $z$ into data $x \in \mathcal{X}$.

In a deep generative model the "index" is replaced by a learned neural network $x = g_\theta(z)$ (Slide 6).

#### Discriminative vs. Generative (Slide 7)

| Model type | Models | Direction |
|---|---|---|
| Discriminative | $p(y \mid x)$ | data $\to$ label |
| Generative | $p(x)$, $p(x \mid y)$ | noise/label $\to$ data |

---

### Part 2 — Common Types of Deep Generative Models (Slides 8–23)

#### Autoencoder (Slide 8)

An autoencoder compresses data to a latent code then reconstructs it:

$$z = f_\phi(x), \quad \hat{x} = g_\theta(z) = g_\theta\!\left(f_\phi(x)\right)$$

Training objective (reconstruction loss):

$$\mathcal{L} = \|x - \hat{x}\|^2 = \left\|x - g_\theta\!\left(f_\phi(x)\right)\right\|^2$$

Problem: no guarantee that the latent space is structured for sampling — arbitrary $z$ may decode to garbage.

#### Denoising Autoencoder (Slide 9)

Idea: corrupt the input with noise $\tilde{x} \sim q(\tilde{x} \mid x)$, then reconstruct the clean sample $x$. This forces the model to learn the structure of the data manifold and yields more robust representations.

$$z = f_\phi(\tilde{x}), \quad \hat{x} = g_\theta\!\left(f_\phi(\tilde{x})\right), \quad \mathcal{L} = \left\|x - g_\theta\!\left(f_\phi(\tilde{x})\right)\right\|^2$$

#### Variational Autoencoder — VAE (Slides 10–14)

**Problem:** We want $z \sim p(z) \Rightarrow x \sim p(x)$, i.e., sampling the prior should produce realistic data. The marginal likelihood:

$$p_\theta(x) = \int p_\theta(x \mid z)\, p(z)\, dz$$

is intractable to optimize directly.

**Idea:** Learn an approximate posterior $q_\phi(z \mid x)$ alongside the decoder.

Architecture:
- **Encoder**: $z \sim q_\phi(z \mid x)$
- **Prior**: $p(z) = \mathcal{N}(0, I)$
- **Decoder**: $\hat{x} \sim p_\theta(x \mid z)$

Two loss terms:
- **Reconstruction**: $\mathcal{L}_x = \|x - \hat{x}\|^2$
- **KL regularization**: $\mathcal{L}_z = D_\text{KL}\!\left(q_\phi(z \mid x) \;\|\; p(z)\right)$

**ELBO** (Evidence Lower Bound) — the core equation (Slide 13):

$$\log p_\theta(x) \geq \mathbb{E}_{q_\phi(z|x)}\!\left[\log p_\theta(x \mid z)\right] - D_\text{KL}\!\left(q_\phi(z \mid x) \;\|\; p(z)\right)$$

Interpretations:
- **Reconstruction term**: Latent code $z$ carries enough information to decode $x$ accurately.
- **KL regularization**: Posterior $q_\phi(z \mid x)$ stays close to the prior $p(z)$, so sampling from $p(z)$ at test time falls in a well-decoded region.

**Reparameterization trick** (Slide 14) — makes sampling differentiable:

$$z = \mu_\theta(x) + \sigma_\theta(x) \odot \epsilon, \quad \epsilon \sim \mathcal{N}(0, I)$$

Gradients flow through $\mu_\theta$ and $\sigma_\theta$; randomness is isolated in the fixed-distribution draw $\epsilon$.

**Trade-off**: VAEs are principled and diverse but tend to produce blurry samples because the reconstruction loss is MSE-based.

#### Generative Adversarial Network — GAN (Slides 15–16)

Two networks compete:
- **Generator** $G_\theta(z)$: maps noise $z \sim \mathcal{N}(0,I)$ to a fake sample $\hat{x}$.
- **Discriminator** $D_\phi(x)$: predicts real vs. fake.

**Minimax objective**:

$$\min_\theta \max_\phi\; \mathbb{E}_{x \sim p(x)}\!\left[\log D_\phi(x)\right] + \mathbb{E}_{z \sim p(z)}\!\left[\log\!\left(1 - D_\phi(G_\theta(z))\right)\right]$$

- Generator tries to fool the discriminator (minimize the expression).
- Discriminator tries to correctly classify (maximize).

**Strengths**: Sharp, high-quality samples.  
**Weaknesses**: Unstable training, mode collapse (generator learns only a subset of the data distribution).

#### Diffusion Model (Slides 17–22)

**Core idea**: Generate data by starting from pure noise and repeatedly denoising.

**Forward process** (Slides 18–21): Gradually corrupt a clean sample $x_0$ by adding Gaussian noise over $K$ steps.

$$q(x_k \mid x_{k-1}) = \mathcal{N}\!\left(\sqrt{1 - \beta_k}\, x_{k-1},\; \beta_k I\right)$$

- $x_0 \sim p(x_0)$ is the real data.
- $x_K \approx \mathcal{N}(0, I)$ — approximately pure noise.
- $\beta_k$ is the noise schedule (typically increasing).

**Closed-form marginal** (any step directly from $x_0$):

$$x_k = \sqrt{\bar\alpha_k}\, x_0 + \sqrt{1 - \bar\alpha_k}\, \epsilon, \quad \epsilon \sim \mathcal{N}(0,I)$$

where $\alpha_k = 1 - \beta_k$ and $\bar\alpha_k = \prod_{s=1}^{k} \alpha_s$.

This avoids sequential simulation during training — you can sample any noise level in one step.

**Reverse process** (Slide 22): A neural network $\epsilon_\theta(x_k, k)$ learns to predict the noise that was added at step $k$. The reverse mean is:

$$\mu_\theta(x_k, k) = \frac{1}{\sqrt{\alpha_t}}\!\left(x_k - \frac{1 - \alpha_k}{\sqrt{1 - \bar\alpha_k}}\,\epsilon_\theta(x_k, k)\right)$$

**Training loss** (simple noise-prediction MSE):

$$\mathcal{L} = \mathbb{E}_{x_0, \epsilon, k}\!\left[\|\epsilon - \epsilon_\theta(x_k, k)\|^2\right]$$

**Strengths**: Stable training, diverse samples, state-of-the-art quality.  
**Weakness**: Slow sampling (requires $K$ sequential denoising steps, typically 100–1000).

#### Comparison of Generative Models (Slide 23)

| Model | Strengths | Weaknesses |
|---|---|---|
| VAE | Principled, diverse | Often blurrier |
| GAN | Sharp samples | Unstable, mode collapse |
| Diffusion | Stable, diverse, high quality | Slow sampling |

The Venn diagram from Slide 23 (credit: Neeraj Kumar) shows that GANs dominate high-quality + fast; VAEs / Normalizing Flows dominate mode coverage + fast; Diffusion dominates high-quality + mode coverage, at the cost of speed.

---

### Part 3 — Deep Generative Models for Robotic Control (Slides 24–32)

#### Conditional Generation (Slide 24)

All generative models extend to **conditional generation** $p_\theta(x \mid c)$, where $c$ is a context signal. In vision and robotics, $c$ can be:

- Text prompt
- Image
- Pose
- Segmentation map, depth, edges, etc.

#### Generative Models as Policies (Slide 25)

A **stochastic policy** is literally a generative model over actions:

$$a \sim \pi_\theta(a \mid o)$$

- Input: observation $o$ + optional task specification $c$
- Output: action $a$

Why generative policies matter:
1. **Capture multimodal actions** — many tasks admit several equally valid behaviors (e.g., go around an obstacle on either side).
2. **Support stochastic exploration** — necessary for RL and avoiding deterministic traps.

#### Generative Models as Dynamics Models (Slide 26)

A stochastic dynamics model is a generative model over future states:

$$s_{t+1} \sim p_\theta(s_{t+1} \mid s_t, a_t) \quad \text{or} \quad o_{t+1} \sim p_\theta(o_{t+1} \mid o_t, a_t)$$

Useful for model-based RL, planning, and world models.

#### Multimodal Action Distributions (Slides 27–28)

In many robot states, multiple valid actions exist (e.g., pick up an object from the left or right). A policy trained with MSE behavior cloning:

$$\min_\theta \mathbb{E}\!\left[\|a - \pi_\theta(o)\|^2\right]$$

predicts the **mean** of all valid actions — which can be physically invalid (e.g., the average of "go left" and "go right" is "go straight into the obstacle"). A generative policy instead models the full distribution, preserving all modes.

#### Diffusion Policy (Slides 29–32)

Reference: Chi et al., "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion," 2023.

**Core idea**: Apply the diffusion model framework to generate robot action sequences, conditioned on observation history.

**Inference** (Slide 29): Start from a noisy action sequence and iteratively denoise:

$$a_H^{(K)} \to a_H^{(K-1)} \to \cdots \to a_H^{(0)}$$

**Observation history** (Slide 30): The policy conditions on a history window $o_{t-H_o+1:t} = (o_{t-H_o+1}, \ldots, o_t)$ rather than a single observation. This matters because:

- Robots often operate under **partial observability** (hidden state).
- **Occlusion** means single frames can be ambiguous.
- History encodes **velocity information** implicitly.

**Action chunking** (Slide 31): The policy predicts an entire action sequence (chunk) $a_{t:t+H_a-1} = (a_t, \ldots, a_{t+H_a-1})$ at once. Benefits:

- Robot motion is temporally correlated; smooth multi-step plans are more natural.
- Single-step predictions can be noisy or myopic.
- Reduces compounding errors from frequent re-planning.

**Training objective** (Slide 32):

$$\mathcal{L} = \mathbb{E}_{a, \epsilon, k, o}\!\left[\|\epsilon - \epsilon_\theta(o, a^{(k)}, k)\|^2\right]$$

where:
- $a$: expert action sequence from demonstrations
- $a^{(k)}$: noised version of $a$ at diffusion step $k$
- $o$: observation history $o_{t-H_o+1:t}$

The denoising network $\epsilon_\theta$ takes the observation history $\mathbf{O}$, the noised action sequence $\mathbf{A}^{(k)}$, and the noise level $k$, and predicts the noise $\epsilon$.

At inference, the policy samples a random Gaussian action sequence and runs $K$ denoising steps conditioned on the current observation history to recover a clean, coherent action sequence.
