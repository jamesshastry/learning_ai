---
type: Lecture Notes
title: "Introduction to Robot Learning"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "01"
slide_url: https://drive.google.com/file/d/1Wnwt55PPXzL0oT_WmXOhNUeq1bsHO06w/view?usp=sharing
tags: [robot-learning, introduction, perception, control, dexterity, generalizability]
timestamp: 2026-01-20T00:00:00Z
---

# Introduction to Robot Learning

**Course:** CS 4756/5756 Robot Learning
**Slides:** [Google Drive](https://drive.google.com/file/d/1Wnwt55PPXzL0oT_WmXOhNUeq1bsHO06w/view?usp=sharing)

## TL;DR

Robot Learning = using Machine Learning to solve Robotics. The field sits at the intersection of ML techniques (representation learning, imitation learning, reinforcement learning, dynamics learning) and robotics problems (perception, control). The central challenge is building robots that are simultaneously **dexterous** (can handle complex physical interactions) and **generalizable** (can operate across diverse environments, tasks, and instruction modalities). Two converging trends make now the right moment: rapid commoditization of robot hardware (humanoids, quadrupeds, consumer arms) and the emergence of generalizable AI models trained on internet-scale datasets.

## Key Takeaways

1. Robot Learning is formally defined as using ML to solve Robotics — not just one algorithm, but a family of techniques (representation, imitation, reinforcement, dynamics learning) applied to perception and control.
2. Robots come in many morphologies (arms, legged, humanoid, wheeled, aerial, soft); the Wikipedia definition emphasizes programmability and automatic execution of complex action sequences.
3. The two core unsolved axes are **dexterity** (high-dimensional control, complex dynamics, perception-action uncertainty) and **generalizability** (open-world variation in environment, behavior, and instruction). Their combination is the North Star.
4. Open-world generalization has three levels: environment-level (new objects/scenes), behavior-level (new tasks), and instruction-level (new modalities: language, gamepad, gesture, video).
5. The **data flywheel** (users → data → better model → more users) powers internet-scale ML but is broken in robotics because data requires costly physical interactions.
6. Unlike standard ML, robot learning requires physical interaction for data collection — this is the bottleneck distinguishing the field.
7. Rapid hardware advances (humanoid explosion in 2024, 18.6% CAGR robotics market) plus powerful AI models (ImageNet → AlphaGo → GPT-4) converge to make robot learning tractable now.
8. The course covers 5 modules: Fundamentals, Model-Free Decision Making, Model-Based Decision Making, Perception, and Frontiers (~25 lectures total).

## Detailed Notes

### What is Robot Learning? [Slides 7–8]

Robot software has historically been developed via pure **engineering** — hand-coded behaviors for constrained, structured environments (factory floors, assembly lines). The modern approach adds **learning** as a third pillar alongside engineering, operating across the triad of:

- **Perception** — interpreting sensor data (vision, lidar, tactile)
- **Control** — generating motor commands
- **Learning** — the ML glue that connects data to both

Formal definition:

> **Robot Learning = using Machine Learning to solve Robotics**

The ML side includes: representation learning, imitation learning, reinforcement learning, dynamics learning, and more. The robotics side includes: perception and control.

### Definition of Robots [Slides 4–10]

Robots have long been a cultural fixture (Metropolis, Star Wars, Transformers, Wall-E, Big Hero 6, Astro Boy), reflecting humanity's hopes and fears. In practice they appear as: robotic arms, legged robots, humanoids, wheeled robots, unmanned aerial vehicles (UAVs), and soft robots.

**Wikipedia definition:** "A robot is a machine — especially one programmable by a computer — capable of carrying out a complex series of actions **automatically**."

Two key properties: **machine** (physical instantiation) and **automatically** (autonomous execution).

The course probes edge cases: a washing machine (automatic but not general-purpose), an exoskeleton (physical DoFs but human-directed), a chatbot (intelligent but no physical embodiment).

The slide presents a 3×3 taxonomy along two axes:

| | Autonomy Purist (must be general-purpose) | Autonomy Neutral (somewhat intelligent) | Autonomy Rebel (manual ok) |
|---|---|---|---|
| **Morphology Purist** (must be humanoid) | Terminator | Atlas | Gundam |
| **Morphology Neutral** (can manipulate) | Wall-E | Industrial Arm | Excavator |
| **Morphology Rebel** (any DoFs) | L5 Vehicle | Smart Litter Box | Chopsticks |

### Why Robot Learning Now? [Slides 11–17]

**1. Hardware Advances [Slides 12–14]**

Historical milestones: Stanford Arm (1969), CMU NavLab autonomous vehicle (1984). Today: consumer-grade drones (DJI), self-driving cars (Tesla), desktop robot arms, quadrupeds (Unitree), service and social robots, robot vacuums.

Humanoid explosion (2024): HD Atlas, NED, GR-1 (Fourier), Figure, Phoenix (Sanctuary AI), Apollo (Agility), Digit, Atlas (Boston Dynamics), H1 (Unitree), Optimus Gen 2 (Tesla).

Market: Global robotics at $100.21B (2025) → projected $392.25B (2033) at **18.60% CAGR**.

**2. AI Model Advances [Slides 15–16]**

Massive datasets unlocked generalizable models:

| Dataset | Scale | Result |
|---|---|---|
| ImageNet [Deng et al. 2009] | 14M images | General visual recognition |
| AlphaGo [Silver et al. 2016] | 30M Go positions | Superhuman Go play |
| GPT-3 [Brown et al. 2020] | 45 TB of text | ChatGPT-class language models |

Historical context: In 2012, Andrej Karpathy wrote "The state of Computer Vision and AI: we are really, really far away" — illustrating a photograph that AI could not understand (the humor of a man pressing down on a scale behind someone being weighed). By 2023+, multimodal models explain that exact joke in detail. The pace of AI capability improvement is dramatic.

**3. Societal Context [Slides 17–19]**

The global robotics market is projected to nearly 4× by 2033. Despite flashy demos, robots still fail publicly at basic tasks — DARPA Robot Challenge humanoids fall over, Boston Dynamics Atlas stumbles off boxes. The gap between controlled demos and household tasks (laundry, cooking, babysitting) remains large, motivating the research agenda.

### The North Star: Dexterity + Generalizability [Slide 20]

The goal is robots that are simultaneously:

- **Dexterous** — can perform fine-grained physical manipulation (e.g., solving a Rubik's cube with a dexterous hand)
- **Generalizable** — can operate across diverse real-world settings (e.g., autonomous vehicles navigating open roads)
- **Both together** — a general-purpose household robot handling arbitrary tasks in human environments

These two axes are in tension: specialized robots optimize for dexterity; broad systems sacrifice it for generality.

### Key Challenges for Dexterity [Slide 21]

Building dexterous robots requires overcoming:

1. **High-Dimensional Control** — multi-fingered hands have many degrees of freedom; the action space is enormous and hand-engineered solutions are intractable.
2. **Complex Dynamics** — contact, friction, and deformable objects make physical interactions hard to model analytically.
3. **Perception-Action Uncertainty** — noisy sensors, partial observability, and the need to close the loop between sensing and acting in real time. (Point cloud reconstructions of objects illustrate this — significant noise and missing data.)

### Key Challenges for Generalizability [Slides 22–23]

**Open-World Generalization** decomposes into three levels:

1. **Environment-Level** — generalizing to new objects, textures, scene layouts not seen during training (e.g., different cleaning tools, new snack bags).
2. **Behavior-Level** — generalizing to new tasks or skill compositions (e.g., hammering vs. screwing).
3. **Instruction-Level** — generalizing across instruction modalities: natural language commands, gamepad input, hand gesture, demonstration video.

### The Data Flywheel Problem [Slide 24]

Standard ML benefits from a self-reinforcing data flywheel:

> **Users → more training data → better performance → more users → ...**

Robotics breaks this flywheel: each data point requires real hardware, real time, and real risk of failure. Data collection is slow and expensive. This is the fundamental bottleneck distinguishing robot learning from internet-scale ML.

### ML vs. Robot Learning [Slide 25]

| Dimension | Machine Learning | Robot Learning |
|---|---|---|
| Data variety | Various tasks, modalities (digital) | Various environments, tasks, robots (physical) |
| Data collection | Cheap, scalable, parallelizable | Requires physical interactions; slow and expensive |
| Feedback | Dense, instant (often simulated) | Sparse, delayed, real-world |

### Why Study Robot Learning? [Slide 26]

Reasons to take the course:
- Make AI work in the physical world (not just digital)
- Combine multiple disciplines (ML, control theory, computer vision, physics)
- A long-term career opportunity — the field is still early

### Course Structure [Slides 27–40]

**Learning Objectives [Slide 27]:**
1. Formulate various robot perception and control problems
2. Implement and compare deep learning approaches for robotics
3. Identify challenges in robot learning and apply appropriate mitigation techniques
4. Design and benchmark robot learning algorithms using open-source datasets and simulation platforms

**5-Module Syllabus [Slides 28–34]:**

| Module | Lectures | Topics |
|---|---|---|
| 1. Fundamentals | ×4 | Intro to Robot Learning; Fundamentals of Robotic Control; Robotic Control as MDPs; Deep Learning Tutorials |
| 2. Model-Free Decision Making | ×6 | Imitation Learning I & II; Intro to RL; Policy Gradients; Actor-Critic Algorithms; Robot Learning with Q Functions |
| 3. Model-Based Decision Making | ×4 + tutorial | Model Predictive Control I & II; Reward Estimation; Dynamics Learning; Simulation Tutorials |
| 4. Perception | ×4 | Camera Models & Images; 2D Visual Representations; 3D Visual Representations; Detection & Pose Estimation |
| 5. Frontiers | ×7 | Goal-Conditioned Learning; Multi-Task Learning; RL from Offline Data; Advanced Network Architectures; Manipulation; Navigation & Locomotion; Benchmarking Robot Learning |

**In-class Prelim [Slide 33]:** Review session + in-class prelim on 04/09/2025.

**Prerequisites [Slide 35]:**
- Math (required): probability theory, multivariable calculus, linear algebra (MATH 1920/2220, MATH 2940)
- ML (required): stochastic gradient descent, logistic regression (CS 4780 or equivalent)
- Deep learning (recommended): backpropagation, convolutional networks
- Programming (recommended): Python, PyTorch/TensorFlow/JAX

**Grading [Slide 38]:**
- Assignments: 50% (6 assignments: first worth 5%, five at 9% each)
- In-class Prelim: 20% (10% per presentation)
- Course Project: 20% (Final Report 10% + Final Video 10%)
- Participation: 10% (in-class quizzes)

**Assignments [Slide 36]:** 6 total; Assignment 0 checks prerequisites. Late policy: 3 total late days for the semester; exceeding those incurs a 33% penalty per extra day.

**Course Project [Slide 37]:** Teams of 1–3 people on a research project related to course topics. Support: project ideas list, Google Cloud credits, WidowX robot arms in lab. Deliverables: proposal (week 9), final report (final week), final video (final week). No late days apply to project deliverables.

**Resources [Slide 39]:** https://www.cs.cornell.edu/courses/cs4756 | Ed & Gradescope via Canvas | Office hours from week 2.
