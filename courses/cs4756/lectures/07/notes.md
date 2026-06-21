---
type: Lecture Notes
title: "Q-Learning"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "07"
slide_url: https://drive.google.com/file/d/1iTYH9RujW8FNXYikTq7Rdp7_Ncgc774k/view?usp=sharing
tags: [q-learning, reinforcement-learning, temporal-difference, exploration]
timestamp: 2026-02-10T00:00:00Z
---

## TL;DR

Value iteration requires knowing the transition dynamics $P(\cdot|s,a)$, which is often unavailable in robot learning. This lecture bridges model-based value iteration to the fully model-free Q-learning algorithm. The key insight is that the Bellman backup expectation over next states can be approximated with sampled roll-out data $(s, a, s')$, turning RL into a supervised regression problem. Fitted Q-Value Iteration (FQI) formalizes this with a dataset; Q-learning is its online, SGD-based variant. Because the target $y_i = R(s,a) + \gamma \max_{a'} Q(s', a')$ depends only on the transition tuple and not on which policy collected it, Q-learning is an **off-policy** method — the canonical practical instance being Deep Q-Networks (DQN), which "launched the field of deep RL." For continuous action spaces, action maximization is handled by random sampling or the Cross-Entropy Method (CEM), as demonstrated at scale in QT-Opt for robotic grasping.

---

## Key Takeaways

1. **Q-values remove the need for dynamics at policy-extraction time.** The greedy policy $\hat{\pi}(s) = \arg\max_a Q_K(s,a)$ never queries $P(\cdot|s,a)$.
2. **Fitted Q-Value Iteration (FQI) is supervised learning on Bellman targets.** Compute regression targets $y_i = R(s_i, a_i) + \gamma \max_{a'} Q_\theta(s_i', a')$, then minimize MSE. The target network is treated as a constant (no backprop through it).
3. **FQI is off-policy.** Given $(s_i, a_i)$, the next state $s_i'$ is determined by the environment, not the policy. Data from any policy — or a mix — can be reused in the replay buffer.
4. **Q-learning $\approx$ online FQI with SGD.** Each step collects one transition, appends it to a replay buffer, and performs one (or more) gradient steps on a minibatch.
5. **Exploration requires a separate policy.** The final policy is $\arg\max_a Q_\theta(s,a)$; the exploration policy $\pi_e$ uses $\epsilon$-greedy or softmax (Boltzmann) temperature to trade off exploitation vs. exploration.
6. **DQN (Mnih et al. 2015) is Q-learning with experience replay and a CNN state encoder**, achieving superhuman performance on several Atari games and launching modern deep RL.
7. **Continuous action spaces require approximate maximization.** Sample a candidate set $\hat{\mathcal{A}} = \{a^i\}_{i=0}^{N-1}$ and take the argmax, or use CEM for efficiency — this is the approach of QT-Opt.

---

## Detailed Notes

### Slides 4–5 — Recap: Value Iteration and the Dynamics Problem

Value iteration computes:

$$V_{k+1}(s) = \max_a \left[ R(s,a) + \gamma \mathbb{E}_{s' \sim P(\cdot|s,a)}[V_k(s')] \right]$$

Policy extraction also requires the transition model:

$$\hat{\pi}(s) = \arg\max_a \left[ R(s,a) + \gamma \mathbb{E}_{s' \sim P(\cdot|s,a)}[V_K(s')] \right]$$

**Problem:** The dynamics $P(\cdot|s,a)$ could be unknown. We need a way to work without it.

---

### Slides 6–7 — Q-Value Iteration

Define the **action-value (Q) function**:

$$Q_{k+1}(s, a) = R(s,a) + \gamma \mathbb{E}_{s' \sim P(\cdot|s,a)}[V_k(s')]$$

Since $V_k(s') = \max_{a'} Q_k(s', a')$, the full recursion becomes:

$$Q_{k+1}(s, a) = R(s,a) + \gamma \mathbb{E}_{s' \sim P(\cdot|s,a)}\left[\max_{a'} Q_k(s', a')\right]$$

Policy extraction no longer needs dynamics:

$$\hat{\pi}(s) = \arg\max_a [Q_K(s, a)]$$

The expectation over $P(\cdot|s,a)$ remains, but now it only appears inside $Q$, not during policy extraction.

---

### Slides 8–10 — Approximating the Expectation with Samples

The expectation in the Bellman update:

$$\mathbb{E}_{x \sim p(x)}[f(x)] \approx \frac{1}{N} \sum_{i=1}^{N} f(x_i)$$

can be approximated by samples $x_i \sim p(x)$. Rewriting $Q_{k+1}$:

$$Q_{k+1}(s,a) = \mathbb{E}_{s' \sim P(\cdot|s,a)}\left[R(s,a) + \gamma \max_{a'} Q_k(s',a') \;\Big|\; s,a\right]$$

If we let $x = (s, a)$ and $y = R(s,a) + \gamma \max_{a'} Q_k(s', a')$, then $\mathbb{E}[y|x] = Q_{k+1}(s,a)$.

This is a **supervised regression problem** with model $f_\theta(x) = Q_\theta(s, a)$.

---

### Slides 11–12 — Roll-Out Data Collection

Collect a dataset:

$$\mathcal{D} = \{(s_i, a_i, s_i', r_i)\}_{i=0}^{N-1}$$

by rolling out a policy $\pi$ in the environment. Then train the policy on $\mathcal{D}$ (data flows: environment $\to$ collect $\to$ data $\to$ train $\to$ policy).

---

### Slides 13–16 — Fitted Q-Value Iteration (FQI)

**Algorithm:**

```
Input: Dataset D = {(s_i, a_i, s_i', r_i)}
Initialize θ

For k = 0, ..., K-1:
    Compute targets:  y_i = R(s_i, a_i) + γ max_{a'} Q_θ(s_i', a')
    Update:           θ = argmin_θ (1/2) Σ (Q_θ(s_i, a_i) - y_i)²

Return Q_θ
```

**Key implementation detail:** $y_i$ is treated as a **constant** (the "target Q-value"). Backpropagation flows only through $Q_\theta(s_i, a_i)$, not through the $Q_\theta(s_i', a')$ used to compute $y_i$. This is why a separate **target network** is used in practice.

**Off-policy property:** Does it matter which policy collected $\mathcal{D}$? No — given $(s_i, a_i)$, the transition to $s_i'$ is determined by the environment's dynamics, independent of $\pi$. FQI is therefore an **off-policy learner**. Any behavior policy's data is valid.

---

### Slide 17 — On-Policy vs. Off-Policy Learners

| | On-Policy | Off-Policy |
|---|---|---|
| **Learns** | Value of the policy carried out by the robot | Value of the **optimal** policy, independently of the robot |
| **Examples** | SARSA, policy gradient | Q-learning, FQI |

---

### Slides 19–21 — Online FQI: Interleaving Collection and Training

Rather than collecting a fixed dataset upfront, interleave:

1. Collect $N_\text{data}$ samples $(s_i, a_i, s_i', r_i)$ and append to a **replay buffer** $\mathcal{D}$.
2. Train the policy for $N_\text{update}$ gradient steps from minibatches sampled from $\mathcal{D}$.

The **Update-to-Data (UTD) ratio** is:

$$\text{UTD} = \frac{N_\text{update}}{N_\text{data}}$$

Higher UTD = more gradient steps per environment interaction = more sample-efficient but potentially less stable.

Because FQI is off-policy, we can also use a **separate exploration policy** $\pi_e$ to collect data with better state-space coverage while the learned Q-network improves.

---

### Slides 22–23 — Exploration Strategies

**Final (greedy) policy:**

$$\pi(a|s) = \begin{cases} 1 & \text{if } a = \arg\max_a Q_\theta(s,a) \\ 0 & \text{otherwise} \end{cases}$$

**Epsilon-greedy exploration policy:**

$$\pi_e(a|s) = \begin{cases} 1 - \epsilon & \text{if } a = \arg\max_a Q_\theta(s,a) \\ \epsilon / (|\mathcal{A}| - 1) & \text{otherwise} \end{cases}$$

**Softmax (Boltzmann) exploration policy** (for discrete action spaces):

$$\pi_e(a|s) = \frac{\exp(Q_\theta(s,a)/\lambda)}{\sum_{a'} \exp(Q_\theta(s,a')/\lambda)}$$

where $\lambda$ is the **temperature**. As $\lambda \to \infty$, $\pi_e$ approaches uniform random (maximum exploration). As $\lambda \to 0$, $\pi_e$ approaches the greedy policy (pure exploitation).

---

### Slides 24–25 — Q-Learning Algorithm

Q-learning is online FQI with SGD updates:

```
Initialize θ
Initialize D ← ∅

For k = 0, ..., K-1:
    For i = 0, ..., N_data - 1:
        Collect (s_i, a_i, s_i', r_i) using exploration policy π_e
        D = D ∪ {(s_i, a_i, s_i', r_i)}
    For i = 0, ..., N_update - 1:
        Update θ on a minibatch sampled from D

Return Q_θ
```

**Q-learning ≈ online FQI with SGD**

The relationship to temporal-difference (TD) learning: in the limit $N_\text{data} = N_\text{update} = 1$, this is exactly the classic tabular Q-learning update rule with learning rate $\alpha$:

$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ r + \gamma \max_{a'} Q(s', a') - Q(s,a) \right]$$

---

### Slides 27–30 — Deep Q-Networks (DQN)

**Paper:** Mnih et al., "Playing Atari with Deep Reinforcement Learning," DeepMind, 2015 — described as "a classic which substantially launched the field of deep RL."

**Setting:** Discrete action space, image-based state (raw pixels preprocessed by a CNN), both sparse and dense rewards across 57 Atari games.

**DQN Algorithm (key elements):**
- Replay memory $\mathcal{D}$ with fixed capacity $N$ (experience replay)
- $\epsilon$-greedy exploration during training
- Preprocessed frames $\phi(s_t)$ as CNN input
- Target: $y_j = r_j$ (terminal) or $y_j = r_j + \gamma \max_{a'} Q(\phi_{j+1}, a'; \theta)$ (non-terminal)
- Gradient descent on $(y_j - Q(\phi_j, a_j; \theta))^2$

**Results vs. baselines** (selected games, scores):

| Agent | Breakout | Pong | Q*bert | Seaquest |
|---|---|---|---|---|
| Random | 1.2 | -20.4 | 157 | 110 |
| Sarsa | 5.2 | -19 | 614 | 665 |
| DQN | **168** | **20** | **1952** | **1705** |
| Human | 31 | -3 | 18900 | 28010 |

DQN substantially outperforms prior RL methods; human level on several games.

**DQN successors** (slide 30): The research lineage continued through Double DQN, Dueling Networks, Prioritized Replay, Distributional RL, R2D2, and eventually Agent57 (Badia et al., 2020), which outperforms humans on all 57 Atari games.

---

### Slides 31–32 — Q-Learning with Continuous Action Spaces

Policy extraction requires $\pi_\theta(s) = \arg\max_{a \in \mathcal{A}} [Q_\theta(s,a)]$. When $\mathcal{A}$ is continuous (e.g., robot joint torques, steering angles), this optimization is intractable in closed form.

**Approach 1 — Random sampling:**

$$\hat{\mathcal{A}} = \{a^i\}_{i=0}^{N-1}, \quad \pi_\theta(s) = \arg\max_{a \in \hat{\mathcal{A}}} [Q_\theta(s,a)]$$

**Approach 2 — Cross-Entropy Method (CEM):** An iterative population-based optimizer. Sample a population, keep elite samples, fit a new distribution, repeat. More efficient than pure random sampling for high-dimensional continuous actions.

---

### Slides 33–36 — QT-Opt: Q-Learning for Robotic Manipulation

**Paper:** Kalashnikov et al., "QT-Opt: Scalable Deep Reinforcement Learning for Vision-Based Robotic Manipulation," 2018.

**Setup:**
- 7 physical robots collecting grasping data in parallel
- 472×472 image observations
- Self-supervised binary reward (grasp success/failure)
- 580K offline grasps plus ongoing online collection

**Architecture:**
- Off-policy replay buffer (historical data) + on-policy replay buffer (fresh data from current policy)
- Bellman Updater computes target Q-values $Q_T$
- Training Worker minimizes Bellman error on mixed buffer
- Policy execution via **Cross-Entropy Method**: $\pi(\mathbf{s}) = \arg\max_\mathbf{a} Q_{\bar{\theta}}(\mathbf{s}, \mathbf{a})$

**Results:** Robust recovery from failures (re-grasping after slip), long-horizon manipulation capabilities. Demonstrated that Q-learning with CEM scales to real-world robot learning with image inputs and sparse binary rewards.
