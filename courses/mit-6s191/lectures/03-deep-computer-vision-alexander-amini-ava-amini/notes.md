---
type: Lecture Notes
title: "Deep Computer Vision"
course: mit-6s191 Introduction to Deep Learning
university: MIT
lecture_id: "03"
video: https://youtube.com/watch?v=pqIcoskUuWs
tags: [computer-vision, cnn, convolutional-neural-networks, convolution, pooling, object-detection]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Computer Vision

**Course:** Introduction to Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=pqIcoskUuWs)

## TL;DR
Alexander Amini covers convolutional neural networks (CNNs) for computer vision, explaining why flattening images for fully connected networks destroys spatial information. The lecture builds convolutions from first principles—filters, element-wise multiplication, feature maps—then assembles full CNNs with convolution, non-linearity (ReLU), and pooling layers. Applications include image classification, object detection (R-CNN), semantic segmentation, and autonomous driving.

## Key Takeaways
- Images are 2D (grayscale) or 3D (RGB) matrices of pixel values; flattening them for fully connected networks destroys spatial structure and creates massive parameter counts
- Convolutions apply small learned filters (patches) across images via element-wise multiplication, preserving spatial relationships and enabling local feature detection
- Feature maps show where detected features are strongest; positive values indicate strong matches between filter and image patch
- CNNs combine convolutions, non-linearities (ReLU), and pooling (max pooling) to build hierarchical feature representations from low-level (edges) to high-level (objects)
- The CNN architecture has two parts: feature extraction (convolutions + pooling) and classification (dense layers)
- The feature extraction backbone is reusable across tasks; only the output head changes for classification vs detection vs segmentation
- Object detection extends classification by predicting bounding box coordinates; R-CNN proposes regions then classifies them end-to-end
- Semantic segmentation uses encoder-decoder architecture with upsampling to produce pixel-level classification maps

## Detailed Notes

### Images as Numbers [04:47-06:03]
Grayscale images are 2D matrices (height × width) with brightness values 0-1. Color images add a third dimension of size 3 (RGB channels). This numerical representation enables mathematical processing by neural networks.

### The Problem with Fully Connected Networks for Images [11:50-13:57]
Flattening a 100×100 image creates a 10,000-dimensional input vector. Fully connected layers then require enormous weight matrices (10,000 × hidden_size), wasting parameters and destroying 2D spatial relationships critical for visual understanding.

### Convolutions: Patch-Based Feature Detection [14:24-23:02]
Instead of connecting every pixel to every neuron, convolutions connect small patches (e.g., 3×3 or 4×4) to single neurons. The filter slides across the image, performing element-wise multiplication at each position. Strong matches produce high positive values in the output feature map. Multiple filters detect different features (edges, corners, diagonals) simultaneously.

### CNN Architecture: Convolution + ReLU + Pooling [29:06-37:02]
Three core operations: (1) Convolution extracts local features using learned filters, (2) ReLU activation introduces non-linearity by thresholding negatives to zero, (3) Max pooling reduces spatial dimensions by taking the maximum value in each patch. This hierarchy builds from lines/edges → corners/curves → shapes → objects. Pooling increases the relative receptive field of filters at deeper layers.

### Building a CNN in Code [40:53-43:09]
Feature extraction head: Conv2D(32 filters, 3×3) → ReLU → MaxPool → Conv2D(64 filters, 3×3) → ReLU → MaxPool. Classification head: Flatten → Dense → Softmax output. In PyTorch, Conv2d takes (in_channels, out_channels, kernel_size); pooling only reduces spatial dimensions, not depth.

### Applications Beyond Classification [43:43-54:34]
Object detection: predict bounding boxes + class labels using region proposals and end-to-end differentiable R-CNN. Semantic segmentation: encode image then decode back to full resolution with per-pixel classification using upsampling. Self-driving: multiple camera inputs through separate CNN streams, concatenated with map features, outputting control commands as probability distributions.

## Notable Quotes
- "Before you've even started anything with your neural network, you've really handicapped the model." [13:10] (on flattening images)
- "Even though these images are quite different in pixel space, at the feature space, they're actually very, very aligned." [20:14]
- "The whole point of what we're doing here is to learn this hierarchy." [37:46]
- "The feature detection part is very stable for many of these applications. You're always only really changing the output side." [48:22]

## Concepts Introduced
- [[Convolution]] -- sliding filter operation preserving spatial structure
- [[Feature Map]] -- output of convolution showing feature locations
- [[Convolutional Neural Network]] -- CNN architecture for spatial data
- [[Max Pooling]] -- downsampling by taking maximum values in patches
- [[Receptive Field]] -- the input region influencing a single neuron
- [[Object Detection]] -- localizing and classifying objects with bounding boxes
- [[Semantic Segmentation]] -- pixel-level classification of images
- [[R-CNN]] -- region-based CNN for end-to-end object detection

## Connections to Other Lectures
- Builds on Lecture 01's dense layers and non-linearities
- CNN feature extractors reappear in Lecture 04 (VAE debiasing) and Lab 2 (facial detection)
- Vision Transformers mentioned in Lecture 02 are an alternative to CNNs for vision
- Self-driving application connects to Lecture 05's reinforcement learning discussion

## Open Questions
- How do Vision Transformers compare to CNNs in data efficiency and inductive bias?
- What are the limits of transfer learning with pretrained CNN backbones?
- How can CNNs handle scale variation without explicit multi-scale architectures?
