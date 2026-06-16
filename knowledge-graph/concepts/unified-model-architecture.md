---
aliases: ["Uni 1", "Unified Intelligence"]
tags: [architecture, multimodal, models]
type: concept
first_seen: cs153/08
sources:
  - course: cs153
    lecture: "08"
    timestamps: ["18:58", "27:42", "29:10"]
---
# Unified Model Architecture

A single transformer backbone that processes text, image, video, and audio in a shared representation space with modality-specific encoders/decoders. Unlike fused architectures with separate towers and thin bridges, unified models reason across all modalities in one backbone, analogous to the neocortex.

## Key Points from Sources

- **cs153 Lecture 08**

## Related Concepts

- [[Data Scale Dictates Architecture]] (prerequisite for) — Unified models require multimodal data at massive scale across all modalities.
- [[Skills Layer]] (enables) — Unified models can interpret skills that span visual, textual, and audio domains.
