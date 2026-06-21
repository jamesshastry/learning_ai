---
type: Lecture Notes
title: "3D Visual Representations"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: 17
date: 2026-03-19
slide_url: https://drive.google.com/file/d/1ZYm8meD0tLMDprPQqEc46PYI93UBfX-t/view?usp=sharing
tags: [visual-representations, 3d-vision, robot-learning, point-clouds, neural-radiance-fields]
timestamp: 2026-06-20
---

## TL;DR
2D perception is fundamentally ambiguous for physical interaction tasks — a single image pixel corresponds to a ray in 3D space, not a point. This lecture surveys the 3D shape representations available to robots (depth images, meshes, voxels, point clouds, and neural implicit fields like NeRF), explains the trade-offs of each, and shows how architectures like PointNet and PointNet++ enable deep learning directly on unordered point sets. These representations then power downstream visuomotor tasks such as 6-DoF grasp detection.

## Key Takeaways
- 2D perception suffers from scale and depth ambiguity; robots need 3D representations for reliable physical interaction
- Five main 3D shape representations exist — projected view, depth (2.5D), mesh, voxel, and point cloud — each with different memory, acquisition, and learning trade-offs
- A depth image pixel $(x', y')$ carrying depth value $d$ back-projects to 3D via $\begin{bmatrix}x\\y\\z\end{bmatrix} = dK^{-1}\begin{bmatrix}x'\\y'\\1\end{bmatrix}$
- Point clouds are the practical sweet spot: directly from sensors, no discretization artifacts, memory-efficient compared to voxels, and easy to fuse across views
- PointNet handles unordered point sets by applying a shared MLP per point, then aggregating with a symmetric function (max-pool), achieving permutation invariance
- PointNet++ extends PointNet with hierarchical set abstraction (farthest point sampling + local grouping + PointNet), analogous to how CNNs build hierarchical spatial features
- Neural Radiance Fields (NeRF) represent scenes as continuous implicit functions mapping $(x,y,z,\theta,\phi) \to (\text{color}, \sigma)$ and synthesize novel views via volume rendering
- 4-DoF grasp detection works on depth images (Dex-Net 2.0); 6-DoF grasp detection requires point clouds and handles arbitrary orientations $[x,y,z,\alpha,\beta,\gamma]$
- RGBD combines texture/semantic information (RGB) with geometry/collision information (depth) but requires careful calibration between separate sensors

## Detailed Notes

### Motivation: Why 3D? (Slides 3-4)

2D perception is often fundamentally ambiguous for robotics:

- **Scale ambiguity**: A large far-away object and a small nearby object can look identical in 2D
- **Depth ambiguity**: A 2D image cannot distinguish a flat photo from a real 3D scene

Humans resolve these ambiguities using **binocular vision** — the disparity between two eyes allows triangulation of depth. Robots must do the same.

The 3D shape of an object can be represented in several forms, each with different trade-offs:

| Representation | Dimensionality | Notes |
|---|---|---|
| Projected view (multi-view images) | 2D | Familiar format, but view-dependent |
| Depth image | 2.5D | Single-channel; view-dependent |
| Mesh | 3D | Vertices + edges + faces |
| Voxel | 3D | Regular grid; 3D analog of pixels |
| Point cloud | 3D | Unordered set of $(x,y,z)$ points |

---

### Multiview and Stereo Vision (Slide 5)

Given images captured from multiple views with known camera frames $\mathcal{F}_{c_1}, \mathcal{F}_{c_2}, \ldots$, 3D structure can be recovered by **matching corresponding points across views** (triangulation). This is the basis of Structure-from-Motion (SfM) and stereo depth estimation.

**Limitation for control**: The recovered 3D structure is typically not directly usable as a robot control input — it requires further processing before being actionable.

---

### Depth Image (Slides 6-8)

A depth image is a $[W, H]$ tensor where each element stores the **distance from the camera center to the object surface** along the corresponding ray. Hardware sources include LiDAR and structured-light depth sensors (e.g., Intel RealSense).

**Camera projection model**: A pixel $(x', y')$ in a 2D image corresponds to a ray in 3D space. The 3D point is:

$$\begin{bmatrix}x\\y\\z\end{bmatrix} = dK^{-1}\begin{bmatrix}x'\\y'\\1\end{bmatrix}$$

where:
- $K$ is the **camera intrinsic matrix** (encodes focal length and principal point)
- $d$ is the **depth value** (unknown for RGB, provided by depth sensor)
- $(x', y')$ are **pixel coordinates** in homogeneous form

**Projection ambiguity** in RGB images: the distance $d$ is unknown, so the 3D location of the point along the ray is ambiguous. A depth image resolves this by providing $d$ at each pixel.

**Limitations of depth images**:
- Not explicitly 3D — still a 2D array parameterized by view
- View-dependent: a single depth image only covers the visible surface from one viewpoint

---

### 4-DoF Grasp Detection from Depth Images — Dex-Net 2.0 (Slides 9-10)

*Reference: Mahler et al., Dex-Net 2.0, RSS 2017*

Similar to RGB-based grasp detection, grasps can be predicted from depth images. An advantage over RGB: the absolute height above the table is no longer needed as a separate input (it is encoded in the depth values).

**Pipeline**:
1. Propose grasp candidates $g_1, g_2, \ldots$ from the depth image
2. Align and crop a depth image patch around each candidate
3. Score each with a CNN: output $P(\text{"success"} | I, g)$
4. Deproject the best grasp back to 3D and plan robot motion

**Model**:
- **Input**: Grasp-aligned depth image $I$ and 4-DoF grasp $g = (x, y, z, \gamma)$ where $\gamma$ is gripper rotation
- **Output**: Probability of grasp success $P(\text{"success"} | I, g)$
- **Architecture**: Convolutional layers (7×7, 5×5, 3×3, 1×1) with ReLU/LRN → fully connected layers → softmax
- **Training**: Simulated data (smaller covariate shift relative to RGB because depth is less texture-dependent and appearance-agnostic)

---

### Mesh Representation (Slide 11)

A **polygon mesh** is a collection of **vertices**, **edges**, and **faces** (polygonal elements, typically triangles) that defines the surface of a polyhedral object.

Standard file format: **OBJ**, which stores:
- `v x y z` — geometric vertices
- `vt u v` — texture coordinates
- `vn x y z` — vertex normals
- `f v1 v2 v3` — polygonal face elements

Meshes can represent objects at different levels of detail (LOD) by varying the number of triangles.

**Limitations**:
- Requires reconstruction from sensor data (not directly captured)
- Hard to use for learning due to irregular, variable-size topology

---

### Voxel Representation (Slide 12)

3D space is **discretized into a regular grid** of voxels — the 3D equivalent of 2D pixels. Each voxel stores a binary occupancy value (or sometimes a signed distance field value).

Voxel representations are compatible with **3D convolution** (X ∗ K = Y), making them straightforward to use with standard CNNs extended to 3D.

**Limitation**: Memory scales as $O(n^3)$ with resolution — a $256^3$ grid requires ~16M cells. High-resolution voxel grids are memory-prohibitive.

---

### Point Cloud (Slides 13-15)

A point cloud is a **set of 3D points in Euclidean space** — no grid structure, no explicit connectivity.

**Advantages over other representations**:
- **Directly matches raw sensor signals** (LiDAR, structured-light depth sensors)
- **No discretization artifacts** (unlike voxels)
- **Memory efficient** (only stores surface points, not entire volume)
- **Easier to fuse multiple views** (compared to depth images, which are view-dependent)

**Sources**: Can be obtained from depth images (via back-projection), mesh sampling, LiDAR, or structured-light sensors.

**Limitation**: A point cloud from a single view is **partially observable** — only the visible surface is captured. Multiple view fusion is required for full coverage.

---

### Converting Depth Image to Point Cloud (Slides 16-17)

**Step 1** — Back-project each pixel using camera intrinsics $K$:

$$\begin{bmatrix}x\\y\\z\end{bmatrix} = dK^{-1}\begin{bmatrix}x'\\y'\\1\end{bmatrix}$$

This gives the 3D coordinate of each pixel in the **camera frame**.

**Step 2** — Transform to the **world frame** using camera extrinsic parameters:
- Rotation matrix $R$
- Translation vector $T$

$$p_\text{world} = R \cdot p_\text{camera} + T$$

**Multi-view fusion**: Given extrinsic parameters for each view, point clouds from multiple viewpoints can be trivially concatenated and merged into a single unified point cloud. This is widely used in autonomous driving (LiDAR sweeps) and 3D reconstruction systems.

---

### Deep Learning on Point Clouds — PointNet (Slides 18-22)

**Goal**: End-to-end learning on scattered, unordered point data for a unified framework covering classification, segmentation, etc.

**Key challenges**:

1. **Permutation invariance**: A point cloud of $N$ points can be presented in $N!$ orderings; the model output must be identical for all orderings. Formally, we require:
   $$f(x_1, x_2, \ldots, x_n) \equiv f(x_{\pi_1}, x_{\pi_2}, \ldots, x_{\pi_n}), \quad x_i \in \mathbb{R}^D$$
   Examples of permutation-invariant functions: $f = \max\{x_1, \ldots, x_n\}$ or $f = x_1 + x_2 + \ldots + x_n$

2. **Geometric transformation invariance**: Rotating the point cloud should not change classification results (the model should be rotation-invariant or equivariant)

**PointNet solution**:
1. Apply a **shared MLP** independently to each point: each point $(x_i, y_i, z_i)$ is mapped to a per-point feature vector
2. Apply a **symmetric aggregation** (max-pool or average-pool) across all point features to produce a global descriptor
3. Apply a final **MLP** to the global descriptor for task output

This is permutation-invariant by construction because max/average pooling are symmetric functions.

---

### Hierarchical Point Encoding — PointNet++ (Slides 23-27)

**Motivation**: PointNet processes all points globally — it lacks local spatial structure akin to the local receptive fields in CNNs. Just as CNNs build features hierarchically (local edges → textures → parts → object), we want hierarchical encoding for point clouds.

**Set Abstraction** (the core building block):
1. **Farthest Point Sampling (FPS)**: Select $N_1 < N$ representative points that maximally cover the point cloud. FPS greedily selects the point farthest from all already-selected points.
2. **Grouping**: For each sampled centroid, collect the $k$ nearest neighbors within a radius $r$ in Euclidean space, expressed in **local coordinates** $(u,v)$ relative to the centroid
3. **PointNet**: Apply a small PointNet to each local neighborhood to produce a single feature vector per centroid

Result: $N$ input points → $N_1$ output points, each with a high-dimensional feature $F$ encoding local geometry. Points now live in $(X, Y, F)$ space (Euclidean position + feature space).

**PointNet++ architecture**: Stack multiple set abstraction layers. Each layer further reduces the number of points and increases the feature dimension, progressively capturing larger-scale geometric context.

**Comparison: CNN vs PointNet++**

| Aspect | CNN (Image) | PointNet++ (Point Cloud) |
|---|---|---|
| Input | Grid-structured pixels | Unordered points |
| Feature extraction | Shared convolution kernel | Shared MLP |
| Neighborhood | Kernel size (square) | Radius (sphere) |
| Downsampling | Stride | Farthest point sampling |
| Feature format | Feature maps (grid) | Point features (set) |
| Building block | Convolutional layer block | Set abstraction layer |

---

### Neural Radiance Fields — NeRF (Slides 28-33)

*This section covers implicit neural representations for 3D scenes.*

**Motivation**: Mesh and voxel representations require explicit 3D reconstruction. **Implicit representations** encode 3D structure in the weights of a neural network, avoiding discretization.

**NeRF** represents a scene as a continuous function:
$$F_\Theta: (x, y, z, \theta, \phi) \to (\mathbf{c}, \sigma)$$

where:
- $(x, y, z)$ is a 3D position
- $(\theta, \phi)$ is a viewing direction (azimuth and elevation)
- $\mathbf{c} = (r, g, b)$ is emitted color
- $\sigma$ is volume density (opacity)

**Rendering via volume rendering**: To render a pixel from camera ray $\mathbf{r}(t) = \mathbf{o} + t\mathbf{d}$, integrate color along the ray:

$$C(\mathbf{r}) = \int_{t_n}^{t_f} T(t) \cdot \sigma(\mathbf{r}(t)) \cdot \mathbf{c}(\mathbf{r}(t), \mathbf{d}) \, dt$$

where the transmittance is:
$$T(t) = \exp\!\left(-\int_{t_n}^{t} \sigma(\mathbf{r}(s)) \, ds\right)$$

In practice, this is discretized by sampling $M$ points along each ray and using numerical quadrature.

**Training**: Minimize the mean squared error between rendered pixel colors and ground-truth pixel colors from training images. No 3D supervision is required — only posed 2D images.

**Properties for robotics**:
- Can render novel views from any camera pose
- Compact representation (network weights)
- Differentiable: gradients flow through rendering to 3D geometry
- Limitation: slow to train and render; scene-specific (does not generalize across scenes without modification)

---

### 6-DoF Grasp Detection (Slides 34-35)

*Reference: Mousavian et al., 6-DOF GraspNet, CVPR 2019*

**4-DoF grasp** $[x, y, z, \gamma]$: Position + single rotation angle. Assumes planar grasping geometry — limited to top-down or near-planar approaches.

**6-DoF grasp** $[x, y, z, \alpha, \beta, \gamma]$: Full 6-DoF pose. Works for arbitrary orientations — can grasp objects from the side, below, at any angle. Essential for real-world clutter.

**Why success depends on local geometry**: The feasibility of a grasp is determined by the local object geometry around the contact points. The global shape is less relevant.

**6-DoF grasp detection pipeline from point clouds**:
1. Propose grasp candidates $g_1, g_2, \ldots$ using generative models over the full scene point cloud
2. For each candidate, crop the point cloud within a 3D region (bounding box or sphere) aligned with the grasp pose
3. Score each cropped point cloud with a network trained to predict grasp success probability
4. Execute the highest-scoring grasp

---

### RGBD Representation (Slides 36-37)

**RGBD** combines two complementary modalities:
- **RGB image**: Encodes texture → semantic and material properties
- **Depth image**: Encodes geometry → collision and contact information
- **RGBD**: RGB + Depth together

**Practical consideration**: On RGBD cameras (e.g., ASUS Xtion, Intel RealSense), RGB and depth are captured by **separate physical sensors** with:
- Different camera intrinsic parameters (focal length, principal point)
- Different camera extrinsic parameters (physical positions/orientations on the device)

Therefore, RGB and depth images are **not aligned by default**, even on the same device. Proper **calibration of both cameras** is required before the two modalities can be fused (e.g., projecting depth into the RGB frame or vice versa).
