---
type: Lecture Notes
title: "2D Visual Representations"
course: CS 4756 Robot Learning
university: Cornell
lecture_id: 16
date: 2026-03-26
slide_url: https://drive.google.com/file/d/1J2VGGH9TFtbWfmr2gHOn0JOYdtUoBqPM/view?usp=sharing
tags: [visual-representations, 2d-vision, robot-learning, feature-extraction]
timestamp: 2026-06-20
---

## TL;DR
This lecture covers how 2D images are represented and processed for robot learning, progressing from raw pixel arrays through hand-designed features to learned convolutional representations. CNNs are presented as a principled solution for learning translation-equivariant features, and the lecture closes with a concrete robotics application: framing 4-DoF grasp detection as an object detection problem solvable with the same CNN machinery.

## Key Takeaways
- An RGB image is a $[W, H, 3]$ array of uint8 values (0–255); alternative colorspaces (CMYK, HSL) exist for different use cases
- Before deep learning, hand-designed features (HOG, SIFT, color histograms) were combined with simple classifiers; their weakness is requiring domain expertise
- Invariance (output unchanged under transformation) and equivariance (output transforms correspondingly) are the two key desiderata for visual representations
- Convolution is a learnable, translation-equivariant operation: $(f * g)[n] = \sum_{m=-\infty}^{\infty} f[m]\,g[n-m]$
- Stacking conv layers grows the receptive field; pooling adds spatial invariance and reduces resolution
- CNNs (AlexNet, VGG, ResNet) combine conv + pooling + FC layers; residual connections solve the vanishing-gradient problem in very deep networks
- Object detection = classification + localization (bounding box regression), often using region proposals
- 4-DoF grasp detection is directly reducible to object detection: region proposal → grasp proposal, class score → grasp success probability, bounding box → grasp orientation

## Detailed Notes

### Image Representations (Slides 3–7)

**Raw image format**

An RGB image of $W \times H$ pixels is stored as a $[W, H, 3]$ array where each element is an integer in $[0, 255]$ representing the intensity of the red, green, or blue channel. Alternative colorspaces include:
- **RGB** (Red-Green-Blue): additive primary colors, native sensor format
- **CMYK** (Cyan-Magenta-Yellow-Key/Black): subtractive, used in printing
- **HSL** (Hue-Saturation-Light): perceptually motivated, separates color from brightness

A **greyscale image** collapses to a single channel: $[W, H]$, with $0 = \text{black}$ and $255 = \text{white}$.

**Hand-designed representations**

Before deep learning, the standard pipeline was:

$$\text{Image} \xrightarrow{\text{feature extractor}} x \xrightarrow{f(x, W)} y \xrightarrow{\text{softmax}} \text{class}$$

Common hand-designed features:
- **Color Histogram**: distribution of pixel colors, ignores spatial layout
- **HOG** (Histogram of Oriented Gradients): captures local edge orientation statistics in cell grids
- **SIFT** (Scale-Invariant Feature Transform): detects and describes local keypoints that are scale- and rotation-invariant

Limitation: these require domain expertise and careful tuning. This motivates learning representations from data.

### Invariance and Equivariance (Slides 12–14)

**Invariance**: The output of a function is unchanged when the input undergoes a transformation.

$$f(\text{translate}(I)) = f(I)$$

Example: an image classifier should output "Cat" whether the cat appears in the top-left or center of the image.

**Equivariance**: When the input transforms, the representation transforms in a corresponding way.

$$f(\text{translate}(I)) = \text{translate}(f(I))$$

Example: a feature map that shifts when the input image shifts — spatial structure is preserved.

**Why these matter for robot learning**:
- Goal: learn representations from data that preserve spatial structure
- Convolution achieves translation equivariance
- Pooling achieves (approximate) translation invariance

The "Where's Waldo?" analogy illustrates human pattern recognition: we decompose the search into locating simpler sub-features (red-white stripe, blue pants, glasses) and combine them. CNNs formalize this compositional hierarchy.

### Convolution (Slides 15–20)

**1D definition**:

$$(f * g)[n] = \sum_{m=-\infty}^{\infty} f[m]\,g[n-m]$$

**Key ideas in 2D image convolution**:
1. Apply a small filter (kernel) over the image by sliding it spatially
2. At each position, compute a weighted sum of local pixels: $\text{output}[i,j] = \sum_{u,v} K[u,v] \cdot I[i+u, j+v]$
3. The same filter is shared across all positions (weight sharing) → translation equivariance
4. High response where the kernel matches the local pattern → pattern detection

**Concrete examples**:

Gaussian (box) filter — blurs by averaging:

$$K = \frac{1}{K^2} \begin{bmatrix} 1 & \cdots & 1 \\ \vdots & \ddots & \vdots \\ 1 & \cdots & 1 \end{bmatrix}$$

Larger kernel size → stronger blur (shown with $3\times3$ through $11\times11$ on an image).

Prewitt operator — edge detection:

$$K_{\text{vertical}} = \begin{bmatrix} +1 & 0 & -1 \\ +1 & 0 & -1 \\ +1 & 0 & -1 \end{bmatrix}, \quad K_{\text{horizontal}} = \begin{bmatrix} +1 & +1 & +1 \\ 0 & 0 & 0 \\ -1 & -1 & -1 \end{bmatrix}$$

**Hyperparameters**:

| Parameter | Effect |
|-----------|--------|
| **Stride** $s$ | Step size when sliding kernel; larger stride → smaller output, lower spatial resolution |
| **Padding** $p$ | Zeros added around the input border; controls whether output is same-size or smaller |

Output spatial size formula for input $W$, kernel $K$, stride $s$, padding $p$:

$$W_{\text{out}} = \left\lfloor \frac{W - K + 2p}{s} \right\rfloor + 1$$

### Convolutional Neural Networks (Slides 21–27)

**Convolutional Layer**

A conv layer applies $C_{\text{out}}$ filters, each of shape $[C_{\text{in}}, K_H, K_W]$, plus a bias vector of size $C_{\text{out}}$.

Example: input $3 \times 32 \times 32$, applying 6 filters of size $3 \times 5 \times 5$ with no padding → output $6 \times 28 \times 28$.

Parameters of a conv layer:
- Activation function (e.g., ReLU)
- Number of output channels $C_{\text{out}}$
- Kernel size $K$
- Stride $s$
- Padding $p$

**Stacking conv layers and receptive fields**

Each successive conv layer increases the **receptive field** — the region of the original input that influences a single output neuron. With $L$ layers each using $K \times K$ kernels:

$$\text{Receptive field} \approx 1 + L(K-1)$$

This allows deep networks to capture global context while each layer only performs local operations.

Example stack:
- Input: $N \times 3 \times 32 \times 32$
- After Conv1 ($W_1$: $6 \times 3 \times 5 \times 5$, $b_1$: 6): $N \times 6 \times 28 \times 28$
- After Conv2 ($W_2$: $10 \times 6 \times 3 \times 3$, $b_2$: 10): $N \times 10 \times 26 \times 26$
- After Conv3 ($W_3$: $12 \times 10 \times 3 \times 3$, $b_3$: 12): $N \times 12 \times 24 \times 24$

**Pooling**

Pooling downsamples feature maps by operating on local regions:

- **Max pooling**: $\text{out}[i,j] = \max_{u,v \in \text{window}} \text{feat}[i \cdot s + u,\, j \cdot s + v]$
- **Average pooling**: $\text{out}[i,j] = \frac{1}{|W|}\sum_{u,v \in \text{window}} \text{feat}[i \cdot s + u,\, j \cdot s + v]$

Effects: reduces spatial resolution, increases robustness to small shifts (spatial invariance).

**Global Pooling** pools over the entire spatial dimension, collapsing $[C, H, W]$ to $[C]$. This removes all spatial information and keeps only "what is present," providing full spatial invariance. Useful for producing fixed-size feature vectors regardless of input resolution.

**Full CNN architecture**

Three building blocks:
1. **Convolutional Layer**: detect local spatial patterns
2. **Pooling Layer**: reduce spatial dimensionality
3. **Fully Connected Layer**: integrate features into global patterns

Classic architectures:
- **AlexNet**: 5 conv layers (first: $11 \times 11$, 96 filters), then 3 FC layers
- **VGG16**: 13 conv layers (all $3 \times 3$) + 3 FC layers; deeper and more uniform
- **ResNet**: introduces **residual connections** — directly feeds input to the output of a block: $\text{out} = \mathcal{F}(x) + x$. This solves the vanishing gradient problem in very deep networks (50–152 layers).

  Residual block example:
  ```
  x (28×28×256)
    → 1×1 conv, 64 (BN, ReLU)
    → 3×3 conv, 64 (BN, ReLU)
    → 1×1 conv, 256
    + x  (skip connection)
  = output (28×28×256)
  ```

### Object Detection (Slides 28–31)

**Image Classification** (Slide 28): CNN → class scores → softmax → classification loss.

**Object Localization** (Slide 29): CNN → bounding box coordinates $(x, y, h, w)$ → regression loss.

**Object Detection = Classification + Localization** (Slide 30): A single network produces both class scores and box coordinates simultaneously, trained with a combined classification + regression loss.

**Region Proposal approach** (Slide 31):
1. Generate many candidate crops of the image (region proposals)
2. For each crop, run a CNN that outputs:
   - Class scores (object vs. background, or specific category)
   - Refined box coordinates
3. Non-maximum suppression to remove duplicates

This is the basis of architectures like R-CNN, Fast R-CNN, and Faster R-CNN.

### Grasp Detection (Slides 32–39)

**Robotic Grasping problem** (Slide 32): Goal is to robustly pick up an object and control its motion using a parallel-jaw gripper. A grasp is parameterized by the end-effector pose:

- **6-DoF grasp**: $[x, y, z, \alpha, \beta, \gamma]$ — full 3D position + orientation
- **4-DoF grasp**: $[x, y, z, \gamma]$ — position + yaw only (simplified for table-top scenarios)

**4-DoF simplifying assumptions** (Slide 33):
- Gripper approaches along the camera z-axis
- End-effector orientation is constrained to the image plane (only yaw $\gamma$ varies)

This means the grasp can be reasoned about entirely in 2D image space.

**Grasp as object detection** (Slides 34–35):

For each sampled grasp candidate, success depends on object geometry within a local image patch aligned with the grasp pose. The analogy to object detection:

| Object Detection | Grasp Detection |
|---|---|
| Region proposal | Grasp proposal |
| Class score | Grasp success probability |
| Bounding box coordinates | Grasp orientation |

**4-DoF Grasp Detection CNN** (Slides 36–37):

Architecture (AlexNet-style):
- Input: $227 \times 227$ image patch (aligned with candidate grasp)
- conv1: 96 filters @ $55 \times 55$
- conv2: 256 filters @ $27 \times 27$
- conv3: 384 filters @ $13 \times 13$
- conv4: 384 filters @ $13 \times 13$
- conv5: 256 filters @ $13 \times 13$
- fc6: 4096 units
- fc7: 1024 units
- Output heads for each discretized angle bin (e.g., ang1, ang5, ang12, ang18), each outputting 2 values (binary success classification)

The CNN finds $[x', y', \gamma]$ on the image that correspond to valid grasps. Objects in the scene are first found via MOG (Mixture of Gaussians) background subtraction.

**Full pipeline** (Slides 37–38):

1. **Propose**: use MOG subtraction on Kinect RGB-D image to find object regions → generate grasp proposals
2. **Crop**: extract $227 \times 227$ patch aligned with each candidate
3. **Predict**: run CNN, get success probability for each yaw bin
4. **Select**: pick the grasp $(x', y', \gamma)$ with highest score
5. **Lift to 3D**: use camera intrinsics and known table height $z_{\text{table}}$

**2D to 3D coordinate lifting** (Slide 39):

Given image coordinates $(x', y')$ and camera intrinsic matrix parameters $(\alpha, \beta, c_x, c_y)$:

$$x_c = \frac{x' - c_x}{\alpha}, \quad y_c = \frac{y' - c_y}{\beta}$$

The camera projection matrix is:

$$P' = \begin{bmatrix} \alpha & 0 & c_x & 0 \\ 0 & \beta & c_y & 0 \\ 0 & 0 & 1 & 0 \end{bmatrix}$$

Given the table surface depth $z_{\text{table}}$ in the camera frame:

$$X_{\text{camera}} = \begin{bmatrix} x_{\text{camera}} \\ y_{\text{camera}} \\ z_{\text{camera}} \end{bmatrix} = z_{\text{table}} \begin{bmatrix} x_c \\ y_c \\ 1 \end{bmatrix}$$

Converting to the robot frame via extrinsic rotation $R$ and translation $T$:

$$X_{\text{robot}} = R \, X_{\text{camera}} + T$$

This yields the full 4-DoF grasp $[x, y, z, \gamma]$ in robot coordinates, ready for motion planning.
