# Chapter 6: Memory Optimization

## Learning Objectives

- Master gradient checkpointing for training efficiency
- Implement mixed precision training
- Understand memory-efficient attention mechanisms
- Optimize memory usage for both training and inference
- Apply techniques to fit larger models on limited hardware

## Memory Challenges in LLMs

### Training Memory Requirements

**Components:**
1. **Model weights**: 1× model size
2. **Gradients**: 1× model size
3. **Optimizer states**: 2× model size (Adam)
4. **Activations**: Varies by batch size and sequence length

**Total**: ~4× model size + activations

**Example (13B model, FP32):**
- Weights: 52GB
- Gradients: 52GB
- Optimizer: 104GB
- Activations (batch=8, seq=2048): ~40GB
- **Total**: ~248GB (Doesn't fit on single A100 80GB!)

## Gradient Checkpointing

### The Problem

During training, intermediate activations must be stored for the backward pass:

```
Forward: Input → Layer1 → Layer2 → ... → LayerN → Loss
                  ↓        ↓              ↓
                [Save]   [Save]        [Save]
Backward: Use saved activations to compute gradients
```

**Memory usage**: O(layers × batch_size × sequence_length × hidden_dim)

### The Solution

**Gradient checkpointing** (also called activation checkpointing):
- Only save checkpoints at intervals
- Recompute intermediate activations during backward pass
- Trade compute for memory

```
Forward: Input → [Checkpoint] → ... → [Checkpoint] → Loss
Backward: Recompute between checkpoints as needed
```

**Memory savings**: ~10× for large models
**Compute overhead**: ~20-30% slower training

### Implementation

**Using Hugging Face:**
```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    use_cache=False  # Required for gradient checkpointing
)

# Enable gradient checkpointing
model.gradient_checkpointing_enable()

# Train as normal
# Memory usage dramatically reduced!
```

**Impact on 13B model:**
- Without: ~248GB (impossible on A100)
- With: ~28GB (fits easily!)
- Training speed: ~25% slower
- **Result**: Can train on single GPU instead of 4!

## Mixed Precision Training

### Precision Types

**FP32 (Full Precision)**
- 32-bit floating point
- Maximum precision
- Highest memory usage

**FP16 (Half Precision)**
- 16-bit floating point
- 50% memory reduction
- 2-3× faster on modern GPUs
- Risk of numerical instability

**BF16 (Brain Float 16)**
- 16-bit with better range than FP16
- Same memory savings as FP16
- More stable training
- Requires Ampere+ GPUs

### Automatic Mixed Precision (AMP)

**Strategy:**
- Weights in FP32 (master copy)
- Forward/backward in FP16/BF16
- Update master weights in FP32

```python
import torch
from torch.cuda.amp import autocast, GradScaler

model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b-hf")
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-5)

# For FP16
scaler = GradScaler()

for batch in dataloader:
    optimizer.zero_grad()

    # Forward pass in FP16
    with autocast():
        outputs = model(**batch)
        loss = outputs.loss

    # Backward pass with gradient scaling
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()
```

**For BF16 (simpler, recommended on Ampere+):**
```python
from torch.cuda.amp import autocast

for batch in dataloader:
    optimizer.zero_grad()

    with autocast(dtype=torch.bfloat16):
        outputs = model(**batch)
        loss = outputs.loss

    loss.backward()
    optimizer.step()
```

**Memory savings**: ~50%
**Speed improvement**: 2-3× on modern GPUs
**Quality impact**: Minimal with proper configuration

## Memory-Efficient Attention

### Standard Attention Memory

```python
# Memory: O(batch × heads × sequence² × bytes)
# For sequence=4096, batch=8, heads=32:
# 8 × 32 × 4096² × 2 bytes = 34GB just for attention!
```

### Flash Attention (Revisited)

**Memory optimization:**
- Tiling: Process attention in blocks
- No materialization of full attention matrix
- Memory: O(sequence) instead of O(sequence²)

```python
# Enable Flash Attention
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    torch_dtype=torch.bfloat16,
    attn_implementation="flash_attention_2",
    device_map="auto"
)

# Training with long sequences now feasible!
```

**Impact:**
- 4K sequence: ~3-4× memory reduction
- 8K sequence: ~7-8× memory reduction
- Essential for long-context training

### Memory-Efficient Attention Variants

**1. xFormers Memory-Efficient Attention**
```python
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    attn_implementation="sdpa",  # Scaled Dot Product Attention
)
```

**2. Linear Attention**
- Approximates softmax attention
- O(sequence) complexity
- Quality trade-offs
- Research area

## Optimizer Memory Optimization

### Standard Optimizers

**Adam optimizer states:**
- First moment (momentum): 1× model size
- Second moment (variance): 1× model size
- **Total**: 2× model size in optimizer memory

**Example (13B model, FP32):**
- Optimizer states: 104GB

### Memory-Efficient Optimizers

**1. AdamW 8-bit (bitsandbytes)**
```python
import bitsandbytes as bnb

optimizer = bnb.optim.AdamW8bit(
    model.parameters(),
    lr=1e-5,
    weight_decay=0.01
)

# Optimizer memory: 104GB → 26GB (75% reduction!)
```

**2. Adafactor**
```python
from transformers import Adafactor

optimizer = Adafactor(
    model.parameters(),
    lr=1e-3,
    relative_step=False,
    warmup_init=False
)

# No momentum storage, factorized second moment
# Memory: ~0.5× model size instead of 2×
```

**3. SGD (minimal memory)**
```python
optimizer = torch.optim.SGD(model.parameters(), lr=0.01)

# No optimizer states
# Memory: Near zero
# Trade-off: Slower convergence, may need learning rate schedule
```

## Model Parallelism

### When Single GPU Isn't Enough

**Options:**
1. **Data Parallelism**: Same model on each GPU, split data
2. **Model Parallelism**: Split model across GPUs
3. **Pipeline Parallelism**: Different layers on different GPUs
4. **Tensor Parallelism**: Split individual layers across GPUs

### Data Parallelism (DDP)

**Use when**: Model fits on one GPU, want to train faster

```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

# Initialize process group
dist.init_process_group("nccl")

# Wrap model
model = DDP(model, device_ids=[local_rank])

# Each GPU processes different batch
# Gradients averaged across GPUs
```

**Memory**: Same per GPU
**Speed**: ~Linear scaling with GPUs

### Pipeline Parallelism

**Use when**: Model too large for one GPU

```python
from torch.distributed.pipeline.sync import Pipe

# Split model into stages
model = nn.Sequential(
    layer1,
    layer2,
    # ...
)

# Distribute across GPUs
model = Pipe(model, chunks=8, devices=[0, 1, 2, 3])
```

**Memory**: Divided across GPUs
**Efficiency**: Can have idle GPUs (bubble)

### Tensor Parallelism

**Use when**: Individual layers too large

```python
# Supported in Megatron-LM, DeepSpeed

# Split weight matrices across GPUs
# Each GPU computes partial result
# Communicate and combine results
```

**Memory**: Best efficiency
**Communication**: High bandwidth needed

### ZeRO (DeepSpeed)

**Zero Redundancy Optimizer**
- Partitions optimizer states, gradients, and parameters
- Dramatically reduces memory per GPU
- Enables training massive models

```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./output",
    per_device_train_batch_size=4,
    gradient_checkpointing=True,
    bf16=True,
    deepspeed="ds_config.json"  # DeepSpeed config
)

# ds_config.json
{
    "zero_optimization": {
        "stage": 2,  # or 3 for even more memory savings
        "offload_optimizer": {
            "device": "cpu"  # Offload to CPU if needed
        }
    },
    "bf16": {"enabled": true}
}
```

**ZeRO Stages:**
- **Stage 1**: Partition optimizer states (4× memory reduction)
- **Stage 2**: Partition gradients (8× memory reduction)
- **Stage 3**: Partition parameters (Linear scaling with GPUs)

**Example:**
- 70B model normally requires 8× A100 80GB
- With ZeRO-3: Can train on 4× A100 80GB

## CPU Offloading

### Offload to CPU RAM

When GPU memory is insufficient:

```python
from transformers import AutoModelForCausalLM

# Offload automatically
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    device_map="auto",  # Automatically offloads to CPU
    offload_folder="offload",  # Disk offload if needed
    max_memory={0: "40GB", "cpu": "100GB"}
)
```

**Trade-offs:**
- **Pro**: Can run larger models
- **Con**: 10-100× slower for offloaded layers
- **Use case**: Inference on limited hardware, not training

### DeepSpeed CPU Offloading

```json
{
    "zero_optimization": {
        "stage": 3,
        "offload_optimizer": {
            "device": "cpu",
            "pin_memory": true
        },
        "offload_param": {
            "device": "cpu",
            "pin_memory": true
        }
    }
}
```

**Enables**:
- Training 13B on single RTX 3090 (24GB)
- Training 70B on 4× RTX 3090

**Speed**: ~50% slower than full GPU, but makes impossible → possible

## Batch Size Optimization

### Finding Optimal Batch Size

**Goal**: Maximize batch size without OOM (Out of Memory)

```python
def find_max_batch_size(model, max_memory):
    batch_size = 1
    while True:
        try:
            torch.cuda.empty_cache()
            dummy_input = torch.randint(0, 1000, (batch_size, 512)).cuda()

            with torch.no_grad():
                _ = model(dummy_input)

            print(f"Batch size {batch_size}: OK")
            batch_size *= 2
        except RuntimeError as e:
            if "out of memory" in str(e):
                optimal = batch_size // 2
                print(f"Max batch size: {optimal}")
                return optimal
            else:
                raise e

optimal_batch_size = find_max_batch_size(model, gpu_memory)
```

### Gradient Accumulation

**Effective larger batch sizes:**

```python
# Want effective batch size of 32, but only fits batch size 4
effective_batch_size = 32
actual_batch_size = 4
accumulation_steps = effective_batch_size // actual_batch_size  # 8

optimizer.zero_grad()
for i, batch in enumerate(dataloader):
    outputs = model(**batch)
    loss = outputs.loss / accumulation_steps  # Scale loss
    loss.backward()

    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()
```

**Benefits:**
- Simulate large batch training on limited memory
- Same convergence as actual large batch
- No memory overhead

## Memory Profiling

### PyTorch Profiler

```python
from torch.profiler import profile, ProfilerActivity, record_function

with profile(
    activities=[ProfilerActivity.CPU, ProfilerActivity.CUDA],
    record_shapes=True,
    profile_memory=True,
    with_stack=True
) as prof:
    with record_function("model_training"):
        for batch in dataloader:
            outputs = model(**batch)
            loss = outputs.loss
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()

# Print memory usage
print(prof.key_averages().table(sort_by="cuda_memory_usage", row_limit=10))

# Export for visualization
prof.export_chrome_trace("trace.json")
```

### NVIDIA Tools

```bash
# Nsight Systems
nsys profile -o profile.qdrep python train.py

# Nsight Compute (detailed GPU kernel analysis)
ncu --set full -o profile python train.py
```

## Practical Memory Optimization Workflow

### Step 1: Measure Baseline

```python
import torch

torch.cuda.empty_cache()
torch.cuda.reset_peak_memory_stats()

# Run training/inference
outputs = model(**batch)

peak_memory = torch.cuda.max_memory_allocated() / 1024**3
print(f"Peak memory: {peak_memory:.2f} GB")
```

### Step 2: Apply Optimizations

**Priority order:**
1. **Enable mixed precision** (BF16/FP16) → 50% savings
2. **Gradient checkpointing** (training) → 5-10× savings on activations
3. **Flash Attention** → 3-8× savings on attention
4. **8-bit optimizers** → 75% savings on optimizer states
5. **Reduce batch size** + gradient accumulation → as needed
6. **Model parallelism** (if still doesn't fit)

### Step 3: Verify

```python
# After each optimization
peak_memory_new = torch.cuda.max_memory_allocated() / 1024**3
savings = (peak_memory - peak_memory_new) / peak_memory * 100
print(f"Memory savings: {savings:.1f}%")
```

## Case Study: Training 13B on Single GPU

### Goal
Fine-tune Llama-2 13B on single A100 40GB

**Initial attempt:**
```python
model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-13b-hf")
# OOM Error! Needs ~250GB
```

**Optimization 1: Mixed Precision (BF16)**
```python
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-13b-hf",
    torch_dtype=torch.bfloat16
)
# Still OOM! ~125GB needed
```

**Optimization 2: Add Gradient Checkpointing**
```python
model.gradient_checkpointing_enable()
# Memory: ~35GB - almost fits!
```

**Optimization 3: 8-bit Optimizer**
```python
optimizer = bnb.optim.AdamW8bit(model.parameters())
# Memory: ~25GB - fits with batch_size=1
```

**Optimization 4: Gradient Accumulation**
```python
# Effective batch size = 4
accumulation_steps = 4
# Total memory: ~30GB
# Successfully training!
```

**Final configuration:**
- BF16 mixed precision
- Gradient checkpointing
- 8-bit optimizer
- Batch size = 1, accumulation = 4
- Flash Attention 2
- **Memory**: 30GB / 40GB
- **Feasible on single A100 40GB!**

## Frequently Asked Questions

**Q: Does gradient checkpointing slow down training significantly?**
A: Typically 20-30% slower, but enables fitting 10× larger models. The trade-off is usually worth it.

**Q: Should I use FP16 or BF16?**
A: BF16 if your GPU supports it (Ampere+). It's more stable and doesn't require gradient scaling. Otherwise, FP16 with AMP works well.

**Q: Can I combine all these optimizations?**
A: Yes! They're complementary. Use mixed precision + gradient checkpointing + Flash Attention + 8-bit optimizer together.

**Q: When should I use DeepSpeed?**
A: When training very large models (70B+) or when you have multiple GPUs. For single GPU fine-tuning, the techniques in this chapter are sufficient.

**Q: Is CPU offloading worth it?**
A: For inference on limited hardware, yes. For training, it's very slow—better to use fewer parameters (QLoRA) or gradient checkpointing.

## Action Items

- [ ] Enable gradient checkpointing for your training workloads
- [ ] Switch to BF16/FP16 mixed precision if not already using
- [ ] Implement Flash Attention for long-context scenarios
- [ ] Try 8-bit optimizers to reduce optimizer memory
- [ ] Profile your training to identify memory bottlenecks
- [ ] Calculate maximum feasible model size on your hardware

## What's Next?

In Chapter 7, we'll explore production deployment strategies, including model serving frameworks, load balancing, monitoring, and scaling LLM applications to handle real-world traffic.

---

**Key Takeaway**: Memory optimization is essential for training and deploying large models. Combine gradient checkpointing, mixed precision, efficient attention, and optimizer optimizations to fit much larger models on your available hardware—often enabling single-GPU training for models that otherwise require multiple GPUs.
