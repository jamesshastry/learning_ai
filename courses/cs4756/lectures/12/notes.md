---
type: lecture_notes
title: "Dynamics Learning"
course: CS 4756/5756 Robot Learning
university: Cornell University
lecture_id: 12
slide_url: https://drive.google.com/file/d/1q7yWpG4DUP9h1dAYdDZoFlzDpBPlXM9z/view?usp=sharing
tags: [dynamics, model-based-rl, system-identification, gaussian-processes, neural-networks, dyna, compounding-error]
timestamp: 2026-03-03
---

## TL;DR

Dynamics learning is about fitting a model $f(s, a) \approx s'$ from data so that a robot can plan or learn policies without relying on a hand-coded physics engine. The lecture covers four complementary approaches — linear models, Gaussian processes, neural networks, and ensembles — then shows how learned dynamics plug into two model-based RL paradigms: backpropagating gradients directly through the model, and using the model as a sample generator for model-free RL. The central pitfall is compounding error: small per-step model errors grow as $O(\epsilon T^2)$ over long rollouts, motivating short-rollout variants and the Dyna algorithm.

## Key Takeaways

1. **Dynamics models are function approximators** mapping $(s_t, a_t) \mapsto s_{t+1}$ (or a residual $\Delta s$). Residual models are often better conditioned because the state barely changes each step.
2. **Four model families**: linear regression (fast, low capacity), Gaussian processes (principled uncertainty, expensive), neural networks (high capacity, data-hungry), probabilistic/ensemble networks (uncertainty-aware, practical).
3. **Backpropagating through dynamics** enables analytic policy gradients but suffers from vanishing/exploding gradients over long horizons.
4. **Model-free RL with a model (Dyna)** avoids gradient issues: the model generates synthetic $(s, a, s', r)$ transitions that augment real data for any model-free algorithm.
5. **Compounding error** scales as $O(\epsilon T^2)$; short rollouts from real states (MBPO-style) reduce it while maintaining coverage of later states.

---

## Detailed Notes

### Section 1 — Why Learn Dynamics? (Slides 1–4)

Recall the MDP transition $s' = f(s, a)$. In **model-based RL**, we want to use $f$ for planning or policy optimization. When $f$ is unknown we must learn it.

**Motivation for learning over hand-coding:**
- Real robots have complex, poorly-modelled contact dynamics.
- Simulation has a *reality gap* — parameters (friction, mass) are uncertain.
- Learned models can be updated online as the environment changes.

**Two uses of a learned model:**
1. **Planning**: use $\hat{f}$ to simulate trajectories and optimize actions (MPC, shooting methods).
2. **Policy learning**: use $\hat{f}$ as a differentiable or generative environment.

---

### Section 2 — Learning Dynamics Models (Slides 5–14)

#### 2.1 Problem Setup

Given a dataset $\mathcal{D} = \{(s_i, a_i, s_i')\}_i$, learn $f_\phi$ to minimize prediction error:

$$\mathcal{L}(\phi) = \sum_i \|s_i' - f_\phi(s_i, a_i)\|^2$$

**Residual formulation** (often preferred):

$$f_\phi(s, a) = s + \Delta_\phi(s, a)$$

Because $\Delta$ is small, regression targets are near zero and learning is better conditioned.

#### 2.2 Linear Models

$$s' = As + Ba + \text{const}$$

- **Pros**: closed-form solution, fast, interpretable.
- **Cons**: low expressivity; fails for nonlinear dynamics (robot joints, contacts).
- **System identification**: classical robotics approach — fit $(A, B)$ from trajectories. Works well for quasi-static or slow motions.

#### 2.3 Gaussian Processes (GPs)

A GP places a distribution over functions:

$$f \sim \mathcal{GP}(\mu(s,a),\ k((s,a),(s',a')))$$

Posterior given data:

$$p(s'_* | s_*, a_*, \mathcal{D}) = \mathcal{N}(\mu_*, \sigma_*^2)$$

- **Pros**: principled uncertainty quantification (know when you don't know), data-efficient for low-dimensional problems.
- **Cons**: $O(n^3)$ training cost; scales poorly to high-dimensional states.
- **Key use**: PILCO (Deisenroth & Rasmussen 2011) — propagates uncertainty through multi-step rollouts for sample-efficient control.

#### 2.4 Neural Network Dynamics Models

A feed-forward network $f_\phi: \mathcal{S} \times \mathcal{A} \to \mathcal{S}$ trained with MSE loss.

- **Pros**: high capacity, handles raw images with CNNs, scales to high dimensions.
- **Cons**: overconfident, poor uncertainty estimates, prone to overfitting with small $\mathcal{D}$.

Training loop:
1. Collect data with current policy $\pi$.
2. Train $f_\phi$ on $\mathcal{D}$.
3. Use $f_\phi$ to plan / improve policy.
4. Collect more data, repeat (iterative / DAgger-style).

#### 2.5 Probabilistic / Ensemble Models

To get uncertainty, output a Gaussian:

$$f_\phi(s, a) = \mathcal{N}(\mu_\phi(s,a),\ \Sigma_\phi(s,a))$$

Or train an **ensemble** of $K$ deterministic networks $\{f_{\phi_k}\}$:
- Epistemic uncertainty $\propto$ variance across ensemble members.
- PETS (Chua et al. 2018) uses ensembles of probabilistic networks — state of the art on many continuous control benchmarks.

**Why ensembles help:**
- Different initializations $\Rightarrow$ different solutions $\Rightarrow$ disagreement signals out-of-distribution inputs.
- Can use disagreement as exploration bonus: visit states where ensemble disagrees.

---

### Section 3 — Model-Based Policy Optimization (Slides 15–20)

Two main paradigms for using $f_\phi$ to improve a policy $\pi_\theta$:

#### 3.1 Backpropagate Directly Through the Model (Slides 22–23)

Unroll the policy through the learned dynamics and differentiate the return end-to-end:

$$J(\theta) = \sum_{t=0}^{T-1} r(s_t, a_t), \quad s_{t+1} = f_\phi(s_t, a_t), \quad a_t = \pi_\theta(s_t)$$

Gradient: $\nabla_\theta J = \frac{\partial J}{\partial a_t} \frac{\partial a_t}{\partial \theta}$, backpropagated through $f_\phi$ at each step.

**Algorithm:**
```
Run π₀ to collect D = {(sᵢ, aᵢ, sᵢ')}
While not converged:
    Learn f_φ(sₜ, aₜ) to minimize Σ||sᵢ' - f_φ(sᵢ, aᵢ)||²
    Backpropagate through f_φ to optimize π_θ
    Run π_θ to collect (sₜ, aₜ, sₜ') and update D
```

**Problems (Slide 23):**
- **Vanishing gradient**: $\|\partial h_i / \partial h_{i-1}\|_2 < 1$ — gradients shrink exponentially with horizon.
- **Exploding gradient**: $\|\partial h_i / \partial h_{i-1}\|_2 > 1$ — gradients blow up.
- Both arise because backprop chains Jacobians of $f_\phi$ across $T$ steps.

#### 3.2 Model-Free Optimization with a Model (Slide 24)

Use $f_\phi$ to **generate synthetic transitions** $(s, a, s', r)$, then train any model-free RL algorithm on them.

- Avoids gradient-through-dynamics issues.
- Compatible with Q-learning, SAC, PPO, etc.

**Model-Based RL via Policy Gradient (Slides 25–27):**
```
Run π₀ to collect D
While not converged:
    Train f_φ(sₜ'|sₜ, aₜ) on D
    While not converged:
        Use f_φ to generate D' = {(sⱼ, aⱼ, sⱼ')} with π_θ
        Train π_θ on D' via policy gradient
    Run π_θ to collect data and update D
```

Trajectory distribution: $p_{\theta,\phi}(\tau) = P(s_0)\prod_{t=0}^{T-1} \pi_\theta(a_t|s_t) f_\phi(s_{t+1}|s_t, a_t)$

---

### Section 4 — Compounding Error and Short Rollouts (Slides 28–30)

#### 4.1 Compounding Error (Slides 28–29)

Even a small per-step error $\epsilon$ in $f_\phi$ compounds over a $T$-step rollout:

$$\text{Error} = O(\epsilon T^2)$$

This means long synthetic rollouts diverge dramatically from real dynamics (red vs black curve).

**Three rollout strategies (Slide 29):**

| Strategy | Pro | Con |
|---|---|---|
| Long rollouts from start | Covers full trajectory | Large compounding error |
| Short rollouts from start | Lower error | Never sees later states |
| Short rollouts from real states (branched) | Lower error + sees later states | Wrong state distribution |

The third (branched) is used in **MBPO** (Janner et al. 2019): branch short synthetic rollouts from states in the real replay buffer.

#### 4.2 Model-Based RL with Short Rollouts (Slide 30)

```
Run π₀ to collect D
While not converged:
    Train f_φ on D
    While not converged:
        Sample sᵢ ∈ D
        Use f_φ(sᵢ'|sᵢ, aᵢ) to generate short rollouts as D'
        Train π_θ on D ∪ D' with off-policy RL
    Run π_θ, collect data, update D
```

---

### Section 5 — Dyna (Slides 31–32)

**Dyna** (Sutton 1990) is the canonical algorithm combining model learning with model-free RL:

1. Collect transitions $(s, a, s', r)$ from the real environment.
2. Learn model $\hat{p}(s'|s, a)$ (and optionally $\hat{r}(s, a)$).
3. Repeat $K$ times:
   - Sample $s \sim \mathcal{B}$ from replay buffer.
   - Choose action $a$ (from buffer, policy, or random).
   - Simulate $s' \sim \hat{p}(s'|s, a)$ (and $r = \hat{r}(s, a)$).
   - Train on $(s, a, s', r)$ with model-free RL (e.g., Q-learning).

**Key insight**: Each real step generates $K$ virtual steps at essentially zero cost, dramatically improving sample efficiency. The diagram shows short branched rollouts from real states (orange dots), keeping the synthetic distribution close to real.
