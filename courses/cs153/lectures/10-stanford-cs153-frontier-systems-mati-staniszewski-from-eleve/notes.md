---
type: Lecture Notes
title: "Mati Staniszewski from ElevenLabs on The Future of Voice Systems"
course: CS153 Frontier Systems
university: Stanford
lecture_id: "10"
video: https://youtube.com/watch?v=vfF011ko89o
tags: [audio-ai, voice-synthesis, text-to-speech, cascaded-vs-fused, dubbing, voice-agents]
timestamp: 2026-06-15T00:00:00Z
---

# Stanford CS153 Frontier Systems | Mati Staniszewski from ElevenLabs on The Future of Voice Systems

**Course:** Frontier Systems
**Video:** [YouTube](https://youtube.com/watch?v=vfF011ko89o)

## TL;DR
Mati Staniszewski, CEO and co-founder of ElevenLabs, traces the company's journey from a Polish dubbing problem to a $430M+ ARR voice AI platform in 36 months with ~450 people. He explains the cascaded audio pipeline (transcription → LLM → text-to-speech), describes how the original insight came from the terrible experience of Polish movies dubbed by a single monotone male voice, and breaks down the critical debate between cascaded and fused architectures for voice agents — arguing cascaded wins for enterprise reliability while fused wins for latency in companion use cases. Key innovations include voice cloning, controllable expressivity, and the emotional Turing test for voice agents.

## Key Takeaways
1. **The dubbing problem revealed the audio pipeline:** AI dubbing requires transcription + translation + voice synthesis. Fixing all three simultaneously was impossible in 2022, so ElevenLabs focused on the common denominator — text-to-speech generation.
2. **Cascaded vs. fused is the central architectural debate:** Cascaded (separate speech-to-text, LLM, text-to-speech) provides reliability, debuggability, and tool-calling for enterprise. Fused (end-to-end audio model) provides lower latency (~300ms) but sacrifices reliability and control.
3. **Expressivity breakthrough required a data labeling investment:** Controlling emotional delivery (excited, reassuring, dramatic) required building new labeled datasets over the past year, since no off-the-shelf data captured sentiment-specific delivery parameters.
4. **Gaming/Discord as petri dish for innovation:** ElevenLabs launched as a Discord bot, ran the company on Discord initially, and used the community to close the feedback loop with users as quickly as possible.
5. **Revenue scales with deployment, not compute:** Unlike Anthropic where revenue correlates with compute, ElevenLabs' revenue scales predictably with the deployment/forward-deployed engineering team that brings AI into enterprise workflows.

## Detailed Notes

### Origin: The Polish Dubbing Problem [05:05-10:00]
- In Poland, foreign movies are narrated by a single monotone male voice reading all characters with intentionally flat delivery "so the audience can interpret the emotions for themselves."
- Vision: access all content in any language with original tonality and emotions. Left Google and Palantir to pursue this.
- The dubbing pipeline requires three models: (1) Transcription (who's speaking, remove background), (2) Translation via LLM, (3) Text-to-speech preserving original voice performance.
- In 2022, none of these components were good enough; LLM translation was poor, GPT hadn't happened yet.

### First Breakthrough: Voice Cloning and Contextual TTS [10:00-15:30]
- Open-source model Tortoise TTS (James Betker, built nights-and-weekends at Google) first achieved human-like delivery on short fragments — but was extremely slow and unstable beyond one sentence.
- ElevenLabs' innovations: (1) Contextual understanding — if text is happy, deliver happily; if dialogue, deliver as dialogue. Used next-token prediction with context. (2) Abstract voice characterization — instead of hard-coding gender/accent/age parameters, let the model learn voice characteristics abstractly.
- Initial compute cost: tens of thousands of dollars (used Nvidia Inception program free credits). Models were hundreds of millions of parameters.

### Timeline of Audio AI Progress [15:30-22:00]
- **2022:** First text-to-speech breakthrough (contextual delivery, voice cloning). English only.
- **2023:** Expansion to multi-language voices, voice marketplace where users contribute/share voices, audiobook and creative tooling.
- **2024:** AI dubbing/localization pipeline finally works. Javier Milei UN speech dubbed to English. Lex Fridman conversations with world leaders (Zelenskyy, Modi) dubbed maintaining original voice characteristics.
- **2025:** Real-time voice agents — cascaded pipeline (STT → LLM → TTS) fast enough for interactive use. Emotional expressivity and controllable delivery.
- **2026 (predicted):** Cascaded-to-fused transitions, further latency cuts, hybrid approaches.

### Cascaded vs. Fused Architecture [23:35-30:40]
- **Cascaded:** Three separate models (STT, LLM, TTS). Advantage: use the smartest LLM available, reliable tool-calling, each step debuggable, can add guardrails at each stage. Disadvantage: higher latency, complex pipeline integration, emotion lost in text transcription.
- **Fused:** Single model processing audio-to-audio. Advantage: ~300ms response time, emergent emotional understanding. Disadvantage: less reliable for enterprise (can't track what happened at each step), harder to integrate tool-calling, depends on open-source LLM quality (lags behind closed-source).
- **Hybrid future:** Information-only queries use fused (fast, no action needed). Authenticated actions (booking, payment) switch to cascaded (reliable, auditable). Blend within a single conversation.
- Expressivity/emotionality is fixable in BOTH approaches — recent ElevenLabs release detects emotions on transcription side, passes as parameter to LLM, generates emotionally appropriate response.

### Business Model and Growth [35:00-42:00]
- $0 → $330M ARR in 2025 → $430M+ with $100M added in most recent quarter alone.
- ~450 people. Teams of <10 with big mandates and independent decision-making authority.
- Revenue split: >50% enterprise (predictable, scales with deployment team), <50% PLG/self-serve (less predictable, scales with model innovation).
- **Pricing principle:** Start from customer value delivered, work backwards to capture ~1/10th. Never price from cost of compute/operations.
- Forward-deployed engineers work alongside enterprises to bring applied AI into specific workflows — this deployment capacity is the predictable revenue bottleneck.

### Safety and Voice Authentication [42:48-44:30]
- Voice cloning risks: fraud, scams, identity impersonation. ElevenLabs builds safety into models from the start.
- Three safety layers: (1) Trace generated content back to creator, (2) Moderate for fraud/scams before generation, (3) Public AI detection system with watermarking.
- **Voice authentication is not the future** — ElevenLabs explicitly advises against using voice as authentication (banking, etc.) given cloning capabilities.
- Counter-offensive use case: charity deployed voice agents to waste scammers' time when caller IP indicated likely fraud.

### On-Device Models [01:03:22-01:04:35]
- Recently figured out how to constrain models to single languages for on-device deployment.
- Quality gap still exists between on-device and cloud versions. On-device handles text-to-speech but not the full interactive pipeline (transcription, emotion transfer, tool-calling).
- Philosophy: fix cloud quality first, then bring to device — not the reverse of shipping lower quality to device early.

### Collaboration as Competitive Advantage [31:00-35:00]
- ElevenLabs and Sesame (founded by former Oculus CEO Brendan Iribe) have a collaborative relationship — angel investments in each other, knowledge sharing.
- "If you are to pick competition, you probably want it to be one of the hyperscalers or legacy companies. It pulls you up."
- Community adoption shows use cases 6-12-18 months before mainstream diffusion.

## Notable Quotes
> "So the audience can interpret the emotions for themselves." — Mati Staniszewski (on Polish dubbing philosophy) [06:07]
> "Never start from the cost. Start from the value and work backwards from there." — Mati Staniszewski [42:07]
> "Voice authentication is not the future and you should step away from this." — Mati Staniszewski [43:51]
> "Being close to the users is super valuable, but more so in those early days, you need to be extremely problem-obsessed." — Mati Staniszewski [04:48]

## Concepts Introduced
- [[Cascaded Audio Architecture]] — Three-model pipeline (speech-to-text, LLM reasoning, text-to-speech generation) providing enterprise reliability at the cost of latency.
- [[Fused Audio Architecture]] — Single end-to-end audio model processing speech directly to speech without text intermediary, achieving ~300ms latency but sacrificing reliability and debuggability.
- [[Voice Cloning]] — The ability to replicate a person's voice characteristics from audio samples, enabling dubbing, voiceover, and personalization but raising security concerns about identity fraud.
- [[Emotional Expressivity Control]] — The ability to detect emotional context from input speech and control the emotional delivery of generated speech, requiring specialized labeled training data.
- [[PLG Motion]] — Product-led growth strategy where community/developer adoption drives distribution and context feedback before enterprise sales, as demonstrated by ElevenLabs' Discord bot origin.

## Connections to Other Lectures
- **Lecture 08 (Amit Jain, Luma AI):** Amit's federated vs. unified architecture debate directly parallels Mati's cascaded vs. fused debate — both address the fundamental question of specialized pipeline vs. integrated model.
- **Lecture 09 (Andreas Blattmann, BFL):** Andy's natural vs. unnatural representations framework explains why audio models must handle natural representations (voice, emotion) differently from text.
- **Lecture 01 (Resilience):** The cybersecurity leader's emphasis on proactive defense parallels ElevenLabs' approach to building safety into models from the start rather than retrofitting guardrails.

## Open Questions
- Will fused audio models eventually match cascaded reliability for enterprise use, or will the hybrid approach persist indefinitely?
- How should IP and economics be structured for voice licensing when AI can perfectly clone any voice?
- Can the emotional Turing test (agent responding with contextually appropriate emotions) be passed in 2026, and what are the implications for human-AI relationships?
- As on-device models improve, will the cloud-first quality philosophy remain viable, or will competitive pressure force earlier on-device deployment?
