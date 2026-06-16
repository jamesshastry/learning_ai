---
aliases: ["End-to-End Audio", "Speech-to-Speech"]
tags: [architecture, audio, agents]
type: concept
first_seen: cs153/10
sources:
  - course: cs153
    lecture: "10"
    timestamps: ["24:38", "25:00", "29:13"]
---
# Fused Audio Architecture

Single end-to-end model that processes input speech directly to output speech without text intermediary. Achieves ~300ms response latency with emergent emotional understanding, but sacrifices the reliability, debuggability, and tool-calling control of cascaded approaches.

## Key Points from Sources

- **cs153 Lecture 10**

## Related Concepts

- [[Cascaded Audio Architecture]] (contrasts with) — Fused wins on latency; cascaded wins on reliability and enterprise control.
