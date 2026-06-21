---
type: Lecture Notes
title: "State Estimation"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: 18
date: 2026-03-24
slide_url: https://drive.google.com/file/d/1qLc-iFhKvOR37EhmbKPbkJl08rbSBgmZ/view?usp=sharing
tags: [state-estimation, kalman-filter, bayes-filter, robot-learning, localization, tracking, pose-estimation, slam, 3d-reconstruction]
timestamp: 2026-06-20
---

## TL;DR

State estimation is the first and foundational stage of a robotic pipeline, responsible for converting raw, high-dimensional, noisy sensor observations into compact, structured, Markovian state representations that downstream modules (modeling, planning, control) can act on. The lecture surveys both single-frame (detection, pose estimation, 3D reconstruction) and temporal (tracking, filtering, SLAM) estimation tasks, framing all of them probabilistically as inference over $p(s_t \mid o_{0:t})$. Temporal filtering methods — Bayesian filter, Kalman filter, particle filter — combine a predict step over past observations with an update step that incorporates the new measurement.

## Key Takeaways

- State estimation bridges the gap between raw sensors and downstream planning/control by producing states that are Markovian, structured, and low-dimensional.
- Raw sensor signals are often high-dimensional (images, point clouds), partially observable (occlusion), and noisy — state estimation addresses all three issues.
- Two modes of inference: single-step $p(s_t \mid o_t)$ (single-frame) and temporal $p(s_t \mid o_{0:t})$ (using all past observations).
- Most industrial robotics applications adopted deep learning first in the state estimation module (perception), before applying it to planning or control.
- Single-frame tasks covered: object detection, object pose estimation (instance-level and category-level), human pose estimation, and 3D reconstruction.
- Temporal tasks covered: single-object tracking, multi-object tracking, point tracking, localization, mapping, SLAM, and semantic SLAM.
- Filtering formalizes temporal estimation with a **predict** step $p(s_t \mid o_{0:t-1})$ and an **update** step $p(s_t \mid o_{0:t})$.
- Semantic SLAM extends geometric SLAM by annotating the map with object categories and functional affordances, enabling language-driven navigation.

## Detailed Notes

### State Estimation in the Robotic Pipeline (Slides 4–6)

A staged robotic system processes information through four sequential modules:

$$\text{Sensors} \xrightarrow{\text{State Estimation}} \xrightarrow{\text{Modeling \& Prediction}} \xrightarrow{\text{Planning}} \xrightarrow{\text{Control}} \text{Actuators}$$

**Why state estimation matters:**

Ideal states for sequential decision making must be:
- **Markovian** — sufficient statistics; no need to remember the full history $o_{0:t}$ once $s_t$ is known.
- **Structured** — facilitates prediction of actions and values (e.g., 6-DoF pose is more actionable than a raw image).
- **Low-dimensional** — tractable for downstream learning algorithms.

However, raw sensor signals violate all three desiderata:
- **Partially observable** — objects may be occluded or view-dependent.
- **Noisy** — sensors introduce stochastic measurement errors.
- **High-dimensional** — RGB images, depth maps, and point clouds are orders of magnitude larger than the true state.

**Historical note on deep learning adoption:** In industrial robotics, deep learning was initially adopted *only* for the state estimation block (perception) while modeling, planning, and control remained classical. Only later did end-to-end and learning-based control become common.

### Probabilistic Formulation (Slide 10)

State estimation is cast as probabilistic inference in a Hidden Markov Model (HMM) / state-space model:

```
o_{t-1}    o_t    o_{t+1}
   ↑         ↑       ↑
s_{t-1} → s_t → s_{t+1}
```

States $s_t$ are latent (hidden); observations $o_t$ are measured. Two inference problems:

- **Single-step inference:** $p(s_t \mid o_t)$ — estimate the current state from only the current observation.
- **Temporal inference:** $p(s_t \mid o_{0:t})$ — estimate the current state from the full history of observations up to time $t$.

### Common Types of States (Slides 7–9)

| Category | Examples |
|---|---|
| **Geometric** | Pose (position + orientation), velocity, shape |
| **Semantic** | Object category, affordance/functionality, task-relevant attributes |
| **Environment** | Scene structure, other objects, other agents (robots, humans) |
| **Robot** | Proprioception (joint angles — known/computed), global pose (estimated) |

Pose is an element of $SE(3)$, the Special Euclidean group of rigid body transformations in 3D, parameterized as $[x, y, z, \alpha, \beta, \gamma]$ (translation + Euler angles) or equivalently as a $4 \times 4$ homogeneous transformation matrix.

### Single-Frame Estimation — Detection (Slides 11–12)

**Goal:** Identify and localize objects in a single image.

**Input:** RGB image (or other visual modality).

**Output:**
- Class label for each detected object.
- Bounding box $[x, y, w, h]$ — top-left corner plus width and height.

**Challenges:**
- Occlusion (objects hidden behind others).
- Scale variation (same object appears at very different sizes).
- Clutter (many overlapping objects in dense scenes).

**Applications in robotics:** grasping pipeline (need to know *where* the object is before estimating its pose), navigation (detect pedestrians and vehicles).

**Variants:**
- *Single-object detection* — one bounding box per image.
- *Multi-object detection* — variable number of boxes; requires handling a dynamic output size.

### Single-Frame Estimation — Pose Estimation (Slides 13–17)

**Goal:** Estimate the 6-DoF pose of an object or robot in $SE(3)$.

**Output:** $[x, y, z, \alpha, \beta, \gamma]$ — three translational and three rotational degrees of freedom.

**Challenges:** shape variation across instances, partial observation and occlusion, rotational ambiguity for symmetric objects.

**Applications:** grasping, manipulation (need metric pose, not just bounding box).

#### Instance-Level Pose Estimation (Slide 14)

Assumes the **exact 3D CAD model** of the object is known. Given that model, a deep network or geometric solver estimates the pose that best aligns the model with the observed image or point cloud.

#### Category-Level Pose Estimation (Slide 15)

When the exact instance model is unavailable but the **object category** is known (e.g., "mug," "bottle"), and all instances within the category share similar geometry:
- Define a **canonical pose** per category.
- Jointly estimate object class $c$ and instance pose $[x, y, z, \alpha, \beta, \gamma]$ relative to that canonical frame.

This generalizes across unseen instances within the known category.

#### Pose Estimation for Robotic Grasping (Slides 16–17)

Full pipeline for bin-picking / manipulation:

1. Detect objects in the scene.
2. Estimate 6-DoF object pose.
3. Transform pre-computed grasps (from simulation or grasp planning on the 3D model) into the object frame.
4. Convert grasp: camera frame $\rightarrow$ world frame $\rightarrow$ robot frame.
5. Execute the grasp.

Key insight: pose estimation enables **sim-to-real transfer** of grasps. Grasps planned on a clean 3D model in simulation are warped to the real observed pose, bypassing the need to re-plan in the real world.

### Single-Frame Estimation — Human Pose Estimation (Slides 22–24)

**Representation:** A human pose is a **structured state** with physical constraints:
- A set of $N$ keypoints (body joints — shoulders, elbows, wrists, hips, knees, ankles, head, etc.).
- A skeleton encoding the connectivity (edges) between joints.

This structured representation is inherently low-dimensional compared to a raw image and encodes biomechanical constraints.

**Inference formulations:**
- **Single-frame estimation:** $X_t = f(I_t)$ — predict joint locations from a single image.
- **Temporal tracking:** $X_t = f(I_{0:t})$ — predict using all video frames up to $t$, enabling temporally consistent, smoother estimates.

**Robotics applications:**
- **Motion retargeting:** Map human skeleton states/actions to robot states/actions (teleoperation, imitation learning).
- **Human-robot interaction:** Understand human intent from pose to anticipate actions and plan collaborative behavior.

### Single-Frame Estimation — 3D Reconstruction (Slides 25–27)

**Goal:** Recover the 3D geometric structure of objects or scenes from 2D images.

**Challenges:**
- *Ill-posed problem* — the mapping from 3D to 2D is many-to-one (2D $\rightarrow$ 3D ambiguity).
- Occlusion and missing observations.
- Viewpoint and scale ambiguity.
- Noise and camera calibration errors.

**Output representations:** voxel grids, meshes, point clouds, implicit functions (NeRF, SDF).

#### Multi-View 3D Reconstruction (Slide 26)

Uses multiple images from known viewpoints to triangulate 3D structure.

- **Inputs:** $N$ images $\{o_i\}_{i=0}^{N-1}$ and corresponding camera matrices $\{M_i\}_{i=0}^{N-1}$.
- **Output:** 3D structure (voxels or mesh).
- Leverages epipolar geometry — a 3D point projects to a known epipolar line in every other camera, constraining the solution.

#### Single-View 3D Reconstruction (Slide 27)

Recovers 3D structure from a **single** image; requires strong shape priors learned from data.

- **Input:** Single image $o$.
- **Output:** 3D voxels or mesh.
- **Key challenge:** Severe ambiguity; many 3D shapes project to the same 2D image. Deep networks overcome this by learning category-level priors (e.g., "cars look like this").

### Temporal Estimation — Tracking (Slides 18–21)

**Goal:** Maintain state estimates with **temporal consistency** across video frames.

**Challenges specific to tracking:**
- Appearance changes (lighting, viewpoint, deformation).
- Occlusion and missed detections (the detector may fail on individual frames).
- Drift and error accumulation over time.
- **Data association** — matching detections across frames to the correct identity ("who is who?").

**Applications:** robust detection, target following/servoing, motion forecasting.

#### Single-Object Tracking (Slide 19)

- **Inputs:** Video frames $\{o_t\}_{t=0}^{T-1}$, initial bounding box $b_0$.
- **Output:** Bounding box trajectory $\{b_t\}_{t=0}^{T-1}$.
- The tracker is initialized with the ground-truth location and must follow the target through the video.

#### Multi-Object Tracking (Slide 20)

- **Inputs:** Video frames $\{o_t\}_{t=0}^{T-1}$, initial bounding boxes $\{b_0^i\}_{i=0}^{N-1}$ for $N$ targets.
- **Output:** Per-object trajectories $\{b_t^i\}_{i=0}^{N-1}$ for $t = 0, \ldots, T$.
- Must maintain consistent identity labels across frames despite crossings and occlusions.

#### Point Tracking (Slide 21)

Track individual **keypoints or pixels** — estimating spatio-temporal correspondence.

- **Inputs:** Video frames $\{o_t\}_{t=0}^{T-1}$, initial point locations $\{x_0^i\}_{i=0}^{N-1}$.
- **Output:** Point trajectories $\{x_t^i\}_{i=0}^{N-1}$ for $t = 0, \ldots, T$.
- More fine-grained than bounding-box tracking; useful for deformable objects, optical flow.

### Temporal Estimation — Mapping and Localization (Slides 28–29)

#### Mapping

**Goal:** Build a 3D representation of the environment given known robot poses.

- **Inputs:** Images from multiple viewpoints $\{o_i\}_{i=0}^{N-1}$, known robot poses $\{x_i\}_{i=0}^{N-1}$.
- **Output:** Map $m$ of environment (voxels, point clouds, occupancy grids).
- Mapping is well-posed when poses are known; uncertainty in poses propagates directly into map quality.

#### Localization

**Goal:** Estimate the robot's pose in the world frame, given a known map.

- **Inputs:** Observations $\{o_i\}_{i=0}^{N-1}$, environment map $m$.
- **Output:** Robot poses $\{x_i\}_{i=0}^{N-1}$.
- Dual to mapping: mapping assumes known pose, localization assumes known map.

#### Simultaneous Localization and Mapping (SLAM) (Slide 30)

**Goal:** Joint estimation of map and robot pose — neither is assumed known.

- **Inputs:** Observations $\{o_t\}_{t=0}^{T-1}$, robot actions $\{a_t\}_{t=0}^{T-1}$.
- **Output:** Robot poses $\{x_t\}_{t=0}^{T-1}$ and environment map $m$.
- Classically solved with Extended Kalman Filter (EKF-SLAM), particle filters, or graph-based optimization; modern approaches use deep learning.

#### Semantic SLAM (Slide 31)

Extends geometric SLAM to include **semantic labels**:

- Not just *where* things are, but *what* they are and *how* they can be used (affordances).
- Outputs a labeled 3D map with categories (wall, floor, chair, bed, refrigerator, etc.).
- Enables high-level, language-driven commands (e.g., "Find a microwave") — the robot queries its semantic map rather than exploring blindly.

### Temporal Estimation — Filtering (Slide 32)

**Filtering** is the formal framework for estimating state over time from a sequence of observations.

Two-step recursive structure at each time $t$:

1. **Predict step:** Compute prior over current state using all previous observations:
$$p(s_t \mid o_{0:t-1}) = \int p(s_t \mid s_{t-1})\, p(s_{t-1} \mid o_{0:t-1})\, ds_{t-1}$$

2. **Update step:** Incorporate the new observation $o_t$ via Bayes' rule:
$$p(s_t \mid o_{0:t}) \propto p(o_t \mid s_t)\, p(s_t \mid o_{0:t-1})$$

**Key insight (illustrated on slide 32):** Naive averaging of noisy observations (top panel) introduces lag and over-smoothing because it treats all observations equally. Temporal filtering (bottom panel) tracks the true trajectory more closely by weighting recent observations appropriately and propagating uncertainty through the motion model.

**Three canonical filters:**

| Filter | Assumptions | Representation of $p(s_t)$ |
|---|---|---|
| **Bayesian Filter** | General; nonparametric | Any distribution |
| **Kalman Filter** | Linear dynamics, Gaussian noise | Gaussian $(\mu_t, \Sigma_t)$ |
| **Particle Filter** | Nonlinear dynamics, non-Gaussian | Weighted samples $\{s_t^{(i)}, w_t^{(i)}\}$ |

The Kalman filter is optimal under the linear-Gaussian assumption. The predict step propagates the Gaussian through the linear motion model, and the update step performs a closed-form Bayesian update (Kalman gain). Particle filters handle arbitrary nonlinear/non-Gaussian settings at the cost of higher computational load.
