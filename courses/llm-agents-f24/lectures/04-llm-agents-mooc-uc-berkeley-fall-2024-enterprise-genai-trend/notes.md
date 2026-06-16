---
type: Lecture Notes
title: "Enterprise GenAI Trends & AI Agents"
course: llm-agents-f24 Large Language Model Agents
university: UC Berkeley
lecture_id: "04"
video: https://youtube.com/watch?v=Sy1psHS3w3I
tags: [enterprise, fine-tuning, grounding, RAG, function-calling, distillation]
timestamp: 2026-06-15T00:00:00Z
---

# Enterprise GenAI Trends & AI Agents — Burak Gokturk (Google)

**Course:** Large Language Model Agents
**Video:** [YouTube](https://youtube.com/watch?v=Sy1psHS3w3I)

## TL;DR
Burak Gokturk surveys enterprise AI trends from Google's Vertex AI perspective, covering how base model improvements outpace domain-specific models, the shift from model selection to platform selection, practical approaches to fine-tuning (LoRA dominates), grounding with search for factuality, and function calling to extend LLM capabilities to real-world actions. Key insight: the barrier to AI development has dropped from AI experts to any developer, driving exponential growth.

## Key Takeaways
1. **Base models improve faster than domain-specific models:** By the time a domain-specific model ships, the next base model often surpasses it — enterprises should focus on customization over specialized training.
2. **Platform over model selection:** Enterprises want multi-model access, evaluation tools, and customization capabilities rather than betting on a single model.
3. **LoRA is the dominant fine-tuning approach:** Parameter-efficient fine-tuning (LoRA/QLoRA) is storage-efficient and practical; full fine-tuning and prompt tuning see limited enterprise adoption.
4. **Grounding with search is essential for factuality:** Combining LLMs with search addresses hallucination, recency, and citation needs — nearly every enterprise use case now incorporates search.
5. **Function calling enables real-world actions:** LLMs need to recognize when they cannot answer and select the right external function/API, similar to "calling a friend" on Who Wants to Be a Millionaire.

## Detailed Notes

### AI History & Acceleration [00:03–05:00]
- Neural networks went from derided to dominant; predictions off by ~85 years on timeline
- Three enablers: parallelizable architecture, massive training data via masking/next-token prediction, hardware improvements (GPU/TPU)

### Enterprise Trends [16:00–28:02]
- AI adoption exploded post-ChatGPT (Nov 2022); enterprises shifted from months/years to days for AI projects
- Developer democratization: any developer can build AI applications, 100x more developers than AI experts
- Dense models → sparse models (MoE) reducing cost and latency; multimodal unification across text/image/video/audio
- API costs approaching zero; latency decreasing expands application possibilities
- 36x growth in Vertex AI API calls in first 8 months of 2024

### Customization Stack [34:35–44:03]
- Prompt design (0-5 examples, most popular), prompt tuning (learns embedding vectors, underused), LoRA fine-tuning (parameter-efficient, enterprise favorite), full fine-tuning (rare due to compute)
- Distillation: teacher-student model approach; large models generate soft labels, smaller models learn from them; avoids manual labeling
- Temperature parameter in softmax controls soft vs. hard label distribution

### Grounding & Search [48:00–54:01]
- Three reasons search is needed: training data is stale, hallucination risks, and inability to cite sources
- RAG pipeline: convert prompt to search query → retrieve results → augment LLM context → validate citations
- Dynamic retrieval: intelligently decide when to invoke search (cost optimization)
- Model factuality improvements via RLHF with grounding rewards

### Function Calling & Extensions [54:08–58:19]
- LLMs cannot book flights, access databases, or take real-world actions without extensions
- Two challenges: recognizing when to call a function, and selecting the right one from a growing library
- Three steps: define functions, train LLM to recognize needs, inference-time function selection
- Enables structured outputs, real-time information, customer data access, and transactions

### Evaluation Trends [59:00–01:00:40]
- Auto side-by-side evaluation using large models as judges shows significant correlation with human evaluation
- LLM-as-judge addresses human rater shortage

## Notable Quotes
1. "Where we are today — we thought we would be here about in 100 years, whereas we arrived there in 15 years."
2. "Any developer can start building AI applications using large language models — that's a big culture change."
3. "The pace of improvement in the base large models is so large that you can produce a domain-specific model and by the time the new base model comes, it's usually already better."
4. "Large language models are great in reasoning but they're not great in taking actions."
5. "It was cheaper to run a flash model, which is supposed to be not free, than an open-source model because you still need to figure out the hardware."

## Concepts Introduced
- [[LoRA Fine-Tuning]], [[Model Distillation]], [[Grounding with Search]], [[Function Calling]], [[Dynamic Retrieval]], [[Needle in a Haystack Test]]

## Connections to Other Lectures
- Lecture 03 (Chi Wang/Jerry Liu) covers RAG implementation details that grounding builds upon
- Lecture 05 (Omar Khattab) provides an alternative to manual prompt engineering through automated optimization
- Lecture 10 (Percy Liang) discusses open-source alternatives to the enterprise platforms described here

## Open Questions
1. Will large context windows eventually replace traditional search/retrieval?
2. How do we systematically evaluate function-calling accuracy as extension libraries grow?
3. What is the optimal tradeoff between model factuality and reasoning/creativity?
