---
aliases: ["SWE-bench-v", "SWE-bench Verified"]
tags: [benchmarks, software-engineering, evaluation, benchmark]
type: concept
first_seen: cs294-agentic-f25/04
sources:
  - course: cs294-agentic-f25
    lecture: "04"
    timestamps: ["01:18:37"]
  - course: llm-agents-f24
    lecture: "06"
    timestamps: ["05:00", "08:00", "12:00"]
---
# SWE-bench Verified

A benchmark for evaluating coding agents on real-world software engineering tasks, consisting of 2294 GitHub issues from 12 Python repositories where agents must generate patches that pass existing test suites — the gold standard for practical coding agent evaluation.

## Key Points from Sources

- **cs294-agentic-f25 Lecture 04**
- **llm-agents-f24 Lecture 06**

## Related Concepts

- [[SWE-bench]] (improved version of) — Addresses quality issues in the original benchmark
- [[Agent-Computer Interface]] (evaluated by) — SWE-agent showed that ACI design dramatically impacts SWE-bench scores.
- [[OpenHands]] (evaluated on) — OpenHands is regularly evaluated on SWE-bench.
