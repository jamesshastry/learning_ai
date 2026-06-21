---
type: Lecture Notes
title: "Multi-Task Learning"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "23"
slide_url: https://drive.google.com/file/d/1G0PxQjAun5fkANDwn1T-9FpZjh4fF524/view?usp=sharing
tags: [multi-task-learning, goal-conditioned, language-conditioned, shared-representations]
timestamp: 2026-04-16T00:00:00Z
---

## TL;DR

Multi-task learning trains a single policy conditioned on a task specification $c$ so that $a_t \sim \pi(a_t | s_t, c)$. The four main specification types — task index, goal state/observation, language instruction, and latent variable — trade off expressiveness, interpretability, ease of grounding, and ease of data relabeling. For each type, behavior cloning (maximize log-likelihood) and reinforcement learning (maximize discounted reward) are both applicable, with goal-conditioned RL gaining a critical practical advantage through Hindsight Experience Replay (HER).

## Key Takeaways

- **Contextual MDP** formalizes multi-task RL as $\mathcal{M} = \langle \mathcal{S}, \mathcal{C}, \mathcal{A}, P, R \rangle$ where reward $r_t = R(s_t, a_t, s_{t+1}, c_t)$ depends on context.
- **Task index** (one-hot) is the simplest specification; works when the task set is fixed and discrete, but ignores inter-task structure and cannot generalize to novel tasks.
- **Goal-conditioned** policies ($\pi(a|s,g)$) support continuous task variation and enable easy relabeling via HER: a failed episode for goal $g$ is a successful episode for the achieved goal $\tilde{g}$.
- **HER** is the key practical technique for GCBC and GCRL — it dramatically increases useful supervision from sparse-reward or unlabeled trajectory data.
- **Language-conditioned** policies ($\pi(a|s,l)$) have open-ended expressiveness but relabeling requires an LLM or human annotation, and reward is very hard to define for LCRL.
- **Latent task representations** replace discrete IDs with a continuous embedding; similar tasks cluster nearby, enabling generalization, but interpretability is low.
- **Three index-conditioned architectures**: task embedding (shared backbone + concatenated embedding, scalable but may interfere), multiple networks (full specialization, no transfer), multiple prediction heads (shared trunk + per-task output heads, middle ground).
- **Grounding** — mapping a task specification to target objects, success conditions, and constraints in the current scene — is an open, hard problem, especially for language.
- **Long-tail task distributions** (e.g., Open X-Embodiment) are an acute practical challenge: head tasks dominate data, tail tasks have sparse supervision but still matter at test time.
- **Summary tradeoff table**: Task Index (limited expressiveness, easy grounding: no, relabeling: hard); Goal (goal-reaching expressiveness, medium grounding, easy relabeling); Language (open-ended, hard grounding, hard relabeling); Latent (data-dependent, low interpretability, data-dependent grounding, hard relabeling).

## Detailed Notes

### 1. Problem Setup: Contextual MDP and Multi-Task Policy (Slides 3–4)

**Contextual Markov Decision Process** is defined by the tuple:

$$\mathcal{M} = \langle \mathcal{S},\, \mathcal{C},\, \mathcal{A},\, P,\, R \rangle$$

- $\mathcal{C}$: context space, $c_t \in \mathcal{C}$
- $\mathcal{S}$: state space, $s_t \in \mathcal{S}$
- $\mathcal{A}$: action space, $a_t \in \mathcal{A}$
- $P$: transition model, $s_{t+1} \sim P(\cdot | s_t, a_t)$
- $R$: reward function, $r_t = R(s_t, a_t, s_{t+1}, c_t)$

The key extension over a standard MDP is that the **reward depends on the context** $c_t$, which encodes the current task.

**Single-task** policy: $a_t \sim \pi(a_t | s_t)$

**Multi-task** (task-conditioned) policy: $a_t \sim \pi(a_t | s_t, c)$

The context $c$ is the **task specification** — it tells the policy which of the many tasks to perform.

### 2. Types of Task Specifications (Slide 5)

Four main forms:

| Type | Description |
|---|---|
| Task Index | Discrete identifier, often as one-hot embedding |
| Goal | A desired goal state or goal observation (e.g., image) |
| Language Instruction | Natural language string (e.g., "Sweep the skittles into the bin") |
| Latent | A continuous latent vector, jointly learned or pre-trained |

### 3. Task Index Conditioning (Slides 6–12)

**Mechanism**: Policy is conditioned on a discrete task identifier converted to a one-hot embedding:

$$\pi(a_t \mid s_t,\, \underbrace{[0,0,1,0,0,0]}_{\text{one-hot task ID}})$$

**When to use**: Task set is fixed and fully known at training time. Simplest multi-task setup.

#### When to share a task index (Slide 8)

The principled criterion is based on whether the observation distribution $p(o_t)$ or the intended mapping $o_t \to a_t$ changes:

- **Same task index** if only $p(o_t)$ changes but the intended mapping $o_t \to a_t$ stays the same.  
  Example: "grasp mug from table" vs. "grasp mug from shelf" — same behavior, different object placement.
- **Different task indices** if $p(o_t)$ stays the same but the intended mapping $o_t \to a_t$ changes.  
  Example: "grasp mug" vs. "grasp hook" — same scene statistics, different grasp targets.
- **Ambiguous** if both change: depends on how much knowledge sharing the designer wants.

#### Architecture Variants (Slides 9–11)

**Task Embedding** (Slide 9): Single shared backbone; task ID is embedded and concatenated into the latent representation.
- Pros: scalable, efficient cross-task sharing
- Cons: gradient interference across tasks (conflicting gradients can hurt individual task performance)

**Multiple Networks** (Slide 10): One independent network per task.
- Pros: full per-task specialization
- Cons: no knowledge transfer, parameter count scales linearly with task count, limited to fixed discrete task sets

**Multiple Prediction Heads** (Slide 11): Shared feature extractor trunk; separate output head per task.
- Pros: shared perception representation + specialized per-task outputs
- Cons: still limited to fixed discrete task sets; trunk may still experience interference

#### Limitations of Task Indices (Slide 12)

- Do not capture **structure or similarity** between tasks (e.g., that "grasp mug" and "grasp cup" are similar).
- Cannot represent **continuous task variations** (e.g., moving a target 1 cm vs. 10 cm).
- **Generalize poorly** to unseen or compositional tasks — a new task ID has no pre-defined embedding.

### 4. Goal-Conditioned Policies (Slides 13–22)

**Setup**: Policy conditioned on a desired goal state $g$ or goal observation (image):

$$\pi_\theta(a \mid [x_t, y_t],\, [x_g, y_g]) \quad \text{(goal state)}$$
$$\pi_\theta(a \mid o_t,\, o_g) \quad \text{(goal observation)}$$

Supports continuous task variation and is natural for navigation and manipulation.

#### Goal-Conditioned Behavior Cloning (GCBC) (Slide 15)

Train policy $\pi_\theta(a_t | s_t, g)$ by maximum likelihood over trajectory datasets labeled with goals:

$$\theta^* = \arg\max_\theta\; \mathbb{E}_{(g,s,a)}\bigl[\log \pi_\theta(a \mid s, g)\bigr]$$

Training data: $M$ trajectories $(g^i, s_0^i, a_0^i, \ldots, s_T^i)$ for $i = 0, \ldots, M$.

#### Goal-Conditioned Reinforcement Learning (GCRL) (Slide 16)

Maximize discounted cumulative goal-reaching reward:

$$\theta^* = \arg\max_\theta\; \mathbb{E}\!\left[\sum_t \gamma^t R(s_t, a_t, s_{t+1}, g)\right]$$

**Universal Value Function Approximators (UVFA)** extend value functions to be goal-conditioned:
- Value function: $V(s, g)$
- Q-value function: $Q(s, a, g)$

#### Goal-Reaching Reward Design (Slides 17–18)

**Sparse reward** (binary success indicator):

$$R(s, a, s', g) = \mathbf{1}[s' = g]$$

This gives a reward sequence $r_t = 0, 0, \ldots, 0, 1$ — only nonzero at goal arrival. Efficient to specify but leads to sparse learning signal.

**Offset sparse reward** (encourages faster goal-reaching):

$$R(s, a, s') = \mathbf{1}[s' \in \mathcal{S}_\text{success}] - 1 = -\mathbf{1}[s' \notin \mathcal{S}_\text{success}]$$

This yields reward sequence $r_t = -1, -1, \ldots, 0$. As a consequence:

$$V(s) \approx \text{negative (discounted) distance to the goal}$$

#### Hindsight Experience Replay (HER) (Slides 19–20)

**Key idea**: A failed episode for goal $g$ may be a successful episode for a different goal $\tilde{g}$.

Given a transition collected under goal $g$:

$$(s_t, a_t, s_{t+1}, g)$$

HER replaces $g$ with an **achieved goal** $\tilde{g}$ (a state actually visited later in the same episode):

$$(s_t, a_t, s_{t+1}, \tilde{g})$$

For example, $\tilde{g} = s_{t'}$ where $t' > t$ is a later timestep in the same episode.

**Why HER helps**:
- **For GCBC**: Any trajectory can be relabeled to be a successful trajectory. Smaller $t'$ (closer achieved goal) leads to more optimal demonstrations.
- **For GCRL**: Mitigates the sparse reward problem. Setting $\tilde{g} = s_{t+1}$ guarantees goal achievement at every transition, providing dense positive-reward signal.

#### Exploration in Goal-Conditioned RL (Slide 21)

Random goal sampling is often too easy (already reachable) or too hard (far beyond current ability).

**Curriculum learning**: a goal proposal module $q_\phi(g)$ proposes goals that are **feasible yet challenging** — sitting at the **epistemic boundary** between solvable and unsolvable.

Goal-conditioned exploration procedure (Zhang et al., NeurIPS 2020):
1. Sample goal $g \sim q_\phi(g)$
2. Roll out goal-conditioned policy for episode $\tau$
3. Extract achieved goal $\tilde{g}$
4. Relabel: $(s_t, a_t, s_{t+1}, g) \Rightarrow (s_t, a_t, s_{t+1}, \tilde{g})$

The epistemic boundary shifts outward as the policy improves during training.

#### Goal-Conditioned Policy Architecture (Slide 22)

Both the state observation and the goal observation are passed through separate visual encoders (or a shared encoder), their feature maps are merged (e.g., via concatenation or cross-attention), and then passed through shared layers to produce the action.

### 5. Language-Conditioned Policies (Slides 23–27)

**Setup**: Policy conditioned on a natural language instruction $l$:

$$\pi_\theta(a \mid s, l)$$

Example: "Sweep the skittles into the bin."

Training data: $M$ trajectories $(l^i, s_0^i, a_0^i, \ldots, s_T^i)$ for $i = 0, \ldots, M$.

#### Language-Conditioned Behavior Cloning (LCBC) (Slide 25)

$$\theta^* = \arg\max_\theta\; \mathbb{E}_{(l,s,a)}\bigl[\log \pi_\theta(a \mid s, l)\bigr]$$

Compared to GCBC: **relabeling is much harder**. For GCBC, relabeling simply reuses states visited in the episode. For LCBC, generating a new language label for an achieved sub-goal requires a language model or human annotator.

#### Language-Conditioned Reinforcement Learning (LCRL) (Slide 26)

$$\theta^* = \arg\max_\theta\; \mathbb{E}\!\left[\sum_t \gamma^t R(s_t, a_t, s_{t+1}, l)\right]$$

Compared to GCRL: **reward is much harder to define**. For GCRL, the sparse reward $\mathbf{1}[s'=g]$ is computable directly from state. For LCRL, interpreting a language instruction to determine whether a state constitutes success requires perceptual understanding — typically a separate reward model.

#### Language-Conditioned Policy Architecture (Slide 27)

The instruction string is passed through a **text encoder** (e.g., a pre-trained language model) to produce a language embedding, which is concatenated into the policy's latent representation alongside the visual state features — structurally identical to the task-embedding architecture, but with the text encoder replacing the one-hot lookup.

### 6. Latent Task Representation (Slides 28–29)

Instead of a manually assigned discrete task index, use a **continuous latent vector** $z$ as the task specification:

$$\pi(a \mid s, z)$$

- The latent provides a **compact, continuous** representation of task identity.
- **Similar tasks map to nearby latent embeddings** — captures inter-task geometry that one-hot indices cannot.
- Can be jointly learned with the policy or pre-trained on task data.

**Latent-conditioned policy architecture** (Slide 29): A task latent (continuous vector) is passed through a small encoder to produce an embedding, which is concatenated into the shared backbone — structurally identical to the task-embedding architecture, but the input is a learned continuous vector rather than a one-hot.

### 7. The Grounding Problem (Slide 30)

A task specification is **useful only if the robot can map it to the relevant objects, relations, and actions in the current scene.** Three core questions:

- What are the **target objects**?
- What is the **success condition**?
- What are the **constraints**?

This is especially hard for language instructions: "Grasp the duster handle and use the duster bristles to sweep the snack bag into the rattan basket" requires identifying object parts, understanding functional affordances, and sequencing manipulation primitives. Grounding remains a major open problem in language-conditioned robotics.

### 8. Long-Tail Distribution of Tasks (Slide 31)

Real-world multi-task datasets (e.g., Open X-Embodiment, ICRA 2025) are **highly imbalanced**:

- Most data comes from a few common behaviors (picking, moving, pushing) and a few common objects (blocks, mugs).
- Many rare tasks (e.g., unscrewing a nut, operating a faucet) have limited data but may still appear at test time.

Implications for multi-task learning:
- Head tasks risk dominating gradient updates, crowding out tail tasks.
- Must balance **positive transfer from head tasks** (sharing representations) with **robustness on tail tasks** (not ignoring low-count categories).

### 9. Summary of Task Specification Tradeoffs (Slide 32)

Different task interfaces trade off four properties:

| Representation | Expressiveness | Interpretability | Grounding | Relabeling |
|---|---|---|---|---|
| Task Index | Limited | High | No | Hard |
| Goal | Goal-reaching | High | Medium | Easy |
| Language | Open-ended | High | Hard | Hard |
| Latent | Depends on data | Low | Depends on data | Hard |

**Design guidance**:
- Use **task index** when the task set is small, fixed, and fully known.
- Use **goal** when tasks can be described by desired states and HER relabeling is valuable.
- Use **language** when human-interpretability and open-ended flexibility matter more than ease of training.
- Use **latent** when unsupervised discovery of task structure is needed or when no clear symbolic specification is available.
