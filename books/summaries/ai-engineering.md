---
title: "AI Engineering: Building Applications with Foundation Models"
author: Chip Huyen
publisher: O'Reilly
year: 2025
isbn: 978-1-098-16630-4
tags: [ai-engineering, foundation-models, LLMs, RAG, finetuning, prompt-engineering]
---

# AI Engineering: Building Applications with Foundation Models

**Author:** Chip Huyen | **Publisher:** O'Reilly, 2025

---

## Chapter 1: Introduction to Building AI Applications with Foundation Models (pp. 1–38)

### TL;DR
AI engineering is a new discipline sitting above ML engineering, focused on adapting foundation models to specific applications rather than training models from scratch. The chapter frames the AI engineering stack, distinguishes it from classical ML engineering, and surveys the landscape of application types and the build-vs-buy decision.

### Key Concepts
- **AI engineering stack** has three layers: (1) infrastructure (compute, storage, networking), (2) model development (training, evaluation, deployment of foundation models), and (3) application development (where AI engineers primarily work — building products on top of foundation models)
- **Foundation models** are large models trained on broad data and adapted to many tasks; they shift the paradigm from task-specific ML to general-purpose model adaptation
- **AI engineering vs. ML engineering**: ML engineers build and train models; AI engineers adapt existing models to applications via prompting, RAG, finetuning, and system design
- **Build vs. buy decision** analyzed along 7 axes: data privacy, data lineage, latency, performance, functionality, control, and cost — proprietary APIs win on ease, self-hosted models win on privacy and control
- **Application types**: conversational AI (chatbots, virtual assistants), coding assistants, search and recommendation, data analysis, content generation, AI agents
- **Evaluation-driven development**: the central workflow — define what success looks like, measure it continuously, iterate

### Notable Frameworks/Techniques
- Three-layer AI engineering stack
- Build vs. buy framework (7 axes)
- Evaluation-driven development as a guiding principle

### Key Takeaway
AI engineering is fundamentally about adapting foundation models to specific use cases — the core loop is: define the task, evaluate outputs, and iterate using prompting, RAG, or finetuning.

---

## Chapter 2: Understanding Foundation Models (pp. 39–100)

### TL;DR
Foundation models are built on the transformer architecture, which uses attention mechanisms to process sequences. This chapter explains how transformers work mechanically, surveys alternative architectures, covers scaling laws, and details post-training techniques (SFT, RLHF, DPO) that turn base models into instruction-following assistants.

### Key Concepts
- **Transformer architecture**: attention mechanism computes relevance between tokens using Query, Key, and Value (Q/K/V) vectors; multi-head attention runs multiple attention computations in parallel
- **Seq2seq vs. transformer**: seq2seq models use fixed-size context vectors; transformers allow each output token to attend to all input tokens directly
- **Alternative architectures**: RWKV (recurrent with constant memory), SSMs — S4, H3, Mamba, Jamba (state space models with linear scaling), Mixture of Experts (MoE / sparse models)
- **Chinchilla scaling law**: compute-optimal training uses ~20 tokens per model parameter — a 70B model optimally trains on ~1.4T tokens; many models are now "overtrained" for cheap inference
- **Post-training pipeline**: (1) Supervised Finetuning (SFT) on instruction-following data, then (2) Preference Finetuning via RLHF or DPO
- **RLHF**: train a reward model from human preferences, then optimize the language model via PPO reinforcement learning; DPO (used by Llama 3) is a simpler alternative that avoids a separate reward model
- **Sampling strategies**: greedy (argmax), temperature scaling, top-k, top-p (nucleus sampling); temperature controls randomness/creativity
- **Test time compute**: best-of-N sampling, beam search, process/outcome verifiers — allocating more compute at inference time improves quality
- **Structured outputs**: achieved via prompting, post-processing, constrained sampling, or finetuning
- **Hallucination**: two hypotheses — "self-delusion" (model doesn't know it doesn't know) and mismatched knowledge between pre-training and post-training data

### Notable Frameworks/Techniques
- Multi-head attention, Q/K/V vectors
- Mixture of Experts (MoE)
- Chinchilla scaling law
- SFT → RLHF / DPO post-training pipeline
- Top-p (nucleus) sampling
- Best-of-N, beam search, verifiers for test time compute

### Key Takeaway
Post-training (SFT + preference finetuning) is what transforms a base language model into a useful assistant — understanding this pipeline is essential for evaluating and adapting foundation models.

---

## Chapter 3: Evaluation Methodology (pp. 101–150)

### TL;DR
Evaluating AI systems is one of the hardest problems in the field. The chapter systematically covers metrics from bit-level perplexity to human-like comparative evaluation, introduces AI-as-a-judge methods with their known biases, and explains comparative ranking algorithms used in systems like the LMSYS Chatbot Arena.

### Key Concepts
- **Language model metrics**: cross-entropy loss, perplexity (exp of cross-entropy), bits-per-character (BPC), bits-per-byte (BPB) — lower is better for all
- **Functional correctness**: pass@k metric — for code tasks, generate k solutions and measure what fraction passes tests; more robust than single-shot accuracy
- **Lexical similarity metrics**: BLEU (precision-based n-gram overlap for translation), ROUGE (recall-based, common for summarization), METEOR++ (includes synonyms), TER, CIDEr — all compare against reference texts
- **Semantic similarity**: BERTScore (uses BERT embeddings to measure token-level similarity), MoverScore, cosine similarity of embeddings — better than lexical for paraphrase-tolerant tasks
- **Embeddings**: BERT for text, CLIP for text+image, Sentence Transformers, joint embedding spaces for cross-modal retrieval
- **AI as a Judge (LLM-as-judge)**: GPT-4 agrees with human judges ~85% on MT-Bench; dramatically reduces evaluation cost vs. human annotation
- **AI judge biases**: inconsistency across runs (~10–25% self-preference bias), first-position bias (prefers the first response shown), verbosity bias (longer responses preferred), criteria ambiguity
- **Specialized judges**: reward models (Cappy), reference-based judges (BLEURT, Prometheus), preference models (PandaLM, JudgeLM)
- **Comparative evaluation**: Elo rating, Bradley-Terry model, TrueSkill — pairwise comparisons aggregated into global rankings
- **LMSYS Chatbot Arena**: crowdsourced pairwise evaluation where users vote for better model response; major real-world benchmark driven by these algorithms
- **Transitivity assumption**: comparative systems assume A > B > C implies A > C, which can fail in practice

### Notable Frameworks/Techniques
- pass@k metric
- BLEU, ROUGE, METEOR++
- BERTScore, cosine semantic similarity
- LLM-as-judge methodology
- Elo / Bradley-Terry / TrueSkill ranking
- LMSYS Chatbot Arena

### Key Takeaway
LLM-as-judge is now a standard, cost-effective evaluation method, but engineers must explicitly account for and mitigate its known biases (self-preference, verbosity, position) to get reliable signal.

---

## Chapter 4: Evaluate AI Systems (pp. 151–200)

### TL;DR
Evaluating AI systems in practice requires choosing the right benchmarks for model selection, designing a rigorous evaluation pipeline, and carefully curating evaluation data. The chapter introduces step-by-step pipeline design, discusses data contamination risks, and explains statistical best practices for reliable evaluation.

### Key Concepts
- **Model selection criteria**: domain-specific capability, generation quality, safety, multimodality support, cost per token, latency, context length, instruction-following fidelity
- **Public benchmarks**: MMLU (massive multitask language understanding, 57 subjects), HumanEval (code generation), HELM (holistic evaluation), Big-Bench (204 tasks), MT-Bench (multi-turn conversations), MATH, GSM8K (grade school math)
- **Data contamination**: train/test leakage occurs when benchmark data appears in pre-training corpora; detected via n-gram overlapping and perplexity-based methods
- **Evaluation pipeline (3 steps)**:
  1. Evaluate all components — turn-based metrics (per response) and task-based metrics (end-to-end)
  2. Create evaluation guidelines — define criteria, scoring rubrics with examples, tie metrics to business outcomes
  3. Define evaluation methods and data — choose judge types, annotate examples, use data slicing to catch subgroup failures, bootstrapping for statistical reliability
- **Simpson's paradox**: a model can win on average while losing on every individual subgroup — slice evaluation is essential
- **Sample size guidance**: ~100 examples to detect a 10% performance difference; ~1,000 examples for 3% differences
- **Inverse Scaling phenomenon**: some capabilities degrade as model size increases — bigger is not always better for specific tasks
- **Evaluation-driven development**: teams build what they can measure; coding tasks dominate partly because they are easiest to evaluate via execution

### Notable Frameworks/Techniques
- MMLU, HumanEval, MT-Bench, HELM, GSM8K
- Data slicing for subgroup evaluation
- Bootstrapping for evaluation confidence intervals
- Simpson's paradox awareness
- Turn-based vs. task-based evaluation distinction

### Key Takeaway
Good evaluation requires both the right metrics and enough statistically reliable examples — a 10% performance difference requires at least 100 carefully curated examples, and per-slice analysis is mandatory to avoid Simpson's paradox masking failures.

---

## Chapter 5: Prompt Engineering (pp. 201–260)

### TL;DR
Prompt engineering is the first and lowest-cost tool for adapting foundation models. The chapter covers prompt anatomy, in-context learning techniques, best practices for effective prompts, automated optimization tools, and defensive techniques against prompt attacks.

### Key Concepts
- **Prompt anatomy**: task description + examples (few-shot) + the actual task; in-context learning lets models generalize from examples without weight updates
- **Zero-shot vs. few-shot**: zero-shot relies on model's prior knowledge; few-shot provides demonstrations that dramatically improve performance on structured tasks
- **System prompt vs. user prompt**: concatenated into the final prompt; system prompt receives higher priority in the model's instruction hierarchy
- **Context length expansion**: GPT-2 had 1K tokens; Gemini-1.5 Pro extended to 2M tokens; long contexts create new capabilities but also challenges
- **Needle in a Haystack (NIAH) test**: measures whether models can retrieve specific information buried in long contexts; many models degrade for information in the middle
- **Prompt best practices**: write clear/explicit instructions, adopt a persona, provide worked examples, specify output format with markers, include sufficient context, break complex tasks into subtasks, use chain-of-thought (CoT) prompting, include self-critique steps
- **Chain-of-Thought (CoT)**: prompting the model to reason step-by-step before answering; dramatically improves performance on multi-step reasoning tasks
- **Prompt decomposition**: breaking tasks into subtasks improves monitoring, debugging, parallelization, and reduces per-prompt complexity
- **Automated optimization tools**: OpenPrompt, DSPy (compiles task descriptions to optimized prompts), Promptbreeder (evolutionary search), TextGrad
- **Prompt versioning**: store prompts separately from code, use semantic versioning, maintain prompt catalogs; treat prompts as first-class artifacts
- **Defensive prompt engineering**:
  - Threat types: prompt extraction (stealing system prompts), jailbreaking (bypassing safety), indirect injection (malicious content in retrieved documents)
  - Attack methods: obfuscation, output formatting manipulation, roleplaying (DAN), automated attacks (PAIR), training data extraction (divergence attack)
  - Defense levels: model-level (instruction hierarchy with 4 priority levels, Wallace et al. 2024), prompt-level (explicit constraints, repeat system prompt), system-level (input/output filtering, anomaly detection, human approval for write actions)
- **Security metrics**: violation rate (fraction of malicious prompts that succeed) and false refusal rate (fraction of legitimate prompts incorrectly blocked)

### Notable Frameworks/Techniques
- Chain-of-Thought (CoT) prompting
- Needle in a Haystack (NIAH) evaluation
- DSPy, Promptbreeder, TextGrad for automated optimization
- PAIR attack framework
- Instruction hierarchy (4-level priority system, Wallace et al. 2024)
- Indirect prompt injection attack pattern

### Key Takeaway
Chain-of-thought prompting and task decomposition are the highest-leverage prompt engineering techniques; for production systems, build a defensive layer that addresses prompt injection at model, prompt, and system levels simultaneously.

---

## Chapter 6: RAG and Agents (pp. 261–306)

### TL;DR
RAG (Retrieval-Augmented Generation) augments models with external knowledge at inference time, solving the problem of stale or missing information without retraining. Agents extend models with tools and memory, enabling multi-step, stateful task completion. This chapter is the architectural heart of applied AI engineering.

### Key Concepts
- **RAG pattern** (Lewis et al. 2020): retrieve relevant documents → augment the prompt → generate; the retriever and generator are separate components
- **RAG remains relevant despite long contexts**: long-context models still suffer from "lost in the middle" degradation, higher cost, and focus issues; RAG is often more efficient
- **Retrieval algorithms**:
  - Term-based (lexical): TF-IDF, BM25, inverted index; exact keyword matching; tools: Elasticsearch, BM25
  - Embedding-based (semantic): dense vector representations, cosine similarity, approximate k-NN; captures meaning not just keywords
  - Sparse vs. dense: term-based = sparse (one-hot-like), embedding-based = dense; SPLADE bridges both using sparse BERT embeddings
- **Vector search algorithms**: LSH (locality-sensitive hashing), HNSW (Hierarchical Navigable Small World — currently most popular), Product Quantization (PQ), IVF (inverted file index with k-means), Annoy (tree-based, Spotify)
- **Vector libraries**: FAISS (Facebook), ScaNN (Google), Annoy (Spotify), Hnswlib
- **Hybrid search**: combine BM25 + semantic retrieval; Reciprocal Rank Fusion (RRF) merges the two ranked lists
- **Retrieval evaluation**: context precision, context recall; ranking metrics NDCG, MAP, MRR; MTEB benchmark for embeddings; BEIR benchmark for IR
- **Chunking strategies**: equal-length, recursive (section → paragraph → sentence), overlapping windows, token-based; no universal best — tune for your use case
- **Reranking**: after initial retrieval, rerank results by relevance using a second model or time-based signals
- **Query rewriting**: reformulate the user query using an AI model to improve retrieval (e.g., expand abbreviations, add context)
- **Contextual retrieval** (Anthropic): augment each chunk with 50–100 token context generated by Claude describing what the chunk is about; significantly improves retrieval
- **Multimodal RAG**: CLIP embeddings enable joint text+image retrieval
- **Tabular RAG**: text-to-SQL workflow — semantic parsing generates SQL → execute → pass results to generator
- **Agents**: any system that perceives its environment and acts upon it using tools; ChatGPT and RAG systems qualify as agents
- **Agent failure modes**: planning failures (invalid tool, valid tool with wrong params, goal failure), tool failures (wrong output, translation errors), efficiency failures (too many steps, high cost/latency)
- **Memory types for agents**:
  - Internal knowledge: training data (immutable without retraining)
  - Short-term memory: context window (fast, limited capacity, lost between sessions)
  - Long-term memory: external retrieval via RAG (persistent, unlimited scale)
- **Memory management strategies**: FIFO eviction, context summarization, reflection approach (Liu et al. 2023)

### Notable Frameworks/Techniques
- RAG architecture (retriever + generator)
- BM25, TF-IDF for lexical retrieval
- HNSW for approximate nearest neighbor search
- FAISS, ScaNN, Annoy vector libraries
- Hybrid search + Reciprocal Rank Fusion (RRF)
- Anthropic's contextual retrieval (50–100 token chunk context)
- CLIP for multimodal retrieval
- Text-to-SQL for tabular RAG
- Chameleon (tool selection), Voyager (skill manager)

### Key Takeaway
Hybrid search (BM25 + semantic) with reranking and query rewriting is the most robust RAG retrieval setup; for agents, the biggest risk is compounding errors across tool calls, so build evaluation at each step of the pipeline.

---

## Chapter 7: Finetuning (pp. 307–361)

### TL;DR
Finetuning adjusts model weights (unlike prompting, which doesn't) to improve domain-specific capabilities, output format, or style. The chapter distinguishes types of finetuning, introduces PEFT techniques (especially LoRA), explains model merging, and gives practical guidance on when and how to finetune.

### Key Concepts
- **Finetuning vs. prompting**: finetuning modifies weights; prompting doesn't; finetuning is for behavior-based failures (format, style, task competence) while RAG is for information-based failures (lacks knowledge, outdated facts)
- **Transfer learning** (Bozinovski and Fulgosi, 1976): reuse knowledge from one domain to improve performance in another; the conceptual foundation for finetuning
- **Types of finetuning**:
  - Self-supervised / continued pre-training (domain data, no labels)
  - Supervised finetuning / instruction tuning (input-output pairs)
  - Preference finetuning (instruction + winning response + losing response triples, for RLHF/DPO)
  - Infilling finetuning (predict masked spans, useful for code editing)
  - Long-context finetuning (modify positional embeddings)
- **When NOT to finetune**: alignment tax (finetuning can degrade other capabilities), requires ML expertise, data and hardware costs, maintenance burden, rapid base model improvement makes finetuned models go stale quickly
- **BloombergGPT case study**: 50B parameter financial model trained for $1.3–2.6M; GPT-4-0314 zero-shot outperformed it on many benchmarks — illustrates the build vs. buy trade-off
- **PEFT (Parameter-Efficient Finetuning)**: trains only a small subset of parameters; dominant approach for practical finetuning
- **LoRA (Low-Rank Adaptation)**: decomposes a weight matrix W (n×m) into two smaller matrices A (n×r) and B (r×m); only A and B are trained; rank r is a key hyperparameter (typically 4–64); W' = W + (α/r)·AB
  - For GPT-3 175B, LoRA uses ~4.7M trainable parameters vs. 175B full — 0.0027% of total
  - Apply to all 4 attention matrices (Wq, Wk, Wv, Wo) for best results; feedforward layers also help
  - Why LoRA works: pre-training implicitly minimizes intrinsic dimension; larger models have lower intrinsic dimension, making PEFT more effective
- **Quantized LoRA (QLoRA)**: stores model weights in 4-bit NF4 format, dequantizes to BF16 for compute; enables finetuning 65B models on a single 48GB GPU; produces Guanaco models (competitive with GPT-3.5)
- **Multi-LoRA serving**: keep base model W and adapter pairs (A, B) separate; swap adapters per customer/task without reloading the full model; dramatically reduces storage vs. serving N separate finetuned models
- **Model merging**: combine multiple finetuned models into one without extra inference cost; approaches:
  - Summing: linear combination (weighted average of weights), SLERP (spherical linear interpolation)
  - Task vectors: finetune - base = task vector; task arithmetic allows adding/subtracting capabilities
  - TIES and DARE: prune redundant task-vector parameters before merging to reduce interference
  - Layer stacking (frankenmerging): take layers from different models and stack them; creates MoE-like models; used by Goliath-120B
  - Concatenation: merge LoRA adapters by concatenating (rank r1 + r2); not recommended due to parameter overhead
- **Finetuning tactics**: start with the strongest model you can afford; use progression path (cheap model → validate data → scale up) or distillation path (strong model → generate data → train cheaper model)

### Notable Frameworks/Techniques
- LoRA (Low-Rank Adaptation, Hu et al. 2021)
- QLoRA with NF4 quantization (Dettmers et al. 2023)
- Multi-LoRA serving
- Task vectors and task arithmetic (Ilharco et al. 2022)
- TIES / DARE merging
- Layer stacking / frankenmerging
- PEFT frameworks: Hugging Face PEFT, Axolotl, Unsloth, LitGPT

### Key Takeaway
LoRA is the practical default for finetuning: it achieves near-full-finetuning performance at 0.003% of the trainable parameters, enables multi-model serving without per-model storage costs, and can be combined with quantization (QLoRA) to finetune large models on consumer hardware.

---

## Chapter 8: Dataset Engineering (pp. 363–403)

### TL;DR
High-quality training data is as important as model architecture. This chapter covers the full data pipeline: augmentation and synthesis techniques (rule-based, simulation, AI-powered), the limitations of synthetic data (including model collapse), model distillation as a special synthesis case, and data processing practices (deduplication, quality filtering, inspection).

### Key Concepts
- **Data synthesis motivations**: increase quantity (scale), improve coverage (targeted rare cases, adversarial examples), improve quality (AI more consistent than humans for some tasks), mitigate privacy (synthetic records), distill models (imitate teacher)
- **Rule-based synthesis**: templates + random generators (e.g., Faker for transaction data); procedural generation from gaming (used by DeepMind's AlphaGeometry with 100M synthetic examples)
- **Data augmentation**: for images (rotate, crop, scale, perturb); for text (synonym replacement, paraphrase, back-translation); perturbation (adding noise) improves model robustness
- **Simulation**: generate data from virtual environments; used for robotics (CARLA, Waymo SimCity), rare events (financial crashes), and agent tool-use data (more efficient than human demonstrations)
- **AI-powered synthesis**:
  - Self-play: AI generates both sides of a conversation; used by OpenAI for Dota 2 (180 years of games), AlphaGo
  - Paraphrasing/translation: MetaMath (Yu et al. 2023) rewrote 15,000 GSM-8K examples into 400,000 variants
  - Instruction synthesis: UltraChat (ChatGPT-generated topics → subtopics → examples), Alpaca (175 seed examples → 52,000 via GPT-3), reverse instruction (generate prompts for existing high-quality content)
  - Llama 3 synthesis pipeline: generate problem descriptions → generate solutions → run unit tests → fix errors via prompting → translate to other languages → back-translation for documentation; produced 2.7M+ synthetic coding examples
- **Data verification**: functional correctness (execution), AI judges (score 1–5 or classify), factual consistency checks, anomaly detection, heuristic filters
- **Limitations of synthetic data**:
  - Quality control is difficult ("garbage in, garbage out")
  - Superficial imitation: student models mimic style but not reasoning (Gudibande et al. 2023, "False Promise of Imitating Proprietary LLMs")
  - Model collapse: recursively training on AI-generated data degrades models over generations (Shumailov et al. 2023); can be avoided by mixing with real data
  - Obscured data lineage: AI-generated data inherits training data's biases and potential copyright issues; contaminates benchmarks
- **Model distillation** (Hinton et al. 2015): train a small student model to mimic a large teacher model; DistilBERT reduces BERT by 40% while retaining 97% of performance; Alpaca distills text-davinci-003 into Llama-7B
- **Data processing pipeline**: inspect (distribution analysis, stare at data), deduplicate (whole-document, intra-document, cross-document; tools: MinHash, Bloom filter, dupeGuru), filter (heuristics, quality classifiers, topic detection), clean

### Notable Frameworks/Techniques
- Faker for rule-based generation
- CARLA, SimulationCity for simulation
- Alpaca / Self-Instruct (Wang et al. 2022) instruction synthesis
- Llama 3 synthetic data pipeline
- MinHash, Bloom filter for deduplication
- Model distillation (student-teacher training)
- Cosmopedia (25B synthetic token dataset)

### Key Takeaway
AI-generated data can match or exceed human-annotated data quality for verifiable tasks (code, math), but model collapse is a real risk from recursive self-training — always mix synthetic data with real data and verify quality through execution or AI judges.

---

## Chapter 9: Inference Optimization (pp. 405–448)

### TL;DR
Inference is often the dominant cost for deployed AI systems. This chapter covers optimization at the model level (quantization, pruning, speculative decoding, attention optimization) and the service level (batching strategies, KV caching, prompt caching, parallelism), with concrete benchmarks showing 10x throughput gains are achievable.

### Key Concepts
- **Inference efficiency metrics**: latency (TTFT = time to first token, TPOT = time per output token), throughput (tokens/second), utilization; there is a fundamental latency-throughput trade-off
- **Hardware fundamentals**: compute measured in FLOP/s; memory bandwidth is often the bottleneck for LLMs (memory-bound, not compute-bound); selecting hardware requires matching workload characteristics
- **Three optimization levels**: model level (changes the model), hardware level (kernels, compilers), service level (resource management)
- **Model compression**:
  - Quantization: reduce weight precision (FP32 → FP16 → INT8 → INT4); weight-only quantization is most popular; halving precision halves memory footprint
  - Pruning: remove low-importance parameters (set to zero or remove nodes); makes model sparse; less common in practice due to hardware support challenges
  - Distillation: train smaller model to mimic larger model (covered in Ch. 8)
- **Speculative decoding**: draft model generates K tokens, target model verifies them in parallel; target model accepts longest valid prefix; works because verification is parallelizable while generation is sequential; DeepMind used a 4B draft to speed up Chinchilla-70B — 8x faster drafting, 2x+ overall latency reduction; implemented in vLLM, TensorRT-LLM, llama.cpp
- **Inference with reference**: copy repeated tokens from input rather than generating them; 2x speedup for tasks with heavy input-output overlap (summarization, coding bug fixes)
- **Parallel decoding**: generate multiple future tokens simultaneously; Lookahead decoding (Jacobi method), Medusa (multiple decoding heads predicting future positions); NVIDIA reports 1.9x speedup for Llama 3.1 with Medusa
- **KV cache**: store key and value vectors from previous tokens to avoid recomputation; KV cache for LLaMA 2 13B at batch=32, seq=2048 totals 54 GB without optimization
- **KV cache optimization**:
  - Redesigning attention: local windowed attention (attend to fixed nearby window), cross-layer attention (share KV across layers), multi-query attention (share KV across heads), grouped-query attention
  - Managing KV cache size: PagedAttention (vLLM) — divides cache into non-contiguous blocks, reduces fragmentation; KV quantization, adaptive compression, selective caching
  - FlashAttention (Dao et al. 2022): kernel that fuses matmul + softmax + mask operations; hardware-aware for GPU memory hierarchy; ~15ms → <5ms attention on GPT-2
- **Kernel optimization techniques**: vectorization, parallelization, loop tiling, operator fusion; kernels written in CUDA (NVIDIA), Triton (OpenAI), ROCm (AMD)
- **Inference service optimization (batching)**:
  - Static batching: fixed batch size, wait until full — simple but adds latency
  - Dynamic batching: fixed time window, process when full or timeout
  - Continuous (in-flight) batching (Orca, Yu et al. 2022): add new requests as previous ones complete; dramatically improves GPU utilization
- **Prefill/decode decoupling**: prefill is compute-bound, decode is memory-bound; assigning them to separate GPUs (DistServe, Hu et al. 2024) improves throughput while meeting latency SLOs; prefill:decode ratio typically 2:1 to 4:1 for long inputs
- **Prompt caching**: cache the KV state of shared prompt prefixes (system prompt, few-shot examples); Anthropic offers up to 90% cost savings and 75% latency reduction; Google Gemini offers 75% discount on cached tokens
- **Parallelism strategies**: replica parallelism (multiple identical model copies), tensor parallelism (split operators across devices), pipeline parallelism (assign model stages to different devices), context parallelism, sequence parallelism
- **PyTorch optimization case study**: Llama-7B throughput improvement — eager (25.5 tok/s) → compile (107) → INT8 (157) → INT4 (202) → INT4 + speculative decoding (244.7, +21%)

### Notable Frameworks/Techniques
- Speculative decoding
- PagedAttention / vLLM
- FlashAttention / FlashAttention-3
- Continuous (in-flight) batching
- Prompt caching / KV cache
- DistServe (prefill/decode decoupling)
- Medusa (parallel decoding heads)
- Apache TVM, MLIR, XLA, TensorRT (compilers)

### Key Takeaway
Continuous batching + KV cache management (PagedAttention) + quantization is the current production-optimal combination — together they can achieve 10x+ throughput improvement over naive serving while maintaining output quality.

---

## Chapter 10: AI Engineering Architecture and User Feedback (pp. 449–492)

### TL;DR
The final chapter synthesizes all techniques into a coherent architecture that grows incrementally: start with the simplest query-model-response loop, then add context construction, guardrails, a model gateway with routing, caching, and agent patterns. User feedback — explicit, implicit, and AI-generated — is the key mechanism for continuous improvement.

### Key Concepts
- **Incremental architecture pattern**: start minimal, add components as needs emerge; common progression:
  1. Basic model API call (query → model → response)
  2. Add context construction (RAG, tool use, query rewriting)
  3. Add guardrails (input: PII detection, prompt injection; output: safety, format, quality)
  4. Add model gateway with routing
  5. Add caching (exact and semantic)
  6. Add agent patterns (loops, parallel execution, write actions)
- **Step 1 — Context construction**: RAG, tool use, query rewriting; "context construction is like feature engineering for foundation models" — gives the model what it needs to produce good outputs
- **Step 2 — Guardrails**:
  - Input guardrails: PII detection and masking (replace sensitive data with placeholders, maintain reverse PII map to unmask responses), prompt injection detection, scope enforcement
  - Output guardrails: catch malformed outputs, hallucinations, toxic content, brand-risk responses; retry logic (parallel redundant calls to avoid latency doubling); fallback to human operators
  - Reliability vs. latency trade-off: some teams skip guardrails due to latency cost, especially in streaming mode where partial responses are shown before full generation
  - Guardrail tools: Meta's Purple Llama, NVIDIA NeMo Guardrails, Azure PyRIT, Perspective API, OpenAI content moderation API
- **Step 3 — Model router and gateway**:
  - Router: intent classifier routes queries to the optimal model/solution (specialized models for specific tasks, cheaper models for simple queries); next-action predictor for agents; routers should be small and fast (GPT-2, BERT, Llama 7B scale)
  - Gateway: unified API layer for all model providers; enables access control, cost management, rate limit fallbacks, load balancing, logging, analytics; tools: Portkey, MLflow AI Gateway, Kong, Cloudflare
- **Step 4 — Caching**:
  - Exact caching: cache responses for identical queries (PostgreSQL, Redis, tiered storage); LRU/LFU/FIFO eviction; risk of data leaks if user-specific responses are cached incorrectly
  - Semantic caching: use embedding similarity to reuse responses for semantically similar queries; unreliable in practice (requires high-quality embeddings, appropriate threshold, and adds vector search latency)
- **Step 5 — Agent patterns**: feedback loops (output back into context), write actions (composing emails, placing orders, executing code); write actions vastly increase capability but also risk — require careful guardrails and human approval
- **Monitoring and observability**: log all inputs, outputs, intermediate steps; use AI judges for automated quality monitoring; track latency, cost, error rates per component; essential for debugging complex multi-step pipelines
- **Orchestration frameworks**: LangChain, LlamaIndex, Haystack, Semantic Kernel — help chain components together; most have significant vendor lock-in trade-offs
- **User feedback**:
  - Explicit: thumbs up/down, star ratings, direct edits — high signal but low volume (typically <1% of users provide feedback)
  - Implicit: session length, follow-up queries, copy-paste behavior, completion rates — high volume but noisy
  - AI-generated: use LLM judges to evaluate responses at scale — highest volume, requires calibration against human preferences
  - Feedback design: minimize friction (one-click feedback), ask for reasons when quality is extreme (very good or very bad), use feedback as a data source for finetuning and evaluation

### Notable Frameworks/Techniques
- Incremental architecture (5-step build-out)
- PII masking with reverse PII map
- Intent classifier router pattern
- Model gateway (Portkey, MLflow AI Gateway, Kong)
- Exact caching vs. semantic caching
- Continuous batching with write actions
- LangChain, LlamaIndex, Haystack orchestration
- Explicit/implicit/AI-generated feedback taxonomy

### Key Takeaway
Build the simplest architecture that works first, then add components only when you have evidence they're needed — the full architecture (guardrails + gateway + cache + agents) is expensive to operate and debug; measure business impact at each addition.

---

## Cross-Cutting Themes

1. **Evaluation-driven development**: every chapter returns to the theme that you must define what success looks like and measure it rigorously before optimizing
2. **Cost-quality-latency triangle**: every architectural decision involves explicit trade-offs among these three; no technique wins on all three simultaneously
3. **Build vs. adapt**: the book consistently favors adaptation (prompting → RAG → finetuning) over building from scratch, with finetuning from scratch reserved for organizations with exceptional data moats
4. **The hierarchy of adaptation techniques**: prompting (cheapest, fastest) → RAG (adds fresh knowledge) → finetuning (improves behavior) → continued pre-training (improves domain knowledge); apply in order, escalating only when lower-cost techniques fall short
5. **Data as the real moat**: synthetic data closes many gaps, but proprietary human-annotated data — especially preference data — remains the most defensible competitive advantage
