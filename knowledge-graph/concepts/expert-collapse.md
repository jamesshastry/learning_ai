---
aliases: ["expert starvation", "token concentration"]
tags: [training]
type: concept
first_seen: cs336/04
sources:
  - course: cs336
    lecture: "04"
    timestamps: ["01:03:59", "01:08:04"]
---
# Expert Collapse

A degenerate MoE training outcome where the rich-get-richer dynamic causes most tokens to be routed to just 1-2 experts while remaining experts receive no training signal. Without load-balancing interventions, most MoE parameters become wasted.

## Key Points from Sources

- **cs336 Lecture 04**

## Related Concepts

- [[Load Balancing Loss]] (contrasts with) — Load balancing loss is the primary solution to expert collapse
