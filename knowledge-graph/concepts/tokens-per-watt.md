---
aliases: ["Intelligence Per Watt"]
tags: [metrics, efficiency, infrastructure]
type: concept
first_seen: cs153/04
sources:
  - course: cs153
    lecture: "04"
    timestamps: ["30:08", "30:12", "39:01"]
---
# Tokens Per Watt

A performance metric measuring AI intelligence output (generated tokens) relative to energy consumption. Considered more meaningful than MFU (Model FLOPs Utilization) for evaluating system efficiency, though still incomplete since different token types have different value.

## Key Points from Sources

- **cs153 Lecture 04**

## Related Concepts

- [[MFU]] (contrasts with) — Tokens per watt captures more than raw compute utilization, which MFU measures.
- [[Co-Design]] (related to) — Achieving high tokens per watt requires co-design across the full stack.
