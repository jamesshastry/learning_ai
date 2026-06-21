---
type: Lecture Notes
title: "Hierarchical Decision Making"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "26"
slide_url: https://drive.google.com/file/d/1WsCE9REpiTo8oxWOd7HjIgsKoWfImMig/view?usp=sharing
tags: [hierarchical-rl, options-framework, subgoals, task-decomposition, TAMP, skill-discovery, HRL, HIRO, DIAYN, SayCan]
timestamp: 2026-04-28T00:00:00Z
---

## TL;DR

Long-horizon robot tasks are hard because of sparse rewards, huge search spaces, compounding errors, and poor transfer. Hierarchical decision making addresses this by decomposing behavior across levels of abstraction: a high-level policy selects *what* to do (a subgoal, skill, or symbol), and a low-level policy decides *how* to do it. The lecture covers three main regimes — planning with existing skills (goal-conditioned, language-space, and symbolic/TAMP), learning the full hierarchy end-to-end (HRL / HIRO), and discovering skills without task supervision (DIAYN). The options framework provides the unifying formal vocabulary.

---

## Key Takeaways

1. **Temporal abstraction** breaks the action sequence into temporally extended decisions (options/skills), drastically reducing the effective horizon for the high-level planner.
2. **Hierarchy is a set of design choices**, not a single algorithm. The four axes are: interface type ($z_k$), skill source, high-level decision rule, and execution check (termination).
3. **Goal-conditioned planning** requires a learned feasibility model $p(g_{k+1} \mid g_k, g)$ to propose reachable subgoals; three variants trade off search space size vs. generalization.
4. **Language as a high-level action space** (SayCan, PALO) lets LLMs propose skill sequences while value functions or behavior-cloning loss ground them in physical feasibility.
5. **Symbolic planning + robot skills (TAMP)** gives interpretable, long-horizon plans but requires grounding each symbolic action in perception and continuous motion planning.
6. **HRL credit assignment** is the core difficulty: as the low-level policy changes, old high-level transitions become off-policy. HIRO solves this by relabeling high-level goals.
7. **The options framework** formally defines a skill as $o = (I_o, \pi_o, \beta_o)$: initiation set, intra-option policy, and termination condition.
8. **Unsupervised skill discovery (DIAYN)** learns a diverse, controllable skill library before any downstream task by maximizing mutual information $I(S; Z)$ through a discriminator.

---

## Detailed Notes

### Slide 1 — Title

**Hierarchical Decision Making**
Instructor: Kuan Fang | 2026-04-28 | CS 4756/5756 Robot Learning (Spring 2026)

---

### Slide 4 — The Plan for Today

Three sections:
1. Hierarchical Policy Formulation
2. Planning with Existing Skills
3. Learning the Hierarchy

---

### Slides 5–7 — Motivation: Long-Horizon Tasks

**The problem** (slide 5): Real-world manipulation involves very long trajectories:

$$s_0, a_0, s_1, a_1, s_2, a_2, s_3, a_3, \ldots$$

with policy $a_t \sim \pi(a_t \mid s_t)$.

**Challenges:**
- Sparse rewards — reward signal arrives only at task completion
- Huge search space — exponential in horizon
- Compounding errors — small per-step errors accumulate
- Hard to transfer — monolithic policies do not generalize

**Temporal abstraction** (slide 6): Instead of picking every primitive action, the robot picks *temporally extended decisions*. For example, a block-stacking task decomposes into:

$$\underbrace{s_0, a_0, s_1, a_1, s_2, a_2}_{\text{pick}},\ \underbrace{s_3, a_3, s_4, a_4}_{\text{move}},\ \underbrace{s_5, a_5, s_6, a_6}_{\text{place}},\ \underbrace{s_7, \ldots}_{\text{pick}} \ldots$$

**Modularity** (slide 7): A modular policy $\pi(a \mid s, z)$ exposes reusable building blocks. The same low-level skills compose into different tasks:

| Task | Skill sequence |
|---|---|
| clean table | pick + place |
| serve drink | pick + pour + place |
| move object onto drawer | pick + place + open |
| move object into drawer | open + pick + place |

Benefits: reuse across tasks, more interpretable behavior, better transfer.

---

### Slides 8–12 — Hierarchical Policy Formulation

**Two-level hierarchy** (slides 8–9): Hierarchies decompose behavior across levels of abstraction. The high-level policy selects *what* to do; the low-level policy decides *how*:

$$z_k \sim \pi_H(z_k \mid s_{t_k}) \quad \text{(high-level, fires at time } t_k\text{)}$$

$$a_t \sim \pi_L(a_t \mid s_t, z_k), \quad t_k \le t < t_{k+1} \quad \text{(low-level)}$$

The high-level policy is only invoked at switching times $t_0, t_1, t_2, \ldots$

**When to switch** (slide 10): Two common choices for determining $t_{k+1}$:
- **Fixed horizon**: $t_{k+1} = t_k + K$ (simplest; ignores skill progress)
- **Termination condition**: $\beta_z(s_t) \in [0,1]$, either hand-designed or learned (more flexible; used in the options framework)

**Interface type $z_k$** (slide 11): Five modalities for the signal passed from high-level to low-level:

| Modality | Example |
|---|---|
| Goal | $g \in \mathcal{G}$ (a target state) |
| Language | "open the drawer" |
| Symbol | Holding(robot, cup) |
| Latent code | $z \in \mathbb{R}^d$ |
| Other | — |

**Design axes** (slide 12): Hierarchy is a *set of design choices*, not a single algorithm:
- **Interface**: goal, language, symbol, latent code, option, …
- **Skill source**: hand-designed, IL, RL, unsupervised discovery, …
- **High-level decision rule**: planner, LLM, RL policy, …
- **Execution check**: fixed horizon, hand-designed condition, learned condition

---

### Slides 13–15 — Planning over Goal-Conditioned Policies

**Setup** (slide 13): Assume a learned goal-conditioned low-level policy $\pi_L(a \mid s, g)$. The high-level planner must find the sequence of intermediate subgoals $g_0, g_1, \ldots, g_{K-1}$ such that:
- The chain starts at $s_0$ and ends at the final goal $g$
- Each transition $g_k \to g_{k+1}$ is *feasible* (the low-level policy can execute it)
- The overall plan is efficient

**Feasibility model** (slides 14–15): We can learn a generative model of the next subgoal. Three variants, each with trade-offs:

| Model | Expression | Pros | Cons |
|---|---|---|---|
| Unconditional | $p(g_{k+1}) = p(s_t)$ | No generalization issue | Large search space |
| Reachability | $p(g_{k+1} \mid g_k)$ | Reduces search space | $g_k$ must be in distribution |
| Goal-directed | $p(g_{k+1} \mid g_k, g)$ | Direct prediction toward goal | $(g_k, g)$ must be in distribution |

The goal-directed model $p(g_{k+1} \mid g_k, g)$ — "what is the next subgoal on the way from $g_k$ toward $g$?" — is the most powerful but hardest to generalize.

---

### Slides 16–20 — Task Planning in Language Space

**Language as high-level action space** (slides 16–17): When each natural-language phrase maps to an executable low-level skill, language instructions become the high-level action space. Example: "Clean the plate" decomposes into subtask instructions ("pick up the plate", "pick up the sponge", "move the plate to the bowl", "clean the plate"), each executed by a language-conditioned low-level policy.

**SayCan** (slides 18–19): Ahn et al., CoRL 2022.
Selects skills that are both *useful* and *feasible*:

- **"Say"** (useful): LLM scores $p(\text{skill} \mid \text{instruction})$ — does this skill help complete the task?
- **"Can"** (feasible): value function scores $p(\text{success} \mid \text{skill}, s)$ — can the robot actually execute it now?

The combined score for each candidate skill is:

$$\text{score}(\text{skill}) \propto p_{\text{LLM}}(\text{skill} \mid \text{instruction}) \cdot V(\text{skill}, s)$$

The highest-scoring skill is selected and executed; then the process repeats.

**PALO** (slide 20): Myers & Zheng et al., ICRA 2025.
Adapts a pretrained policy to new long-horizon tasks from a small number of demonstrations using language decomposition:
1. A VLM generates candidate language decompositions $z_{1:K}$
2. Each decomposition is scored against few-shot demonstrations
3. Subtasks are executed by the existing policy

The optimal instruction sequence is found by minimizing behavior-cloning loss over predicted actions $\hat{a}_t$ vs. demonstration actions $a_t$:

$$z^*_{1:K} = \arg\min_{z_{1:K}} \sum_t \|\hat{a}_t - a_t\|^2$$

---

### Slides 21–26 — Planning over Symbolic States and Actions (TAMP)

**Symbolic representations** (slide 21): The world is described by *objects* and *predicates* (Boolean relations over objects):

- Objects: $\textit{robot},\ \textit{cup},\ \textit{table},\ \textit{drawer}$
- Predicates: $\text{At}(\textit{robot}, \textit{table}),\ \text{On}(\textit{cup}, \textit{table}),\ \text{HandEmpty}(\textit{robot}),\ \text{Open}(\textit{drawer})$

A symbolic state is a set of true predicates:

$$S = \{\text{At}(\textit{robot}, \textit{table}),\ \text{On}(\textit{cup}, \textit{table}),\ \text{HandEmpty}(\textit{robot})\}$$

**Symbolic action schema** (slide 22): Each action is defined by:

$$a = \langle \text{Pre}(a),\ \text{Eff}^+(a),\ \text{Eff}^-(a) \rangle$$

Example: $\text{Pick}(\textit{cup})$
- Preconditions: $\text{On}(\textit{cup}, \textit{table}) \wedge \text{HandEmpty}(\textit{robot})$
- Add effects: $\text{Holding}(\textit{robot}, \textit{cup})$
- Delete effects: $\text{On}(\textit{cup}, \textit{table}),\ \text{HandEmpty}(\textit{robot})$

**Grounding symbolic actions** (slide 23): A symbolic plan is useful only if each symbolic action can be grounded in perception and continuous control. For $\text{Pick}(\textit{cup})$ this requires: detecting the cup, estimating its pose, sampling a grasp, planning a collision-free motion, closing the gripper, and verifying grasp success.

**Task and Motion Planning (TAMP)** (slide 24): Connects discrete task choices with continuous motion feasibility:
- Task planner selects discrete action sequence: $a_1, a_2, \ldots, a_T$
- Motion planner selects continuous parameters: $\theta_1, \theta_2, \ldots, \theta_T$

Continuous parameters $\theta_i$ include: object poses, grasps, robot configurations, trajectories, timing parameters.

**TAMP with VLMs** (slide 25–26): Yang et al., ICRA 2025 shows VLMs can guide long-horizon TAMP by proposing symbolic plan skeletons (e.g., `pick(left-arm, cabbage)`, `place(left-arm, cabbage, pot)`) which are then grounded by a motion planner. When initial plans fail (e.g., due to occlusion), the VLM can propose alternative task sequences.

---

### Slides 27–30 — Hierarchical Reinforcement Learning (HRL)

**Setup** (slide 27): HRL jointly learns both levels from environment reward:
- High level: $z_k \sim \pi_H(z_k \mid s_{t_k})$
- Low level: $a_t \sim \pi_L(a_t \mid s, z_k)$

Joint objective:

$$J(\pi_H, \pi_L) = \mathbb{E}\!\left[\sum_t \gamma^t\, r(s_t, a_t)\right]$$

The core difficulty: **how to assign credit between high-level and low-level policies?** As the low-level policy changes during training, old high-level experience becomes off-policy.

**Option Framework** (slides 28–29): An option is a temporally extended action:

$$o = (I_o,\ \pi_o,\ \beta_o)$$

- $I_o$: **Initiation set** — states where option $o$ is available ($s \in I_o$)
- $\pi_o(a \mid s)$: **Intra-option policy** — primitive actions taken while $o$ is active
- $\beta_o(s)$: **Termination condition** — probability of terminating at state $s$

Execution loop at test time:
```
Observe s_0
Choose o_0 ~ π_Ω(o | s_0)
For t = 0, 1, 2, ...:
    Observe s_t
    If β_{o_t}(s) = 1:
        Choose o_t ~ π_Ω(o | s_t)   # reselect option
    Choose a_t ~ π_{o_t}(a | s_t)
    Execute a_t
```

**HIRO** (slide 30): Nachum et al. Key insight for the off-policy problem: *relabel high-level goals*.

When the low-level policy has changed, old experience $(s_t, g, s_{t+1}, \ldots)$ is no longer valid for the high-level policy because the same goal $g$ would now produce different low-level behavior. HIRO relabels the goal $g$ to $\tilde{g}$ — the goal that would have made the *observed* low-level behavior most likely under the *current* low-level policy — enabling off-policy training of $\pi_H$.

---

### Slides 31–32 — Unsupervised Skill Discovery (DIAYN)

**Motivation** (slide 31): Can a robot learn useful skills *before* knowing the downstream task?

Skill discovery learns behaviors indexed by a latent variable $z$:

$$z \sim p(z), \quad a_t \sim \pi(a \mid s_t, z)$$

Desired properties of discovered skills:
- **Diverse**: different $z$ values lead to visibly different behaviors
- **Controllable**: the latent code $z$ reliably determines what behavior emerges
- **Persistent**: the behavior corresponding to $z$ is consistent over an episode
- **Reusable**: skills can be composed by a downstream policy

**DIAYN** (slide 32): Eysenbach et al. Learns skills by maximizing the distinguishability of visited states.

Training procedure:
1. Sample a skill: $z \sim p(z)$
2. Run the skill-conditioned policy: $a_t \sim \pi(a_t \mid s_t, z)$
3. Train a discriminator to infer the skill from the state: $q_\phi(z \mid s)$
4. Use intrinsic reward: $r_z(s) = \log q_\phi(z \mid s) - \log p(z)$

Objective intuition:

$$\max\ I(S; Z) + H(A \mid S, Z)$$

- $I(S; Z)$: skills should visit different states (high mutual information between skill and states visited)
- $H(A \mid S, Z)$: skills should be diverse in action space given state and skill label

The discriminator $q_\phi(z \mid s)$ is trained to distinguish which skill produced a given state; the policy is trained to maximize this discriminator's confidence — a self-supervised loop that requires no task reward.
