---
type: Lecture Notes
title: "Policy Gradients"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "08"
slide_url: https://drive.google.com/file/d/1cMrAYFy1zx_4oSmN18Sf7kmuuwDGOoSS/view?usp=sharing
tags: [policy-gradients, REINFORCE, variance-reduction, baseline, causality, reward-to-go, TRPO, PPO, local-optima]
timestamp: 2026-02-12T00:00:00Z
---

# Lecture 08: Policy Gradients

**Course:** CS 4756/5756 Robot Learning
**Instructor:** Kuan Fang
**Date:** February 12, 2026
**Slides:** [Google Drive](https://drive.google.com/file/d/1cMrAYFy1zx_4oSmN18Sf7kmuuwDGOoSS/view?usp=sharing)

## TL;DR

Policy gradients are a class of reinforcement learning algorithms that directly optimize the policy parameters $\theta$ by computing the gradient of expected return with respect to $\theta$. The core insight — the log-derivative trick — converts an intractable integral over trajectory distributions into a tractable expectation over sampled rollouts. The resulting algorithm, REINFORCE, formalizes trial-and-error learning: increase the probability of actions that led to high reward, decrease the probability of actions that led to low reward. Three fundamental challenges follow: (1) high variance due to not knowing relative action quality, addressed by subtracting a baseline; (2) distribution shift because trajectories must be collected under the current policy, addressed by constrained updates (TRPO/PPO); and (3) local optima, partially mitigated by a good reset distribution. The method applies directly to robotics, as demonstrated by Peters and Schaal (IROS 2006) on a robot baseball swing task.

## Key Takeaways

- The policy gradient theorem gives $\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim p_\theta(\tau)}[\nabla_\theta \log p_\theta(\tau) \cdot R(\tau)]$, converting a gradient through a distribution into an expectation
- The log-derivative trick eliminates the need to differentiate through the unknown dynamics $P(s_{t+1}|s_t, a_t)$ — only $\log \pi_\theta(a_t|s_t)$ remains after taking the gradient of $\log p_\theta(\tau)$
- REINFORCE is equivalent to behavior cloning weighted by trajectory return: good trajectories are reinforced, bad ones suppressed
- Causality (the policy at time $t'$ cannot affect rewards at $t < t'$) yields reward-to-go, reducing variance without introducing bias
- Subtracting any baseline $b$ that is constant w.r.t. action is unbiased: $\mathbb{E}_{\tau \sim p_\theta(\tau)}[\nabla_\theta \log p_\theta(\tau) \cdot b] = 0$
- The average reward is a simple but effective baseline; the optimal baseline minimizes variance per gradient element
- Policy gradient is inherently on-policy: trajectories must be collected under the current $\pi_\theta$, making naive REINFORCE sample-inefficient
- TRPO and PPO address distribution shift by constraining $D_\text{KL}(\pi_{\theta^+} \| \pi_\theta) \leq \epsilon$ during each update
- Local optima are a genuine hazard; a good reset distribution (randomizing start states) is the primary practical mitigation
- Real-world application: Peters & Schaal (2006) successfully trained a robotic arm to bat a ball using policy gradients initialized from imitation learning, converging in ~400 episodes

## Detailed Notes

### [Slides 6-8] MDP Recap and Parameterized Policy

An MDP is the tuple $\mathcal{M} = \langle \mathcal{S}, \mathcal{A}, P, R \rangle$:
- $\mathcal{S}$: state space, $s_t \in \mathcal{S}$
- $\mathcal{A}$: action space, $a_t \in \mathcal{A}$
- $P$: transition probability $s_{t+1} \sim P(\cdot | s_t, a_t)$
- $R$: reward function $r_t = R(s_t, a_t, s_{t+1})$

The discounted return and objective:

$$J(\pi) = \mathbb{E}_\pi\left[\sum_{t \geq 0} \gamma^t r_t\right]$$

With a parameterized policy $\pi_\theta(a|s)$, the trajectory distribution factors as:

$$p_\theta(\tau) = P(s_0) \prod_{t=0}^{T-1} \pi_\theta(a_t|s_t)\, P(s_{t+1}|s_t, a_t)$$

The optimization goal becomes:

$$\theta^* = \arg\max_\theta J(\theta) = \arg\max_\theta \mathbb{E}_{\tau \sim p_\theta(\tau)}\left[\sum_{t=0}^{T-1} R(s_t, a_t)\right]$$

For the finite-horizon case (used throughout the derivation), $R(\tau) = \sum_{t=0}^{T-1} R(s_t, a_t)$.

### [Slides 9] Monte Carlo Approximation of $J(\theta)$

Because the expectation is intractable in closed form, approximate with $N$ sampled rollouts:

$$J(\theta) = \mathbb{E}_{\tau \sim p_\theta(\tau)}[R(\tau)] \approx \frac{1}{N} \sum_{i=1}^{N} R(\tau_i) = \frac{1}{N} \sum_i \sum_{t=0}^{T-1} r_{i,t}$$

where $i$ indexes rollout trajectories.

### [Slides 10-13] The Policy Gradient Theorem (Log-Derivative Trick)

Direct differentiation:

$$\nabla_\theta J(\theta) = \nabla_\theta \int p_\theta(\tau) R(\tau)\, d\tau = \int \nabla_\theta p_\theta(\tau) R(\tau)\, d\tau$$

The problem: $R(\tau)$ and $p_\theta(\tau)$ are entangled inside an integral that cannot be sampled directly. Apply the **log-derivative trick**:

$$\nabla_\theta \log p_\theta(\tau) = \frac{\nabla_\theta p_\theta(\tau)}{p_\theta(\tau)} \implies p_\theta(\tau)\,\nabla_\theta \log p_\theta(\tau) = \nabla_\theta p_\theta(\tau)$$

Substituting back:

$$\nabla_\theta J(\theta) = \int p_\theta(\tau)\,\nabla_\theta \log p_\theta(\tau)\, R(\tau)\, d\tau = \mathbb{E}_{\tau \sim p_\theta(\tau)}\left[\nabla_\theta \log p_\theta(\tau)\, R(\tau)\right]$$

### [Slide 14] Eliminating Unknown Dynamics

Take the log of the trajectory distribution:

$$\log p_\theta(\tau) = \underbrace{\log P(s_0)}_{\text{no }\theta} + \sum_{t=0}^{T-1} \log \pi_\theta(a_t|s_t) + \underbrace{\log P(s_{t+1}|s_t,a_t)}_{\text{no }\theta}$$

The initial state distribution and dynamics terms vanish under $\nabla_\theta$:

$$\nabla_\theta \log p_\theta(\tau) = \sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t|s_t)$$

This is the key practical insight: **we never need to know or differentiate through the environment dynamics**.

### [Slide 15] Final Policy Gradient Estimator

Combining everything:

$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim p_\theta(\tau)}\left[\left(\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t|s_t)\right)\left(\sum_{t=0}^{T-1} R(s_t, a_t)\right)\right]$$

Monte Carlo approximation with $N$ rollouts:

$$\widehat{\nabla}_\theta J(\theta) \approx \frac{1}{N} \sum_{i=0}^{N-1}\left[\left(\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\right)\left(\sum_{t=0}^{T-1} R(s_{i,t}, a_{i,t})\right)\right]$$

### [Slide 16] REINFORCE Algorithm

```
Initialize π_θ
While not converged:
    Collect {(s_i, a_i, s_i', r_i)}_{i=0}^N  under policy π_θ
    Compute gradient:
        ∇̂_θ J(θ) = (1/N) Σ_{i=0}^{N-1} [(Σ_{t=0}^{T-1} ∇_θ log π_θ(a_{i,t}|s_{i,t}))
                                            (Σ_{t=0}^{T-1} R(s_{i,t}, a_{i,t}))]
    Update θ ← θ + α ∇̂_θ J(θ)   # α is the learning rate
Return π_θ
```

### [Slide 17] Comparison to Imitation Learning (Behavior Cloning)

Policy gradient estimator:

$$\widehat{\nabla}_\theta J_\text{PG}(\theta) = \frac{1}{N}\sum_{i=0}^{N-1}\left[\left(\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\right)\left(\sum_{t=0}^{T-1} R(s_{i,t}, a_{i,t})\right)\right]$$

Behavior cloning estimator (no reward weighting):

$$\widehat{\nabla}_\theta J_\text{BC}(\theta) = \frac{1}{N}\sum_{i=0}^{N-1}\left[\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\right]$$

The difference is the return multiplier $\sum_t R(s_{i,t}, a_{i,t})$. Policy gradients formalize "trial and error": good trajectories are made more likely, bad trajectories less likely. This operates without any expert demonstration.

### [Slides 18-19] Causality and Reward-to-Go

**Causality principle:** The policy at time $t'$ cannot causally affect rewards at time $t < t'$. This holds regardless of the Markov assumption.

Applying causality to the gradient:

$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim p_\theta(\tau)}\left[\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_t|s_t) \underbrace{\left(\sum_{t'=t}^{T-1} R(s_{t'}, a_{t'})\right)}_{\text{reward-to-go}}\right]$$

The reward-to-go $\hat{Q}_t = \sum_{t'=t}^{T-1} R(s_{t'}, a_{t'})$ replaces the full trajectory return. This is an unbiased estimator with lower variance than the full-return version (proof at spinningup.openai.com/en/latest/spinningup/extra_pg_proof1.html).

### [Slide 20] REINFORCE with Reward-to-Go

```
Initialize π_θ
While not converged:
    Collect {(s_i, a_i, s_i', r_i)}_{i=0}^N  under policy π_θ
    Compute gradient:
        ∇̂_θ J(θ) = (1/N) Σ_{i=0}^{N-1} [Σ_{t=0}^{T-1} ∇_θ log π_θ(a_{i,t}|s_{i,t})
                                            (Σ_{t'=t}^{T-1} R(s_{i,t'}, a_{i,t'}))]
    Update θ ← θ + α ∇̂_θ J(θ)
Return π_θ
```

---

## Part 2: Analysis and Improvements

### [Slide 22] Challenge 1: High Variance

Consider a simple policy $\pi_\theta(a|s) = \begin{cases}\theta & \text{if } a = \text{LEFT} \\ 1-\theta & \text{if } a = \text{RIGHT}\end{cases}$

Suppose LEFT yields +10 and RIGHT yields -1. The gradient correctly increases LEFT. But if both LEFT and RIGHT yield positive rewards (e.g., +12 vs. +1), both get reinforced — the agent does not know that LEFT is much better relative to RIGHT. All-positive reward scales create a situation where even suboptimal actions are made more likely, just to varying degrees.

**Key issue:** The raw return provides no signal about how an action performs *relative to other actions* from the same state.

### [Slide 23] Variance Reduction via Baseline Subtraction

Subtract a baseline $b$ (a scalar constant with respect to action $a$) from the reward:

$$\nabla_\theta J(\theta) \approx \frac{1}{N}\sum_{i=0}^{N-1}\left[\nabla_\theta\left(\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\right)\left(\sum_{t'=t}^{T-1} R(s_{i,t}, a_{i,t}) - b\right)\right]$$

**Why is this unbiased?**

$$\mathbb{E}_{\tau \sim p_\theta(\tau)}[\nabla_\theta \log p_\theta(\tau) \cdot b] = 0$$

This follows because $\int \nabla_\theta p_\theta(\tau)\, d\tau = \nabla_\theta \int p_\theta(\tau)\, d\tau = \nabla_\theta 1 = 0$, and $b$ is constant w.r.t. $\tau$.

**Practical choices for $b$:**
- **Average reward** (simple, good default): $b = \frac{1}{N}\sum_i R(\tau_i)$
- **Optimal baseline** (minimizes variance per gradient element $h$, as shown in Peters & Schaal 2006):

$$b^h = \frac{\left\langle\left(\sum_{k=0}^{H} \nabla_{\theta_h} \log \pi_\theta(\mathbf{u}_k|\mathbf{x}_k)\right)^2 \sum_{l=0}^{H} a_l r_l\right\rangle}{\left\langle\left(\sum_{k=0}^{H} \nabla_{\theta_h} \log \pi_\theta(\mathbf{u}_k|\mathbf{x}_k)\right)^2\right\rangle}$$

### [Slide 24-25] Challenge 2: Distribution Shift (On-Policy Requirement)

The policy gradient expectation is taken under the *current* policy $\pi_\theta$:

$$\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim p_\theta(\tau)}\left[\cdots\right]$$

This makes policy gradients **on-policy**: trajectories collected under $\pi_\theta$ cannot be reused after $\theta$ is updated. Every gradient step requires fresh rollouts.

**On-policy vs. off-policy:**
- **On-policy learner:** Learns the value of the policy currently being executed by the robot
- **Off-policy learner:** Learns the value of the optimal policy independently of the robot's current behavior (enables replay buffers, data reuse)

On-policy learning is **highly inefficient and unstable**: thousands of fresh rollouts discarded after each small parameter update.

### [Slide 26] Addressing Distribution Shift: TRPO and PPO

Idea: Allow updates, but constrain how much the distribution can change. Find the best $\Delta\theta$ such that:

$$\max_{\Delta\theta} J(\theta + \Delta\theta) \quad \text{s.t.} \quad D_\text{KL}(\pi_{\theta^+} \| \pi_\theta) \leq \epsilon$$

where KL-divergence measures distribution shift:

$$D_\text{KL}(P \| Q) = \int_{-\infty}^{\infty} p(x) \log \frac{p(x)}{q(x)}\, dx$$

**Trust Region Policy Optimization (TRPO):**
- Enforces the KL constraint exactly (using conjugate gradients)
- Theoretically well-grounded with monotonic improvement guarantees
- Complex to implement in practice

**Proximal Policy Optimization (PPO):**
- Approximates the KL constraint via a clipping objective (no second-order methods needed)
- More widely used in practice (e.g., in RLHF for LLMs)
- The clipping prevents the ratio $\pi_{\theta^+}(a|s)/\pi_\theta(a|s)$ from straying too far from 1

### [Slides 27-35] Challenge 3: Local Optima

Policy gradient ascent can converge to local optima rather than the global optimum. The **Ring of Fire** example illustrates this:

- Environment: robot can move left (+1 small reward) or right (ring of fire: -10 cost to enter, but +100 reward inside)
- Starting from the middle, early rollouts reveal the small left reward consistently
- The few rollouts that attempt right mostly encounter the -10 penalty before discovering the +100 reward
- The gradient pushes the policy toward left (consistent positive signal), and the policy converges to always going left — a local optimum
- The globally optimal policy (go right, brave the ring) is never explored

**Mitigation: Good reset distribution**

Run REINFORCE from *different start states*:
- Reset the robot at various positions in the state space, including near the ring of fire
- From near the ring, the agent discovers the +100 reward directly
- Each sub-problem has a cleaner gradient signal
- The policy can then generalize the "go into the ring" behavior from multiple start points

This is also known as **curriculum learning** in robotics — structuring the distribution of initial states to expose the agent to the relevant parts of the state space. It does not guarantee finding the global optimum but significantly improves exploration.

### [Slides 36-39] Application to Robotic Control (Peters & Schaal, IROS 2006)

**Task:** Teach a robotic arm to bat a thrown ball (baseball swing).

**Approach:**
1. Initialize from imitation learning (teach by demonstration): human physically demonstrates the swing motion
2. Run policy gradient from this initialization with per-element optimal baseline

**Peters & Schaal algorithm:**
```
input: policy parameterization θ_h
repeat:
    Perform a trial: collect x_{0:H}, u_{0:H}, r_{0:H}
    for each gradient element g_h:
        Estimate optimal baseline b^h
        Estimate gradient element:
            g_h = ⟨(Σ_{k=0}^H ∇_{θ_h} log π_θ(u_k|x_k))(Σ_{l=0}^H a_l r_l - b^h)⟩
    end for
until gradient estimate g_FD = [g_1, ..., g_h] converged
return gradient estimate g_FD
```

**Results:**
- Performance $J(\theta)$ improved from -10 (random/initial) to near 0 over ~400 episodes
- Qualitative progression: (b) teach by imitation → (c) initial reproduced motion → (d) improved reproduced motion after RL

Modern extension: Boston Dynamics (2025) uses similar policy gradient methods (combined with simulation-to-real transfer) to train acrobatic behaviors in real humanoid robots.

## Concepts Introduced

- [[Policy Gradient Theorem]] — Core result expressing $\nabla_\theta J(\theta)$ as a tractable expectation
- [[Log-Derivative Trick]] — Mathematical identity enabling gradient of expectation via samples
- [[REINFORCE]] — The fundamental policy gradient algorithm; Williams (1992)
- [[Reward-to-Go]] — Variance reduction using causality; replace full-trajectory return with future-only return
- [[Baseline Subtraction]] — Subtract action-independent scalar $b$ without introducing bias
- [[On-Policy Learning]] — Requirement that data be collected under the current policy
- [[TRPO]] — Trust Region Policy Optimization; constrained update with KL bound
- [[PPO]] — Proximal Policy Optimization; practical clipping-based approximation of TRPO
- [[Local Optima in RL]] — Policy gradients are gradient ascent; can get stuck in suboptimal policies
- [[Reset Distribution]] — Randomizing start states to explore and escape local optima

## Connections to Other Lectures

- Lecture 06: MDP formalism and return definitions established here
- Lecture 07: Behavioral cloning — policy gradient extends BC by weighting with reward signal
- Lecture 09 (upcoming): Value-based methods (Q-learning) — an alternative to policy gradients that learn a value function instead of directly optimizing the policy
- CS336 Lecture 16: RLVR and GRPO — policy gradient methods applied to LLM post-training (GRPO is a group-relative variant that removes the value function entirely)

## Open Questions

- What is the optimal baseline in general (beyond the per-element formula)? The value function $V^\pi(s_t)$ is theoretically optimal — motivating Actor-Critic methods
- How do we efficiently implement PPO's clipping in practice, and what $\epsilon$ works best?
- Can we combine imitation learning initialization with policy gradients more systematically to avoid local optima?
- How does sample complexity scale with the dimensionality of $\theta$ for policy gradient methods?
