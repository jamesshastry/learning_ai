---
aliases: ["query-key normalization"]
tags: [architecture, training]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["01:10:04", "01:11:27"]
---
# QK Norm

A stability technique that applies RMS normalization to queries and keys before computing attention scores. Ensures inputs to the attention softmax have controlled scale, preventing attention degeneracies and gradient spikes. Originally from multimodal models, now standard in large language models.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[Z-Loss]] (related to) — Both are stability interventions targeting softmax operations
