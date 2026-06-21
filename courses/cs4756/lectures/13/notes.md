---
type: lecture_notes
title: "Reward Shaping and Learning"
course: CS 4756/5756 Robot Learning
university: Cornell University
lecture_id: 13
slide_url: https://drive.google.com/file/d/11UMvzij8oTTvIA_E6_qxgPRuOTibSX79/view?usp=sharing
tags: [reward-shaping, reward-learning, inverse-reinforcement-learning, IRL, sparse-reward, dense-reward, potential-based-shaping, supervised-reward-learning]
timestamp: 2026-03-05
---

## TL;DR

Reward design is one of the hardest problems in RL for robotics. This lecture covers three strategies: (1) **reward shaping** — manually augmenting a sparse reward with auxiliary signals to guide learning without changing the optimal policy; (2) **supervised reward learning** — training a neural reward model from labeled data; and (3) **inverse reinforcement learning (IRL)** — inferring a reward function from expert demonstrations. The key theoretical result is that the only shaping functions that preserve the optimal policy are potential-based: $F(s,a,s') = \gamma\Phi(s') - \Phi(s)$.

## Key Takeaways

1. **Sparse rewards** give no learning signal until the goal is reached; all pre-goal trajectories look equally bad. Dense rewards provide per-step feedback.
2. **Potential-based reward shaping** (Ng, Harada, Russell 1999): adding $F(s,a,s') = \gamma\Phi(s') - \Phi(s)$ to any reward preserves the optimal policy $\pi^*$ because it shifts the value function by $\Phi(s)$ without changing $\arg\max_a Q(s,a)$.
3. **Reward shaping in practice**: combine distance rewards, energy penalties, safety penalties, and multi-stage sub-rewards (e.g., Meta-World).
4. **Supervised reward learning**: train $R_\theta(s,a,s')$ by regression on labeled $(s,a,s',r)$ tuples, or train a success classifier on binary $(s,a,s',y)$ data.
5. **IRL** recovers $r_\psi(s,a)$ such that the expert $\pi^*$ outperforms all other policies. Key challenge: trivial reward $R=0$ always satisfies the constraint; max-margin and MaxEnt IRL address this.

---

## Detailed Notes

### Section 1 — Why Shape / Learn Rewards? (Slides 4–5)

**From the imitation learning perspective**: we want to understand what an expert is optimizing — recovering the reward recovers the intent.

**From the RL perspective**: we need to specify desired behavior precisely. Bad reward design leads to reward hacking.

**Motivating example — 2D Navigation (Slide 5):**
- State: $s = (s_x, s_y)$
- Action: $a = (\Delta s_x, \Delta s_y)$
- Transition: $s' = f(s, a) = (s_x + \Delta s_x,\ s_y + \Delta s_y)$
- Goal: "Get to the office room" — what should the reward be?

---

### Section 2 — Reward Shaping (Slides 6–21)

#### 2.1 Sparse Reward (Slides 6–10)

Given a goal state $g$, the simplest reward is:

$$R(s, a, s') = \mathbf{1}[s' = g]$$

For continuous state spaces (goal cannot be exactly reached), use a threshold $\epsilon$:

$$R(s, a, s') = \mathbf{1}[d(s', g) < \epsilon]$$

For a goal region $\mathcal{S}_\text{success}$:

$$R(s, a, s') = \mathbf{1}[s' \in \mathcal{S}_\text{success}]$$

Adding an offset of $-1$ encourages faster goal reaching:

$$R(s, a, s') = \mathbf{1}[s' \in \mathcal{S}_\text{success}] - 1 = -\mathbf{1}[s' \notin \mathcal{S}_\text{success}]$$

This yields $r_t = -1, -1, \ldots, 0$, so $V(s) \approx$ negative discounted distance to goal.

**Problem (Slide 10):** Before reaching the goal, all trajectories have reward $0, \ldots, 0, 1$, making them equally bad. The agent receives no informative feedback mid-episode.

#### 2.2 Dense Reward (Slide 11)

A distance-based dense reward provides feedback every step:

$$R(s, a, s') = -d(s', g) \quad \text{or} \quad d(s, g) - d(s', g)$$

Example: $d(s', g) = \|g - s'\|^2$ gives $R = -\|g - s'\|^2$.

The second form (improvement in distance) is zero-mean and can be interpreted as a potential-based shaping function.

#### 2.3 Reward Shaping (Slides 12–13)

**Reward shaping**: augmenting the original reward $R$ with an auxiliary shaping function to guide learning:

$$R'(s, a, s') = R(s, a, s') + F(s, a, s')$$

Example combining multiple terms:

$$R(s, a, s') = 10 \cdot \mathbf{1}[s' \in \mathcal{S}_\text{success}] - 5 \cdot \mathbf{1}[s' \in \mathcal{S}_\text{bathroom}] - \|g - s'\|^2$$

An extreme case: $R(s, a, s') = \mathbf{1}[a = \pi^*(s)]$ — reward for imitating the optimal policy — trivially solves the problem if $\pi^*$ is known.

#### 2.4 Potential-Based Reward Shaping (Slides 14–18)

**Key question**: which shaping functions $F$ do not change the optimal policy $\pi^*$?

**Theorem (Ng, Harada, Russell 1999):** A shaping function that does **not** change $\pi^*$ must have the form:

$$\boxed{F(s, a, s') = \gamma\Phi(s') - \Phi(s)}$$

where $\Phi: \mathcal{S} \to \mathbb{R}$ is a **potential function**.

**Why this works (Slide 18):**
Adding $F = \gamma\Phi(s') - \Phi(s)$ shifts the value function: $V'(s) = V(s) + \Phi(s)$. The optimal action is:

$$\arg\max_a Q'(s, a) - \Phi(s) = \arg\max_a Q'(s, a) = \arg\max_a Q(s, a)$$

The $\Phi(s)$ term is a constant w.r.t. $a$, so argmax is unchanged.

**Example — "Change of Gravity Potential" (Slides 16–17):**

$$\Phi(s) = \frac{1}{\|g - s\|^2}, \quad F(s, a, s') = \frac{\gamma}{\|g - s'\|^2} - \frac{1}{\|g - s\|^2}$$

This creates a gravitational potential well around the goal, accelerating convergence.

#### 2.5 Practical Reward Design in Robotics (Slides 19–21)

**Example — Object Rearrangement (Slide 19):**
- 4-DoF pick-and-place (rotation along z-axis only)
- State: $s = (x_\text{ee}, \theta_\text{ee}, \text{open/close}, x_\text{obj})$
- Action: $a = (\Delta x_\text{ee}, \Delta\theta_\text{ee}, \text{open/close})$
- Reward: $R(s,a,s') = \|x_\text{goal} - x_\text{obj}\|^2 - \gamma\|x_\text{goal} - x'_\text{obj}\|^2$

**Common reward types for humanoid whole-body control (HumanPlus, Slide 20):**
- Distance rewards: $-\|x_\text{object} - x_\text{target}\|$
- Energy penalties: $-\|\text{torque}\|$
- Safety penalties: $-\text{collision\_penalty}$
- Velocity tracking: $\exp(-|[v_x, v_y] - [v_x^\text{tg}, v_y^\text{tg}]|)$
- Joint position tracking: $-\|q - q^\text{tg}\|_2^2$
- Feet contact, slipping penalties, alive bonus

**Multi-Stage Reward (Slide 21) — Meta-World:**

For complex tasks (door open, drawer close, peg insert, etc.), the reward decomposes into sequential stages:
- `reward = reachRew + pickRew + placeRew`
- Each stage has its own distance-based sub-reward with exponential shaping

---

### Section 3 — Supervised Learning of Reward (Slides 22–25)

#### 3.1 Motivation (Slide 23)

Manually designing rewards is hard in practice:
- Many terms, many stages, many hyperparameters
- High-dimensional state/action spaces (images, joint angles)
- Complex semantic objectives (e.g., "make a good dumpling", "wrap a gift nicely")

**Question**: Can we learn reward functions from data?

#### 3.2 Regression-Based Reward Model (Slide 24)

Given a labeled dataset $\mathcal{D} = \{(s_i, a_i, s_i', r_i)\}_{i=0}^{N-1}$, train a reward model $R_\theta(s, a, s')$ with regression loss:

$$\theta^* = \arg\min_\theta \sum \|R_\theta(s_i, a_i, s_i') - r_i\|^2$$

The model takes state, action, and next state as input (e.g., images through a CNN) and outputs a scalar reward.

#### 3.3 Success Classifier as Reward Function (Slide 25)

When binary success labels $y_i \in \{0, 1\}$ are available instead of scalar rewards:

Given $\mathcal{D} = \{(s_i, a_i, s_i', y_i)\}_{i=0}^{N-1}$, train a classifier:

$$\theta^* = \arg\max_\theta \sum \log R_\theta(y_i | s_i')$$

The classifier $R_\theta(s, a, s')$ then serves as a reward function: $P(\text{success}|s')$ is high near the goal, providing dense signal.

---

### Section 4 — Inverse Reinforcement Learning (Slides 26–40)

#### 4.1 IRL vs. Forward RL (Slides 27–28)

| | Forward RL | Inverse RL |
|---|---|---|
| Given | $s \in \mathcal{S}$, $a \in \mathcal{A}$, $p(s'\|s,a)$, $r(s,a)$ | $s \in \mathcal{S}$, $a \in \mathcal{A}$, $p(s'\|s,a)$, samples $\{\tau_i\} \sim \pi^*$ |
| Learn | $\pi^*(a\|s)$ | $r_\psi(s,a)$ then $\pi^*(a\|s)$ |

**IRL example**: "How should the robot traverse a parking lot?" — observe human pedestrians, recover their implicit reward (avoid cars, stay on sidewalks, etc.).

#### 4.2 Basic IRL Principle (Slides 29–30)

The expert policy $\pi^*$ should achieve performance $\geq$ any other policy $\pi$ under the recovered reward $R_w$:

$$\mathbb{E}_{\tau \sim p_{\pi^*}(\tau)}\left[\sum_t R_w(s_t, a_t)\right] \geq \mathbb{E}_{\tau \sim p_\pi(\tau)}\left[\sum_t R_w(s_t, a_t)\right] \quad \forall \pi$$

**Challenges (Slide 30):**
- $R_\psi(s_t, a_t) = 0$ trivially satisfies the constraint.
- Need $\pi^*$ to be truly optimal (not just approximately good).
- Usually only observe rollouts from $\pi^*$, not $\pi^*$ itself.
- Computationally intractable to enumerate all policies.

#### 4.3 Linear Reward Function (Slides 31–32)

Parameterize $R_w(s) = w^\top \phi(s)$, where $w \in \mathbb{R}^d$ and $\phi: \mathcal{S} \to \mathbb{R}^d$ is a feature extractor.

Then the expected cumulative reward becomes:

$$\mathbb{E}_{\tau \sim p_\pi(\tau)}\left[\sum_t R_w(s_t, a_t)\right] = w^\top \mathbb{E}_{\tau \sim p_\pi(\tau)}\left[\sum_t \phi(s_t)\right] = w^\top \mu(\pi)$$

where $\mu(\pi)$ is the **feature expectation** (expected cumulative sum of features under $\pi$).

The IRL objective simplifies to:

$$w^\top \mu(\pi^*) \geq w^\top \mu(\pi) \quad \forall \pi$$

**Example (Kitani et al. 2012)**: Each tile in a bird's-eye view is a state, features are semantic categories (road, building, car, grass, person, sidewalk, curb, pavement). The learned $w$ captures which terrain types pedestrians prefer.

#### 4.4 Max Margin IRL (Slides 33–34)

**Standard max margin:**

$$\min_w \|w\|^2 \quad \text{s.t.} \quad w^\top\mu(\pi^*) > w^\top\mu(\pi) + 1 \quad \forall\pi$$

**Problem**: fixed margin of 1 may be too rigid — some suboptimal policies are almost as good as $\pi^*$.

**Structured prediction max margin:**

$$\min_w \|w\|^2 \quad \text{s.t.} \quad w^\top\mu(\pi^*) > w^\top\mu(\pi) + m(\pi^*, \pi) \quad \forall\pi$$

where $m(\pi^*, \pi)$ is a policy-specific margin (e.g., number of states where $\pi^*$ and $\pi$ disagree). Policies very different from $\pi^*$ must be beaten by a larger margin.

#### 4.5 Apprenticeship Learning (Slide 35)

Classic application of max margin IRL to aerobatic helicopter flight (Abbeel et al., NeurIPS 2006). Demonstrates that IRL can extract complex reward functions from human expert demonstrations and then train policies that match or exceed expert performance.

#### 4.6 Keypoint-Based Reward (Slides 36–39)

**KETO (Qin et al., ICRA 2018)**: Define reward using distances between semantic keypoints:
- Environment points, effect points, function points, grasp points
- Keypoint generator trained from positive/negative interaction examples (self-supervised)
- Reward = distance between relevant keypoints in desired configuration

**ReKep (Huang et al. 2024)**: Spatio-temporal relational keypoint constraints for robot manipulation — defines reward via geometric relations between keypoints on objects and robot (e.g., cloth folding: track corner keypoints).

#### 4.7 Language-Conditioned Reward (Slide 40)

**MINEDOJO / MineCLIP (Fan et al., NeurIPS 2022):**

Reward is the dot product between image and text features:

$$\mathcal{R} = \phi_V(\text{video frames})^\top \phi_G(\text{task description})$$

- CLIP-style model fine-tuned on Minecraft gameplay videos paired with subtitles
- Achieves 0.95 correlation with human reward judgments
- Enables open-vocabulary task specification: "Shear sheep to obtain wool"
