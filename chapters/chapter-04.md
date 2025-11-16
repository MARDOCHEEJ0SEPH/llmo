# Chapter 4: Inference Optimization Fundamentals

## Learning Objectives

By the end of this chapter, you will:
- Master techniques for reducing inference latency
- Understand and implement KV cache optimization
- Learn batching strategies for improved throughput
- Implement Flash Attention and efficient attention mechanisms
- Optimize the prefill and decoding phases separately
- Choose the right serving framework for your needs

## The Inference Pipeline

### Request Flow

```
User Request
    ↓
Input Tokenization (ms)
    ↓
Prefill Phase (100-500ms)
    ↓
Decoding Phase (500-2000ms)
    ↓
Output Detokenization (ms)
    ↓
Response to User
```

**Optimization opportunities at each stage!**

### Time Budget Breakdown

For a typical chatbot response (2s total):
- Tokenization: 5ms (0.25%)
- Prefill: 200ms (10%)
- Decoding: 1,750ms (87.5%)
- Detokenization: 5ms (0.25%)
- Network/overhead: 40ms (2%)

**Key Insight**: Optimize where time is spent! Decoding dominates, so that's where to focus first.

## KV Cache Optimization

### Understanding KV Cache

The KV cache stores computed key and value vectors for all previous tokens, avoiding recomputation during autoregressive generation.

**Without KV Cache:**
```python
# For each new token, recompute attention for ALL previous tokens
# Token 1: compute 1 attention
# Token 2: compute 1 + 2 = 3 attentions
# Token 3: compute 1 + 2 + 3 = 6 attentions
# Token N: compute N(N+1)/2 attentions
# Total: O(N²) - prohibitively expensive!
```

**With KV Cache:**
```python
# Reuse cached K, V from previous tokens
# Each token: compute only 1 new attention
# Total: O(N) - practical!
```

### KV Cache Memory Calculation

```python
def calculate_kv_cache_size(
    batch_size,
    sequence_length,
    num_layers,
    num_heads,
    head_dim,
    bytes_per_param=2  # FP16
):
    # K and V for each layer
    kv_cache_size = (
        2 *  # K and V
        batch_size *
        sequence_length *
        num_layers *
        num_heads *
        head_dim *
        bytes_per_param
    )
    return kv_cache_size / (1024**3)  # Convert to GB

# Example: Llama-2 13B
size = calculate_kv_cache_size(
    batch_size=8,
    sequence_length=2048,
    num_layers=40,
    num_heads=40,
    head_dim=128,
    bytes_per_param=2
)
print(f"KV Cache: {size:.2f} GB")  # ~10.5 GB
```

### KV Cache Optimization Strategies

**1. Grouped-Query Attention (GQA)**

Used in Llama-2, Mistral, and modern models:

```python
# Standard Multi-Head Attention
num_kv_heads = num_q_heads  # e.g., 32 = 32

# Grouped-Query Attention
num_kv_heads = num_q_heads // groups  # e.g., 32 // 8 = 4

# Memory savings
savings = 1 - (num_kv_heads_gqa / num_kv_heads_mha)
# Example: 1 - (4/32) = 87.5% KV cache reduction!
```

**2. Multi-Query Attention (MQA)**

Even more aggressive (single K, V shared):

```python
num_kv_heads = 1  # Maximum sharing

# Memory savings: 96%+ for 32-head models
# Trade-off: Slight quality degradation (~2-3%)
```

**3. KV Cache Quantization**

Reduce precision of cached values:

```python
# FP16 cache → INT8 cache
kv_cache_int8 = quantize_kv_cache(kv_cache_fp16)

# Memory savings: 50%
# Quality impact: <1% degradation
# Supported in: TensorRT-LLM, vLLM (experimental)
```

**4. Sliding Window Attention**

Limit attention to recent tokens:

```python
# Instead of attending to all previous tokens
attention_window = 4096  # Only last 4K tokens

# Memory savings: Bounded cache size regardless of sequence length
# Used in: Mistral, Longformer
```

**5. PagedAttention (vLLM)**

Non-contiguous memory blocks for KV cache:

```python
# Traditional: Allocate max_length upfront → wasteful
# PagedAttention: Allocate in blocks as needed

# Benefits:
# - Reduced memory fragmentation
# - Higher batch sizes
# - Better memory utilization (up to 2x)
```

## Batching Strategies

### Static Batching

**Traditional approach:**
```python
# Wait for batch to fill, then process
batch = collect_requests(batch_size=8)
results = model.generate(batch)
return_results(results)
```

**Problem**: Head-of-line blocking
- Fast queries wait for slow ones
- Padding for different lengths
- Poor latency for small batches

### Dynamic Batching

**Continuous batching (iteration-level):**
```python
# Add/remove requests at each generation step
active_requests = []

while active_requests:
    # Add new requests that arrived
    active_requests.extend(get_new_requests())

    # Generate one token for all active requests
    next_tokens = model.generate_next_token(active_requests)

    # Remove completed requests
    active_requests = [r for r in active_requests if not r.is_complete()]
```

**Benefits:**
- No head-of-line blocking
- Higher GPU utilization
- Better throughput
- Implemented in: vLLM, TGI, TensorRT-LLM

### Batching Decision Matrix

| Scenario | Batch Size | Strategy | Priority |
|----------|-----------|----------|----------|
| Chatbot (real-time) | 1-4 | Continuous | Latency |
| API service | 4-16 | Continuous | Balance |
| Batch processing | 32+ | Static | Throughput |
| High traffic | 16-64 | Continuous | Throughput |

## Flash Attention

### The Problem with Standard Attention

**Standard attention implementation:**
```python
# Compute full attention matrix: O(N²) memory
scores = Q @ K.T  # N×N matrix - huge!
weights = softmax(scores)
output = weights @ V
```

**For 2K sequence**: 2048 × 2048 = 4M elements × batch × heads
- Memory intensive
- Many memory reads/writes
- GPU memory bandwidth bottleneck

### Flash Attention Solution

**Key innovations:**
1. **Tiling**: Process attention in blocks
2. **Recomputation**: Trade compute for memory
3. **Kernel fusion**: Minimize memory movements

**Result:**
- Same output as standard attention
- O(N) memory instead of O(N²)
- 2-4x faster for long sequences
- Enables longer context windows

### Flash Attention Versions

**Flash Attention 1 (2022)**
- Initial implementation
- 2-3x speedup
- Limited GPU support

**Flash Attention 2 (2023)**
- Further optimizations
- 2x faster than FA1
- Better parallelism
- Widely adopted (Llama-2, Mistral)

**Flash Attention 3 (2024)**
- Optimized for Hopper GPUs (H100)
- FP8 support
- 1.5-2x faster than FA2 on H100

### Implementing Flash Attention

**Using Hugging Face:**
```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    torch_dtype=torch.float16,
    attn_implementation="flash_attention_2",  # Enable FA2
    device_map="auto"
)
```

**Using vLLM (automatic):**
```python
from vllm import LLM

llm = LLM(
    model="meta-llama/Llama-2-13b-hf",
    # Flash Attention enabled by default
)
```

### When Flash Attention Matters Most

**High impact:**
- Long sequences (4K+ tokens)
- Large batch sizes
- Many attention heads
- Memory-constrained GPUs

**Low impact:**
- Very short sequences (<512 tokens)
- Batch size = 1
- CPU inference

## Serving Framework Comparison

### vLLM

**Strengths:**
- Continuous batching (PagedAttention)
- Best throughput
- Easy to use
- Active development

**Best for:**
- High-traffic APIs
- Multiple concurrent users
- Maximizing GPU utilization

**Code:**
```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Llama-2-13b-hf")
sampling_params = SamplingParams(temperature=0.7, max_tokens=200)

outputs = llm.generate(prompts, sampling_params)
```

### TensorRT-LLM

**Strengths:**
- Best latency
- Optimized NVIDIA kernels
- FP8 support (H100)
- Production-grade

**Best for:**
- Low-latency requirements
- NVIDIA hardware
- Enterprises

**Trade-offs:**
- More complex setup
- NVIDIA-only
- Less flexibility

### Text Generation Inference (TGI)

**Strengths:**
- Hugging Face integration
- Good balance of features
- Production-ready
- Streaming support

**Best for:**
- Hugging Face ecosystem users
- Balanced workloads
- Quick deployment

### llama.cpp

**Strengths:**
- CPU inference
- Quantization (GGUF)
- Low dependencies
- Cross-platform

**Best for:**
- CPU/Mac inference
- Edge deployment
- Resource-constrained environments

**Code:**
```python
from llama_cpp import Llama

llm = Llama(
    model_path="./models/llama-2-13b.Q4_K_M.gguf",
    n_ctx=2048,
    n_threads=8
)

output = llm("Explain quantum computing", max_tokens=200)
```

### Framework Selection Guide

```
Need absolute lowest latency?
└─ TensorRT-LLM

Need highest throughput?
└─ vLLM

Need CPU inference?
└─ llama.cpp

Need quick deployment with Hugging Face?
└─ Text Generation Inference

Need flexibility and experimentation?
└─ Transformers (basic)
```

## Optimizing Prefill vs. Decoding

### Prefill Optimization

**Characteristics:**
- Compute-bound
- Parallelizable
- Single pass through model

**Optimization techniques:**
1. **Efficient attention**: Flash Attention
2. **Larger batch sizes**: Process multiple prompts
3. **Tensor parallelism**: Split across GPUs for huge prompts
4. **Kernel fusion**: Combine operations

**Code example:**
```python
# Optimize prefill with larger batch
prefill_batch_size = 32  # Process many prompts at once

# Enable Flash Attention for efficiency
model.config.use_flash_attention_2 = True

# Profile to verify compute-bound
with torch.profiler.profile() as prof:
    model.forward(input_ids)
# Check: GPU utilization should be >80%
```

### Decoding Optimization

**Characteristics:**
- Memory-bound
- Sequential (one token at a time per sequence)
- Repeated model passes

**Optimization techniques:**
1. **KV cache management**: Keep in fast memory
2. **Batch multiple sequences**: Decode different requests together
3. **Quantization**: Reduce memory bandwidth
4. **Speculative decoding**: Predict multiple tokens (advanced)

**Code example:**
```python
# Optimize decoding with continuous batching
# vLLM does this automatically

# Manual optimization with batching
def batch_decode(models, kv_caches, batch_size=16):
    # Decode multiple sequences simultaneously
    active_sequences = get_active_sequences()

    # Group into batches
    batches = chunk(active_sequences, batch_size)

    for batch in batches:
        # Generate next token for all sequences in batch
        next_tokens = model.decode(batch, kv_caches)
        update_sequences(next_tokens)
```

## Speculative Decoding

### The Concept

Use a small "draft" model to predict multiple tokens, then verify with the large "target" model in parallel.

**Process:**
1. Draft model generates K tokens quickly
2. Target model verifies all K tokens in parallel
3. Accept correct tokens, reject from first wrong token
4. Repeat

**Speedup:**
- Best case: K× faster (if all accepted)
- Typical: 2-3× faster
- Worst case: Slightly slower (if all rejected)

### When It Works

**Good scenarios:**
- Draft and target models are similar
- Predictable output (code, structured data)
- Long outputs

**Poor scenarios:**
- Creative writing (low predictability)
- Very diverse outputs
- Short generations

### Implementation

**Using Hugging Face:**
```python
from transformers import AutoModelForCausalLM

# Load models
target_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-70b-hf")
draft_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")

# Enable speculative decoding (Transformers 4.35+)
outputs = target_model.generate(
    input_ids,
    assistant_model=draft_model,
    do_sample=True,
    max_new_tokens=200
)
```

## Real-World Optimization Examples

### Example 1: Chatbot Latency Optimization

**Baseline:**
- Model: Llama-2 13B FP16
- Framework: Transformers
- Hardware: A100 40GB
- Latency: 2.8s (500 tokens output)

**Optimization steps:**

```python
# Step 1: Enable Flash Attention 2
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    attn_implementation="flash_attention_2"
)
# Result: 2.1s (-25%)

# Step 2: Switch to vLLM
from vllm import LLM
llm = LLM(model="meta-llama/Llama-2-13b-hf")
# Result: 1.2s (-43% from step 1)

# Step 3: Add quantization (covered in Chapter 5)
# Result: 0.9s (-25% from step 2)

# Total improvement: 68% latency reduction
```

### Example 2: Throughput Optimization

**Baseline:**
- Model: Mistral 7B
- Framework: Transformers
- Workload: 100 requests/minute
- Throughput: 12 req/min (can't keep up!)

**Optimization:**

```python
# Switch to vLLM with continuous batching
from vllm import LLM, SamplingParams

llm = LLM(
    model="mistralai/Mistral-7B-v0.1",
    max_model_len=4096,
    gpu_memory_utilization=0.95,  # Use most of GPU memory
)

# Process requests as they arrive
# vLLM handles batching automatically

# Result: 85 req/min (7× improvement)
```

### Example 3: Cost Optimization

**Goal**: Reduce infrastructure costs while maintaining quality

```python
# Original: A100 80GB ($3/hour)
# Optimization path:

# 1. Quantize to INT8 (Chapter 5)
#    → Reduces memory 2×
#    → Can now use A10G 24GB ($1/hour)

# 2. Implement request caching
cache = {}
def get_response(prompt):
    prompt_hash = hash(prompt)
    if prompt_hash in cache:
        return cache[prompt_hash]  # Instant!

    response = llm.generate(prompt)
    cache[prompt_hash] = response
    return response

# 3. Use spot instances with failover
#    → Additional 60-70% cost reduction

# Total cost reduction: ~80%
```

## Frequently Asked Questions

**Q: Does Flash Attention work on all GPUs?**
A: Flash Attention 2 requires Ampere or newer NVIDIA GPUs (A100, A10, RTX 30/40 series, etc.). Older GPUs fall back to standard attention.

**Q: Is continuous batching always better?**
A: For high-traffic scenarios, yes. For single-user or low-volume use cases, the complexity may not be worth it.

**Q: Should I use speculative decoding?**
A: If you have predictable outputs and can run two models, it's worth testing. For creative generation, gains are minimal.

**Q: How much does vLLM improve performance?**
A: Typically 2-5× throughput improvement and 30-60% latency reduction compared to basic Transformers, depending on workload.

**Q: Can I combine all these optimizations?**
A: Yes! Flash Attention + continuous batching + quantization + good serving framework = massive improvements.

## Action Items

- [ ] Identify your primary bottleneck (prefill vs. decoding)
- [ ] Enable Flash Attention 2 for your model
- [ ] Test vLLM for throughput improvements
- [ ] Measure KV cache size for your typical workload
- [ ] Implement basic request caching if applicable
- [ ] Calculate potential savings from better serving framework

## Reflection Questions

1. Is your use case more latency-sensitive or throughput-sensitive?
2. What percentage of your inference time is prefill vs. decoding?
3. Do you have multiple concurrent users? (batching opportunity)
4. Are your prompts/outputs predictable? (speculative decoding opportunity)
5. What's your current GPU memory utilization? (room for larger batches?)

## What's Next?

In Chapter 5, we'll explore model compression techniques—quantization, pruning, and distillation. These methods can reduce model size by 50-75% while maintaining quality, enabling deployment on cheaper hardware and faster inference.

---

**Key Takeaway**: Inference optimization starts with understanding your bottlenecks. Use Flash Attention for long sequences, continuous batching for high traffic, and modern serving frameworks (especially vLLM) for the biggest immediate wins.
