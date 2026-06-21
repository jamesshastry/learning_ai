---
type: Lecture Notes
title: "Markov Decision Processes"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "03"
slide_url: https://drive.google.com/file/d/1qZiHppwM0UE55soqtnwO_6yABc2hxPrB/view?usp=sharing
tags: [mdp, markov-decision-process, policy, reward, transition, pomdp, contextual-mdp, goal-conditioned]
timestamp: 2026-01-27T00:00:00Z
---

# Markov Decision Processes

**Course:** CS 4756/5756 Robot Learning
**Slides:** [Google Drive](https://drive.google.com/file/d/1qZiHppwM0UE55soqtnwO_6yABc2hxPrB/view?usp=sharing)

## TL;DR

A Markov Decision Process (MDP) is the mathematical framework for sequential decision making, defined by a tuple $\mathcal{M} = \langle \mathcal{S}, \mathcal{A}, P, R \rangle$. A policy $\pi$ maps states to actions and the goal is to find the optimal policy $\pi^*$ that maximizes expected cumulative (possibly discounted) reward. The lecture also covers advanced variants — POMDPs, contextual MDPs, and goal-conditioned MDPs — that relax or extend standard MDP assumptions.

## Key Takeaways

1. The **Markov assumption** says the current state $s_t$ is a sufficient statistic for the future — conditioned on $s_t$ and $a_t$, the next state and reward are independent of all prior history.
2. An MDP is fully specified by four components: state space $\mathcal{S}$, action space $\mathcal{A}$, transition model $P$, and reward function $R$.
3. Both state and action spaces can be discrete or continuous; transition dynamics can be deterministic or stochastic.
4. A **policy** $\pi: \mathcal{S} \to \mathcal{A}$ is the robot's decision rule; policies can be deterministic or stochastic.
5. A **trajectory** $\tau = (s_0, a_0, s_1, a_1, \ldots, s_T)$ is the sequence of states and actions produced when a policy interacts with an MDP.
6. The **return** (cumulative reward) is what we optimize: finite-horizon $\sum_{t=0}^{T-1} r_t$ or discounted infinite-horizon $\sum_{t \geq 0} \gamma^t r_t$.
7. The **optimal policy** $\pi^* = \arg\max_\pi J(\pi)$ maximizes expected return.
8. **POMDPs** extend MDPs with a separate observation space when the full state is not directly accessible.
9. **Contextual MDPs** add a context variable $c_t$ that modulates the reward (e.g., task identity, goal specification).
10. **Goal-conditioned MDPs** are a special case of contextual MDPs where the context is a goal $g_t \in \mathcal{C} \subset \mathcal{S}$.

---

## Detailed Notes

### Section 1: Definition of Markov Decision Processes (Slides 4–18)

#### The Perception-Action Loop (Slides 5–6)

A central challenge in robotics is closing the **perception-action loop**: the robot perceives the environment and acts on it, which changes the environment, producing new percepts.

A typical robotic system pipeline:
```
Sensors → State Estimation → Modeling & Prediction → Planning → Control → Actuators
```

#### Sequential Decision Making (Slides 7–8)

Sequential decision making is the process of making a series of decisions over time to achieve a goal. Each time step $t$ the robot is in state $s_t$, takes action $a_t$, and receives reward $r_t$.

**Example (grid navigation):**

| $s_t$ | $a_t$ | $r_t$ |
|-------|--------|--------|
| [6,2] | left   | -1     |
| [5,2] | down   | -1     |
| ...   | ...    | ...    |
| [2,5] | down   | **+10** (goal) |

A bad trajectory might reach a hazard state [1,0] with reward **-100**.

#### The Markov Assumption (Slide 9)

> Conditioned on $s_t$ and $a_t$, the reward $r_t$ and next state $s_{t+1}$ are **independent of the past**.

Formally:
$$p(s_{t+1}, r_t \mid s_t, a_t, s_{t-1}, a_{t-1}, \ldots) = p(s_{t+1}, r_t \mid s_t, a_t)$$

The state **summarizes all past information** into a compact representation sufficient to predict the future. This is what makes MDPs tractable.

#### Formal MDP Definition (Slides 10–11)

A **Markov Decision Process** is defined by the tuple:
$$\mathcal{M} = \langle \mathcal{S}, \mathcal{A}, P, R \rangle$$

The agent-environment loop:
- Environment sends state $s_t$ (and reward $r_t$) to the robot
- Robot sends action $a_t$ to the environment

Components:
- $\mathcal{S}$: **state space** — $s_t \in \mathcal{S}$
- $\mathcal{A}$: **action space** — $a_t \in \mathcal{A}$
- $P$: **transition probability** — $s_{t+1} \sim P(\cdot \mid s_t, a_t)$
- $R$: **reward function** — $r_t = R(s_t, a_t, s_{t+1})$

#### State Space (Slide 12)

The state $s_t$ is the **sufficient statistic** of the system to predict the future, disregarding the past.

- **Discrete states**: board game positions (Go), slot machine faces
- **Continuous states**: robot joint angles $q_1, q_2, q_3, q_4$; GPS coordinates on a map

#### Action Space (Slide 13)

The action $a_t$ is the control decision — usually a motor command or abstract choice.

- **Discrete actions**: keyboard keys (W/A/S/D), card choices in a card game
- **Continuous actions**: joystick deflection, steering wheel angle, gripper torque

#### Transition Model (Slides 14–15)

The transition model specifies how states evolve:

**Deterministic:**
$$s' = P(s, a)$$
One outcome for each (state, action) pair.

**Stochastic:**
$$s' \sim P(s, a)$$
A distribution over possible next states.

Sources of uncertainty in robotics:
- Motor undershoot / overshoot
- Sensor noise
- Physical uncertainty (friction, contact)

**Initial state distribution:**
$$\rho(s_0) = P(s_0)$$

The episode always begins by sampling $s_0 \sim \rho$.

#### Reward Function (Slides 16–17)

The reward function encodes the objective:
$$r_t = R(s_t, a_t, s_{t+1})$$

Common simplified forms:
- $R(s_t, a_t)$ — depends only on state and action
- $R(s_t, s_{t+1})$ — depends on state transition
- $R(s_{t+1})$ — depends only on next state

**Sparse reward**: reward is 0 almost everywhere, nonzero only at success/failure states (e.g., $+1$ at goal, $-1$ at cliff).

**Dense reward**: reward signal at every step guides the agent toward the goal (e.g., distance-based shaping).

**Reward shaping**: For real robot tasks, reward functions are usually hand-designed. Example from Meta-World Benchmark (Yu et al. 2019): the `placeReward()` function combines exponential distance terms for reaching, picking, and placing with weighted constants $c_1, c_2, c_3$.

#### Alternative Notations (Slide 18)

Two historical traditions exist:

| Bellman (RL) | Pontryagin (Control) |
|---|---|
| $\mathbf{s}_t$ — state | $\mathbf{x}_t$ — state |
| $\mathbf{a}_t$ — action | $\mathbf{u}_t$ — action |
| $r(\mathbf{s}, \mathbf{a})$ — reward | $c(\mathbf{x}, \mathbf{u})$ — cost |

The relationship: $r(\mathbf{s}, \mathbf{a}) = -c(\mathbf{x}, \mathbf{u})$

Maximizing reward is equivalent to minimizing cost.

#### Policy (Slide 19)

A **policy** $\pi$ maps states to actions:
$$\pi: \mathcal{S} \to \mathcal{A}$$

- **Deterministic policy**: $a_t = \pi(s_t)$
- **Stochastic policy**: $a_t \sim \pi(\cdot \mid s_t)$

The policy is the robot's "brain" — it specifies what to do in every possible state.

---

### Section 2: Analyzing Markov Decision Processes (Slides 20–27)

#### Trajectory (Slides 21–22)

When a robot interacts with the environment using policy $\pi$, it generates a **trajectory** (also called an **episode**):
$$\tau = (s_0, a_0, s_1, a_1, s_2, a_2, \ldots, s_T)$$

The trajectory unfolds as:
1. $s_0 \sim \rho$ (initial state distribution)
2. $a_0 \sim \pi(\cdot \mid s_0)$ (policy)
3. $s_1 \sim P(\cdot \mid s_0, a_0)$ (environment)
4. $a_1 \sim \pi(\cdot \mid s_1)$
5. $s_2 \sim P(\cdot \mid s_1, a_1)$
6. $\ldots$

Multiple trajectories are possible from the same starting state due to stochasticity in the policy and/or environment.

#### Probability of a Trajectory (Slide 23)

The probability of a trajectory $\tau$ under policy $\pi$ is:
$$p_\pi(\tau) = \rho(s_0) \, \pi(a_0 \mid s_0) \, P(s_1 \mid s_0, a_0) \, \pi(a_1 \mid s_1) \, P(s_2 \mid s_1, a_1) \cdots$$

In compact form:
$$p_\pi(\tau) = \rho(s_0) \prod_{t=0}^{T-1} \pi(a_t \mid s_t) \, P(s_{t+1} \mid s_t, a_t)$$

This factorization follows directly from the Markov assumption and the chain rule of probability.

#### Finite-Horizon vs. Infinite-Horizon MDPs (Slides 24–25)

**Finite-horizon MDP:** Has a fixed time horizon $T$: $t = 0, 1, 2, \ldots, T$. The episode terminates after exactly $T$ steps.

**Infinite-horizon MDP:** Runs forever: $t = 0, 1, 2, \ldots$. No terminal state.

**Infinite-horizon MDP with discount factor $\gamma$:** The problem never terminates, but rewards closer in time receive higher weight.
- $\gamma \in [0, 1]$ is the **discount factor**
- $\gamma = 0$: only immediate reward matters (myopic)
- $\gamma = 1$: all future rewards equally weighted (requires care for convergence)
- Typical values: $\gamma \in \{0.95, 0.99\}$

A finite-horizon MDP does not require a discount factor (though one can be used).

#### Return (Slide 26)

The **return** (cumulative reward) is the quantity we want to maximize.

**Finite-horizon (undiscounted):**
$$G = \sum_{t=0}^{T-1} r_t$$

**Infinite-horizon (discounted):**
$$G = \sum_{t \geq 0} \gamma^t \, r_t$$

**Expected return** under policy $\pi$:
$$J(\pi) = \mathbb{E}_{\tau \sim p_\pi} \left[ \sum_{t=0}^{T-1} r_t \right] \quad \text{or} \quad J(\pi) = \mathbb{E}_{\tau \sim p_\pi} \left[ \sum_{t \geq 0} \gamma^t r_t \right]$$

The expectation is over trajectories sampled from $p_\pi(\tau)$.

#### Finding the Optimal Policy (Slide 27)

The goal of sequential decision making is to find the **optimal policy** $\pi^*$:
$$\pi^* = \arg\max_\pi J(\pi)$$

This is the policy that maximizes expected cumulative (possibly discounted) reward. All of reinforcement learning and much of robot learning can be framed as solving this optimization problem.

---

### Section 3: Advanced Variants of Markov Decision Processes (Slides 28–35)

#### Partially Observable Markov Decision Process — POMDP (Slides 29–30)

In many real-world settings, the robot cannot directly observe the full state $s_t$. Instead it receives an **observation** $o_t$ that is a noisy or partial function of the state.

A **POMDP** is defined by:
$$\mathcal{M} = \langle \mathcal{S}, \Omega, \mathcal{A}, P, O, R \rangle$$

Components:
- $\mathcal{S}$: state space ($s_t \in \mathcal{S}$)
- $\Omega$: **observation space** ($o_t \in \Omega$)
- $\mathcal{A}$: action space ($a_t \in \mathcal{A}$)
- $P$: transition probability $s_{t+1} \sim P(\cdot \mid s_t, a_t)$
- $O$: **observation probability** $o_t \sim O(\cdot \mid s_t)$
- $R$: reward function $r_t = R(s_t, a_t, s_{t+1})$

The agent only sees $o_t$, not $s_t$; the true state is hidden.

**Example (Object Goal Navigation, Habitat):** A robot navigating an indoor environment receives an RGBD image (RGB + depth) and GPS/compass at each step. The full 3D scene geometry is the hidden state; the camera image is the observation. The action is discrete (TURN_LEFT, TURN_RIGHT, MOVE_FORWARD, STOP).

#### Contextual Markov Decision Process (Slide 31)

A **Contextual MDP** adds a context variable $c_t$ that the robot can observe and that influences the reward:

$$\mathcal{M} = \langle \mathcal{S}, \mathcal{C}, \mathcal{A}, P, R \rangle$$

Components:
- $\mathcal{S}$: state space ($s_t \in \mathcal{S}$)
- $\mathcal{C}$: **context space** ($c_t \in \mathcal{C}$)
- $\mathcal{A}$: action space ($a_t \in \mathcal{A}$)
- $P$: transition probability $s_{t+1} \sim P(\cdot \mid s_t, a_t)$
- $R$: reward function $r_t \sim R(s_t, a_t, s_{t+1}, c_t)$

The context $c_t$ is observed by the robot (unlike the hidden state in a POMDP). It allows the same environment dynamics to support different tasks or objectives depending on context.

#### Goal-Conditioned MDP (Slides 32–33)

A **Goal-Conditioned MDP** is a special case of the Contextual MDP where the context is a goal $g_t$ drawn from a goal space $\mathcal{C} \subset \mathcal{S}$:

$$\mathcal{M} = \langle \mathcal{S}, \mathcal{C}, \mathcal{A}, \mathcal{P}, \mathcal{R} \rangle$$

Components:
- $\mathcal{S}$: state space ($s_t \in \mathcal{S}$)
- $\mathcal{C}$: **goal space** ($g_t \in \mathcal{C} \subset \mathcal{S}$) — goals are a subset of states
- $\mathcal{A}$: action space ($a_t \in \mathcal{A}$)
- $P$: transition probability $s_{t+1} \sim P(\cdot \mid s_t, a_t)$
- $R$: goal-conditioned reward, e.g.:

$$r_t = R(s_t, g_t) = -\mathbf{1}[s_t \neq g_t]$$

(reward of 0 when goal is reached, -1 otherwise)

**Example:** A ball-in-maze task where $\mathcal{S}$ is all positions in the maze and $\mathcal{C}$ is the set of target positions. The same maze dynamics apply regardless of which goal is specified.

Goal-conditioned policies take the form $\pi(a_t \mid s_t, g_t)$ and must generalize across different goals.

#### Open Question: Limits of MDP Formulation (Slide 35)

The lecture closes with the discussion question:

> **What robotics problems cannot be formulated as an MDP?**

Key cases where standard MDP assumptions break down:
- Problems with **non-Markovian state** (the true state requires memory of history that cannot be compactly summarized)
- Problems where the **reward function is unknown** or cannot be hand-specified (leads to inverse RL / imitation learning)
- Problems with **partial observability** that cannot be handled by augmenting the state (requires POMDP or memory architectures)
- **Multi-agent settings** where other agents' policies affect transition dynamics (game-theoretic formulations needed)
