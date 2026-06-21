---
type: Lecture Notes
title: "Actor-Critic Methods"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "09"
slide_url: https://drive.google.com/file/d/1PlFT0THQ6lecOj4WYCPD7uRkvY7mPQnh/view?usp=sharing
tags: [actor-critic, advantage-function, A2C, GAE, policy-gradient, value-function, bootstrapping]
timestamp: 2026-02-19T00:00:00Z
---

# Lecture 09: Actor-Critic Methods

**Course:** CS 4756/5756 Robot Learning
**Instructor:** Kuan Fang
**Slides:** [Google Drive](https://drive.google.com/file/d/1PlFT0THQ6lecOj4WYCPD7uRkvY7mPQnh/view?usp=sharing)

## TL;DR

Actor-critic methods combine the strengths of policy gradient (REINFORCE) and value-based methods by maintaining two networks: an **actor** (policy $\pi_\theta$) and a **critic** (value function $\hat{V}^\pi_\phi$). The key idea is to replace the high-variance Monte Carlo return estimate in REINFORCE with a lower-variance bootstrapped estimate from the critic. The advantage function $A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)$ tells the actor how much better a given action is than average, reducing gradient variance significantly. The lecture also covers extending the batch on-policy algorithm to an off-policy variant using a replay buffer, requiring careful fixes to both the value update (use fresh $Q$ estimates with current policy actions) and the policy update (sample fresh actions from $\pi_\theta$, not the buffer).

## Key Takeaways

- REINFORCE uses single-sample Monte Carlo returns — unbiased but high variance; actor-critic uses a learned critic — lower variance but introduces bias
- The advantage function $A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)$ measures how much better action $a$ is compared to the policy's average at state $s$
- Only $V^\pi$ needs to be learned; $Q^\pi$ can be expressed as $R(s, a) + \gamma V^\pi(s')$ via the Bellman relationship
- The critic is fitted via regression: either Monte Carlo targets (unbiased, high variance) or bootstrapped TD targets (biased, lower variance)
- Batch actor-critic loops over: collect samples → fit critic → compute advantage → update policy
- Adding a discount $\gamma$ modifies the advantage estimate to $\hat{A}^\pi(s_i, a_i) = R(s_i, a_i) + \gamma\hat{V}^\pi_\phi(s'_i) - \hat{V}^\pi_\phi(s_i)$
- The basic batch actor-critic is **on-policy**: samples must come from the current $\pi_\theta$
- Moving to off-policy with a replay buffer requires two fixes: (1) bootstrap with fresh on-policy actions in the value update; (2) sample fresh on-policy actions for the policy gradient
- The residual state distribution mismatch ($s_i$ from buffer, not current $\pi_\theta$) cannot be corrected — it is treated as training over a wider state distribution

## Detailed Notes

### [Slides 2-5] Recap: REINFORCE and Gaussian Policy

**REINFORCE algorithm** (slide 2):

Initialize $\pi_\theta$. While not converged:
1. Collect $\{(s_i, a_i, s'_i, r_i)\}_{i=0}^N$ under policy $\pi_\theta$
2. Compute gradient:

$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N} \sum_{i=0}^{N-1} \left[ \left(\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\right)\left(\sum_{t=0}^{T-1} R(s_{i,t}, a_{i,t})\right) \right]$$

3. Update $\theta \leftarrow \theta + \alpha \hat{\nabla}_\theta J(\theta)$

**Gaussian policy** (slides 3-5): For continuous action spaces, parameterize:

$$\pi_\theta(a|s) = \mathcal{N}(a|\mu_\theta(s), \sigma_\theta(s))$$

where $\sigma_\theta(s)$ is typically a diagonal covariance matrix. The log probability is:

$$\log \pi_\theta(a|s) = -\frac{1}{2}\sum_{i=1}^{|\mathcal{A}|}\left[\frac{(a_i - \mu_\theta(s)_i)^2}{\sigma_\theta(s)_i^2} + \log \sigma_\theta(s)_i^2 + \log(2\pi)\right]$$

The **reparameterization trick** allows differentiable sampling: compute $\mu_\theta(s)$, $\sigma_\theta(s)$, sample $\epsilon \sim \mathcal{N}(0, I)$, then set $a = \mu_\theta(s) + \sigma_\theta(s)\epsilon$. The network architecture encodes $s$ with an encoder, then outputs $\mu_\theta(s)$ and $\sigma_\theta(s)$ via a fully connected head.

### [Slides 7-9] Part 1: Introducing Actor-Critic Methods — Reward to Go

The REINFORCE gradient uses the full trajectory return. A better estimate is to use only **reward to go** from each timestep:

$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_{i=0}^{N-1}\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t}) \left(\sum_{t'=t}^{T-1} R(s_{i,t'}, a_{i,t'})\right)$$

The bracketed sum is an estimate of the **Q-function**:

$$Q^\pi(s_t, a_t) = \mathbb{E}_{\pi_\theta}\left[\sum_{t'=t}^{T-1} R(s_{t'}, a_{t'}) \,\Big|\, s_t, a_t\right]$$

This is the expected cumulative return from state $s_t$ when taking action $a_t$ and then following $\pi_\theta$ thereafter. Using $Q^\pi$ in place of the raw sample sum:

$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_{i=0}^{N-1}\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\, Q^\pi(s_{i,t}, a_{i,t})$$

### [Slides 10-12] The Advantage Function

To reduce variance further, subtract a **baseline** from $Q^\pi$. A natural baseline is the **value function**:

$$V^\pi(s) = \mathbb{E}_{a \sim \pi_\theta(\cdot|s)}[Q^\pi(s, a)]$$

This gives the **advantage function**, which measures how much better action $a$ is compared to the average action under $\pi$:

$$A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)$$

The policy gradient becomes:

$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_{i=0}^{N-1}\sum_{t=0}^{T-1} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})\, A^\pi(s_{i,t}, a_{i,t})$$

Summary of the three value functions (slide 12):
- $Q^\pi(s_t, a_t) = \mathbb{E}_{\pi_\theta}[\sum_{t'=t}^{T-1} R(s_{t'}, a_{t'}) | s_t, a_t]$ — expected return by taking $a_t$ in state $s_t$
- $V^\pi(s_t) = \mathbb{E}_{a_t \sim \pi_\theta(\cdot|s_t)}[Q^\pi(s_t, a_t)]$ — expected return from state $s_t$
- $A^\pi(s_t, a_t) = Q^\pi(s_t, a_t) - V^\pi(s_t)$ — how much better $a_t$ is in state $s_t$

### [Slide 13] Value Function Fitting via Bootstrapping

The advantage can be written without needing to separately estimate $Q^\pi$. Using the Bellman identity $Q^\pi(s_t, a_t) = R(s_t, a_t) + \mathbb{E}_{s_{t+1}}[V^\pi(s_{t+1})]$:

$$A^\pi(s_t, a_t) = R(s_t, a_t) + \mathbb{E}_{s_{t+1}}[V^\pi(s_{t+1})] - V^\pi(s_t)$$

We only need to fit $V^\pi$ — everything else follows. This motivates the **critic**: a neural network $\hat{V}^\pi_\phi$ that learns the value function.

The algorithm loops through three phases:
1. **Generate samples** — collect trajectories under current $\pi_\theta$
2. **Estimate the return** — fit the critic $\hat{V}^\pi_\phi$
3. **Improve the policy** — update $\theta$ using the advantage

### [Slide 14] Monte Carlo Evaluation with Function Approximation

Fit the critic using Monte Carlo targets. Training data: $\{(s_i, y_i)\}_{i=0}^{N-1}$ where:

$$y_i = \sum_{t'=t}^{T-1} R(s_{i,t'}, a_{i,t'})$$

Minimize regression loss:

$$\mathcal{L}(\phi) = \frac{1}{N}\sum_{i=0}^{N-1} \|\hat{V}^\pi_\phi(s_i) - y_i\|^2$$

**Pro:** Unbiased targets (Monte Carlo returns are unbiased estimates of $V^\pi$).
**Con:** High variance — full trajectory returns have compounding randomness.

### [Slide 15] Bootstrapped Estimation (TD Target)

Instead of full Monte Carlo returns, use a **one-step bootstrapped target**:

$$y_i = R(s_{i,t}, a_{i,t}) + \hat{V}^\pi_\phi(s_{i,t+1})$$

The same regression loss $L(\phi) = \frac{1}{N}\sum_{i=0}^{N-1}\|\hat{V}^\pi_\phi(s_i) - y_i\|^2$ is minimized. This is **lower variance** (only one step of randomness) but **introduces bias** because $\hat{V}^\pi_\phi$ is itself an approximation.

### [Slides 16-17] Batch Actor-Critic Algorithm

**Without discount** (slide 16):

Initialize $\theta$, $\phi$. While not converged:
1. Collect $\{(s_i, a_i, s'_i)\}_{i=0}^{N-1}$ under $\pi_\theta$
2. Fit $\hat{V}^\pi_\phi$ to sampled return
3. Evaluate $\hat{A}^\pi(s_i, a_i) = R(s_i, a_i) + \hat{V}^\pi_\phi(s'_i) - \hat{V}^\pi_\phi(s_i)$
4. Evaluate $\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_i \nabla_\theta \log \pi_\theta(a_i|s_i)\,\hat{A}^\pi(s_i, a_i)$
5. Update $\theta \leftarrow \theta + \alpha\hat{\nabla}_\theta J(\theta)$

**With discount** $\gamma$ (slide 17): The TD target and advantage estimate become:

$$y_i = R(s_i, a_i) + \gamma\hat{V}^\pi_\phi(s'_i)$$

$$\hat{A}^\pi(s_i, a_i) = R(s_i, a_i) + \gamma\hat{V}^\pi_\phi(s'_i) - \hat{V}^\pi_\phi(s_i)$$

**Question (slide 18):** Is actor-critic on-policy or off-policy? Answer: it is **on-policy** — samples must come from the current $\pi_\theta$ because the policy gradient formula assumes this. The critic fits $V^\pi$ for the current policy, and the advantage is computed for that policy.

### [Slides 19-25] Part 2: Improving Actor-Critic — Off-Policy Extension

**Motivation:** On-policy methods throw away all past data after each update — very sample-inefficient. Can we reuse transitions from a **replay buffer** $\mathcal{D}$?

**Problem 1 — Value update** (slides 20-22): Using buffered transitions naively, the target $y_i = R(s_i, a_i) + \gamma\hat{V}^\pi_\phi(s'_i)$ is wrong because $V^\pi(s) = \mathbb{E}_{a \sim \pi_\theta(\cdot|s)}[Q^\pi(s, a)]$ requires averaging over the current policy, but $s'_i$ came from an old policy.

Fix: Fit $\hat{Q}^\pi_\phi$ instead of $\hat{V}^\pi_\phi$, using fresh on-policy actions in the bootstrap:

$$y_i = R(s_i, a_i) + \gamma\hat{Q}^\pi_\phi(s'_i, a'_i), \quad a'_i \sim \pi_\theta(\cdot|s'_i) \text{ (not from buffer)}$$

The value can be recovered as: $\hat{V}^\pi_\phi(s_i) = \mathbb{E}_{a_i \sim \pi_\theta(\cdot|s_i)}[\hat{Q}^\pi_\phi(s_i, a_i)]$

**Problem 2 — Policy update** (slide 23): The policy gradient uses buffered actions $a_i$ (from the old policy, not $\pi_\theta$):

$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_i \nabla_\theta \log \pi_\theta(\boxed{a_i}|s_i)\,\hat{Q}^\pi_\phi(s_i, a_i) \quad \leftarrow \text{wrong}$$

Fix: Sample fresh on-policy actions $a^\pi_i \sim \pi_\theta(\cdot|s_i)$ for the gradient:

$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_i \nabla_\theta \log \pi_\theta(a^\pi_i|s_i)\,\hat{Q}^\pi_\phi(s_i, a^\pi_i)$$

**Problem 3 — State distribution** (slide 24): The buffered states $s_i$ do not follow the state distribution under $\pi_\theta$. This cannot be corrected directly. The pragmatic view: treat it as training over a **wider state distribution**, which can even be beneficial for generalization.

### [Slide 25] Off-Policy Actor-Critic Algorithm (Final)

Initialize $\theta$, $\phi$. While not converged:
1. Collect $\{(s_i, a_i, s'_i)\}_{i=0}^{N-1}$ under $\pi_\theta$, append to replay buffer $\mathcal{D}$
2. Fit $\hat{Q}^\pi_\phi(s_i, a_i)$ to $y_i = R(s_i, a_i) + \gamma\hat{Q}^\pi_\phi(s'_i, a'_i)$, where $a'_i \sim \pi_\theta(\cdot|s'_i)$
3. Evaluate $\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_i \nabla_\theta \log \pi_\theta(a^\pi_i|s_i)\,\hat{Q}^\pi_\phi(s_i, a^\pi_i)$, where $a^\pi_i \sim \pi_\theta(\cdot|s_i)$
4. Update $\theta \leftarrow \theta + \alpha\hat{\nabla}_\theta J(\theta)$

### [Slide 26] Comparing REINFORCE and Actor-Critic

| | REINFORCE | Actor-Critic |
|---|---|---|
| Gradient | $\frac{1}{N}\sum_{i,t} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})(\sum_{t'=t}^{T-1}\gamma^{t'-t}R(s_{i,t'}, a_{i,t'}) - b)$ | $\frac{1}{N}\sum_{i,t} \nabla_\theta \log \pi_\theta(a_{i,t}|s_{i,t})(R(s_{i,t}, a_{i,t}) + \gamma\hat{V}^\pi_\phi(s_{i,t+1}) - \hat{V}^\pi_\phi(s_{i,t}))$ |
| Bias | None (unbiased) | Yes (from critic approximation) |
| Variance | High (single-sample MC estimate) | Low (critic smooths over trajectories) |

The bias-variance tradeoff is fundamental: REINFORCE is unbiased but noisy; actor-critic is biased but stable.

## Concepts Introduced

- [[Q-Function]] — Expected cumulative return from $(s_t, a_t)$ under policy $\pi$
- [[Value Function]] — Expected Q-value averaged over actions under $\pi$
- [[Advantage Function]] — $A^\pi(s, a) = Q^\pi(s, a) - V^\pi(s)$; how much better $a$ is than average
- [[Actor-Critic]] — Policy gradient with a learned value function critic replacing MC returns
- [[Bootstrapped Estimation]] — Using the current value estimate to form the next step's target
- [[Monte Carlo Policy Evaluation]] — Fitting value from full trajectory returns (unbiased, high variance)
- [[Replay Buffer]] — Store of past transitions enabling off-policy updates
- [[Bias-Variance Tradeoff]] — MC returns are unbiased/high-variance; TD targets are biased/low-variance
- [[Reparameterization Trick]] — Differentiable sampling: $a = \mu_\theta(s) + \sigma_\theta(s)\epsilon$, $\epsilon \sim \mathcal{N}(0,I)$

## Connections to Other Lectures

- Lecture 08: REINFORCE algorithm — the policy gradient baseline that actor-critic improves upon
- Lecture 10: PPO and advanced actor-critic variants (likely covers clipping and trust regions)
- Later: SAC (Soft Actor-Critic) is the off-policy actor-critic variant widely used in robot learning

## Open Questions

- How many bootstrapping steps should we use? (n-step returns, GAE $\lambda$)
- How to handle the bias from the critic approximation in practice?
- When does the replay buffer state distribution mismatch cause training instability?
- What is the right architecture for the critic network — shared encoder with the actor or separate?
