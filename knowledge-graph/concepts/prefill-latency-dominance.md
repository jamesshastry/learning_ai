---
aliases: ["First-Token Latency", "Context Paging Bottleneck"]
tags: [architecture, compute, optimization]
type: concept
first_seen: mse435/05
sources:
  - course: mse435
    lecture: "05"
    timestamps: ["29:13", "29:20", "30:39", "31:49"]
---
# Prefill Latency Dominance

The 400-500ms delay before the first output token is generated, caused by computing the full input context (potentially 400K tokens) through the attention mechanism. This "prefill" phase dominates total latency, making network proximity (edge compute) irrelevant for now. When Cerebras accelerated token generation, it exposed all other system latencies, forcing end-to-end API optimization.

## Key Points from Sources

- **mse435 Lecture 05**

## Related Concepts

- [[Human as Bottleneck]] (contrasts with) — Prefill latency is the main barrier to achieving human-as-bottleneck flow state.
- [[Heterogeneous Compute]] (enables) — Specialized chips (Cerebras) can dramatically reduce prefill latency but expose other bottlenecks.
