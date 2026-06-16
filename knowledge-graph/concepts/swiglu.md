---
aliases: ["Swish-Gated Linear Unit"]
tags: [architecture]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["23:34", "25:00"]
---
# SwiGLU

A gated activation function that multiplies the Swish activation (x * sigmoid(x)) of one linear projection element-wise with a second linear projection. Requires three weight matrices instead of two, so FF dimension is typically reduced by 2/3 to maintain parameter count parity.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[GeGLU]] (contrasts with) — GeGLU uses GELU activation instead of Swish in the gating mechanism
- [[ReLU]] (contrasts with) — SwiGLU consistently outperforms ungated ReLU in controlled experiments
