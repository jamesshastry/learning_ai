---
aliases: ["Data Flow Architecture", "Compiler-Driven Compute"]
tags: [infrastructure, architecture, compute]
type: concept
first_seen: mse435/02
sources:
  - course: mse435
    lecture: "02"
    timestamps: ["10:17", "10:21", "10:26"]
---
# Deterministic Chip Architecture

Groq's chip design philosophy where a compiler predetermines where all calculations happen, unlike GPUs which dynamically schedule work. Uses SRAM (>10x faster bandwidth than HBM) instead of external memory, enabling predictable and efficient inference execution.

## Key Points from Sources

- **mse435 Lecture 02**

## Related Concepts

- [[NVLink Fusion]] (enables) — The deterministic nature makes Groq chips complementary rather than competitive to GPUs.
- [[Inference Cost Deflation]] (enables) — Purpose-built inference architecture drives down per-token cost.
