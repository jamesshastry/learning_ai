---
type: Lecture Notes
title: "Deep Reinforcement Learning Algorithms"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "10"
slide_url: https://drive.google.com/file/d/1e_oaJP3QLyZyldyeruyi2wx_BXRgA3KO/view?usp=sharing
tags: [deep-rl, DQN, DDPG, SAC, off-policy, on-policy, entropy-regularization, actor-critic]
timestamp: 2026-02-24T00:00:00Z
---

# Deep RL Algorithms

**Course:** CS 4756/5756 Robot Learning
**Instructor:** Kuan Fang
**Slides:** [Google Drive](https://drive.google.com/file/d/1e_oaJP3QLyZyldyeruyi2wx_BXRgA3KO/view?usp=sharing)

## TL;DR

This lecture covers three foundational deep RL algorithms used in robotics: (1) stabilizing vanilla Q-learning via double Q-networks and target networks; (2) DDPG, which extends Q-learning to continuous action spaces by learning a deterministic policy that approximates the argmax; and (3) SAC, an off-policy actor-critic that adds entropy regularization to encourage exploration, using the reparameterization trick to train a stochastic policy end-to-end. SAC consistently outperforms DDPG and PPO on continuous control benchmarks and is the dominant algorithm for robot learning today.

## Key Takeaways

- **Q-learning overestimates value due to biased bootstrap targets** — the max operation applied to the same network that is being trained creates a positive feedback loop. Double Q-learning breaks this by decoupling action selection and action evaluation across two networks.
- **Target networks stabilize training** — a slowly-updated copy of the Q-network (polyak averaging: $\phi_\text{targ} \leftarrow \rho\phi_\text{targ} + (1-\rho)\phi$) provides stable regression targets, preventing the loss surface from chasing a moving target.
- **DDPG solves the continuous-action argmax problem** — rather than enumerating actions, learn a deterministic policy $\pi_\theta$ that directly outputs the action maximizing $Q_\phi$. The critic is differentiable w.r.t. action, so backprop flows through the policy.
- **Entropy regularization converts exploration into a first-class objective** — the optimal policy under the entropy-augmented reward $R(s,a) + \alpha H(\pi(\cdot|s))$ is inherently stochastic and hedges against uncertainty rather than committing to one mode.
- **SAC uses the reparameterization trick to train a stochastic policy with low-variance gradients** — sampling $a = \mu_\theta(s) + \sigma_\theta(s) \odot \xi$, $\xi \sim \mathcal{N}(0,I)$ moves the randomness outside the gradient path.
- **Algorithm comparison (slide 41):** Q-Learning and DDPG use deterministic policies; Actor-Critic and SAC use stochastic policies; PPO is on-policy; SAC uses entropy maximization for exploration while DDPG uses noise injection.

## Detailed Notes

### Part 1: Stabilizing Q-Learning [Slides 3–12]

#### Recap: Roll-out Data and Q-Learning [Slides 4–6]

Collect a replay buffer $\mathcal{D} = \{(s_i, a_i, s_i', r_i)\}_{i=0}^{N-1}$ by running the exploration policy $\pi_e$. Q-learning iterates between collecting data and fitting a neural network $Q_\theta$:

$$y_i = R(s_i, a_i) + \gamma \max_{a'} Q_\theta(s_i', a')$$

$$\theta = \arg\min_\theta \frac{1}{2}\sum_{i=0}^{N-1}(Q_\theta(s_i, a_i) - y_i)^2$$

The red flag: the target $y_i$ depends on $Q_\theta$ itself, and the max selects whichever action looks best — which may be systematically overestimated due to extrapolation error.

#### Overestimation of Q Values [Slide 7]

When the Q-network extrapolates outside the observed data distribution, the approximation error tends to be positive (the network can fit arbitrary high values in unvisited regions). Taking $\max_{a'}$ actively selects these overestimated regions. Overestimated targets feed back into training, compounding the bias: biased estimation → overestimated targets → worse biased estimation.

#### Double Q-Learning [Slides 8–9, 12]

**Key idea (van Hasselt, NeurIPS 2010/2015):** decouple action selection and action evaluation using two separate Q-networks $Q_\phi$ and $Q_{\phi'}$.

For $Q_\phi$:
- Select action: $a^* \leftarrow \arg\max_{a'} Q_\phi(s_i', a')$
- Evaluate with other network: $y_i \leftarrow R(s_i, a_i) + \gamma \max_{a'} Q_{\phi'}(s_i', a^*)$
- Update: $\phi \leftarrow \arg\min_\phi \frac{1}{2}\sum_{i=0}^{N/2-1}(Q_\phi(s_i, a_i) - y_i)^2$

And symmetrically for $Q_{\phi'}$ on the other half of the dataset. The full modern algorithm (Hasselt et al., 2015) maintains a primary network $Q_\theta$, a target network $Q_{\theta'}$, and a replay buffer:

$$Q^*(s_t, a_t) \approx r_t + \gamma Q_\theta(s_{t+1}, \arg\max_{a'} Q_{\theta'}(s_{t+1}, a'))$$

Target network parameters updated by: $\theta' \leftarrow \tau \cdot \theta + (1-\tau) \cdot \theta'$

#### Target Value Network [Slide 10]

Rather than hard-copying weights periodically, use **polyak averaging** (exponential moving average):

$$\phi_\text{targ} \leftarrow \rho\,\phi_\text{targ} + (1-\rho)\,\phi$$

where $\rho \in (0,1)$ is close to 1 (e.g., 0.995). The target network $Q_{\phi_\text{targ}}$ is used only for computing bootstrap targets; gradients do not flow through it. This smooths out the target distribution, making the regression problem well-conditioned.

#### Target Policy Network [Slide 11]

The same polyak scheme applies to the policy network in actor-critic methods:

$$\theta_\text{targ} \leftarrow \rho\,\theta_\text{targ} + (1-\rho)\,\theta$$

---

### Part 2: Deep Deterministic Policy Gradient (DDPG) [Slides 13–17]

#### Motivation: Continuous Action Spaces [Slide 14]

Standard Q-learning computes $\max_{a'} Q_\theta(s', a')$. For discrete action spaces this is tractable. For continuous action spaces (e.g., joint torques), this requires solving an optimization problem at every Bellman backup — expensive. **DDPG's solution:** learn a deterministic policy $\pi_\theta(s) \in \mathcal{A}$ to approximate $\arg\max_a Q_\phi(s, a)$ directly.

#### DDPG Algorithm [Slides 15–17]

Initialize actor $\theta$, critic $\phi$, and corresponding target networks $\theta_\text{targ}$, $\phi_\text{targ}$.

For each iteration $k$:

1. **Collect** $(s_i, a_i, s_i', r_i)$ using exploration policy $\pi_e$, add to $\mathcal{D}$

2. **Evaluate targets** using target networks (the policy is deterministic so argmax is free):
$$y_i \leftarrow R(s_i, a_i) + \gamma Q_{\phi_\text{targ}}\!\left(s_i',\, \pi_{\theta_\text{targ}}(s_i')\right)$$

3. **Update critic** (minimize Bellman error):
$$\phi \leftarrow \arg\min_\phi \frac{1}{2}\sum_{i=0}^{N-1}(Q_\phi(s_i, a_i) - y_i)^2$$

4. **Update actor** (maximize Q through differentiable critic):
$$\theta \leftarrow \arg\max_\theta \frac{1}{2}\sum_{i=0}^{N-1} Q_\phi(s_i, \pi_\theta(s_i))$$

5. **Polyak update** both target networks:
$$\theta_\text{targ} \leftarrow \rho\,\theta_\text{targ} + (1-\rho)\,\theta, \quad \phi_\text{targ} \leftarrow \rho\,\phi_\text{targ} + (1-\rho)\,\phi$$

**Why this works:** The Q-function is differentiable w.r.t. its action input, so $\nabla_\theta Q_\phi(s, \pi_\theta(s)) = \nabla_a Q_\phi(s,a)\big|_{a=\pi_\theta(s)} \cdot \nabla_\theta \pi_\theta(s)$ via chain rule.

**DDPG is off-policy:** data in $\mathcal{D}$ can come from any policy ($\pi_e$ for data collection). The actor and target actor essentially approximate the argmax operation in Q-learning — the algorithm is conceptually Q-learning with a learned argmax.

**Exploration in DDPG:** since the policy is deterministic, exploration must be explicit. Common approach: add Ornstein-Uhlenbeck noise or Gaussian noise to actions during data collection.

---

### Part 3: Soft Actor-Critic (SAC) [Slides 18–40]

#### Motivation: Exploration vs Exploitation [Slides 22–26]

A fundamental tension in RL: the agent needs to explore unknown regions to find good rewards, but also exploit known good regions. A deterministic policy (DDPG) commits fully to exploitation; noise injection is unprincipled. **Idea:** use entropy as a formal measure of exploration and build it into the objective.

Entropy measures "how random a random variable is":

$$H(x) = H(p) = \mathbb{E}_{x \sim p(x)}[-\log p(x)]$$

For a Bernoulli distribution: $H(X) = -p\log p - (1-p)\log(1-p)$ — maximized at $p = 0.5$.

For a Gaussian $x \sim \mathcal{N}(\mu, \sigma^2)$:
$$H(x) = \frac{1}{2}\log(2\pi e\,\sigma^2)$$

Higher $\sigma$ → higher entropy → more exploration.

#### Entropy-Regularized RL [Slides 27–30]

Add an entropy bonus at every time step weighted by temperature $\alpha > 0$:

$$\pi^*(s) = \arg\max_\pi \mathbb{E}_{\tau \sim p_\pi}\!\left[\sum_t \gamma^t \left(R(s_t, a_t) + \alpha H(\pi(\cdot | s_t))\right)\right]$$

This modifies the value functions. The entropy-regularized value functions are:

$$V^\pi(s) = \mathbb{E}_\pi\!\left[\sum_t \gamma^t \left(R(s_t, a_t) + \alpha H(\pi(\cdot|s_t))\right)\,\bigg|\, s_0 = s\right]$$

$$Q^\pi(s,a) = \mathbb{E}_\pi\!\left[\sum_t \gamma^t \left(R(s_t, a_t) + \alpha H(\pi(\cdot|s_t))\right)\,\bigg|\, s_0 = s, a_0 = a\right]$$

They are connected by:
$$V^\pi(s) = \mathbb{E}_\pi[Q^\pi(s,a)] + \alpha H(\pi(\cdot|s))$$

And the Bellman equation simplifies elegantly:
$$Q^\pi(s,a) = \mathbb{E}_\pi\left[R(s,a) + \gamma\left(Q^\pi(s', a') + \alpha H(\pi(\cdot|s'))\right)\right] = \mathbb{E}_\pi[R(s,a) + \gamma V^\pi(s')]$$

Expanding the entropy term:
$$Q^\pi(s,a) \approx R(s,a) + \gamma\left(Q^\pi(s', \tilde{a}') - \alpha\log\pi(\tilde{a}'|s')\right), \quad \tilde{a}' \sim \pi(\cdot|s')$$

The $-\alpha\log\pi$ term penalizes confident/deterministic policies and rewards spreading probability mass.

#### Reparameterization Trick [Slides 31–32]

To train a stochastic policy $\pi_\theta$ using backpropagation, we cannot differentiate through a sample $a \sim \mathcal{N}(\mu_\theta(s), \Sigma_\theta(s))$ directly — sampling is not differentiable. 

**Solution:** reparameterize as a deterministic function of noise:
$$a = \mu_\theta(s) + \sigma_\theta(s) \odot \xi, \quad \xi \sim \mathcal{N}(0, I)$$

Now $a$ is a differentiable function of $\theta$ for any fixed $\xi$. Gradients flow through $\mu_\theta$ and $\sigma_\theta$.

This converts the expectation over actions to an expectation over noise:
$$\mathbb{E}_{a \sim \pi}[Q^\pi(s,a) - \alpha\log\pi(a|s)] = \mathbb{E}_{\xi \sim \mathcal{N}(0,I)}[Q^\pi(s, \tilde{a}^\pi(s,\xi)) - \alpha\log\pi(\tilde{a}^\pi(s,\xi)|s)]$$

#### SAC Policy Network Design [Slide 33]

SAC uses:
$$\tilde{a}^\pi(s, \xi) = \tanh(\mu_\theta(s) + \sigma_\theta(s) \odot \xi), \quad \xi \sim \mathcal{N}(0, I)$$

Design choices:
- **tanh:** squashes output to $(-1, 1)$, keeping actions bounded for robot control
- **Learned std $\sigma_\theta(s)$:** the network outputs both mean and log-std; std is state-dependent, allowing the policy to be more uncertain in novel states
- **State-dependent std:** enables adaptive exploration — hedge where uncertain, exploit where confident

#### SAC Algorithm [Slides 34–35]

Initialize actor $\theta$, critic $\phi$, target critic $\phi_\text{targ}$.

While not converged:

1. **Collect** $\{(s_i, a_i, s_i', r_i)\}$ under $\pi_\theta$, append to replay buffer $\mathcal{D}$

2. **Evaluate targets** (using target critic and fresh action sample from current policy):
$$y_i = R(s_i, a_i) + \gamma\!\left(Q_{\phi_\text{targ}}(s_i', \tilde{a}') - \alpha\log\pi(\tilde{a}'|s_i')\right), \quad \tilde{a}' \sim \pi_\theta(\cdot|s_i')$$

3. **Update critic** (standard Bellman regression):
$$\phi = \arg\min_\phi \frac{1}{2N}\sum_{i=0}^{N-1}(Q_\phi(s_i, a_i) - y_i)^2$$

4. **Update actor** via reparameterization (maximize Q minus entropy penalty):
$$\hat{\nabla}_\theta J(\theta) = \frac{1}{N}\sum_i \nabla_\theta\!\left(Q_\phi(s_i, \tilde{a}^\pi(s_i, \xi)) - \alpha\log\pi(\tilde{a}^\pi(s_i, \xi)|s_i')\right), \quad \xi \sim \mathcal{N}(0, I)$$

5. **Polyak update** target critic:
$$\phi_\text{targ} \leftarrow \rho\,\phi_\text{targ} + (1-\rho)\,\phi$$

**With multiple target critics (slide 35):** SAC uses two critic networks $Q_{\phi_1}$, $Q_{\phi_2}$ and takes the minimum to mitigate overestimation:

$$y_i = R(s_i, a_i) + \gamma\!\left(\min_{j=1,2} Q_{\phi_\text{targ,j}}(s_i', \tilde{a}') - \alpha\log\pi(\tilde{a}'|s_i')\right)$$

**Why can't we just use the reparameterization trick in vanilla actor-critic?** (Slide 40) The Q-network in standard off-policy actor-critic is trained without entropy regularization, so it still suffers from overestimation. Using the reparameterized gradient pushes the policy toward overestimated Q regions. SAC's entropy term acts as a regularizer that prevents the policy from over-committing to any single (possibly overestimated) action.

#### SAC Empirical Results [Slides 36–38]

- **Minitaur robot** (Haamoja et al., 2019): trained on flat terrain, policy generalizes zero-shot to obstacles, slopes, and novel terrain — entropy regularization produces broadly capable rather than narrowly specialized policies.
- **Valve rotation** from 32×32 pixel images: policy must infer valve position from low-res observations while also receiving joint positions/velocities.
- **Benchmark comparison** (Fig. 1): SAC (with learned temperature $\alpha$) consistently matches or outperforms DDPG, TD3, and PPO across Hopper, Walker2d, HalfCheetah, Ant, Humanoid environments.

---

### Summary: Algorithm Comparison [Slide 41]

| Algorithm | Type | Policy | Hyperparameters | Exploration |
|---|---|---|---|---|
| Q-Learning | Off-policy | Deterministic | Sensitive | Epsilon-greedy / Softmax |
| DDPG | Off-policy | Deterministic | Sensitive | Noise-based |
| Actor-Critic | Off/On-policy | Stochastic | Medium | Implicit |
| SAC | Off-policy | Stochastic | Medium | Entropy Maximization |
| PPO | On-policy | Stochastic | Stable | Implicit |

The RL loop remains: **generate samples → estimate return → improve policy → repeat**.

## Concepts Introduced

- [[Double Q-Learning]] — two networks decouple action selection and evaluation to reduce overestimation bias
- [[Target Network]] — slowly-updated copy via polyak averaging for stable Bellman targets
- [[DDPG]] — off-policy actor-critic with deterministic policy for continuous action spaces
- [[Entropy-Regularized RL]] — adds $\alpha H(\pi(\cdot|s))$ bonus reward to encourage exploration
- [[Soft Actor-Critic]] — off-policy actor-critic with entropy regularization and reparameterization trick
- [[Reparameterization Trick]] — moves sampling randomness outside gradient computation path
- [[Polyak Averaging]] — exponential moving average for target network updates

## Connections to Other Lectures

- Q-learning fundamentals and Bellman equations from Lectures 7–8
- REINFORCE and vanilla actor-critic recapped from Lectures 8–9 (slides 19–21 recap them)
- Off-policy actor-critic (slide 21, 39) is the direct predecessor to SAC
- PPO (on-policy, stable) compared against SAC in slide 41; PPO covered separately
- Exploration vs exploitation tension (slide 22) motivates the entropy framework

## Open Questions

- How should the temperature $\alpha$ be tuned, and can it be learned automatically (SAC with learned temperature on slide 38)?
- When does DDPG's noise-based exploration fail relative to SAC's entropy maximization?
- Does entropy regularization help in sparse-reward settings, or does it primarily help in dense-reward continuous control?
- How do the two critic networks in SAC interact — is clipped double Q the right heuristic for all domains?
