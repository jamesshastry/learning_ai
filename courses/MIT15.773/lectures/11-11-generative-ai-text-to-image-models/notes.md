---
type: Lecture Notes
title: "Generative AI – Text-to-Image Models"
course: MIT15.773 Hands-On Deep Learning
university: MIT
lecture_id: "11"
video: https://youtube.com/watch?v=NQBhhRG-Pe4
tags: [diffusion-models, stable-diffusion, text-to-image, generative-ai, CLIP, image-generation]
timestamp: 2026-06-15T00:00:00Z
---

# Generative AI – Text-to-Image Models

**Course:** Hands-On Deep Learning
**Video:** [YouTube](https://youtube.com/watch?v=NQBhhRG-Pe4)

## TL;DR
Diffusion models generate images by learning to reverse a gradual noise-adding process, guided by text embeddings from CLIP to enable text-to-image generation. Latent diffusion (Stable Diffusion) makes this computationally feasible by operating in a compressed latent space rather than pixel space.

## Key Takeaways
1. **Diffusion = learning to reverse noise:** The forward process gradually adds Gaussian noise to images over hundreds of steps until pure noise; the reverse process trains a neural network (U-Net) to denoise step-by-step, generating images from random noise.
2. **CLIP connects text and image understanding:** Contrastive Language-Image Pre-training learns a shared embedding space where text descriptions and corresponding images are mapped to nearby vectors, enabling text-guided image generation.
3. **Latent diffusion makes generation computationally feasible:** Instead of denoising in full pixel space (e.g., 512×512×3), Stable Diffusion uses a VAE to compress images to a small latent representation, performs diffusion there, then decodes back to pixels.
4. **Classifier-free guidance controls text fidelity:** A guidance scale parameter trades off between diversity (low guidance) and strict text adherence (high guidance), allowing users to control how literally the model follows the prompt.
5. **Ethical implications are significant:** These models raise questions about deepfakes, copyright of training data, artistic ownership, and potential misuse for misinformation.

## Detailed Notes

### Generative Models Overview [00:00-10:00]
- GANs (Generative Adversarial Networks): generator vs. discriminator game — historically dominant but training instability
- VAEs (Variational Autoencoders): encode to latent space, decode back — good but often blurry
- Diffusion models: emerged as superior approach, producing highest-quality images

### The Diffusion Process [10:00-30:00]
- Forward process (fixed, not learned): progressively add small amounts of Gaussian noise over T steps (typically 1000)
- At step T: image is indistinguishable from pure random noise
- Reverse process (learned): train a U-Net to predict and remove noise at each step
- Training objective: given a noisy image and timestep t, predict the noise that was added
- Generation: start from random noise, iteratively denoise through T steps
- Each denoising step removes a small amount of noise, gradually revealing a coherent image

### U-Net Architecture for Denoising [30:00-40:00]
- U-Net: encoder-decoder architecture with skip connections (from biomedical image segmentation)
- Encoder: series of downsampling blocks extracting features at multiple scales
- Decoder: series of upsampling blocks reconstructing the image
- Skip connections: pass high-resolution features from encoder to decoder (preserve detail)
- Inputs: noisy image + timestep embedding + text conditioning
- Output: predicted noise to be subtracted

### CLIP: Connecting Text and Images [40:00-50:00]
- Trained on 400M image-text pairs from the internet
- Contrastive learning: maximize similarity between matching image-text pairs, minimize for non-matching
- Produces aligned embeddings: text and images live in the same vector space
- Text encoder: transformer-based; Image encoder: ViT or ResNet-based
- Used to condition the denoising process via cross-attention in the U-Net

### Latent Diffusion and Stable Diffusion [50:00-01:05:00]
- Problem: pixel-space diffusion on 512×512 images is extremely expensive
- Solution: use a pretrained VAE to compress images to a latent space (e.g., 64×64×4)
- Perform all diffusion steps in this compressed latent space
- Decode final denoised latent back to pixel space using VAE decoder
- Stable Diffusion: open-source latent diffusion model by Stability AI
- Makes text-to-image generation feasible on consumer GPUs

### Classifier-Free Guidance [01:05:00-01:10:00]
- During training: randomly drop text conditioning (replace with empty/null text) some fraction of the time
- At inference: compute both conditional (with text) and unconditional (without text) predictions
- Guided prediction: unconditional + guidance_scale × (conditional - unconditional)
- Higher guidance scale → more text-adherent but less diverse images
- Typical values: 7-15 for good results

### Ethical Considerations [01:10:00-01:17:00]
- Training data concerns: models trained on internet images may include copyrighted material
- Deepfakes and misinformation: realistic generated images can be misused
- Artistic impact: implications for artists, photographers, and creative professionals
- Bias: models inherit biases present in training data
- Ongoing legal and regulatory discussions worldwide

## Notable Quotes
> "Diffusion models work by learning to do something seemingly simple — remove a little bit of noise — and repeating that simple step many times to create something extraordinary." — Instructor

> "CLIP is the bridge between language and vision, and it's what makes text-to-image generation possible." — Instructor

## Concepts Introduced
- [[Diffusion Models]] — generative models that learn to reverse a gradual noise-adding process
- [[CLIP]] — contrastive model learning aligned text-image embeddings for cross-modal understanding
- [[Latent Diffusion]] — performing diffusion in compressed latent space for computational efficiency
- [[Stable Diffusion]] — open-source latent diffusion model for text-to-image generation
- [[U-Net]] — encoder-decoder architecture with skip connections used for denoising
- [[Classifier-Free Guidance]] — inference technique trading diversity for text adherence
- [[VAE]] — variational autoencoder used to compress images to/from latent space

## Connections to Other Lectures
- Builds on embeddings (Lecture 6) and attention mechanisms (Lecture 7) used in CLIP and U-Net
- CNNs from Lecture 4 form the backbone of U-Net architecture
- Generative AI paradigm introduced in Lecture 1 comes full circle
- Cross-attention in U-Net uses the same mechanism as transformer decoder (Lecture 7)

## Open Questions
- How will video diffusion models evolve from image generation?
- What legal frameworks will emerge for AI-generated content and training data copyright?
- Can diffusion models be made more efficient (fewer denoising steps) without quality loss?
- How do consistency models and flow matching compare to traditional diffusion?
