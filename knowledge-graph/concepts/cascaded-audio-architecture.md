---
aliases: ["Cascaded Pipeline", "Three-Model Pipeline"]
tags: [architecture, audio, agents]
type: concept
first_seen: cs153/10
sources:
  - course: cs153
    lecture: "10"
    timestamps: ["21:16", "24:21", "28:48"]
---
# Cascaded Audio Architecture

Audio agent architecture using three separate models in sequence: speech-to-text transcription, LLM reasoning/response generation, and text-to-speech synthesis. Provides enterprise reliability, debuggability, and tool-calling at each stage, but with higher latency than fused approaches.

## Key Points from Sources

- **cs153 Lecture 10**

## Related Concepts

- [[Fused Audio Architecture]] (contrasts with) — Cascaded prioritizes reliability; fused prioritizes latency.
- [[Emotional Expressivity Control]] (enables) — Cascaded architecture can detect emotions in STT and pass as parameters to TTS.
