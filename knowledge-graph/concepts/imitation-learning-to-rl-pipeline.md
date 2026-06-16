---
aliases: ["demonstration to self-play", "behavioral cloning to RL"]
tags: [training, methodology]
type: concept
first_seen: cs294-agentic-f25/10
sources:
  - course: cs294-agentic-f25
    lecture: "10"
    timestamps: ["20:00"]
---
# Imitation Learning to RL Pipeline

Two-stage training approach: first imitate expert demonstrations (human replays in games, SFT in LLMs), then improve beyond demonstration quality via RL/self-play. Used by AlphaStar, DeepSeek R1, and most modern agentic model training.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 10**

## Related Concepts

- [[AlphaStar]] (used by) — AlphaStar pre-trained on human replays then improved via self-play
- [[Supervised Fine-Tuning]] (analogous to) — SFT in LLMs parallels imitation learning in game AI
