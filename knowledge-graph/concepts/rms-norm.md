---
aliases: ["root mean square normalization"]
tags: [architecture, optimization]
type: concept
first_seen: cs336/03
sources:
  - course: cs336
    lecture: "03"
    timestamps: ["14:17", "14:40"]
---
# RMS Norm

A simplified layer normalization that omits mean subtraction and bias addition, only dividing by the root mean square of activations then scaling. Achieves same model quality as layer norm but with less memory movement overhead.

## Key Points from Sources

- **cs336 Lecture 03**

## Related Concepts

- [[Layer Norm]] (contrasts with) — RMS norm drops mean subtraction for efficiency without quality loss
