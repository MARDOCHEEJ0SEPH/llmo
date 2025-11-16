# Chapter 5: Model Compression Techniques

## Learning Objectives

By the end of this chapter, you will:
- Master quantization techniques (INT8, INT4, and beyond)
- Understand pruning and sparsity methods
- Learn knowledge distillation for creating smaller models
- Implement compression with minimal quality loss
- Choose the right compression strategy for your use case
- Use popular quantization libraries and tools

## Introduction to Model Compression

### Why Compress Models?

**The Challenge:**
- Llama-2 70B in FP16: 140GB
- GPT-4 scale models: 1TB+
- Most organizations can't afford this

**The Solution:**
Model compression techniques can reduce size by 50-75% with minimal quality loss.

### Compression Categories

**1. Quantization**: Reduce numerical precision
**2. Pruning**: Remove unnecessary weights
**3. Distillation**: Train smaller models to mimic larger ones
**4. Low-rank factorization**: Decompose weight matrices

## Quantization Deep Dive

### Understanding Precision

**Floating Point Formats:**
```
FP32 (32-bit): ±1.18e-38 to ±3.4e38
FP16 (16-bit): ±6.10e-5 to ±6.55e4
BF16 (16-bit): ±1.18e-38 to ±3.4e38 (better range than FP16)

Integer Formats:
INT8 (8-bit): -128 to 127 (or 0 to 255 unsigned)
INT4 (4-bit): -8 to 7 (or 0 to 15 unsigned)
```

**Memory Savings:**
- FP32 → FP16: 50% reduction
- FP32 → INT8: 75% reduction
- FP32 → INT4: 87.5% reduction

### Quantization Methods

**1. Post-Training Quantization (PTQ)**

Quantize a pre-trained model without retraining:

```python
from transformers import AutoModelForCausalLM
import torch

# Load model in INT8
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    load_in_8bit=True,  # PTQ to INT8
    device_map="auto"
)

# Memory: 13GB → 6.5GB
# Quality degradation: <1%
# Speed: Similar or faster
```

**2. Quantization-Aware Training (QAT)**

Train model with quantization in the loop:

```python
# Simulates quantization during training
# Better accuracy than PTQ
# More expensive (requires training)

# Used when PTQ quality is insufficient
# Common in edge deployment scenarios
```

### GPTQ (Post-Training Quantization)

**What is GPTQ?**
- Advanced PTQ method
- Layer-wise quantization
- Minimizes reconstruction error
- Excellent for INT4

**Using GPTQ:**

```python
from transformers import AutoModelForCausalLM, GPTQConfig

# Quantize to 4-bit with GPTQ
gptq_config = GPTQConfig(
    bits=4,
    dataset="c4",  # Calibration dataset
    group_size=128
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=gptq_config,
    device_map="auto"
)

# Alternative: Load pre-quantized
model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-13B-GPTQ",  # Community quantized
    device_map="auto"
)
```

**GPTQ Performance:**
- 13B model: 26GB → 6.5GB (4-bit)
- Quality degradation: 2-4%
- Speed: 1.5-2× faster inference

### AWQ (Activation-aware Weight Quantization)

**Key Innovation:**
- Not all weights are equally important
- Preserve high-activation weights at higher precision
- Better quality than GPTQ at same bit-width

```python
from transformers import AutoModelForCausalLM, AwqConfig

awq_config = AwqConfig(
    bits=4,
    group_size=128,
    zero_point=True
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=awq_config,
    device_map="auto"
)

# Or load pre-quantized
model = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-13B-AWQ"
)
```

**AWQ vs GPTQ:**
| Method | Quality | Speed | Memory |
|--------|---------|-------|--------|
| GPTQ | Good | Fast | Low |
| AWQ | Better | Faster | Low |

**General rule:** AWQ usually better for 4-bit, try both!

### bitsandbytes Quantization

**Features:**
- Easy to use
- INT8 and INT4 (NF4) support
- QLoRA for efficient fine-tuning

```python
from transformers import AutoModelForCausalLM, BitsAndBytesConfig

# INT8 quantization
bnb_config = BitsAndBytesConfig(
    load_in_8bit=True,
    llm_int8_threshold=6.0  # Mixed precision threshold
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)

# INT4 (NF4) - for QLoRA
bnb_config_4bit = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",  # Normal Float 4
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True  # Nested quantization
)

model_4bit = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=bnb_config_4bit,
    device_map="auto"
)
```

### FP8 Quantization (Cutting Edge - 2024+)

**Available on:**
- H100 GPUs
- L4 GPUs
- Latest Ada Lovelace GPUs

**Benefits:**
- Hardware acceleration
- Better quality than INT8
- TensorRT-LLM support

```python
# Using TensorRT-LLM
# FP8 quantization for H100

# Build engine with FP8
trtllm-build \
    --checkpoint_dir ./llama-2-13b \
    --output_dir ./llama-2-13b-fp8 \
    --quant_mode fp8

# Result: Near FP16 quality with 2× memory savings
```

## Quantization Comparison Table

| Method | Bits | Memory | Quality | Speed | Best For |
|--------|------|--------|---------|-------|----------|
| FP16 | 16 | Baseline | 100% | Baseline | Training, high quality |
| INT8 (bitsandbytes) | 8 | 50% | 99% | 1.1× | General inference |
| GPTQ | 4 | 25% | 96-98% | 1.5-2× | Production inference |
| AWQ | 4 | 25% | 97-99% | 1.5-2× | Production inference |
| NF4 (QLoRA) | 4 | 25% | 96-98% | N/A | Fine-tuning |
| FP8 | 8 | 50% | 99.5% | 1.2× | H100 deployment |

## Pruning and Sparsity

### What is Pruning?

Removing less important weights from the model:

```python
# Dense model
weight = [0.5, 0.2, -0.3, 0.1, -0.4, 0.05]

# Pruned model (50% sparsity)
weight = [0.5, 0.2, -0.3, 0.0, -0.4, 0.0]
#  Only keep largest magnitude weights
```

### Types of Pruning

**1. Magnitude Pruning**
- Remove weights with smallest absolute values
- Simple and effective
- Can be structured or unstructured

**2. Structured Pruning**
- Remove entire neurons, channels, or heads
- Hardware-friendly (actual speedup)
- More aggressive quality impact

**3. Unstructured Pruning**
- Remove individual weights
- Better quality preservation
- Requires sparse kernels for speedup

### Implementing Pruning

**Using SparseGPT:**

```python
from sparseml.transformers import SparseAutoModelForCausalLM

# Prune to 50% sparsity
model = SparseAutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    sparsity_config={
        "sparsity": 0.5,
        "pruning_method": "magnitude"
    }
)

# Result:
# - 50% fewer parameters
# - With sparse kernels: 1.5× speedup
# - Quality degradation: 3-5%
```

**Combining Pruning + Quantization:**

```python
# Prune to 50% + Quantize to INT4
# Effective compression: 87.5% × 50% = 93.75%
# 13B model: 26GB → 1.6GB!

# Quality degradation: 5-10%
# Best for: Edge deployment, aggressive compression
```

### When to Use Pruning

**Good scenarios:**
- Edge deployment (need small models)
- Combined with quantization
- After distillation

**Challenges:**
- Requires sparse kernels for speedup
- More aggressive quality trade-off than quantization
- Less mature tooling than quantization

## Knowledge Distillation

### The Concept

Train a small "student" model to mimic a large "teacher" model:

```
Teacher (70B) → [Distillation Training] → Student (7B)
```

**Goal:** Smaller model that approaches larger model's quality

### Distillation Process

**1. Generate training data from teacher:**
```python
teacher_model = AutoModelForCausalLM.from_pretrained("llama-2-70b")

# Generate responses for training prompts
teacher_outputs = []
for prompt in training_prompts:
    output = teacher_model.generate(prompt)
    teacher_outputs.append((prompt, output))
```

**2. Train student to match teacher:**
```python
student_model = AutoModelForCausalLM.from_pretrained("llama-2-7b")

# Train on teacher's outputs
# Loss = CrossEntropy(student_output, teacher_output)
```

### Distillation Variants

**1. Response Distillation**
- Match final outputs
- Simplest approach

**2. Feature Distillation**
- Match intermediate activations
- Better knowledge transfer

**3. Ranking Distillation**
- Match probability distributions
- Used in Mistral, Orca

### Practical Distillation

**Using Distil* Models:**

```python
# Pre-distilled models available
model = AutoModelForCausalLM.from_pretrained("distilgpt2")
# GPT-2 distilled to 6 layers

# DistilBERT
model = AutoModel.from_pretrained("distilbert-base-uncased")
# BERT distilled to 6 layers, 40% smaller
```

**Quality vs Size Trade-off:**
- 70B → 13B distillation: ~90-95% quality
- 13B → 7B distillation: ~93-97% quality
- Smaller gaps preserve quality better

### When to Use Distillation

**Good scenarios:**
- Creating deployment-optimized models
- Task-specific models
- You control the teacher model

**Challenges:**
- Requires significant compute
- Need quality training data
- Iterative process

## Compression Strategy Decision Tree

```
What's your primary constraint?

Memory (can't fit model)?
├─ Try INT8 quantization (bitsandbytes)
├─ Still too big? Try INT4 (GPTQ/AWQ)
└─ Still too big? Consider smaller base model

Inference cost?
├─ Try INT4 quantization (GPTQ/AWQ)
├─ Already quantized? Try smaller model + distillation
└─ Extreme budget? Prune + quantize

Latency?
├─ Try quantization (INT8 or INT4)
├─ Use efficient serving framework (vLLM)
└─ Consider smaller base model

Edge deployment?
├─ Start with smallest viable model (7B or less)
├─ Quantize to INT4
└─ Consider pruning if still too large
```

## Hands-On: Quantizing Llama-2 13B

### Step-by-step Implementation

**1. Baseline (FP16):**
```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    torch_dtype=torch.float16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-13b-hf")

# Memory: ~26GB
# Test quality with benchmark prompts
```

**2. INT8 Quantization:**
```python
from transformers import BitsAndBytesConfig

bnb_config = BitsAndBytesConfig(load_in_8bit=True)

model_int8 = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    quantization_config=bnb_config,
    device_map="auto"
)

# Memory: ~13GB (50% reduction)
# Test quality - expect <1% degradation
```

**3. INT4 Quantization (GPTQ):**
```python
model_int4 = AutoModelForCausalLM.from_pretrained(
    "TheBloke/Llama-2-13B-GPTQ",  # Pre-quantized
    device_map="auto",
    trust_remote_code=False,
    revision="gptq-4bit-128g-actorder_True"
)

# Memory: ~6.5GB (75% reduction)
# Test quality - expect 2-4% degradation
```

**4. Compare Results:**
```python
def benchmark_model(model, test_prompts):
    results = []
    for prompt in test_prompts:
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model.generate(**inputs, max_new_tokens=100)
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        results.append(response)
    return results

# Run benchmark on all three models
baseline_results = benchmark_model(model, test_prompts)
int8_results = benchmark_model(model_int8, test_prompts)
int4_results = benchmark_model(model_int4, test_prompts)

# Compare quality manually or with automated metrics
```

## Quality Evaluation

### Automated Metrics

**Perplexity (lower is better):**
```python
from torch.nn import CrossEntropyLoss

def calculate_perplexity(model, text):
    encodings = tokenizer(text, return_tensors="pt")
    max_length = model.config.max_position_embeddings
    stride = 512

    nlls = []
    for i in range(0, encodings.input_ids.size(1), stride):
        begin_loc = max(i + stride - max_length, 0)
        end_loc = min(i + stride, encodings.input_ids.size(1))
        input_ids = encodings.input_ids[:, begin_loc:end_loc]

        with torch.no_grad():
            outputs = model(input_ids, labels=input_ids)
            neg_log_likelihood = outputs.loss

        nlls.append(neg_log_likelihood)

    ppl = torch.exp(torch.stack(nlls).mean())
    return ppl.item()

# Compare across quantization levels
baseline_ppl = calculate_perplexity(model, test_text)
int8_ppl = calculate_perplexity(model_int8, test_text)
int4_ppl = calculate_perplexity(model_int4, test_text)

print(f"FP16: {baseline_ppl:.2f}")
print(f"INT8: {int8_ppl:.2f} ({(int8_ppl/baseline_ppl-1)*100:.1f}% change)")
print(f"INT4: {int4_ppl:.2f} ({(int4_ppl/baseline_ppl-1)*100:.1f}% change)")
```

**Task-Specific Accuracy:**
```python
# For classification, QA, or other benchmarks
from evaluate import load

# Example: Question answering
qa_metric = load("squad")

# Run inference and evaluate
baseline_score = evaluate_model(model, qa_dataset, qa_metric)
int8_score = evaluate_model(model_int8, qa_dataset, qa_metric)
int4_score = evaluate_model(model_int4, qa_dataset, qa_metric)
```

### Human Evaluation

**Side-by-side comparison:**
1. Generate responses from multiple quantization levels
2. Blind evaluation (reviewer doesn't know which is which)
3. Rate on scale (1-5) or choose preferred response
4. Calculate agreement and degradation rates

## Case Study: Production Quantization

### Scenario
SaaS company with code generation product

**Original setup:**
- Model: CodeLlama 34B FP16
- Hardware: 2× A100 40GB
- Cost: $6/hour × 24 = $144/day
- Users: 500 daily active

**Goal:** Reduce costs by 70% without hurting quality

**Step 1: Quantize to INT8**
```python
model_int8 = AutoModelForCausalLM.from_pretrained(
    "codellama/CodeLlama-34b-hf",
    load_in_8bit=True,
    device_map="auto"
)

# Result:
# - Fits on single A100 40GB
# - Cost: $3/hour × 24 = $72/day (50% reduction)
# - Quality: 0.5% degradation on HumanEval
```

**Step 2: Switch to INT4 + Better GPU**
```python
model_int4 = AutoModelForCausalLM.from_pretrained(
    "TheBloke/CodeLlama-34B-GPTQ",
    device_map="auto"
)

# Fits on A10G 24GB
# Cost: $1/hour × 24 = $24/day (67% reduction from step 1)
# Quality: 2.1% degradation on HumanEval (acceptable)
```

**Step 3: Add response caching**
```python
# 30% of queries are similar
# Cache saves 30% of compute
# Effective cost: $24 × 0.7 = $16.80/day
```

**Final result:**
- Cost: $144 → $16.80 (88% reduction!)
- Quality: 2.1% degradation (within acceptable limits)
- Latency: Slightly better (smaller model)

## Frequently Asked Questions

**Q: Which quantization method should I use?**
A: Start with INT8 (bitsandbytes). If you need more compression, try AWQ or GPTQ at INT4. AWQ generally has better quality.

**Q: Can I quantize any model?**
A: Most modern LLMs support quantization. Check Hugging Face or model docs. Pre-quantized versions often available (search "TheBloke" on HF).

**Q: Does quantization slow down inference?**
A: No! INT8/INT4 often *faster* due to reduced memory bandwidth. FP8 on H100 is both smaller and faster.

**Q: Can I fine-tune a quantized model?**
A: Yes! QLoRA enables fine-tuning of 4-bit quantized models efficiently.

**Q: What if quantization hurts quality too much?**
A: Try less aggressive quantization (INT8 instead of INT4), use a larger base model, or consider distillation instead.

## Action Items

- [ ] Quantize your model to INT8 and measure memory savings
- [ ] Test quality with your specific use case benchmarks
- [ ] If acceptable, try INT4 (GPTQ or AWQ)
- [ ] Calculate cost savings from using smaller GPU
- [ ] Set up automated quality monitoring for production deployment
- [ ] Create fallback plan if quantized model quality degrades

## Reflection Questions

1. What's your current model size and memory usage?
2. How much quality degradation is acceptable for your use case?
3. Do you have existing quality benchmarks?
4. What's your potential cost savings with 50% memory reduction?
5. Are you fine-tuning, or only doing inference?

## What's Next?

In Chapter 6, we'll explore memory optimization techniques beyond quantization, including gradient checkpointing for training, memory-efficient attention mechanisms, and strategies for fitting large models on limited hardware.

---

**Key Takeaway**: Quantization is the highest-impact optimization for most use cases. INT8 offers minimal quality loss with 50% memory savings, while INT4 can reduce memory by 75% with acceptable quality trade-offs. Start with bitsandbytes INT8, then explore GPTQ/AWQ if you need more compression.
