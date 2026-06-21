---
type: lecture_notes
title: "Simulation"
course: CS 4756/5756 Robot Learning
university: Cornell University
lecture_id: 14
slide_url: https://drive.google.com/file/d/1okGJT6r_KEzBJh3z5A7OFXnEB9WYa1B6/view?usp=sharing
tags: [simulation, physics-engine, urdf, mujoco, pybullet, reality-gap, sim-to-real, digital-twin, contact-collision, convex-decomposition]
timestamp: 2026-03-10
---

## TL;DR

Simulation is the environment in which robot learning algorithms are trained. This lecture covers how simulators work (rigid bodies, contact/collision, deformation), how robots and objects are represented (meshes, URDF, convex decomposition, textures), how to pick a simulator (MuJoCo vs PyBullet vs ManiSkill vs Isaac Gym), how to build simulated environments using the OpenAI Gym interface, and the fundamental sim-to-real challenge — the reality gap arising from imperfect physics modeling and perception differences.

## Key Takeaways

1. **Simulation = contact collision solver** + rigid-body dynamics. Rendering is decoupled from physics in modern simulators.
2. **Visual mesh vs. collision mesh**: detailed mesh for rendering, simplified convex-hull mesh for physics. Fewer contacts = faster simulation.
3. **URDF** (Unified Robot Description Format) specifies links, joints, visual/collision/inertial properties, and parent-child relationships. The standard format for robot simulation.
4. **Simulator choice tradeoffs**: MuJoCo (fast, easy, good physics, mediocre rendering); PyBullet (normal speed, easy, good physics, basic rendering); ManiSkill (GPU-parallel, better physics and rendering); Isaac Gym (GPU-parallel, good physics, medium config difficulty).
5. **Reality gap**: simulators are imperfect due to unknown object properties, unknown physics parameters, inaccurate models, and limited computation. "All models are wrong, but some are useful." (Box, 1976)
6. **Digital twins and generative AI** are emerging tools to automatically create diverse, realistic simulated environments.

---

## Detailed Notes

### Section 1 — What is a Simulator? (Slides 1–8)

A robot learning simulator provides:
- **Physics engine**: computes forces, torques, and state transitions under physical laws
- **Renderer**: produces visual observations (RGB, depth, segmentation)
- **Contact/collision solver**: detects and resolves object interactions

**Key fact**: Simulation is in essence a **contact collision solver**. It runs faster when:
- There are fewer contacts
- Contacts that exist are between simple primitive shapes

---

### Section 2 — 3D Object Representation (Slides 9–14)

#### 2.1 Mesh (Slides 9–10)

A **mesh** is a collection of vertices, edges, and faces (polygons) defining a 3D surface. Standard format: `.obj` file.

- Vertices: $(x, y, z)$ coordinates
- Faces: lists of vertex indices forming triangles or quads

Meshes serve two distinct roles in simulation:
- **Visual mesh**: detailed, high-polygon, used for rendering
- **Collision mesh**: simplified, used for physics — fewer polygons = faster collision detection

#### 2.2 Contact and Collision (Slide 15)

Physics engines detect and resolve:
- **Contact points**: where two surfaces intersect
- **Contact forces**: normal force (perpendicular to contact surface) and friction force (tangential to contact surface, opposing velocity $v$)

Applications shown: rigid block collision, multi-object scenes, dexterous hand grasping, humanoid locomotion.

#### 2.3 Deformation (Slide 16)

Most simulators assume **rigid bodies** — objects that don't deform. But many real-world tasks require:
- Soft bodies (cloth, deformable foam)
- Liquids and granular materials

Simulating deformable objects is an **active research area** with specialized FEM (finite element method) and particle-based simulators.

#### 2.4 Convex Decomposition (Slide 17)

**Problem**: Complex concave shapes are expensive for collision detection.

**Solution — Convex decomposition**: decompose a concave mesh into multiple convex hulls.

- Exact convex decomposition: may require thousands of parts (e.g., 7611 for a Stanford bunny)
- **Approximate convex decomposition** (e.g., V-HACD algorithm): 20 parts — practical approximation

Convex shapes enable fast, exact collision detection algorithms (GJK, EPA).

#### 2.5 Texture and UV Mapping (Slides 18–19)

**Textures** are 2D images applied to 3D surfaces to achieve visual realism.

**UV mapping**: the 3D modeling process of projecting a 3D model's surface onto a 2D image for texture mapping.
- 3D point $p = (x, y, z)$ maps to UV coordinate $p = (u, v)$
- Texture image sampled at $(u, v)$ gives the surface color

Material files (`.mtl`) specify:
- `Ka`: ambient color
- `Kd`: diffuse color
- `Ks`: specular color
- `map_Kd`: diffuse texture map (`.jpg`)
- `map_Bump`: normal/bump map
- `map_Ks`: specular map

#### 2.6 Visual Mesh vs. Collision Mesh (Slides 20–21)

| | Visual Mesh | Collision Mesh |
|---|---|---|
| Purpose | Rendering | Physics |
| Detail level | High (many polygons) | Low (simplified primitives) |
| Example | Full robot body mesh | Cylinders + spheres approximating limbs |

Running overlaid: visual mesh shows the realistic appearance; collision mesh shows the simple geometric primitives used for physics.

---

### Section 3 — Robot Representation (Slides 22–25)

#### 3.1 Articulated Rigid Bodies (Slide 22)

Robots actuated by motors are modeled as **articulated rigid bodies** consisting of:
- **Link**: a single rigid body segment
- **Joint**: the connection between two links (defines allowed relative motion)
- **End Effector**: a device attached to a specific link, typically at the end of the arm (gripper, tool)

Joint types: revolute (1 rotational DoF), prismatic (1 translational DoF), fixed, continuous, planar, floating.

#### 3.2 Unified Robot Description Format (URDF) (Slides 23–25)

**URDF** is the standard XML format for specifying robots in ROS/simulation:

```xml
<robot name="my_robot">
  <link name="link1">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry><box size="0.5 0.1 0.1"/></geometry>
      <material name="red"><color rgba="1 0 0 1"/></material>
    </visual>
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry><box size="0.5 0.1 0.1"/></geometry>
    </collision>
  </link>

  <joint name="fixed_joint" type="fixed">
    <parent link="base_link"/>
    <child link="link1"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
  </joint>
</robot>
```

Each link specifies three representations:
- **Visual**: mesh/geometry + texture for rendering
- **Collision**: simplified mesh for physics
- **Inertial**: mass and inertia tensor for dynamics

**Finding URDFs:**
- For robots: manufacturer's website or GitHub (e.g., `franka_description` package)
- For objects:
  1. Get `.obj` + `.mtl` from ShapeNet, YCB dataset, or 3D scanning
  2. Run convex decomposition (V-HACD)
  3. Create the URDF

---

### Section 4 — Simulators and Environments (Slides 26–32)

#### 4.1 PyBullet Example (Slide 26)

```python
import pybullet as p
import time, pybullet_data

physicsClient = p.connect(p.GUI)           # L5: Initialize simulator + renderer
p.setGravity(0, 0, -9.8)                  # L7: Set gravity
planeId = p.loadURDF("plane.urdf")        # L9: Load the plane
startPos = [0, 0, 1]
startOrientation = p.getQuaternionFromEuler([0, 0, 0])
boxId = p.loadURDF("r2d2.urdf", startPos, startOrientation)  # L11-13: Load robot

for i in range(10000):
    # TODO: Send control commands
    p.stepSimulation()                    # L15-18: Simulation loop
    time.sleep(1./240.)

cubePos, cubeOrn = p.getBasePositionAndOrientation(boxId)  # L20-21: Query state
print(cubePos, cubeOrn)
p.disconnect()                            # L23: Disconnect
```

#### 4.2 Why So Many Simulators? (Slide 27)

Different simulators optimize for different goals:
- **Physics accuracy**: contact modeling, friction, tendon dynamics
- **Rendering realism**: can be decoupled from physics engine
- **Speed**: CPU-based vs. GPU-parallelized
- **GPU scalability**: training thousands of envs simultaneously
- **Deformable object simulation**

#### 4.3 Simulator Comparison (Slide 28)

| | MuJoCo | PyBullet | ManiSkill | Isaac Gym |
|---|---|---|---|---|
| **Speed** | fast | normal | faster on GPUs | faster on GPUs |
| **Physics** | good | good | better | good |
| **Rendering** | meh | basic | better | basic |
| **Easy to configure** | easy | easy | easy | medium |

**Recommendations:**
- MuJoCo: standard for locomotion and manipulation research
- PyBullet: good for prototyping, easy Python API
- ManiSkill: when GPU parallelism + better rendering needed
- Isaac Gym: large-scale GPU training at Meta/OpenAI scale

#### 4.4 OpenAI Gym Interface (Slide 29)

The standard API for RL environments:

```python
import gym
env = gym.make("LunarLander-v2", render_mode="human")
env.action_space.seed(42)

observation, info = env.reset(seed=42)

for _ in range(1000):  # Each step can take multiple simulation steps
    observation, reward, terminated, truncated, info = env.step(env.action_space.sample())
    if terminated or truncated:
        observation, info = env.reset()

env.close()
```

Key methods: `reset()`, `step(action)`, `close()`.

#### 4.5 Manual Design of Simulated Environments (Slide 30)

Standard procedure for building a new simulated task:

1. Add basic simulator utilities (hyperparameters, initialization, reset, step)
2. Specify the environment (robots, objects, initial poses) in `init` and `reset`
3. Specify sensors (cameras, contact sensors) in `init` and `reset`
4. Create observation and action space (types, dimensions, bounds)
5. Specify environment dynamics (how the robot moves) in `step`
6. Define the reward function

---

### Section 5 — Advanced Environment Creation (Slides 31–34)

#### 5.1 Digital Twins (Slide 31)

**Automatic creation of digital twins**: recreate a real-world environment in simulation from sensor data:
- Video scan of the real scene (e.g., desktop with objects)
- Language instruction: "Knock down the pigs by tossing the bird"
- Automatic 3D reconstruction → simulation environment

Enables training in a virtual copy of the actual deployment environment.

#### 5.2 Automatic Creation of Novel Environments (Slide 32)

**Generative AI for diverse environments**:

- **ACDC**: procedurally generates diverse kitchen layouts — "digital cousin creation" — for zero-shot sim-to-real transfer
- **Meta-Sim**: uses a probabilistic scene grammar (hierarchical tree: road → lanes → cars with location/height/pose) + distribution transformer to match real dataset statistics. Generates synthetic labeled datasets for perception.

#### 5.3 The Reality Gap (Slides 33–34)

**Physics is imperfect** due to:
- Unknown object properties (mass, friction, elasticity)
- Unknown object states (exact pose, joint angles)
- Unknown physics parameters
- Inaccurate modeling assumptions (rigid vs. deformable)
- Limited computation (discrete timestep approximation)

*"All models are wrong, but some are useful."* — George E.P. Box (1976)

**Reality gap** = the distribution shift between simulation and the real world, along two axes:
- **Reality gap for dynamics**: simulated physics ≠ real physics
- **Reality gap for perception**: simulated images ≠ real camera images

**Central question**: How can we transfer knowledge learned in simulation to the real world?

(Domain randomization, domain adaptation, and sim-to-real transfer will be covered in future lectures.)

---

### Section 6 — Final Project (Slides 35–44)

#### 6.1 Project Requirements

- Groups of up to 3 people
- Must involve a (simulated) physical robot
- Must use machine learning
- Resources: up to $50 Google Cloud credits

#### 6.2 Deliverables

| Deliverable | Due Date |
|---|---|
| Project Proposal (CoRL template) | April 10, 11:59 pm |
| Project Report (CoRL 2024, 4-8 pages + refs) | May 10, 11:59 pm |
| Project Video (5-min Spotlight Talk) | May 10, 11:59 pm |
| Video Peer Review (Google form) | May 14, 11:59 pm |

**Proposal includes**: title, team members, project description (1 para), simulator/dataset/platform (1 para), work division, timeline with progress report targets.

**Video should cover**: motivation, key insight/hypothesis, approach/evaluation, 1-3 key takeaways.

#### 6.3 Project Ideas

A. Adapting an existing algorithm to a different system/task
B. Evaluating alternative design options in existing algorithms
C. Defining a new application and solving it with a set of tools
D. Combining N methods into a new method
E. Applying a tool from other areas (CV, NLP) to robotics
F. Solving a pain point in an existing problem
G. Proposing a new way to solve an existing problem
H. Formulating a new problem and developing a solution

**Example projects (Slides 43–44):**

1. *Autonomous Robotic Stone Stacking using Dyna-Q* (starting from Furrer et al. ICRA 2017): create simulation, re-implement approach, try Dyna and compare.

2. *Learning Tool Use Through Reward Prediction by VLMs* (starting from Qin et al. RSS 2018): create simulation, prompt VLM to generate rewards (similar to ReKep), run SAC to learn the task.

**Resources**: CoRL, RSS, ICRA, IROS, NeurIPS, ICLR, CVPR, ICCV, ECCV; Google Scholar, arXiv, research lab websites.
