---
type: Lecture Notes
title: "Camera Models"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: 15
date: 2026-03-12
slide_url: https://drive.google.com/file/d/1pjo5xB-DYQ_8JrI4-WmSxpo3MkwMOi-b/view?usp=sharing
tags: [camera-models, computer-vision, robot-learning, projective-geometry]
timestamp: 2026-06-20
---

## TL;DR

This lecture develops the mathematical model that maps 3D world coordinates to 2D pixel coordinates, building from the intuition of pinhole cameras through the full camera matrix $M = K[R \; T]$. The key insight is that perspective projection — a nonlinear operation involving division by depth — can be expressed as linear matrix multiplication using homogeneous coordinates. Camera parameters are divided into intrinsics (focal length, principal point, skew) and extrinsics (rotation and translation between world and camera frames), and camera calibration estimates all of these from correspondences using a checkerboard pattern.

## Key Takeaways

- Visual perception is the bridge between the physical world and robot decision-making; cameras are the most common sensor for this.
- A bare film without a barrier produces a blurry image because each film point receives light from many scene points; a pinhole fixes this by enforcing a single ray per film position.
- Modern cameras use lenses instead of pinholes to gather more light while keeping sharpness — the thin lens equation governs focus.
- The basic perspective projection in the camera frame is $x' = f \frac{x}{z}$, $y' = f \frac{y}{z}$ — nonlinear due to division by depth $z$.
- Converting to pixel coordinates requires two further steps: adding a principal-point offset $(c_x, c_y)$ and scaling by pixel density $(\alpha, \beta)$ in pixels/meter.
- Homogeneous coordinates add one extra dimension, allowing perspective projection (including the depth division) to be written as a matrix multiplication followed by normalization.
- The camera intrinsic matrix $K$ is $3 \times 3$ with 5 degrees of freedom: $\alpha$, $\beta$, $c_x$, $c_y$, and skew angle $\theta$.
- Camera skewness (non-orthogonal pixel axes) enters $K$ as an off-diagonal $-\alpha \cot\theta$ term; it is near zero for most modern cameras.
- The full camera matrix $M = K[R \; T]$ combines intrinsics and extrinsics into a $3 \times 4$ matrix mapping homogeneous world coordinates to homogeneous image coordinates.
- The extrinsic parameters $(R, T)$ encode the SE(3) rigid-body transform from world frame to camera frame; $R$ has 3 DoF, $T$ has 3 DoF — giving a total of 11 DoF for the camera matrix.
- Camera calibration solves for $K$, $R$, $T$ from 3D–2D point correspondences; each correspondence provides 2 constraints, so at least 6 points (giving 12 constraints) are needed for 11 unknowns.
- In practice many more than 6 points are used (via a checkerboard) to average out detection noise.
- For robot arm setups, calibration can be done with a static camera + onboard checkerboard (moving through robot kinematics) or an onboard wrist camera + static checkerboard.

## Detailed Notes

### Visual Perception and Cameras (Slides 1-8)

**Motivation.** The lecture opens with the David Marr quote: "Vision is the process of discovering from images what is present in the world and where it is." Visual perception is essential to both biological intelligence (eyes across animal species) and robot intelligence.

**Camera sensors** are ubiquitous: DSLR cameras, depth cameras (Xbox Kinect, Intel RealSense), stereo cameras (ZED 2), wrist-mounted cameras on robot arms, GoPros, phone cameras, telescopes, etc.

**Digital cameras** capture images as data by receiving light on a CMOS sensor. The sensor is a grid of photodetectors; the lens, mirror, and pentaprism route light to the sensor.

**Image representation.** An RGB image of width $W$ and height $H$ is a $[W, H, 3]$ array where each element (a pixel) stores integer values in $[0, 255]$ for red, green, and blue channels. The pixel is the smallest addressable element.

**The perception-action loop.** In robot learning, cameras close the loop between perceiving the environment state and selecting actions. Examples from the literature include end-to-end visuomotor policies (Levine et al., JMLR 2016), aerial manipulation (Sa et al., IROS 2014), and bimanual manipulation (Bohg et al., ICRA 2018).

**Formal problem statement.** A camera model defines the mapping:

$$P = \begin{bmatrix} x \\ y \\ z \end{bmatrix} \longrightarrow P' = \begin{bmatrix} x' \\ y' \end{bmatrix}$$

from a 3D coordinate in the robot/world frame to a 2D pixel coordinate on the image.

---

### Pinhole Camera Model (Slides 11-15)

**The problem with a bare film.** If a film (sensor) is placed in front of an object with no barrier, each point on the object shoots light rays in all directions. Each film position receives rays from many object points, producing a blurry, superimposed image.

**Pinhole solution.** Placing an opaque barrier with a tiny pinhole between the object and the film forces each film position to receive light from only one direction, producing a sharp (but inverted) image. The concept of a "virtual image plane" placed in front of the pinhole at distance $f$ is used to avoid the inversion and reason about the geometry more cleanly.

**Key parameter — focal length $f$.** The distance from the pinhole to the film (or equivalently, from the pinhole to the virtual image plane). Larger $f$ magnifies the image.

**Pinhole size trade-off.**
- Smaller pinhole $\Rightarrow$ sharper image (fewer rays per film point)
- Too small $\Rightarrow$ less light reaches the film (dim image, diffraction effects)

The images on slide 15 show a "LUZ OPTICA" sign photographed at pinhole diameters of 2 mm, 1 mm, 0.6 mm, and 0.35 mm — sharpness improves monotonically.

---

### Lenses (Slides 16-17)

**Why lenses?** Lenses solve the pinhole brightness problem. A lens collects all parallel rays (from a distant point along the optical axis) and converges them to the **focal point**, located at the **focal length** $f$ from the lens center. Light rays passing through the lens center are not deviated.

**Thin lens equation.** For an object at distance $z$ from the lens, the image forms at distance $z_0$ satisfying:

$$\frac{1}{f} = \frac{1}{z} + \frac{1}{z_0}$$

This governs which depths are "in focus." The key modeling simplification is that for large object distances ($z \gg f$), $z_0 \approx f$, and we can treat the camera essentially as a pinhole model with focal length $f$.

---

### Camera Frame and Basic Projection (Slide 18)

**Camera coordinate frame $\mathcal{F}_c$.** The camera frame is defined with:
- $k$-axis pointing along the optical axis (depth direction, into the scene)
- $i$, $j$ axes spanning the image plane

For a 3D point $P = [x, y, z]^\top$ expressed in the camera frame, the basic perspective projection equations are:

$$x' = f \frac{x}{z}, \qquad y' = f \frac{y}{z}$$

This is a **perspective projection**: position scales inversely with depth $z$. It is nonlinear because of the division by $z$.

---

### Converting to Pixel Coordinates (Slides 19-22)

Two additional corrections are needed to map metric image coordinates to discrete pixel coordinates.

**Step 1 — Principal point offset.** The camera coordinate origin is the optical center, but the image origin (pixel $(0,0)$) is typically at the corner of the sensor. The principal point $C' = [c_x, c_y]$ is the image-plane location of the optical axis. Adding this offset:

$$x' = f \frac{x}{z} + c_x, \qquad y' = f \frac{y}{z} + c_y$$

**Step 2 — Metric to pixels.** The sensor has a physical pixel pitch. Multiplying by pixel density parameters $k$ (pixels/m, horizontal) and $l$ (pixels/m, vertical):

$$x' = fk \frac{x}{z} + c_x = \alpha \frac{x}{z} + c_x$$
$$y' = fl \frac{y}{z} + c_y = \beta \frac{y}{z} + c_y$$

where $\alpha = fk$ and $\beta = fl$ absorb the focal length and pixel density into a single "effective focal length" in pixel units. The parameters: $f$ in meters, $k, l$ in pixel/m, $\alpha, \beta$ in pixels.

This is the **perspective projection** equation. The challenge: it cannot be written as a simple matrix-vector product because of the division by $z$.

---

### Homogeneous Coordinate System (Slides 23-24)

**Homogeneous coordinates** add one extra dimension so that perspective projection (including the division by depth) becomes a linear matrix multiplication, deferring the nonlinearity to a final normalization step.

**Homogeneous scene coordinate** (3D point $\to$ 4D homogeneous):

$$\begin{bmatrix} x \\ y \\ z \end{bmatrix} \to \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix} \equiv \begin{bmatrix} \lambda x \\ \lambda y \\ \lambda z \\ \lambda \end{bmatrix}$$

Any scalar multiple $\lambda \neq 0$ represents the same point; the actual 3D coordinate is recovered by dividing through by the last component:

$$\begin{bmatrix} x \\ y \\ z \\ w \end{bmatrix} \to \begin{bmatrix} x/w \\ y/w \\ z/w \end{bmatrix}$$

**Homogeneous image coordinate** (2D point $\to$ 3D homogeneous):

$$\begin{bmatrix} x \\ y \end{bmatrix} \to \begin{bmatrix} x \\ y \\ 1 \end{bmatrix} \equiv \begin{bmatrix} \lambda x \\ \lambda y \\ \lambda \end{bmatrix}$$

Recovering the 2D point: divide by last component $w$, giving $(x/w, y/w)$.

**Why this works for projection.** The perspective projection equations $x' = \alpha x/z + c_x$, $y' = \beta y/z + c_y$ can be rewritten as:

$$P' \sim \begin{bmatrix} \alpha x + c_x z \\ \beta y + c_y z \\ z \end{bmatrix} = \begin{bmatrix} \alpha & 0 & c_x & 0 \\ 0 & \beta & c_y & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix} \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$$

The $\sim$ denotes equality up to a scale factor. Dividing the first two components by the third recovers $x' = \alpha x/z + c_x$ and $y' = \beta y/z + c_y$.

---

### Camera Skewness (Slide 25)

In an ideal camera, the pixel axes are perfectly orthogonal. In practice, manufacturing imperfections can make the angle $\theta$ between the two axes deviate from $90°$. This is **camera skewness**.

When skewness is present, the projection matrix becomes:

$$P' = \begin{bmatrix} \alpha & -\alpha \cot\theta & c_x & 0 \\ 0 & \beta/\sin\theta & c_y & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix} \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$$

The off-diagonal term $-\alpha \cot\theta$ couples the $x$ and $y$ pixel coordinates. For $\theta = 90°$, $\cot 90° = 0$ and $\sin 90° = 1$, recovering the non-skewed form with $\beta$ on the diagonal.

---

### Camera Intrinsic Matrix $K$ (Slide 26)

The $3 \times 4$ matrix above factors as $[K \mid 0]$ where $K$ is the $3 \times 3$ **camera intrinsic matrix**:

$$K = \begin{bmatrix} \alpha & -\alpha \cot\theta & c_x \\ 0 & \beta/\sin\theta & c_y \\ 0 & 0 & 1 \end{bmatrix}$$

The projection (for a camera-frame point) is:

$$P' = MP = [K \mid 0] P$$

**Degrees of freedom of $K$:** 5
- $\alpha$ (horizontal effective focal length, pixels)
- $\beta$ (vertical effective focal length, pixels) — or equivalently $\beta/\sin\theta$
- $c_x$ (principal point $x$)
- $c_y$ (principal point $y$)
- $\theta$ (skew angle, or equivalently $-\alpha\cot\theta$)

In practice, modern cameras have $\theta \approx 90°$ (negligible skew), reducing the effective DoF to 4.

---

### World Frame to Camera Frame: Extrinsic Parameters (Slides 27-34)

**Motivation.** The intrinsic model assumes the 3D point is expressed in the camera frame $\mathcal{F}_c$. Real robot scenes express object positions in a **world frame** $\mathcal{F}_w$ (typically the robot base frame). An additional coordinate transform is needed.

**SE(3) rigid-body transform.** A camera pose in the world is described by a rotation $R \in SO(3)$ and a translation $T \in \mathbb{R}^3$, together forming an SE(3) element. In homogeneous form:

$$P_c = \begin{bmatrix} R & T \\ 0 & 1 \end{bmatrix}_{4\times4} P_w$$

**3D rotation.** A rotation matrix $R \in SO(3)$ satisfies $R^\top R = I$ and $\det(R) = 1$. It can be parameterized as a composition of elemental rotations about the three axes (Euler angles $\alpha, \beta, \gamma$):

$$R_x(\alpha) = \begin{bmatrix} 1 & 0 & 0 \\ 0 & \cos\alpha & -\sin\alpha \\ 0 & \sin\alpha & \cos\alpha \end{bmatrix}$$

$$R_y(\beta) = \begin{bmatrix} \cos\beta & 0 & \sin\beta \\ 0 & 1 & 0 \\ -\sin\beta & 0 & \cos\beta \end{bmatrix}$$

$$R_z(\gamma) = \begin{bmatrix} \cos\gamma & -\sin\gamma & 0 \\ \sin\gamma & \cos\gamma & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

$$R = R_x(\alpha) R_y(\beta) R_z(\gamma)$$

Pure rotation in homogeneous coordinates:
$$P' = \begin{bmatrix} R & 0 \\ 0 & 1 \end{bmatrix}_{4\times4} \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$$

**3D translation.** Translation vector $T = [T_x, T_y, T_z]^\top$ in homogeneous form:
$$P' = \begin{bmatrix} I & T \\ 0 & 1 \end{bmatrix}_{4\times4} \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$$

**Combined SE(3) transform:**
$$P' = \begin{bmatrix} R & T \\ 0 & 1 \end{bmatrix}_{4\times4} \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}$$

---

### Full Camera Matrix $M$ (Slides 30-31)

Combining intrinsics and extrinsics, the complete mapping from **world coordinates** to **image pixel coordinates** is:

$$\boxed{P' = K [R \;\; T] \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix} = M \begin{bmatrix} x \\ y \\ z \\ 1 \end{bmatrix}}$$

where:
- $K$ is the $3\times3$ intrinsic matrix (5 DoF)
- $[R \;\; T]$ is the $3\times4$ extrinsic matrix
  - $R$: rotation, 3 DoF
  - $T$: translation, 3 DoF
- $M = K[R \;\; T]$ is the $3\times4$ **camera matrix**

**Total degrees of freedom:** $5 + 3 + 3 = 11$

---

### Camera Calibration (Slides 35-39)

**Goal.** Estimate the intrinsic parameters $K$ and extrinsic parameters $R$, $T$ from one or multiple images containing objects of known geometry.

**Checkerboard calibration target.** A checkerboard pattern provides a set of corner points whose 3D positions are known precisely (from the known square size and grid layout). These give reliable 3D–2D correspondences $P_i \leftrightarrow p_i$.

**Linear system setup.** Each 3D–2D correspondence gives:

$$p_i = \begin{bmatrix} u_i \\ v_i \end{bmatrix} = M P_i = \begin{bmatrix} m_1 P_i / m_3 P_i \\ m_2 P_i / m_3 P_i \end{bmatrix}$$

where $m_1, m_2, m_3$ are the rows of $M$. Each correspondence yields 2 linear equations in the entries of $M$ (after cross-multiplying to clear the denominator). With $n$ correspondences we get $2n$ equations in 11 unknowns.

**Minimum number of points.** We need at least $2n \geq 11$, so $n \geq 5.5$, meaning **at least 6 points** ($6 \times 2 = 12 > 11$). In practice, far more points are used (the full checkerboard grid) to average out corner detection errors.

**Practical robot calibration setups (Slides 37-39).** The Franka Panda arm in the DROID dataset uses:

1. **Static camera + onboard checkerboard:** The camera is fixed in the workspace. A checkerboard is attached to the robot's wrist. As the robot moves (positions known from kinematics), the camera observes the board at many poses. The chain: robot base $\xrightarrow{\text{kinematics}}$ robot wrist $\xrightarrow{\text{known}}$ checkerboard $\xrightarrow{\text{known}}$ 3D points $\xrightarrow{\text{estimate } K,R,T}$ 2D pixels in static camera.

2. **Onboard wrist camera + static checkerboard:** The camera rides on the wrist. The robot moves so the wrist camera sees the static board at different angles. The chain: robot base $\xrightarrow{\text{kinematics}}$ robot wrist $\xrightarrow{\text{known}}$ wrist camera $\xrightarrow{\text{estimate } K,R,T}$ 2D pixels $\leftrightarrow$ 3D points on checkerboard.

Both approaches exploit robot forward kinematics to establish known rigid-body relationships in the calibration chain, enabling the camera parameters to be solved from image observations.
