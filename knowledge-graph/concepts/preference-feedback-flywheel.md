---
aliases: ["Context Feedback Loop", "RLHF for Video", "Context Loop", "Feedback Flywheel"]
tags: [training, product, data, strategy, scaling]
type: concept
first_seen: cs153/08
sources:
  - course: cs153
    lecture: "08"
    timestamps: ["11:24", "11:47", "12:56"]
  - course: cs153
    lecture: "11"
    timestamps: ["23:13", "23:25", "27:17"]
---
# Preference Feedback Flywheel

The system where user interactions with generated content (downloads, likes, multi-turn edits) provide preference signals that improve subsequent model versions. Requires filtering for quality (some users download bad outputs to mock AI) and careful product design to capture meaningful signals.

## Key Points from Sources

- **cs153 Lecture 08**
- **cs153 Lecture 11**

## Related Concepts

- [[Unified Model Architecture]] (enables) — Preference feedback improves the unified model's alignment with human aesthetics and intent.
- [[Skills Layer]] (related to) — Interaction traces from the skills layer feed back into model improvement.
- [[Context Loop Wars]] (enables) — Context feedback loops are the resource being fought over in context loop wars.
- [[Verifiability Thesis]] (prerequisite for) — Context feedback is most useful when task performance can be objectively verified.
