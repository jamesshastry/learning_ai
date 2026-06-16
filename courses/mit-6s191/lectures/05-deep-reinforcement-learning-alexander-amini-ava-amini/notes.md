---
type: Lecture Notes
title: "Deep Reinforcement Learning"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "05"
video: https://youtube.com/watch?v=1ij3dweHu-0
tags: [reinforcement-learning, q-learning, policy-gradient, reward, agent, deep-q-network]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Reinforcement Learning

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=1ij3dweHu-0)

## TL;DR
Alexander Amini introduces reinforcement learning as a third learning paradigm (alongside supervised and unsupervised), where agents learn by interacting with environments through state-action-reward triplets. The lecture covers Q-learning (learning value functions to derive optimal actions), Deep Q-Networks (DQN), and policy gradient methods (directly learning action probability distributions). Applications span Atari games, Go (AlphaGo/AlphaZero), autonomous driving, and LLM alignment via RLHF.

## Key Takeaways
- RL uses state-action-reward triplets; the goal is to maximize cumulative discounted reward over time
- The Q-function Q(s,a) gives the expected total return from taking action a in state s; optimal policy = argmax over actions
- Deep Q-Networks use CNNs to predict Q-values from raw pixel states; achieved superhuman Atari performance in 2015
- Q-learning limitations: only handles discrete action spaces, deterministic (always picks argmax)
- Policy gradient methods directly learn a probability distribution over actions, enabling stochastic policies and continuous action spaces
- Policy loss = -log(P(a|s)) * R(t); encourages high-reward actions and discourages low-reward ones
- Exploration vs exploitation trade-off: must balance exploiting known good policies with exploring potentially better alternatives
- RL extends to LLM alignment: human thumbs-up/down train reward models for RLHF
- Simulation is critical for safe RL training; data-driven simulators bridge the sim-to-real gap

## Detailed Notes

### RL vs Supervised vs Unsupervised [00:12-05:21]
Supervised: paired (X, Y) data, learn X→Y mapping. Unsupervised: X data only, learn distributions. RL: (state, action, reward) triplets, maximize cumulative reward. RL is temporal and involves active data collection during learning, more similar to how humans learn through interaction.

### Core RL Concepts [05:22-13:07]
Agent acts in an environment. Actions are sent to the environment; states and rewards come back. Total return R(t) = sum of future rewards discounted by gamma (gamma^k * r_{t+k}). Discounting reflects preference for immediate rewards. Rewards can be sparse (chess: only at game end) and negative.

### Q-Function and Value Learning [13:07-31:04]
Q(s,a) = expected total return from action a in state s. Optimal policy: for each state, try all actions, pick the one with max Q-value. Breakout Atari example: conservative policy (A) vs corner-breaking policy (B) -- B discovers system exploits through millions of plays. DQN architecture: input state → CNN → Q-values for all actions. Training: target = immediate reward + discounted max future Q; loss = |target - predicted Q|.

### Policy Gradient Methods [34:01-49:00]
Instead of learning Q-values, directly learn policy pi(a|s) as a probability distribution over actions. Outputs probabilities (sum to 1), enabling sampling rather than argmax. Handles continuous action spaces by learning distribution parameters (mean, variance). Self-driving example: initialize random policy, run until crash, decrease probability of near-crash actions, increase early-trajectory actions, repeat. Loss = -log(P(a|s)) * R(t).

### Applications: AlphaGo and LLMs [51:42-59:00]
AlphaGo: supervised pretraining (imitate human experts) → RL self-play → value network for board evaluation. AlphaZero: trained from scratch without human data, achieving superhuman performance across Go, Chess, and Shogi. LLM alignment: base model trained on next-word prediction, then fine-tuned with RLHF where human preferences (thumbs up/down) train a reward model.

## Notable Quotes
- "In the reinforcement learning world we actually have neither [labels nor pre-collected data]. We are actively collecting data while the model is learning." [01:07]
- "If you had this Q function, it's trivial... you just literally plug in every action, and you pick the one that's the best result." [19:06]
- "The point here is that it's probably really hard to forecast this for us as humans... our RL algorithms play like millions of times." [24:24]
- "Those likes versus dislikes, those thumbs ups or thumbs down that you give when talking to a chatbot are exactly training a reward model." [54:54]

## Concepts Introduced
- [[Q-Function]] -- expected total return for a state-action pair
- [[Deep Q-Network]] -- neural network approximating the Q-function
- [[Policy Gradient]] -- directly optimizing the action probability distribution
- [[Reward Signal]] -- scalar feedback indicating action quality
- [[Discount Factor]] -- gamma parameter weighting future vs immediate rewards
- [[Exploration vs Exploitation]] -- trade-off between trying new actions and using known good ones
- [[RLHF]] -- reinforcement learning from human feedback for LLM alignment

## Connections to Other Lectures
- Uses CNNs from Lecture 03 for visual state processing in DQN
- Policy distributions relate to VAE sampling in Lecture 04
- RLHF connects to LLM discussion in Lecture 06
- Self-driving connects to CNN applications in Lecture 03

## Open Questions
- How can RL scale to real-world environments with high-dimensional continuous state spaces?
- What are the limits of RLHF for aligning AI systems with diverse human values?
- Can offline RL (learning from pre-collected data) replace online interaction safely?
