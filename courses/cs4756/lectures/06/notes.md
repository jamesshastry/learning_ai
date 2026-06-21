---
type: Lecture Notes
title: "Value Function and Dynamic Programming"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "06"
slide_url: https://drive.google.com/file/d/1eMQ-X3vzk7FaLMozBIxcr_xx8MWKF0GJ/view?usp=sharing
tags: [value-function, dynamic-programming, bellman-equation, policy-evaluation, value-iteration, policy-iteration, q-function, reinforcement-learning]
timestamp: 2026-02-05T00:00:00Z
---

# Lecture 06: Value Function and Dynamic Programming

**Course:** CS 4756 Robot Learning
**Slides:** [Google Drive](https://drive.google.com/file/d/1eMQ-X3vzk7FaLMozBIxcr_xx8MWKF0GJ/view?usp=sharing)

## TL;DR

This lecture introduces the value function as a recursive, state-based estimate of expected return, derives the Bellman equation, and uses it to build two classical dynamic programming algorithms: Value Iteration and Policy Iteration. The key insight is that the infinite-horizon cumulative return can be expressed recursively — current reward plus discounted future value — which enables iterative, efficient computation without rolling out full episodes. The lecture closes by situating these DP algorithms within the broader anatomy of RL (generate samples → estimate return → improve policy), explaining why so many RL variants exist and what assumptions DP makes that real-world settings will break.

## Key Takeaways

- The value function $V^\pi(s)$ summarizes all future expected return from state $s$ under policy $\pi$, enabling recursive reasoning about long-horizon problems
- The Bellman equation rewrites $V^\pi$ in terms of itself one step ahead: immediate reward + discounted expected value of the next state
- Value Iteration converges to the optimal value $V^*$ by repeatedly applying the Bellman optimality operator (taking $\max$ over actions instead of expectation under $\pi$)
- Policy Iteration alternates between Policy Evaluation (computing $V^\pi$ for the current $\pi$) and Policy Improvement (greedifying the policy with respect to $V^\pi$); it often converges in fewer outer iterations than VI
- The Q-value function $Q^\pi(s,a)$ conditions on both state and action, enabling action selection without a model of transitions; $V^* = \max_a Q^*(s,a)$
- Both VI and PI require a known transition model, enumerable state/action spaces, and tabular storage — assumptions that RL algorithms are designed to relax
- Every RL algorithm follows the same three-phase loop: generate samples, estimate the return, improve the policy; the differences lie in how each phase is implemented

## Detailed Notes

### [Slides 2-4] Overview and Context

Three ways to acquire a policy, framed through the analogy of learning to ride a bike:
- **Imitation Learning** — "learn from an expert" (covered in Lecture 05)
- **Model-Free RL** — "learn from trial and error" (focus of this lecture and the next several)
- **Model-Based RL** — "learn by modeling it"

This lecture begins Module 2 (Model-Free Decision Making) and introduces the theoretical machinery — value functions and DP — that underpins Q-Learning, Policy Gradients, and Actor-Critic methods in subsequent lectures.

### [Slides 5-6] MDP Recap and the Motivating Question

An MDP is the tuple $\mathcal{M} = \langle \mathcal{S}, \mathcal{A}, P, R \rangle$:
- $\mathcal{S}$: state space, $s_t \in \mathcal{S}$
- $\mathcal{A}$: action space, $a_t \in \mathcal{A}$
- $P$: transition probability, $s_{t+1} \sim P(\cdot \mid s_t, a_t)$
- $R$: reward function, $r_t = R(s_t, a_t, s_{t+1})$
- A policy $\pi$ maps states to actions: $\mathcal{S} \to \mathcal{A}$

The return (cumulative discounted reward) and the objective are:

$$\text{Return} = \sum_{t \geq 0} \gamma^t r_t$$

$$J(\pi) = \mathbb{E}_\pi\!\left[\sum_{t \geq 0} \gamma^t r_t\right] = \mathbb{E}_\pi[r_0 + \gamma r_1 + \gamma^2 r_2 + \cdots]$$

$$\pi^* = \arg\max_\pi J(\pi)$$

**Key question:** Can we estimate $J(\pi)$ without unrolling each episode all the way to the end? Yes — by estimating in a recursive manner.

### [Slides 7] Value Function

The **value function** for policy $\pi$ at state $s$ is the expected discounted return starting from $s$:

$$V^\pi(s) = \mathbb{E}_\pi\!\left[\sum_{t \geq i} \gamma^{t-i} R(s_t, a_t) \;\middle|\; s_i = s\right]$$

Expanding the conditioning explicitly:

$$V^\pi(s) = \mathbb{E}\!\left[\sum_{t \geq i} \gamma^{t-i} R(s_t, a_t) \;\middle|\; s_i = s,\; s_{t+1} \sim P(\cdot \mid s_t, a_t),\; a_t \sim \pi(\cdot \mid s_t)\right]$$

$V^\pi$ is a function $\mathcal{S} \to \mathbb{R}$ that compresses the entire future trajectory under $\pi$ into a single scalar per state.

### [Slides 8-9] Bellman Equation

The return can be decomposed recursively by peeling off the first step:

$$\sum_{t \geq 0} \gamma^t R(s_t, a_t) = R(s_0, a_0) + \gamma \sum_{t \geq 1} \gamma^{t-1} R(s_t, a_t)$$

The second term is exactly the discounted return starting from $s_1$. Taking expectations under $\pi$ gives the **Bellman equation**:

$$\boxed{V^\pi(s_t) = \mathbb{E}_{a_t \sim \pi}\!\left[R(s_t, a_t) + \gamma\,\mathbb{E}_{s_{t+1} \sim P(\cdot \mid s_t, a_t)}\!\left[V^\pi(s_{t+1})\right]\right]}$$

This is a self-consistency condition: the value at $s_t$ equals the expected immediate reward plus the discounted expected value at the next state. It is the foundation of all DP algorithms in this lecture.

### [Slide 10] Optimal Policy via Value Functions

The optimal policy maximizes the expected value at the start state:

$$\pi^* = \arg\max_\pi \mathbb{E}_{s_0} V^\pi(s_0)$$

The optimal value function $V^* = V^{\pi^*}$ satisfies the **Bellman optimality equation**:

$$V^*(s_t) = \max_a\!\left[R(s_t, a) + \gamma\,\mathbb{E}_{s_{t+1} \sim P(\cdot \mid s_t, a)}\!\left[V^*(s_{t+1})\right]\right]$$

### [Slides 13-15] Value Iteration and the Q-Function

**Value Iteration (VI)** algorithm:

```
Initialize V_0   # e.g., zeros for every state

For i = 0, ..., N-1:
    For s in S:
        V_{i+1}(s) = max_a [ R(s,a) + γ E_{s'~P(·|s,a)}[V_i(s')] ]

Extract policy: π̂(s) = argmax_a [ R(s,a) + γ E_{s'~P(·|s,a)}[V_N(s')] ]
```

The inner expression $R(s,a) + \gamma\,\mathbb{E}_{s' \sim P(\cdot \mid s,a)}[V_i(s')]$ is called the **Q-value** at iteration $i$:

$$Q_i(s,a) \triangleq R(s,a) + \gamma\,\mathbb{E}_{s' \sim P(\cdot \mid s,a)}\!\left[V_i(s')\right]$$

This motivates the **Q-value function** (or action-value function):

$$Q^\pi(s,a) = \mathbb{E}\!\left[\sum_{t \geq 0} \gamma^t R(s_t,a_t) \;\middle|\; s_0=s,\; a_0=a,\; P,\; \pi\right]$$

**Bellman consistency** relates $V^\pi$ and $Q^\pi$:

$$V^\pi(s) = \mathbb{E}_{a \sim \pi(\cdot \mid s)}\!\left[Q^\pi(s,a)\right]$$

$$Q^\pi(s,a) = R(s,a) + \gamma\,\mathbb{E}_{s' \sim P(\cdot \mid s,a)}\!\left[V^\pi(s')\right]$$

**Bellman optimality** relates $V^*$ and $Q^*$:

$$V^*(s) = \max_a Q^*(s,a)$$

$$Q^*(s,a) = R(s,a) + \gamma\,\mathbb{E}_{s' \sim P(\cdot \mid s,a)}\!\left[V^*(s')\right]$$

### [Slides 16-19] Value Iteration: Grid World Example

The example uses a 10×10 grid world with:
- Goal state (absorbing): $C(s) = -R(s) = 0$
- All other states: $C(s) = -R(s) = 1$ (cost formulation)
- Black cells: walls/obstacles (absorbing "swamp" states)
- Deterministic transitions, time horizon $T=30$, discount $\gamma=1$

By iteration 29 (Time: 29), the value grid shows the cost-to-go from every state, and the policy grid shows the optimal direction (arrows) to reach the goal. Both the reward-maximization and cost-minimization forms are equivalent:

$$V^*(s) = \max_a\!\left[R(s,a) + \gamma\,\mathbb{E}_{s'}\!\left[V^*(s')\right]\right] \quad \Leftrightarrow \quad V^*(s) = \min_a\!\left[C(s,a) + \gamma\,\mathbb{E}_{s'}\!\left[V^*(s')\right]\right]$$

### [Slide 20-21] Policy Evaluation vs. Value Iteration

**Policy Evaluation** computes $V^\pi$ for a fixed policy $\pi$ (no $\max$, just expectation):

```
Initialize V_0

For i = 0, ..., N-1:
    For s in S:
        V_{i+1}(s) = E_{a~π} [ R(s,a) + γ E_{s'~P(·|s,a)}[V_i(s')] ]
```

The distinction is single but critical:

| Algorithm | Update rule | Goal |
|---|---|---|
| Value Iteration | $V_{i+1}(s) = \max_a[\ldots]$ | Find optimal value $V^*$ |
| Policy Evaluation | $V_{i+1}(s) = \mathbb{E}_{a \sim \pi}[\ldots]$ | Find $V^\pi$ for current $\pi$ |

### [Slides 22-26] Policy Iteration

**Policy Iteration (PI)** interleaves evaluation and improvement:

```
Initialize policy π

For i = 0, ..., N-1:
    # Policy Evaluation
    For s in S:  V^π(s) = R(s, π(s)) + γ E_{s'~P(·|s,π(s))}[V^π(s')]

    # Policy Improvement
    For s in S:  π(s) = argmax_a [ R(s,a) + γ E_{s'~P(·|s,a)}[V^π(s')] ]
```

On the grid world, Policy Iteration starts with an arbitrary policy (all arrows pointing right and up) at Iter: 0 with uniform zero values, then after a single outer iteration (Iter: 1) already shows a nearly optimal value surface and directional policy, converging faster than VI in practice.

**VI vs. PI comparison:**

| | Value Iteration | Policy Iteration |
|---|---|---|
| Tracks | Value function only | Both policy and value function |
| Inner update | Bellman optimality ($\max$) | Policy Evaluation + Policy Improvement |
| Convergence | Slower (more outer iterations) | Often faster (fewer outer iterations) |

### [Slides 27-28] What's Missing — Assumptions of DP

Both VI and PI fundamentally assume:
1. **Known transition model** — $\mathbb{E}_{s' \sim P(\cdot \mid s,a)}[\cdot]$ requires knowing $P$
2. **Small, enumerable state and action spaces** — $\max_a$ and $\arg\max_a$ require iterating over all actions; tabular storage requires enumerating all states
3. **Tabular representations** — $V(s)$ and $Q(s)$ stored as lookup tables

Real-world robotic problems violate all three: continuous high-dimensional state/action spaces, unknown dynamics, no tabular storage feasible. The remaining lectures in Module 2 address each assumption.

### [Slides 29-34] Anatomy of a Reinforcement Learning Algorithm

Every RL algorithm is a loop over three phases:

```
generate samples → estimate the return → improve the policy
```

The four main families differ in how they implement "estimate the return" and "improve the policy":

| Family | Estimate the return | Improve the policy |
|---|---|---|
| **Policy Gradients** | $R_\tau = \sum_{t \geq 0} \gamma^t r_t$ (Monte Carlo rollout) | $\pi^* = \arg\max_\pi J(\pi)$ via gradient ascent |
| **Value-based** | Fit $V(s)$ or $Q(s,a)$ of optimal policy | Implicit: $\pi^* = \arg\max_a Q^*(s,a)$ (no explicit policy) |
| **Actor-Critic** | Fit $V(s)$ or $Q(s,a)$ of current policy | $\theta \leftarrow \theta + \alpha \nabla_\theta \mathbb{E}[Q(\mathbf{s}_t, \mathbf{a}_t)]$ |
| **Model-based RL** | Use learned dynamics model | Plan through the model |

Why so many RL algorithms? Different tradeoffs (sample efficiency vs. stability), different assumptions (stochastic/deterministic, continuous/discrete, episodic/infinite horizon), and different representational choices (easier to represent policy or model).

## Concepts Introduced

- [[Value Function]] — $V^\pi(s)$: expected discounted return from state $s$ under $\pi$
- [[Bellman Equation]] — Self-consistency recursion: $V^\pi(s_t) = \mathbb{E}[R + \gamma V^\pi(s_{t+1})]$
- [[Bellman Optimality Equation]] — Bellman equation with $\max$ over actions for $V^*$
- [[Value Iteration]] — DP algorithm applying Bellman optimality operator iteratively
- [[Policy Evaluation]] — Computing $V^\pi$ for a fixed $\pi$ via iterated Bellman consistency
- [[Policy Improvement]] — Greedifying a policy with respect to its current value function
- [[Policy Iteration]] — Alternating policy evaluation and policy improvement until convergence
- [[Q-Value Function]] — $Q^\pi(s,a)$: expected return conditioning on both state and initial action
- [[Bellman Consistency]] — Relations translating between $V^\pi$ and $Q^\pi$
- [[RL Algorithm Anatomy]] — Three-phase loop: generate samples, estimate return, improve policy

## Connections to Other Lectures

- Lecture 03: MDP formalism ($\mathcal{S}, \mathcal{A}, P, R$) and the definition of return — directly extended here
- Lecture 05: Imitation Learning provides the contrasting paradigm (supervised, no RL loop)
- Lecture 07: Q-Learning — relaxes the known-model assumption; learns $Q^*$ from samples
- Lecture 08: Policy Gradients — relaxes tabular/model assumptions; differentiates $J(\pi)$ directly
- Lecture 09: Actor-Critic — combines value function estimation with policy gradient improvement
- Lecture 10: Deep RL algorithms — uses neural networks to approximate $V$ and $Q$ at scale

## Open Questions

- How do we compute $\mathbb{E}_{s' \sim P(\cdot \mid s,a)}[\cdot]$ when the transition model is unknown?
- How do we represent $V(s)$ and $Q(s,a)$ when the state space is continuous and high-dimensional?
- What convergence guarantees do VI and PI have, and how fast do they converge?
- When does Policy Iteration converge faster than Value Iteration in practice?
