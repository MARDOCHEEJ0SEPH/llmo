# Chapter 2: Understanding LLM Architecture

## Learning Objectives

By the end of this chapter, you will:
- Understand the Transformer architecture and its computational characteristics
- Identify the main bottlenecks in LLM inference and training
- Learn how attention mechanisms contribute to computational complexity
- Grasp the relationship between model size and performance
- Understand memory requirements for different model sizes

## The Transformer Architecture

### Core Components

The Transformer, introduced in the paper "Attention Is All You Need" (2017), revolutionized natural language processing and became the foundation for modern LLMs.

**Key Components:**
1. **Embedding Layer**: Converts tokens to vectors
2. **Multi-Head Attention**: Allows the model to focus on different parts of the input
3. **Feed-Forward Networks**: Processes attention outputs
4. **Layer Normalization**: Stabilizes training
5. **Residual Connections**: Enables deep architectures

### Architecture Overview

```
Input Tokens
    ↓
Embedding Layer
    ↓
┌─────────────────────┐
│  Transformer Block  │ ← Repeated N times
│  ┌───────────────┐  │
│  │ Self-Attention│  │
│  └───────────────┘  │
│         ↓           │
│  ┌───────────────┐  │
│  │ Feed-Forward  │  │
│  └───────────────┘  │
└─────────────────────┘
    ↓
Output Layer
    ↓
Generated Tokens
```

## Understanding Attention Mechanisms

### What is Attention?

Attention allows the model to weigh the importance of different input tokens when processing each position. It's the key innovation that makes LLMs powerful but also computationally expensive.

### The Attention Formula

```
Attention(Q, K, V) = softmax(QK^T / √d_k)V
```

Where:
- **Q** (Query): What we're looking for
- **K** (Key): What we can pay attention to
- **V** (Value): The actual information to retrieve
- **d_k**: Dimension of the key vectors

### Computational Complexity

**Time Complexity**: O(n² × d)
- **n**: sequence length
- **d**: model dimension

**Key Insight**: Attention scales quadratically with sequence length. Doubling the input length quadruples the computation!

### Why This Matters for Optimization

A 2,048-token sequence requires 4x more attention computation than a 1,024-token sequence. This is why:
- Long context is expensive
- Context window optimization is crucial
- Efficient attention mechanisms (Flash Attention) make a huge difference

## Model Size and Parameters

### What Makes Models "Large"?

**Parameter Count Components:**
1. **Embedding Weights**: Vocabulary size × hidden dimension
2. **Attention Weights**: Multiple weight matrices per layer
3. **Feed-Forward Weights**: Typically 4× hidden dimension
4. **Layer Norm Parameters**: Small but present

### Common Model Sizes

| Model | Parameters | Hidden Dim | Layers | Attention Heads | Context Length |
|-------|-----------|-----------|--------|----------------|----------------|
| GPT-2 Small | 117M | 768 | 12 | 12 | 1,024 |
| GPT-2 Medium | 345M | 1,024 | 24 | 16 | 1,024 |
| Llama-2 7B | 7B | 4,096 | 32 | 32 | 4,096 |
| Llama-2 13B | 13B | 5,120 | 40 | 40 | 4,096 |
| Llama-2 70B | 70B | 8,192 | 80 | 64 | 4,096 |

### Memory Requirements

**Memory Formula (Simplified):**
```
Memory = Parameters × Bytes_per_parameter
```

**Storage Examples (FP16):**
- 7B model: 7B × 2 bytes = 14GB
- 13B model: 13B × 2 bytes = 26GB
- 70B model: 70B × 2 bytes = 140GB

**But inference requires more than just model weights!**

## Complete Memory Breakdown

### Memory Components During Inference

**1. Model Weights**
- The parameters themselves
- Largest component for most models

**2. KV Cache**
- Stores key and value vectors for each generated token
- Grows with sequence length
- Can exceed model weights for long sequences!

**3. Activations**
- Intermediate computations
- Batch size dependent
- Can be reduced with optimization

**4. Temporary Buffers**
- Framework overhead
- Operation-specific memory

### Example: 7B Model Inference Memory

**Assumptions:**
- Model in FP16: 14GB
- Batch size: 4
- Sequence length: 2,048 tokens
- Context window: 4,096

**Memory Breakdown:**
- Model weights: 14GB
- KV cache (approximate): 8-12GB
- Activations: 4-6GB
- Framework overhead: 2GB
- **Total: 28-34GB**

**Optimization Impact:**
- With INT8 quantization: ~18-22GB (35% reduction)
- With INT4 quantization: ~12-16GB (55% reduction)

## The Two Phases of LLM Inference

### Phase 1: Prefill (Context Encoding)

**What happens:**
- Process all input tokens at once
- Compute attention for entire context
- Build initial KV cache

**Characteristics:**
- Compute-bound (lots of matrix multiplications)
- Can be parallelized effectively
- Faster per token than generation
- Determines Time to First Token (TTFT)

### Phase 2: Decoding (Token Generation)

**What happens:**
- Generate one token at a time
- Use cached KV for previous tokens
- Autoregressive (each token depends on previous)

**Characteristics:**
- Memory-bound (reading from KV cache)
- Cannot parallelize across tokens (sequential)
- Slower per token
- Determines Time Per Output Token (TPOT)

### Why This Distinction Matters

Different phases need different optimizations:

**Prefill Optimizations:**
- Efficient attention implementations (Flash Attention)
- Batch processing
- GPU utilization

**Decoding Optimizations:**
- KV cache management
- Memory bandwidth optimization
- Continuous batching (serving multiple requests)

## Computational Bottlenecks

### 1. Attention Computation

**Problem**: O(n²) complexity with sequence length

**Impact:**
- 4K context: Manageable
- 32K context: 64x more attention computation
- 100K context: Prohibitively expensive

**Solutions:**
- Efficient attention implementations
- Sparse attention patterns
- Alternative architectures (e.g., linear attention)

### 2. Matrix Multiplications

**Problem**: Large weight matrices require billions of operations

**Impact:**
- Dominates compute time, especially in feed-forward layers
- Memory bandwidth limited on consumer GPUs

**Solutions:**
- Quantization to reduce data movement
- Optimized BLAS libraries
- Tensor cores on modern GPUs

### 3. Memory Bandwidth

**Problem**: Moving data between GPU memory and compute units

**Impact:**
- Decoding phase is memory-bound
- Larger models hit bandwidth limits

**Solutions:**
- Reduce precision (quantization)
- Better cache utilization
- Fused operations

### 4. KV Cache Growth

**Problem**: Cache grows with sequence length and batch size

**Formula**: KV Cache Size = 2 × batch × length × layers × hidden_dim × bytes

**Example (13B model, FP16):**
- Batch size: 8
- Sequence: 2,048 tokens
- Layers: 40
- Hidden dim: 5,120
- Bytes: 2 (FP16)

**Calculation**: 2 × 8 × 2,048 × 40 × 5,120 × 2 = 6.7GB

**Impact**: Limits batch size and sequence length

**Solutions:**
- Multi-query attention (shared K, V)
- Grouped-query attention
- KV cache quantization

## Model Architecture Variants

### Decoder-Only Models (GPT, Llama)

**Characteristics:**
- Autoregressive generation
- Causal attention (can't see future tokens)
- Best for text generation

**Use cases:**
- Chatbots
- Code generation
- Creative writing

### Encoder-Only Models (BERT)

**Characteristics:**
- Bidirectional attention
- Best for understanding tasks
- No generation capability

**Use cases:**
- Classification
- Embedding generation
- Information extraction

### Encoder-Decoder Models (T5, BART)

**Characteristics:**
- Separate encoding and decoding
- Flexible for various tasks
- More parameters than decoder-only

**Use cases:**
- Translation
- Summarization
- Question answering

**Optimization Note**: This guide focuses primarily on decoder-only models (GPT-style), as they're most common for modern LLM applications.

## Multi-Head Attention Deep Dive

### Why Multiple Heads?

Multiple attention heads allow the model to attend to different aspects simultaneously:
- Head 1: Syntactic relationships
- Head 2: Semantic similarity
- Head 3: Long-range dependencies
- Head 4-N: Other patterns

### Computational Impact

**Standard Multi-Head Attention:**
```
Total computation = heads × (query_dim × key_dim × sequence²)
```

**Memory for KV Cache:**
```
KV memory = 2 × heads × sequence × head_dim × layers
```

### Optimization Variants

**1. Multi-Query Attention (MQA)**
- Single K, V shared across all heads
- Reduces KV cache by factor of num_heads
- Slight quality trade-off
- Used in: PaLM, Falcon

**2. Grouped-Query Attention (GQA)**
- Groups of heads share K, V
- Middle ground between MHA and MQA
- Better quality than MQA
- Used in: Llama-2, Mistral

**Memory Comparison (32 heads, 2K sequence):**
- Multi-Head: 100%
- Grouped-Query (4 groups): 12.5%
- Multi-Query: 3.1%

## Position Encodings

### Why Position Matters

Transformers have no inherent notion of token order. Position encodings add this information.

### Types of Position Encodings

**1. Absolute Position Encoding**
- Fixed embeddings for each position
- Limited to training context length
- Used in: Original Transformer, GPT-2

**2. Relative Position Encoding**
- Encodes relative distances between tokens
- Better generalization
- Used in: T5

**3. Rotary Position Embedding (RoPE)**
- Applies rotation to query and key
- Excellent extrapolation properties
- Used in: Llama, Mistral, many modern LLMs

**4. ALiBi (Attention with Linear Biases)**
- Adds bias to attention scores
- No learned parameters
- Great for long context
- Used in: BLOOM, MPT

### Optimization Implications

**RoPE with interpolation:**
- Allows context extension beyond training length
- Minimal quality degradation
- Enables 32K+ context from 4K trained models

## Feed-Forward Networks

### Structure

```
FFN(x) = activation(xW₁ + b₁)W₂ + b₂
```

**Typical dimensions:**
- Input: hidden_dim (e.g., 4,096)
- Intermediate: 4 × hidden_dim (e.g., 16,384)
- Output: hidden_dim

### Computational Cost

**Parameters**: ~67% of total model parameters are in FFN layers!

**Example (Llama-2 7B):**
- Total parameters: 7B
- FFN parameters: ~4.7B
- Attention parameters: ~2.3B

### Variants and Optimizations

**1. Standard FFN**
- Two linear layers with activation
- Most common

**2. Gated FFN (SwiGLU)**
- Additional gating mechanism
- Better performance, more parameters
- Used in: Llama, PaLM

**3. Mixture of Experts (MoE)**
- Multiple FFN "experts"
- Route tokens to subset of experts
- More parameters, same compute
- Used in: GPT-4 (rumored), Mixtral

## Practical Implications for Optimization

### Key Takeaways

**1. Sequence Length Impact**
- Quadratic attention cost
- Linear KV cache growth
- Optimize context windows carefully

**2. Model Size Trade-offs**
- Larger ≠ always better for your task
- Memory requirements grow linearly
- Inference cost scales with size

**3. Batch Size Considerations**
- Larger batches improve throughput
- KV cache limits maximum batch size
- Trade-off with latency

**4. Precision Matters**
- FP16 vs INT8 vs INT4 dramatically affects memory
- Minimal quality loss with INT8
- Enables larger batches and models

### Optimization Priority Matrix

| Constraint | Primary Optimization | Secondary Optimization |
|-----------|---------------------|----------------------|
| GPU Memory | Quantization | Smaller model |
| Latency | Flash Attention | KV cache optimization |
| Throughput | Batch size | Continuous batching |
| Cost | Smaller model | Quantization |

## Case Study: Understanding Memory Bottlenecks

### Scenario
Running Llama-2 70B on A100 (80GB) for chatbot

**Initial Attempt (FP16):**
- Model: 140GB ❌ Doesn't fit!

**Solution 1: INT8 Quantization**
- Model: 70GB ✓
- KV cache (batch=1, 2K tokens): 15GB
- Total: 85GB ❌ Still too much with overhead!

**Solution 2: INT4 Quantization**
- Model: 35GB ✓
- KV cache: 15GB ✓
- Activations + overhead: 10GB ✓
- Total: 60GB ✓ Fits with headroom!

**Result**: Can serve model with batch size 2-3, enabling practical deployment

## Frequently Asked Questions

**Q: Why can't we just make attention linear complexity?**
A: Many have tried! Linear attention variants exist but generally trade off quality. The quadratic complexity captures rich interactions between all tokens. However, techniques like sparse attention and FlashAttention reduce the practical cost significantly.

**Q: How much does KV cache really impact performance?**
A: Significantly! For long sequences, KV cache can exceed model weights. It's often the primary memory bottleneck and limits batch sizes.

**Q: Should I use multi-query or grouped-query attention?**
A: If you're training from scratch, grouped-query (like Llama-2) offers best balance. If using existing models, you're stuck with what they have. Multi-query saves most memory but can reduce quality slightly.

**Q: What's more important: model size or architecture?**
A: Both matter! A well-designed 13B model often outperforms a poorly-designed 30B model. But within the same architecture family, larger generally means better quality (with diminishing returns).

**Q: Can I run inference on CPU?**
A: Yes, but expect 10-100x slower depending on model size. For production, GPU is strongly recommended. For experimentation or very low-volume use, CPU can work.

## Action Items

- [ ] Calculate memory requirements for your target model size in FP16, INT8, and INT4
- [ ] Identify whether your use case is prefill-bound or decoding-bound
- [ ] Determine maximum sequence length you need to support
- [ ] Estimate KV cache size for your expected batch size and sequence length
- [ ] Research which attention mechanism your chosen model uses

## Reflection Questions

1. What is your maximum sequence length requirement?
2. Do you need to support long context (8K+) or is shorter context acceptable?
3. How much GPU memory do you have available?
4. Is your use case more latency-sensitive (chatbot) or throughput-focused (batch processing)?
5. Can you trade some model quality for better performance?

## What's Next?

In Chapter 3, we'll explore the complete optimization landscape, including training vs. inference optimization, hardware considerations, and how to benchmark and measure improvements. You'll learn to identify which optimizations deliver the biggest impact for your specific situation.

---

**Key Takeaway**: Understanding LLM architecture is essential for effective optimization. The quadratic attention complexity, memory-bound decoding, and KV cache growth are the primary bottlenecks you'll be optimizing around throughout this book.
