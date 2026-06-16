---
aliases: ["Grace Blackwell NVLink72", "Rack-Scale Computer"]
tags: [hardware, infrastructure, inference]
type: concept
first_seen: cs153/04
sources:
  - course: cs153
    lecture: "04"
    timestamps: ["30:29", "34:42", "35:20"]
---
# NVLink72

NVIDIA's interconnect technology that gangs 72 GPUs together into a single rack-scale computer, providing aggregate memory bandwidth far beyond a single chip. Designed for efficient decode/inference of large language models, achieving 50x improvement over the previous Hopper generation.

## Key Points from Sources

- **cs153 Lecture 04**

## Related Concepts

- [[Co-Design]] (part of) — NVLink72 is a product of full-stack co-design philosophy.
- [[Tokens Per Watt]] (enables) — NVLink72's aggregate bandwidth is the key factor for high tokens-per-watt in decode.
