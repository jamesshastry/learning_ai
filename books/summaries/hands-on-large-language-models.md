---
title: "Hands-On Large Language Models"
author: Jay Alammar, Maarten Grootendorst
publisher: O'Reilly
year: 2024
isbn: 978-1-098-15096-9
tags: [LLMs, transformers, embeddings, fine-tuning, RAG, prompt-engineering, RLHF]
---

# Hands-On Large Language Models — Chapter Summaries

## Part I: Understanding Language Models

---

### Chapter 1: An Introduction to Large Language Models

**TL;DR**
This chapter establishes the conceptual landscape of LLMs, tracing their lineage from early n-gram language models through RNNs and the pivotal Transformer architecture. It explains the two dominant model families — representation models (encoders like BERT) and generative models (decoders like GPT) — and how both are built on the same Transformer backbone but used for different purposes.

**Key Concepts**
- Language models assign probabilities to sequences of text; early models relied on n-grams, which couldn't capture long-range dependencies
- The Transformer architecture (2017, "Attention Is All You Need") replaced RNNs with self-attention, enabling parallelism and far better context modeling
- Encoder-only models (BERT family) produce rich contextual embeddings suited for classification, search, and clustering
- Decoder-only models (GPT family) are trained to predict the next token and excel at text generation
- Encoder-decoder models (T5, BART) combine both for tasks like translation and summarization
- Emergent capabilities arise at scale: models exhibit reasoning, arithmetic, and instruction-following that weren't explicitly trained
- The Transformer processes tokens through embedding layers, positional encoding, multi-head self-attention, and feedforward networks stacked in blocks

**Notable Frameworks/Techniques**
- Hugging Face `transformers` library as the primary interface for loading and running models
- The `pipeline` abstraction for zero-shot use of pretrained models
- Phi-3 (Microsoft) used as a lightweight generative model throughout the book

**Key Takeaway**
LLMs are not magic — they are statistical models trained to predict text. Understanding the encoder/decoder distinction is the foundation for choosing the right model for any given NLP task.

---

### Chapter 2: Tokens and Embeddings

**TL;DR**
This chapter explains how text is converted into the numeric representations that LLMs operate on, covering tokenization (splitting text into subword units) and word/token embeddings (dense vectors encoding meaning). It shows how semantic similarity emerges naturally from training and how embeddings power downstream tasks.

**Key Concepts**
- Tokenization converts raw text into integer IDs using vocabularies built from subword algorithms (BPE, WordPiece, SentencePiece)
- Subword tokenization balances vocabulary size against out-of-vocabulary handling — common words become single tokens, rare words are split
- Token embeddings are learned lookup tables mapping each token ID to a dense vector (e.g., 768 or 4096 dimensions)
- word2vec (skip-gram / CBOW) demonstrated that training on co-occurrence produces geometrically meaningful vector spaces: "king − man + woman ≈ queen"
- Contextual embeddings (from Transformers) differ from static embeddings: the same token gets different representations depending on surrounding context
- The `[CLS]` token in BERT is often used as a sentence-level embedding
- Embedding dimensionality trades off between expressiveness and computational cost

**Notable Frameworks/Techniques**
- Byte-Pair Encoding (BPE): iteratively merges the most frequent character pair, used by GPT models
- WordPiece: similar to BPE but merges by likelihood gain, used by BERT
- `tokenizers` library from Hugging Face for fast, configurable tokenization
- word2vec as the conceptual ancestor of modern embedding approaches

**Key Takeaway**
Before an LLM can reason about text, text must become numbers. The choice of tokenizer and embedding strategy profoundly affects what kinds of linguistic patterns a model can capture.

---

### Chapter 3: Inside Large Language Models

**TL;DR**
This chapter opens the hood on how Transformer-based LLMs actually work internally — from the self-attention mechanism that lets every token attend to every other token, to positional encodings, layer normalization, feedforward sublayers, and how generation happens token-by-token through autoregressive decoding.

**Key Concepts**
- Self-attention computes three projections per token — Query, Key, Value — and produces a weighted sum of values based on query-key dot-product similarity
- Multi-head attention runs several attention computations in parallel and concatenates their outputs, allowing the model to attend to different aspects of the input simultaneously
- Positional encodings inject token order information since attention itself is position-agnostic; modern models use learned or rotary (RoPE) encodings
- Layer normalization stabilizes training by normalizing activations across the feature dimension within each sublayer
- The feedforward sublayer applies a two-layer MLP pointwise to each token's representation after attention, expanding then contracting dimensionality
- Autoregressive generation: at inference time, the model produces one token at a time, feeding each output back as input for the next step
- Sampling strategies: greedy (argmax), top-k, top-p (nucleus), and temperature scaling control the diversity and quality of generated text
- The KV cache stores key and value projections from prior tokens to avoid redundant computation during generation

**Notable Frameworks/Techniques**
- Scaled dot-product attention: softmax(QK^T / sqrt(d_k)) V
- Residual (skip) connections around each sublayer to facilitate gradient flow
- Rotary Position Embeddings (RoPE) used in LLaMA-family models
- Flash Attention: memory-efficient attention computation algorithm

**Key Takeaway**
The self-attention mechanism is the defining innovation of the Transformer — by allowing every token to directly attend to every other token, it captures long-range dependencies that recurrent networks could not, enabling the scale and capability of modern LLMs.

---

### Chapter 4: Text Classification

**TL;DR**
This chapter demonstrates using pretrained LLMs for supervised text classification without training, by leveraging either task-specific pretrained heads or embedding models with a trainable classifier on top. It shows how encoder models like BERT power classification pipelines, and contrasts "frozen" pretrained models with fine-tuned approaches.

**Key Concepts**
- Text classification assigns a label (e.g., sentiment, topic, spam/not-spam) to a piece of text
- Zero-shot classification with pretrained models: task-specific heads (e.g., BERT trained on NLI) can classify text without task-specific training data
- Embedding-based classification: convert text to embeddings, then train a lightweight classifier (logistic regression, SVM) on top of frozen embeddings
- The `[CLS]` token output from BERT serves as the document-level representation for classification tasks
- Pretrained models can be used as feature extractors when compute or labeled data is scarce
- Multi-label vs. multi-class classification: in multi-label tasks a document can belong to multiple categories simultaneously
- Model evaluation: accuracy, F1-score, confusion matrix

**Notable Frameworks/Techniques**
- Hugging Face `pipeline("text-classification")` for zero-shot use
- `pipeline("zero-shot-classification")` using NLI (natural language inference) models
- `sentence-transformers` for embedding-based classification
- scikit-learn classifiers on top of frozen LLM embeddings

**Key Takeaway**
Modern pretrained models can perform competitive text classification without any task-specific training data, but even a small amount of labeled data combined with fine-tuning (Chapter 11) yields substantial gains.

---

### Chapter 5: Text Clustering and Topic Modeling

**TL;DR**
This chapter covers unsupervised methods for organizing large text corpora — clustering documents by semantic similarity using embeddings, and discovering latent topics using BERTopic, a modern topic modeling approach that combines embeddings with clustering and class-based TF-IDF to produce coherent, human-interpretable topics.

**Key Concepts**
- Text clustering groups semantically similar documents without predefined labels using embedding similarity and clustering algorithms
- k-Means assigns each document to one of k clusters based on distance to centroids; requires specifying k in advance
- HDBSCAN (Hierarchical Density-Based Spatial Clustering) identifies clusters of varying density and marks outliers as noise; does not require specifying k
- Dimensionality reduction (UMAP) before clustering makes high-dimensional embeddings more geometrically tractable and enables 2D visualization
- BERTopic pipeline: embed documents → reduce dimensions (UMAP) → cluster (HDBSCAN) → extract topic representations via c-TF-IDF (class-based term frequency-inverse document frequency)
- c-TF-IDF identifies the most distinctive terms for each cluster relative to all other clusters, producing interpretable topic labels
- Dynamic topic modeling tracks how topics evolve over time by training BERTopic on time-sliced corpora

**Notable Frameworks/Techniques**
- BERTopic: modular, state-of-the-art topic modeling library built on embeddings + clustering
- UMAP: nonlinear dimensionality reduction that preserves local and global structure better than t-SNE for clustering purposes
- HDBSCAN: soft clustering with noise detection, well-suited to text data
- c-TF-IDF: BERTopic's method for representing topics as weighted term distributions

**Key Takeaway**
Combining dense text embeddings with density-based clustering (BERTopic) produces topic models that are far more coherent and flexible than classical approaches like LDA, and requires no labeled data.

---

## Part II: Using Large Language Models

---

### Chapter 6: Prompt Engineering

**TL;DR**
This chapter systematically covers the craft of prompt engineering — how the structure, wording, and examples within a prompt dramatically affect the quality of an LLM's output. It progresses from basic zero-shot prompting through few-shot examples and chain-of-thought reasoning, and introduces constrained generation techniques for reliable structured output.

**Key Concepts**
- A prompt has several components: instruction, context, input data, and output format specification — tuning each changes model behavior
- Zero-shot prompting: instructing the model directly without examples; works well for capable models on common tasks
- Few-shot (in-context) learning: including example input-output pairs in the prompt guides the model toward the desired format and behavior
- Chain-of-thought (CoT) prompting: adding "Let's think step by step" or providing reasoning examples induces the model to produce intermediate reasoning before its final answer, improving accuracy on multi-step problems
- System prompts (in chat models) establish role, tone, and behavioral constraints for the entire conversation
- Output format control: instructing the model to respond in JSON, XML, or a fixed schema makes outputs programmatically parsable
- Constrained sampling via grammar rules (e.g., JSON grammar in llama-cpp-python) enforces valid structure at the token-sampling level, not post-hoc
- Temperature and top-p parameters interact with prompt design to control creativity vs. determinism

**Notable Frameworks/Techniques**
- Few-shot prompting with labeled examples for sentiment classification, entity extraction, etc.
- Chain-of-thought prompting for arithmetic and logical reasoning tasks
- `llama-cpp-python` with `response_format={"type": "json_object"}` for grammar-constrained generation
- Phi-3 prompt template format: `<s><|user|>{prompt}<|end|><|assistant|>`

**Key Takeaway**
Prompt engineering is the highest-leverage, lowest-cost way to improve LLM outputs — a well-designed prompt can unlock chain-of-thought reasoning, structured output, and task-specific behavior without any model training.

---

### Chapter 7: Advanced Text Generation Techniques and Tools

**TL;DR**
This chapter extends beyond prompting to architectural patterns for building LLM-powered systems: loading quantized models for efficiency, constructing modular chains with LangChain, managing conversation memory, and building ReAct agents that can use external tools like search engines and calculators.

**Key Concepts**
- Quantization reduces model parameter precision (e.g., from 32-bit to 8-bit or 4-bit floats), shrinking memory requirements and speeding inference with minimal accuracy loss; GGUF is the standard format for quantized models
- LangChain provides modular abstractions: Model I/O (prompts + LLMs + output parsers), Memory, Retrieval, and Agents — chainable into complex pipelines
- A "chain" in LangChain connects a prompt template to an LLM (and optionally other components) using the pipe `|` operator
- Conversation memory types: ConversationBufferMemory (full history), WindowedConversationBufferMemory (last k turns), ConversationSummaryMemory (LLM-compressed summary)
- Agents leverage the ReAct (Reasoning + Acting) framework: the LLM iterates through Thought → Action (tool call) → Observation cycles until it arrives at a final answer
- Tools extend agent capabilities: web search (DuckDuckGo), calculator, code execution, API calls, etc.
- AgentExecutor orchestrates the ReAct loop, handling tool dispatch and result injection back into the context

**Notable Frameworks/Techniques**
- LangChain: the dominant framework for composable LLM application development (alongside DSPy and Haystack)
- GGUF / llama-cpp-python: efficient local model loading with quantization support
- ReAct framework (Yao et al., 2022): iterative reasoning and acting with external tools
- DSPy and Haystack mentioned as alternative orchestration frameworks

**Key Takeaway**
LangChain's modular architecture — chains, memory, and agents — allows LLMs to transcend their context window limitations and interact with the real world through tools, making them useful for complex, multi-step autonomous tasks.

---

### Chapter 8: Semantic Search and Retrieval-Augmented Generation

**TL;DR**
This chapter covers three approaches to LLM-powered search — dense retrieval, reranking, and RAG — explaining how embeddings enable searching by meaning rather than keyword, how rerankers improve result ordering, and how RAG grounds LLM generation in retrieved documents to reduce hallucinations and improve factuality.

**Key Concepts**
- Dense retrieval: embed both query and documents into the same vector space, then retrieve nearest neighbors by cosine similarity; enables semantic search beyond keyword matching
- Chunking: long documents must be split into smaller segments before embedding, as embedding models have context length limits
- Vector databases (FAISS, Pinecone, Weaviate, Chroma) store and index embeddings for fast approximate nearest-neighbor retrieval
- Rerankers (e.g., monoBERT): take a query and a set of candidate results and score each for relevance, reordering the results; more expensive than dense retrieval but more precise
- RAG pipeline: (1) embed query, (2) retrieve relevant chunks from vector database, (3) inject retrieved context into LLM prompt, (4) generate grounded answer with citations
- Advanced RAG techniques: query rewriting (clean up verbose user queries), multi-query RAG (expand to multiple sub-queries), multi-hop RAG (sequential dependent queries), query routing (directing queries to different data sources), agentic RAG
- RAG evaluation axes: fluency, perceived utility, citation recall, citation precision, faithfulness, answer relevance; Ragas is a framework for automated RAG evaluation using LLM-as-a-judge

**Notable Frameworks/Techniques**
- Cohere Embed + co.chat for managed RAG with built-in grounding and citations
- FAISS (`langchain.vectorstores.FAISS`) for local vector search
- LangChain `RetrievalQA` chain for end-to-end RAG pipelines
- Mean Average Precision (MAP) for evaluating search ranking quality
- Ragas library for automated multi-axis RAG evaluation

**Key Takeaway**
RAG is the most practical near-term solution to LLM hallucination: by retrieving relevant information at inference time and grounding the model's generation in those documents, factuality and verifiability improve dramatically without requiring model retraining.

---

### Chapter 9: Multimodal Large Language Models

**TL;DR**
This chapter explores how LLMs can be extended to process and reason about images in addition to text, covering Vision Transformers (ViT) for image encoding, CLIP for joint text-image embedding, and BLIP-2 for multimodal text generation — enabling image captioning, visual question answering, and multimodal chat.

**Key Concepts**
- A modality is a type of data (text, image, audio, video, code); a multimodal model can process more than one
- Vision Transformer (ViT): adapts the Transformer encoder for images by splitting an image into fixed-size patches, linearly projecting each patch into an embedding, and treating patches as tokens
- Image patch embeddings play the same role as token embeddings in text — after projection, the encoder treats them identically
- CLIP (Contrastive Language-Image Pre-training, OpenAI): jointly trains a text encoder and image encoder using contrastive learning on image-caption pairs, aligning both modalities in a shared embedding space
- CLIP enables zero-shot image classification and cross-modal search: find images matching a text query or vice versa
- OpenCLIP: open-source CLIP implementation with multiple model variants
- BLIP-2: bridges a frozen image encoder (ViT) and a frozen LLM via a lightweight trainable "Q-Former" module that translates visual features into the LLM's token space
- BLIP-2 use cases: image captioning (image → text), visual question answering (image + question → answer), multimodal chat (image + conversation history → response)

**Notable Frameworks/Techniques**
- ViT (Dosovitskiy et al., 2020): "An Image is Worth 16x16 Words"
- CLIP: contrastive pre-training on 400M image-text pairs; enables zero-shot visual reasoning
- OpenCLIP (`open_clip` library): accessible open-source CLIP variants
- BLIP-2 (`Salesforce/blip2-opt-2.7b` via Hugging Face Transformers)
- `ipywidgets` for building interactive multimodal chatbots in Jupyter notebooks

**Key Takeaway**
The patch-embedding trick of ViT allows the Transformer architecture to process images using the same mechanisms as text, enabling a unified approach to multimodal reasoning — and CLIP's contrastive training creates a shared semantic space where text and images can be directly compared.

---

## Part III: Training and Fine-Tuning Language Models

---

### Chapter 10: Creating Text Embedding Models

**TL;DR**
This chapter covers how to create and fine-tune text embedding models from scratch or from pretrained checkpoints, explaining the foundational technique of contrastive learning and the SBERT (Sentence-BERT) framework. It progresses through supervised, weakly supervised (Augmented SBERT), and unsupervised (TSDAE) training approaches, and covers domain adaptation.

**Key Concepts**
- Embedding models convert text to dense vectors such that semantically similar texts are geometrically close; the goal is to capture semantic nature, not surface form
- Contrastive learning trains an embedding model by showing it pairs of similar and dissimilar documents, teaching it what "similar" means for a given domain
- Positive pairs: documents that should be close (paraphrases, Q&A pairs, related passages); negative pairs (or hard negatives): documents that should be distant
- SBERT (Sentence-BERT): uses a siamese network architecture — two identical BERT encoders with shared weights — to independently encode sentence pairs, then optimizes their similarity with a contrastive loss
- SBERT resolves the O(n²) computation problem of cross-encoders by producing standalone embeddings that can be compared with a single dot product
- Loss functions for contrastive learning: cosine similarity loss, Multiple Negatives Ranking (MNR) loss, triplet loss
- Augmented SBERT: uses a cross-encoder to label weakly supervised data (silver labels) and augments the training set, enabling training with limited labeled pairs
- TSDAE (Transformer-based Sequential Denoising Auto-Encoder): an unsupervised technique that adds noise to sentences (random word deletion), encodes them to embeddings, and trains a decoder to reconstruct the originals — no labels required
- Domain adaptation via adaptive pretraining: first pretrain unsupervised on target domain (TSDAE or MLM), then fine-tune supervised on any available labeled data

**Notable Frameworks/Techniques**
- `sentence-transformers` library: the primary framework for creating and fine-tuning SBERT-family embedding models
- `SentenceTransformerTrainer` for Hugging Face-compatible training loops
- MTEB (Massive Text Embedding Benchmark): standard benchmark for embedding model quality
- SimCSE, GPL (Generative Pseudo-Labeling): other unsupervised/weakly-supervised embedding training approaches
- FAISS and SBERT together for scalable semantic search systems

**Key Takeaway**
Contrastive learning with sentence-transformers is the gold standard for creating domain-specific embedding models — and TSDAE enables high-quality embedding training even when no labeled data is available.

---

### Chapter 11: Fine-Tuning Representation Models for Classification

**TL;DR**
This chapter covers multiple strategies for fine-tuning BERT-family representation models on classification tasks, from standard supervised fine-tuning (updating all model weights jointly with a classification head) to few-shot learning with SetFit, continued pretraining with masked language modeling, and token-level classification for named-entity recognition.

**Key Concepts**
- Fine-tuning vs. frozen: Chapter 4 used models as frozen feature extractors; here both the pretrained model and classification head are trained jointly, yielding higher F1 (0.85 vs. 0.80 on Rotten Tomatoes)
- The classification head is a feedforward neural network added on top of BERT's `[CLS]` token output; backpropagation flows through both the head and the BERT layers
- Freezing layers: selectively freezing early BERT layers while fine-tuning later layers + head can reduce compute and prevent catastrophic forgetting
- SetFit (few-shot): fine-tunes an embedding model contrastively on a small set of labeled examples (as few as 8 per class), then trains a classification head; achieves strong performance with minimal data
- Continued pretraining with Masked Language Modeling (MLM): continues BERT's original pretraining objective on domain-specific unlabeled text, adapting its representations before task fine-tuning
- Named-Entity Recognition (NER): token-level classification — each token gets a label (B-PER, I-PER, B-ORG, etc.) rather than the entire document; uses BIO tagging scheme
- Subword alignment challenge in NER: when a word is split into subtokens, labels must be carefully aligned — the first subtoken gets the B-tag, subsequent subtokens get I-tags
- `DataCollatorForTokenClassification` handles padding for NER; `seqeval` library for token-level F1 evaluation

**Notable Frameworks/Techniques**
- Hugging Face `Trainer` + `TrainingArguments` for standardized fine-tuning loops
- `AutoModelForSequenceClassification` for document-level classification
- `AutoModelForTokenClassification` for NER
- SetFit library for few-shot contrastive fine-tuning
- CoNLL-2003 dataset for NER benchmarking

**Key Takeaway**
Full fine-tuning of pretrained BERT models — where both the representation model and classification head are updated jointly — consistently outperforms frozen-model approaches, and SetFit makes high-quality classification achievable with as few as 8 labeled examples per class.

---

### Chapter 12: Fine-Tuning Generation Models

**TL;DR**
This final chapter covers the complete pipeline for fine-tuning generative LLMs, explaining the three-stage process from base language modeling through supervised fine-tuning (SFT) to preference tuning (RLHF/DPO). It covers both full fine-tuning and parameter-efficient approaches (PEFT) including LoRA, and explains how quantization enables training large models on consumer hardware.

**Key Concepts**
- The three LLM training stages: (1) language modeling pretraining on massive unlabeled text → base model; (2) supervised fine-tuning (SFT) on instruction-response pairs → instruction-tuned model; (3) preference tuning (RLHF or DPO) on human preference data → preference-aligned model
- Base models are trained to complete text (next-token prediction) and do not follow instructions; SFT adapts them to respond to user queries
- Supervised fine-tuning uses question-answer / instruction-response pairs; the model is trained to predict the response tokens given the instruction tokens
- Full fine-tuning updates all model parameters — expensive in memory and compute, requires significant storage per task
- Parameter-Efficient Fine-Tuning (PEFT): only a small fraction of parameters are updated, dramatically reducing cost
- Adapters: insert small trainable modules (bottleneck MLPs) after attention and feedforward sublayers in each Transformer block; fine-tune only adapter weights (~3.6% of BERT parameters achieves comparable performance to full fine-tuning on GLUE)
- LoRA (Low-Rank Adaptation): instead of adapters, represents weight updates as low-rank matrix decompositions (ΔW = BA where B, A are low-rank); merges with original weights at inference time for zero additional latency
- QLoRA: combines 4-bit quantization of the base model with LoRA fine-tuning, enabling fine-tuning of 7B+ parameter models on a single GPU
- Preference tuning (RLHF): uses a reward model trained on human preference comparisons to optimize the LLM via PPO (Proximal Policy Optimization)
- DPO (Direct Preference Optimization): a simpler alternative to RLHF that directly optimizes preferences without a separate reward model, using accepted/rejected response pairs

**Notable Frameworks/Techniques**
- `trl` (Transformer Reinforcement Learning) library: `SFTTrainer`, `DPOTrainer` from Hugging Face
- `peft` library: LoRA, QLoRA, adapter implementations
- `bitsandbytes`: 4-bit / 8-bit quantization for training and inference
- LoRA hyperparameters: rank (r), alpha scaling factor, target modules (q_proj, v_proj, etc.)
- Alpaca, ShareGPT, and similar instruction datasets for SFT
- TRL's `DataCollatorForCompletionOnlyLM` to mask instruction tokens from the loss (train only on response tokens)

**Key Takeaway**
The combination of QLoRA (4-bit quantization + low-rank adaptation) has democratized LLM fine-tuning — making it possible to fine-tune 7B–13B parameter models on a single consumer GPU — while DPO provides a practical, stable alternative to full RLHF for aligning model outputs with human preferences.
