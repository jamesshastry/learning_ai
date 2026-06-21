---
type: Lecture Notes
title: "Model Predictive Control"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "11"
slide_url: https://drive.google.com/file/d/1EVZyZMmo1NTLQFJtou-gwCY4svoI8TqR/view?usp=sharing
tags: [model-predictive-control, MPC, trajectory-optimization, planning, cross-entropy-method, model-based-rl]
timestamp: 2026-02-26T00:00:00Z
---

# Model Predictive Control

**Course:** CS 4756/5756 Robot Learning
**Slides:** [Google Drive](https://drive.google.com/file/d/1EVZyZMmo1NTLQFJtou-gwCY4svoI8TqR/view?usp=sharing)

## TL;DR

Model-Based Reinforcement Learning (MBRL) leverages a dynamics model $P_\theta(s_{t+1} \mid s_t, a_t)$ — either known (simulation) or learned — to plan actions without needing a parameterized policy. Trajectory optimization frames this as maximizing cumulative reward over a sequence of actions subject to dynamics constraints. Model Predictive Control (MPC) makes trajectory optimization tractable by re-planning online at each step using a short planning horizon $H_p$ and only executing $H_c \leq H_p$ actions before re-observing the state. The Cross-Entropy Method (CEM) makes the search within the planning horizon efficient by iteratively fitting a sampling distribution to the highest-return ("elite") action sequences rather than sampling uniformly.

## Key Takeaways

1. **Three routes to a policy**: imitation learning (learn from an expert), model-free RL (learn from trial and error), and model-based RL (learn by modeling the environment).
2. **Trajectory optimization** is the core planning problem: find the action sequence $a_{0:T-1}$ that maximizes the expected sum of rewards, given a dynamics model and initial state.
3. **Deterministic dynamics** $s_{t+1} = f(s_t, a_t)$ simplify planning to a tree search over sampled action sequences; the best sequence is selected by its total reward.
4. **Stochastic dynamics** $P_\theta(s_{t+1} \mid s_t, a_t)$ require sampling states as well as actions; the same best-of-N selection applies, optionally averaging across multiple rollouts per action sequence.
5. **Open-loop control** plans once at $t=0$ and executes $a_{0:T-1}$ without re-observation; **closed-loop control** re-plans at every step using the current observed state.
6. **MPC** is closed-loop trajectory optimization with a planning horizon $H_p \leq T$, executing only $H_c \leq H_p$ steps before re-planning. Shorter $H_p$ means less uncertainty but more greedy; longer $H_p$ means more farsighted but harder to optimize.
7. **Uniform random sampling over $|\mathcal{A}|^{H_p}$ is exponentially expensive** — the Cross-Entropy Method addresses this by concentrating samples in high-reward regions.
8. **CEM** iteratively: (a) samples $N$ action sequences from a distribution $p_k$, (b) evaluates each, (c) selects the top-$M$ "elite" sequences, (d) refits $p_{k+1}$ to those elites. Only $K \leq 3$ iterations are typically needed in practice.
9. **CEM in latent space** (Fang et al., CoRL 2019) allows sampling from a structured action generator rather than raw action space, improving efficiency for complex manipulation tasks.
10. Real-world MPC applications include Boston Dynamics Atlas parkour (2020) and general robot motion planning with obstacle avoidance.

---

## Detailed Notes

### Section 0: Recap — Prior RL Algorithms (Slide 3)

The lecture begins with a comparison table of model-free RL algorithms studied so far:

| Algorithm    | Type          | Policy       | Hyperparameters | Exploration           |
|--------------|---------------|--------------|------------------|-----------------------|
| Q-Learning   | Off-policy    | Deterministic | Sensitive       | Epsilon-greedy/Softmax |
| DDPG         | Off-policy    | Deterministic | Sensitive       | Noise-based           |
| Actor-Critic | Off/On-policy | Stochastic   | Medium          | Implicit              |
| SAC          | Off-policy    | Stochastic   | Medium          | Entropy Maximization  |
| PPO          | On-policy     | Stochastic   | Stable          | Implicit              |

All of these assume we do **not** know the transition model $P(s_{t+1} \mid s_t, a_t)$. Today's lecture shifts to the model-based setting, where this model is available or learned.

---

### Section 1: Trajectory Optimization (Slides 5–28)

#### Different Ways to Acquire a Policy (Slide 6)

Motivated by the analogy of learning to ride a bike:

- **Imitation Learning**: "Learn from an expert" — observe and replicate demonstrations.
- **Model-Free RL**: "Learn from trial and error" — interact with the environment and improve from rewards.
- **Model-Based RL**: "Learn by modeling it" — build a dynamics model and use it to plan.

This lecture focuses on **Model-Based RL**.

#### Recap: Model-Free RL (Slides 7–8)

In model-free RL, the policy $\pi_\theta(a_t \mid s_t)$ maps states directly to actions. The trajectory probability is:

$$p_\pi(\tau) = \rho(s_0) \prod_t \pi(a_t \mid s_t) \, P(s_{t+1} \mid s_t, a_t)$$

The optimal policy maximizes expected return:

$$\pi^* = \arg\max_\pi \, \mathbb{E}_{\tau \sim p_\pi(\tau)} \left[ \sum_t R(s_t, a_t) \right]$$

The key constraint: $P(s_{t+1} \mid s_t, a_t)$ is **assumed unknown** in model-free RL.

#### Problems with Known Dynamics (Slide 9)

In model-based RL, we assume access to the transition probability $P(s_{t+1} \mid s_t, a_t)$. This can come from:

- **Known dynamics**: physics simulators (e.g., MuJoCo, PyBullet) provide exact or near-exact transitions.
- **Learned dynamics**: system identification (fitting parametric models to data) or neural network dynamics models trained from interaction data.

#### Model-Based RL: Two Steps (Slide 10)

Model-Based RL decomposes into two sub-problems:

1. **Learn the dynamics model** $P_\theta$ from data.
2. **Choose actions using the dynamics model** — this is the focus of today's lecture.

#### The Deterministic Case (Slide 11)

A deterministic dynamics model is a function:
$$s_{t+1} = f(s_t, a_t)$$

This is a special case of the stochastic model where $P_\theta(s_{t+1} \mid s_t, a_t) = \delta(s_{t+1} - f(s_t, a_t))$.

#### Trajectory Optimization: Deterministic Formulation (Slides 12–21)

With a deterministic dynamics model, the planning problem is:

$$\max_{s_{0:T-1}, \, a_{0:T-1}} \sum_{t=0}^{T-1} R(s_t, a_t)$$
$$\text{subject to} \quad s_0 = \tilde{s}_0, \quad s_{t+1} = f(s_t, a_t)$$

This can be solved by **sampling-based planning**:

**Algorithm (deterministic trajectory optimization):**
1. Sample $N$ candidate action sequences $\{a_{0:T-1}^i\}_{i=0}^{N-1}$.
2. For each sequence $i$, roll out the dynamics: $s_{t+1}^i = f(s_t^i, a_t^i)$, starting from $s_0$.
3. Evaluate the total reward $R(\tau^i) = \sum_t R(s_t^i, a_t^i)$ for each rollout.
4. Select the best: $a_{0:T-1}^* = \arg\max_i R(\tau^i)$.

Visually, multiple action sequences branch from $s_0$, each producing a different trajectory through state space. The trajectory with the highest return (e.g., 0.96 vs 0.34 vs 0.65) is selected.

#### The Stochastic Case (Slides 22–28)

With a stochastic dynamics model $P_\theta(s_{t+1} \mid s_t, a_t)$, the planning objective becomes:

$$\max_{a_{0:T-1}} \mathbb{E}_{s_{1:T}} \left[ \sum_{t=0}^{T-1} R(s_t, a_t) \,\Big|\, s_0, a_{0:T-1} \right]$$

where the state trajectory distribution is:

$$p(s_{1:T} \mid s_0, a_{0:T-1}) = \prod_{t=0}^{T-1} P(s_{t+1} \mid s_t, a_t)$$

**Algorithm (stochastic trajectory optimization):**
1. Sample $N$ candidate action sequences $\{a_{0:T-1}^i\}_{i=0}^{N-1}$.
2. For each sequence $i$, sample a state trajectory from the dynamics: $s_{t+1}^i \sim P_\theta(\cdot \mid s_t^i, a_t^i)$.
3. Evaluate $R(\tau^i)$ for each rollout.
   - **Optional**: for the same action sequence, sample multiple state trajectories and average the returns to reduce variance.
4. Select the best action sequence: $a_{0:T-1}^* = \arg\max_i R(\tau^i)$.

The key difference from the deterministic case: states are sampled from the transition distribution rather than computed deterministically.

---

### Section 2: Model Predictive Control (Slides 29–39)

#### Closed-Loop vs. Open-Loop Control (Slides 30–31)

**Open-Loop Control:**
- Plans once at $t=0$ using the initial state $s_0$.
- Executes the entire planned sequence $a_{0:T-1}$ without any further observation.
- Only receives environment feedback at $t=0$.
- Simple but brittle: any deviation from the model breaks the plan.

**Closed-Loop Control:**
- Re-plans at each time step using the current observed state $s_t$.
- Executes actions based on fresh state feedback from the environment.
- Robust to model errors and disturbances, but computationally more demanding.

MPC is a form of closed-loop control.

#### The Horizon Problem (Slide 32)

A natural challenge with trajectory optimization: if the total horizon $T$ is large, the search space grows exponentially:

$$\text{Search space} = |\mathcal{A}|^T$$

Even with $|\mathcal{A}| = 2$ (binary actions) and $T = 50$, this is $2^{50} \approx 10^{15}$ sequences — intractable for uniform sampling.

#### MPC: Planning with a Short Horizon (Slides 33–39)

**Model Predictive Control** addresses the horizon problem by planning over a short **planning horizon** $H_p \leq T$ instead of the full horizon:

$$\max_{a_{t:t+H_p-1}} \mathbb{E}_{s_{t+1:t+H_p}} \left[ \sum_{t'=t}^{t+H_p-1} R(s_{t'}, a_{t'}) \,\Big|\, s_t, a_{t:t+H_p-1} \right]$$

$$p\!\left(s_{t+1:t+H_p} \mid s_t, a_{t:t+H_p-1}\right) = \prod_{t'=t}^{t+H_p-1} P(s_{t'+1} \mid s_{t'}, a_{t'})$$

**Planning horizon $H_p$ tradeoffs:**
- **Small $H_p$**: less uncertainty (near-future is more predictable), but more greedy (cannot see far rewards).
- **Large $H_p$**: less greedy (farsighted), but more uncertain (model errors compound over long rollouts).

**Control horizon $H_c$:** MPC further introduces a control horizon $H_c \leq H_p \leq T$. At each replanning step, the robot plans $H_p$ steps ahead but only **executes the first $H_c$ actions** before re-observing the state and replanning. This balances computation (plan longer once) with responsiveness (do not commit too far ahead).

**MPC Algorithm (Slide 39):**

```
t = 0
While t < T − 1:
    Observe s_t
    Sample actions {a^i_{t:t+H_p−1}}^{N−1}_{i=0}
    For each i = 0, ..., N:
        Predict s^i_{t+1:t+H_p} using P_θ given a^i_{t:t+H_p−1}
        Evaluate R(τ^i), where τ^i = [s^i_{t+1:t+H_p}, a^i_{t:t+H_p−1}]
    Select a*_{t:t+H_p−1} = argmax R(τ^i)
    Execute a*_{t:min(t+H_c−1, T−1)}
    t = t + H_c
```

Key points about this algorithm:
- The robot **re-observes** $s_t$ at each planning cycle — closed-loop behavior.
- Only $H_c$ actions are committed to before the next planning cycle.
- When $H_c = 1$, the robot replans every single step (maximum responsiveness).
- When $H_c = H_p$, the robot executes the full plan before replanning (open-loop within each cycle).

---

### Section 3: Cross-Entropy Method (Slides 40–47)

#### The Sampling Inefficiency Problem (Slide 41)

Even with MPC's reduced horizon $H_p$, the search space is still $|\mathcal{A}|^{H_p}$. For continuous action spaces or large $H_p$, **uniform random sampling is inefficient**: most sampled trajectories land in low-reward regions of the action space, wasting computation.

#### Cross-Entropy Optimization (Slide 42)

**Key idea**: Instead of sampling uniformly, iteratively concentrate samples in **promising regions** of the search space.

The Cross-Entropy Method is a general stochastic optimization technique. Given an objective function $f(x)$ over a solution space:

1. **Generate samples** from a probability distribution $p_k(x)$ (initially broad, e.g., uniform or Gaussian).
2. **Evaluate** $f(x^i)$ for each sample.
3. **Select elite samples**: keep the top-$M$ samples with the highest objective values.
4. **Update the distribution** $p_{k+1}$ by fitting it to the elite samples.
5. Repeat until convergence.

The distribution $p_k$ narrows around the high-reward region of the solution space with each iteration.

#### Cross-Entropy Optimization for MPC (Slide 43)

Applied to trajectory optimization within MPC:

```
Initialize sampling distribution p_0(a_{0:T−1})
  # p_0 is usually uniform or Gaussian

For k = 0, ..., K:
  # In practice, K ≤ 3 is enough

  Sample actions {a^i_{0:T−1}}^{N−1}_{i=0} from p_k

  For each i = 0, ..., N:
    Predict s^i_{1:T} using P_θ given a^i_{0:T−1}
    Evaluate R(τ^i), where τ^i = [s^i_{0:T}, a^i_{0:T−1}]

  Rank R(τ^i) and get ranked indices u_0, ..., u_{N−1} ∈ {0, ..., N−1}

  Pick the M elites {a^{u_j}_{0:T−1}}^{M−1}_{j=0} with highest values, where M < N

  Fit p_{k+1}(a_{0:T−1}) to the elites

Return a*_{0:T−1} = a^{u_0}_{0:T−1}
```

**Practical notes:**
- The initial distribution $p_0$ is usually a uniform or Gaussian distribution over actions.
- The number of CEM iterations $K \leq 3$ is typically sufficient — the distribution converges quickly.
- The elite fraction $M/N$ is a hyperparameter (commonly 10–20% of samples are kept as elites).
- The final answer is the best elite $a^{u_0}_{0:T-1}$ (top-ranked sample).

#### Cross-Entropy Method in Action: 2D Optimization (Slide 44)

On a multimodal 2D objective function:
- **Iteration 1**: samples are scattered uniformly; the distribution is broad (nearly flat).
- After a few iterations: the distribution (right panel) collapses toward the global optimum region, and elite samples (black points) cluster around the peak.

This demonstrates CEM's ability to navigate multimodal landscapes without gradient information.

#### Cross-Entropy Method for Motion Planning (Slide 45)

**Kobilarov (IJRR 2012) — Cross-entropy motion planning:**

- Task: navigate a robot from start (S) to goal (G) in a 2D obstacle environment.
- **Iteration 1**: 100s of random paths fill the space uniformly, most colliding with obstacles.
- **Iteration 2**: paths begin to cluster around obstacle-free corridors.
- **Iterations 5–8**: paths converge to smooth, collision-free routes.
- **Optimal path**: a clean trajectory from S to G.

The same convergence is demonstrated in a 3D urban environment (drone navigation among buildings), showing scalability of CEM to higher-dimensional spaces.

#### Cross-Entropy Method in Latent Space (Slide 46)

**Fang et al. (CoRL 2019) — Dynamics Learning with Cascaded Variational Inference:**

A key insight: for complex manipulation tasks, sampling directly from the raw action space is inefficient. Instead:

- **Standard CEM**: sample action $a \sim p(a)$ directly from the action distribution.
- **Latent-space CEM**: sample latent code $z \sim p(z)$ and decode it through a learned **action generator** $a = g(\cdot \mid s, z)$.

The action generator is trained to produce structured, feasible actions conditioned on the current state. CEM is then run in the compact latent space, which is much easier to search than the full action space.

This approach was applied to a real robotic arm performing multi-step manipulation tasks on a tabletop (pick and place, grasping objects such as soup cans and cereal boxes).

#### Boston Dynamics Atlas (Slide 47)

**Boston Dynamics Atlas (2020):**

MPC with CEM-style planning underlies the planning capabilities demonstrated in Boston Dynamics' Atlas robot performing parkour (jumping over obstacles, climbing boxes). The robot uses a learned or physics-based dynamics model with MPC to plan footstep sequences and whole-body motions in real time, re-planning as the environment changes.

---

## Summary Table

| Component | Role | Key Design Choices |
|---|---|---|
| Dynamics model $P_\theta$ | Predicts next states | Known (sim) vs. learned; deterministic vs. stochastic |
| Trajectory optimization | Finds best action sequence | Sampling-based; evaluate and select best |
| MPC | Closed-loop planning | Planning horizon $H_p$, control horizon $H_c \leq H_p$ |
| CEM | Efficient search | $N$ samples, $M$ elites, $K$ iterations; $p_k$ updated each round |
| Latent-space CEM | Structured action sampling | Action generator $g(\cdot \mid s, z)$; CEM in latent space $z$ |
