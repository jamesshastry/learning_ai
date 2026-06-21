---
type: Lecture Notes
title: "Fundamentals of Robotic Control"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: "02"
slide_url: https://drive.google.com/file/d/1Na52cJko3Uo1X_S8szXYPvZsg3KHoMwm/view?usp=sharing
tags: [robotic-control, kinematics, dynamics, degrees-of-freedom, configuration-space, perception-action-loop, robot-learning]
timestamp: 2026-01-22T00:00:00Z
---

# Fundamentals of Robotic Control

**Course:** CS 4756/5756 Robot Learning
**Instructor:** Kuan Fang
**Date:** January 22, 2026
**Slides:** [Google Drive](https://drive.google.com/file/d/1Na52cJko3Uo1X_S8szXYPvZsg3KHoMwm/view?usp=sharing)

## TL;DR

This lecture establishes the mechanical and computational foundations of robotic systems: how robots are physically structured (rigid bodies, joints, links, DoFs), how their geometry is described (forward/inverse kinematics, configuration space, workspace, task space), and how a classical staged robotic pipeline (state estimation → modeling/prediction → planning → control) works. The lecture closes by motivating the robot learning approach — progressively replacing hand-engineered pipeline stages with learned neural network components.

## Key Takeaways

1. Robots are modeled as **articulated rigid bodies** composed of links connected by joints; motors (actuators) drive motion by supplying force and torque.
2. **Degrees of Freedom (DoF)** quantify a system's independent parameters; Grübler's formula $\text{dof} = m(N-1) - \sum_{i=1}^{J} c_i$ connects joint constraints to total robot DoF.
3. **Configuration Space (C-Space)** is the full space of all configurations; **Workspace** is what the end-effector can reach; **Task Space** is defined by the task, not the robot.
4. **Forward Kinematics (FK)** maps joint positions → end-effector pose; **Inverse Kinematics (IK)** maps desired end-effector pose → joint positions.
5. A classical robotic system decomposes into four staged modules: **State Estimation → Modeling & Prediction → Planning → Control**.
6. Deep learning entered robotics progressively — first replacing state estimation, then planning, now enabling fully end-to-end learned policies.
7. Recent robot learning advances are driven by simulation data, better teleoperation interfaces, large-capacity architectures (diffusion models, transformers), and foundation models (LLMs/VLMs).

## Detailed Notes

### Slides 1–3: Course Logistics

- **Assignment 0** (Numpy and PyTorch) posted; due **January 30, 2026 at 11:59 PM EST**.
  - Submit: `CS_4756_Assignment_0.ipynb`, `q1.py`, `q2.py`, `best_model_checkpoint.pth`, `q2_test.png` — all in a zip file to Gradescope.
- Enrollment: waitlist students should use the Bowers CIS Add/Drop process.

---

### Slides 4–8: Robot Structure

#### Slide 4 — What Is a Robot?

> "A robot is a machine — especially one programmable by a computer — capable of carrying out a complex series of actions automatically."

Types of robots covered in the course:
- **Robotic arms** — industrial manipulators (e.g., factory assembly)
- **Legged robots** — quadrupeds (e.g., Boston Dynamics Spot)
- **Humanoids** — bipedal, full-body robots
- **Wheeled robots** — mobile platforms
- **UAVs** — unmanned aerial vehicles / drones
- **Soft robots** — deformable, compliant body structures

#### Slide 5 — Robots as Rigid Bodies

Robot movement is represented as **rigid-body motion**: a body that does not deform during movement.

- **SE(2)** — Special Euclidean group of rigid-body motion in 2D
  - State: $(x, y, \theta)$ — position plus heading angle
  - Example: a wheeled robot on a plane
- **SE(3)** — Special Euclidean group of rigid-body motion in 3D
  - State: position + orientation described by **roll, pitch, yaw**
  - Example: a drone (UAV) flying in space

The SE groups encode both rotation ($SO(n)$) and translation ($\mathbb{R}^n$), making them the natural home for robot pose.

#### Slide 6 — Actuators

Most modern robots use **motors as actuators** — devices that supply motive power (force and torque).

| Type | Description |
|---|---|
| **Stepper motors** | Electromagnetic; move in discrete steps; precise position control |
| **Servomotors** | Electromagnetic; closed-loop feedback; high-precision speed/position |
| **Hydraulic motors** | Use pressurized fluid; high force output; used in heavy-duty robots |

Stepper and servomotors are collectively called **electromagnetic actuators**.

#### Slide 7 — Articulated Rigid Bodies

Motor-actuated robots are modeled as **articulated rigid bodies**:

- **Link** — a single rigid body segment
- **Joint** — the connection between two links (provides relative motion)
- **End Effector** — a device attached to a specific link (typically the last link/tip of an arm); interacts with the environment

Example (Hildebrandt et al. 2019): a humanoid robot's body structure represented as a kinematic tree of links and joints.

#### Slide 8 — Example: Robotic Arms

Two common robotic arm platforms:
- **Franka Emika Panda** — 7-DOF arm with 7 links (link 0–7) and joints including a spherical shoulder, elbow offset, and non-spherical wrist
- **Universal Robots UR3** — 6-DOF arm; widely used in research and industry

Common **end effectors**:
- **Parallel jaw gripper** — binary open/close; simplest and most common
- **Suction cup** — vacuum-based pick-and-place; widely used in logistics
- **Dexterous hand** — multi-finger; can perform complex grasps and in-hand manipulation

---

### Slides 9–13: Degrees of Freedom and Configuration Space

#### Slide 9 — Degrees of Freedom (DoF)

> "The **Degrees of Freedom (DoF)** of a mechanical system is the number of independent parameters that define its configuration or state."

Examples:
| System | DoF | Parameters |
|---|---|---|
| 2D point | 2 | $(x, y)$ |
| 2D line segment | 3 | $(x, y, \theta)$ — position + orientation |
| 3D rigid body | 6 | $(x, y, z)$ + roll, pitch, yaw |

A 3D rigid body has **6 DoF**: 3 translational + 3 rotational (roll, pitch, yaw).

#### Slide 10 — Robot Joints

A joint allows one rigid body to move relative to another. It simultaneously:
- **Provides freedoms** (the DoFs it enables)
- **Provides constraints** (restricts certain motions)

Joint types (from Lynch & Park, *Modern Robotics*):

| Joint | Abbreviation | DoF $f$ | Motion |
|---|---|---|---|
| Revolute | R | 1 | Rotation about a single axis |
| Prismatic | P | 1 | Linear sliding along one axis |
| Helical | H | 1 | Screw motion (combined rotation + translation) |
| Cylindrical | C | 2 | Rotation + independent translation along same axis |
| Universal | U | 2 | Two revolute axes at right angles |
| Spherical | S | 3 | Rotation about any axis through a point (ball joint) |

Discussion questions posed in lecture:
- A spherical joint has **3 DoF**.
- A human arm (excluding hand) has approximately **7 DoF** (shoulder 3, elbow 1, forearm rotation 1, wrist 2).
- A human hand has approximately **21–27 DoF**.

#### Slide 11 — Grübler's Formula

For a system of $N$ rigid bodies connected by $J$ joints in $m$-dimensional space:

$$\text{dof} = m(N-1) - \sum_{i=1}^{J} c_i$$

Where:
- $m = 3$ for planar bodies, $m = 6$ for spatial (3D) bodies
- $N$ = number of rigid bodies (including ground/base)
- $c_i$ = constraints imposed by joint $i$

Constraint table (from Lynch & Park):

| Joint type | DoF $f$ | Constraints $c$ (planar) | Constraints $c$ (spatial) |
|---|---|---|---|
| Revolute (R) | 1 | 2 | 5 |
| Prismatic (P) | 1 | 2 | 5 |
| Helical (H) | 1 | N/A | 5 |
| Cylindrical (C) | 2 | N/A | 4 |
| Universal (U) | 2 | N/A | 4 |
| Spherical (S) | 3 | N/A | 3 |

Note: $f = m - c$ (freedoms = space dimension minus constraints).

#### Slide 12 — Configuration Space (C-Space)

> "The **Configuration Space (C-Space)** is the space of all configurations of the body."

Each distinct configuration is a point in C-Space. The topology of C-Space depends on the system:

| System | C-Space topology | Sample representation |
|---|---|---|
| Point on a plane | $\mathbb{R}^2$ | $(x, y)$ |
| Spherical pendulum | $S^2$ | (latitude, longitude) $\in [-180°, 180°] \times [-90°, 90°]$ |
| 2R robot arm | $T^2 = S^1 \times S^1$ | $(\theta_1, \theta_2) \in [0, 2\pi) \times [0, 2\pi)$ |
| Rotating sliding knob | $\mathbb{E}^1 \times S^1$ | $\mathbb{R}^1 \times [0, 2\pi)$ |

The dimension of C-Space equals the system's DoF.

#### Slide 13 — Workspace

> "The **Workspace** is the specification of the configurations that the end-effector of the robot can reach."

- Determined entirely by **robot structure** (link lengths, joint limits)
- **Independent of the task**
- Example: ABB IRB120 6-DOF industrial robot has a reachable workspace of ~580 mm radius; the workspace diagram shows the reachable volume from side and top views, with an inner dead zone (minimum turning radius ~R109.4 mm).

#### Slide 14 — Task Space

> "The **Task Space** is the space in which the robot's task can be naturally expressed."

- Determined by **the task**, not the robot structure
- Independent of the robot

Examples:
- **Writing on a whiteboard**: task space = whiteboard surface = $\mathbb{R}^2$
- **Cleaning a floor**: task space = $(x, y)$ pose of the vacuum cleaner's base on the floor plane

Task space and C-Space can have very different dimensionalities (e.g., a 7-DOF arm writing on a 2D whiteboard).

---

### Slides 15–16: Kinematics

#### Slide 15 — Forward Kinematics (FK)

**Problem statement:** Given link lengths $l_1, l_2$ and joint angles $t_1, t_2$, find the end-effector pose $(x, y, t_f)$.

For a 2-link planar arm:
$$x = l_1 \cos(t_1) + l_2 \cos(t_1 + t_2)$$
$$y = l_1 \sin(t_1) + l_2 \sin(t_1 + t_2)$$
$$t_f = t_1 + t_2$$

- FK is always well-defined and has a **unique solution** (given a configuration, there is exactly one end-effector pose)
- Direction: **joint space → task/Cartesian space**

#### Slide 16 — Inverse Kinematics (IK)

**Problem statement:** Given link lengths $l_1, l_2$ and desired end-effector pose $(x, y, t_f)$, find the joint angles $(t_1, t_2)$.

- IK can have **zero, one, or multiple solutions** (e.g., elbow-up vs. elbow-down configurations)
- Can be analytically intractable for high-DoF robots → numerical/optimization methods
- Direction: **task/Cartesian space → joint space**

IK is the core challenge for executing task-space goals on joint-actuated robots.

---

### Slide 17: Quiz (In-Class)

Live poll at PollEv.com/kuanfang905. (Questions not shown in slides.)

---

### Slides 18–26: The Robotic Control Pipeline

#### Slide 18 — The Perception-Action Loop

> "A key challenge in robotics is to close the **perception-action loop**."

The robot must continuously:
1. **Perceive** the environment (via sensors)
2. **Act** on the environment (via actuators)

This closed loop is the defining challenge for autonomous robots. Referenced work: Sa et al. IROS 2014; Levine et al. JMLR 2016; Bohg et al. ICRA 2018.

#### Slide 19 — Staged Robotic System

A classical autonomous robotic system is decomposed into four sequential modules:

```
Sensors → [State Estimation] → [Modeling & Prediction] → [Planning] → [Control] → Actuators
```

Each module has a well-defined input/output interface.

#### Slide 20–22 — State Estimation

**Role:** Find the state (position, orientation, velocity, etc.) from noisy sensor inputs.

**Sensor hardware examples** (from HKU Advanced Robotics Lab):
- 2 fisheye cameras
- Multisense Head (3D laser scanner + stereo camera)
- IMU (Inertial Measurement Unit)
- Six-axis force/torque sensor
- Strain gauge pressure sensors
- RGB-D cameras, tactile sensors

**Processing pipeline** (slide 21):
- Raw sensor inputs → Detection, Segmentation, Pose Estimation, 3D Reconstruction → Environment states

**Core challenges** (slide 22):
- **High dimensionality** — raw sensor data (images, point clouds) is very high-dimensional
- **High diversity** — the robot must handle enormous variety in objects and scenes
- **Sensor noise** — noisy, incomplete 3D reconstructions
- **Multiple modalities** — vision, depth, force, proprioception must be fused

#### Slides 23–24 — Modeling and Prediction

**Role:** Model and forecast the properties of the robot and the environment.

Examples:
- Predicting the trajectory of other vehicles at an intersection (self-driving)
- Modeling object geometry and contact physics for manipulation

**Challenges:**
- **High DoFs** — complex robots like dexterous hands have many interacting degrees of freedom
- **Complex environments** — outdoor terrain, cluttered scenes
- **Human behaviors** — predicting social agents requires understanding intent

#### Slide 25 — Planning

**Role:** Determine the behaviors that will achieve the goal while satisfying constraints.

- Outputs a sequence of actions/waypoints
- Must respect joint limits, collision avoidance, task objectives
- Tools: sampling-based planners (RRT, PRM), optimization-based planners
- Example: Open Motion Planning Library (OMPL) planning collision-free paths in 3D environments

#### Slide 26 — Control

**Role:** Choose the motor commands (forces and torques) to execute the desired behaviors.

Control loop:
```
desired behavior → [controller] → forces & torques → [dynamics of arm & environment] → motions & forces
                        ↑_______________feedback____________________________________________|
```

**Control objectives:**
- **Motion control** — track a desired trajectory in joint or Cartesian space
- **Force control** — regulate contact forces
- **Hybrid motion-force control** — control motion in some directions, force in others
- **Impedance control** — regulate the dynamic relationship between force and motion

---

### Slides 27–40: Deep Learning Revolution in Robotics

#### Slide 27 — Deep Learning in Other Domains

In computer vision and NLP, hand-designed feature extractors have been replaced by end-to-end learned neural networks (e.g., AlexNet/CNNs replacing HOG/SIFT features). This raises the question for robotics.

#### Slide 28 — Should Robotics Be End-to-End Learned?

Classical pipeline: `Sensors → State Estimation → Modeling → Planning → Control → Actuators`

The deep learning question: can we replace the entire pipeline with a single neural network? `Sensors → [Neural Network] → Actuators`

#### Slides 29–36 — How Deep Learning Entered Robotics (Progressive)

**Phase 1: Deep learning for state estimation only** (slide 31)

Industrial applications started by using deep learning solely to improve perception (state estimation), while keeping downstream planning and control classical.

**Example: Warehouse Logistics** (slide 32)
- Deep learning-powered segmentation and pose estimation widely adopted ~2016
- Enables robots to grasp novel objects in unstructured bin-picking scenarios

**Example: Autonomous Driving** (slide 33)
- Object detection and activity forecasting (predicting other vehicles' trajectories)
- Core to all autonomous vehicle stacks

**Phase 2: Deep learning for control/planning** (slide 34)

The revolution progressed to replace planning and control stages:

**Example: Google Arm Farm** (slides 29, Levine et al. 2016)
- 14 robotic manipulators ran continuously to collect **800,000+ grasp attempts**
- Trained a CNN grasp prediction model end-to-end from raw images
- Demonstrated that large-scale self-supervised robot data can train effective policies

**Example: OpenAI Rubik's Cube** (slide 30, OpenAI 2018)
- Architecture: camera images → CNN → Cube Pose + Face Angles → LSTM → Actions
- Used **domain randomization** (randomized parameters and appearances) to generate massive simulation data
- Trained both the control policy and vision-based state estimator using this data
- Demonstrated dexterous in-hand manipulation with a Shadow Hand

**Example: Bipedal Locomotion** (slide 35, Green et al. 2021)
- A **Reduced Order Model Library** generates motion commands at planning level
- A **learned controller** (neural network) maps motion commands + observed state → actions
- Combines model-based planning with learned low-level control

**Example: Quadruped Locomotion** (slide 36, Green et al. 2020)
- Two-tier system running at different frequencies:
  - **50 Hz**: Neural network policy → foot position residuals + leg frequencies/phases → Foot Trajectory Generator
  - **400 Hz**: Inverse Kinematics → Joint PD controller + Robot Dynamics (motion tracking)
- Neural network handles high-level motion generation; classical IK/PD handles low-level tracking

#### Slides 37–40 — Recent Advances in Robot Learning

**Simulation** (slide 37)
- Physical simulation is a major data source (Nvidia Isaac Sim, Meta Habitat)
- Benefits: fast prototyping, easy to scale up, privileged information access, reproducibility
- Key challenge: **sim-to-real gap** (simulation does not perfectly match real physics)

**Teleoperation** (slide 38)
- Convenient human-robot interfaces boost quantity and quality of expert demonstration data
- Examples:
  - **Mobile ALOHA** (Fu & Zhao et al. 2024): whole-body teleoperation rig for household tasks
  - **Shadow Hand + Glove**: dexterous teleoperation using a data glove

**Model Architectures** (slide 39)
- **Diffusion Policy** (Chi et al. 2023): uses diffusion models to learn multimodal action distributions
- **Transformer Policy** (PI 2024): large-capacity transformer architecture for generalist manipulation

**Broader Knowledge via Foundation Models** (slide 40)
- LLMs and VLMs inject broad world knowledge into robot systems
- **Code-as-Policies** (Huang et al. 2022): LLM writes robot policy code using perception/control APIs, enabling flexible task specification through language
- **MOKA** (Fang & Liu et al. 2024): vision-language models plan multi-step manipulation tasks from language instructions (Prof. Fang's own work)

---

## Summary Diagram: Classical vs. Learned Robotic Pipeline

```
Classical:
Sensors → [State Est.] → [Modeling] → [Planning] → [Control] → Actuators
            (hand-eng.)   (hand-eng.)  (hand-eng.)  (hand-eng.)

DL Phase 1 (perception only):
Sensors → [Deep NN] → [Modeling] → [Planning] → [Control] → Actuators

DL Phase 2 (planning/control):
Sensors → [State Est.] → [Modeling] → [Deep NN] → Actuators

End-to-end:
Sensors → [Deep NN] → Actuators
```
