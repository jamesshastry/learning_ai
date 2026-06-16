---
type: Lecture Notes
title: "Deep Learning for Computer Vision – Transfer Learning and Fine-Tuning; Intro to HuggingFace"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "04"
video: https://youtube.com/watch?v=8xh7Y0pBrCE
tags: [computer-vision, cnn, transfer-learning, fine-tuning, convolution, pooling, ResNet]
timestamp: 2026-06-15T00:00:00Z
---

# Deep Learning for Computer Vision – Transfer Learning and Fine-Tuning

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=8xh7Y0pBrCE)

## TL;DR
This lecture explains convolutional neural networks from the ground up — filters that detect features via element-wise multiply-and-sum operations, pooling layers that downsample, and hierarchical feature learning — then demonstrates transfer learning using pretrained ResNet to classify handbags vs. shoes with only ~100 training images, achieving far better results than training from scratch.

## Key Takeaways
1. **Convolutional filters detect image features:** A small matrix of learned weights is slid across the image; element-wise multiplication and summation detects edges, lines, curves, and textures automatically.
2. **Three problems with dense layers for images:** Parameter explosion (millions of inputs × neurons), loss of spatial adjacency information, and lack of translation invariance (learning the same feature separately at every location).
3. **Pooling compresses representations:** Max pooling acts like an "or" detector — asking if any feature fired in a region — reducing spatial dimensions while preserving the number of feature channels.
4. **Transfer learning reuses pretrained knowledge:** Download a network (e.g., ResNet) pretrained on ImageNet (millions of everyday images), freeze its convolutional layers, and only retrain the classification head for your specific task.
5. **Data augmentation artificially expands training data:** Random rotations, flips, zooms, and crops create new valid training examples without changing the image's semantic meaning.

## Detailed Notes

### Problems with Dense Layers for Images [00:16-06:02]
- Flattening a 3024×3024×3 phone photo → 27 million inputs; one 100-neuron dense layer → 2.7 billion parameters
- Spatial adjacency (nearby pixels are related) is lost during flattening
- Translation invariance violated: a vertical line at top-left vs. bottom-right requires learning the same feature twice
- Solution: convolutional layers address all three problems

### Convolutional Filters and Operations [06:02-17:00]
- Filter: small matrix (e.g., 3×3) of numbers; detects a specific feature type
- Operation: overlay filter on image region, multiply matching elements, sum, apply ReLU
- Slide filter across entire image (stride of 1) → produces output feature map
- Horizontal line filter: [1,1,1; 0,0,0; -1,-1,-1] detects horizontal edges
- Vertical line filter: [1,0,-1; 1,0,-1; 1,0,-1] detects vertical edges
- For color images: filter becomes 3D cube (3×3×3 for RGB), still produces 2D output

### Convolutional Layers and Hierarchical Learning [17:00-31:00]
- Layer = collection of multiple filters (e.g., 32 filters → depth-32 output tensor)
- Each filter specializes automatically — no human assignment needed
- Successive layers see progressively larger portions of the original image (expanding receptive field)
- Hierarchical learning: Layer 1 → edges/lines; Layer 2 → textures/patterns; Layer 3+ → object parts/faces
- Filter weights are learned via backprop, just like any other weights — the breakthrough idea

### Pooling Layers [31:00-37:00]
- Max pooling: take maximum of 2×2 region → shrinks spatial dimensions by 2x
- Average pooling: take mean of 2×2 region
- No learnable parameters — pure arithmetic operation
- Acts as feature detector: "did anything fire in this region?"
- Each channel is pooled independently; depth stays the same

### CNN Architecture [37:00-48:00]
- Convolutional block: 1-2 Conv2D layers + MaxPooling2D
- Stack multiple blocks: dimensions shrink, depth grows (e.g., 224×224×3 → 7×7×2048 in ResNet)
- After final conv block: flatten → dense layers → output (softmax/sigmoid)
- Fashion MNIST CNN: 2 conv blocks (32 filters each) → flatten → Dense(256) → Softmax(10) → 90.5% accuracy (up from 88%)
- Keras: `layers.Conv2D(32, kernel_size=(2,2), activation='relu')` + `layers.MaxPooling2D()`

### Transfer Learning [01:00:28-01:07:04]
- Key idea: reuse a network pretrained on a large dataset for your specific problem
- ResNet pretrained on ImageNet (millions of images, 1000 categories) learns general visual features
- Freeze pretrained convolutional layers; replace classification head with your own
- Handbag vs. shoe classifier: scratch CNN = 87%; transfer learning with ResNet = significantly better
- Available in Keras (`keras.applications`) and HuggingFace Hub

### Data Augmentation [01:03:40-01:06:02]
- Randomly flip, rotate, zoom, crop images during training — creates "free" new examples
- Critical constraint: augmentation must not change semantic meaning (no vertical flips for everyday objects)
- Keras layers: `RandomFlip('horizontal')`, `RandomRotation(0.1)`, `RandomZoom(0.1)`
- Inserted right after input layer in model definition

## Notable Quotes
> "This simple idea — why don't we think of the numbers in the filter as just weights and learn them from data — this was the breakthrough." — Instructor [27:01]

> "Max pooling acts like an or condition. Anything fired up? Anything fired up? Yes, okay. Otherwise, no." — Instructor [34:11]

> "The reason I'm doing it from scratch is because you should know how it was done. It should not be a black box to you." — Instructor [49:57]

## Concepts Introduced
- [[Convolutional Filter]] — small learned matrix that detects spatial features in images
- [[Convolutional Neural Network]] — architecture using conv layers, pooling, and dense layers for vision
- [[Max Pooling]] — downsampling operation that takes the maximum value in each region
- [[Transfer Learning]] — reusing a pretrained model's learned features for a new task
- [[Data Augmentation]] — artificially expanding training data via semantic-preserving transformations
- [[Translation Invariance]] — ability to detect a feature regardless of its position in the image

## Connections to Other Lectures
- Builds on dense network and Keras foundations from Lectures 1-3
- Transfer learning concept reappears for NLP with pretrained transformers (Lectures 7-8)
- Fine-tuning approach extended to LLMs in Lecture 10 (PEFT, LoRA)
- HuggingFace Hub introduced here becomes central for NLP models

## Open Questions
- How deep should convolutional networks be for different image domains?
- When should you fine-tune the pretrained layers vs. keep them frozen?
- How do modern architectures like Vision Transformers (ViT) compare to CNNs?
