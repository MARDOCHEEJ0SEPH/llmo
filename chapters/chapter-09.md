# Chapter 9: Edge and Mobile Deployment

## Learning Objectives

- Deploy LLMs on resource-constrained devices
- Optimize models for mobile and edge environments
- Implement hybrid cloud-edge architectures
- Use ONNX, Core ML, and mobile-optimized frameworks
- Balance on-device vs cloud inference

## Edge and Mobile Constraints

### Hardware Limitations

| Device | RAM | Storage | Compute | Power |
|--------|-----|---------|---------|-------|
| Smartphone | 6-12GB | 128-512GB | Limited | Battery |
| Tablet | 8-16GB | 256GB-1TB | Moderate | Battery |
| Edge Server | 16-64GB | 1-4TB | Good | Plugged |
| IoT Device | 512MB-4GB | 8-64GB | Very Limited | Battery/Low |

### Model Size Targets

**Mobile:** <1GB for smooth performance
**Edge:** <4GB for single-device deployment
**IoT:** <500MB maximum

## Model Selection for Edge

### Tiny Models (<1B parameters)

**Phi-2 (2.7B):**
- Size: 5.4GB FP16 → 1.4GB INT4
- Quality: Excellent for size
- Use case: On-device assistance

**TinyLlama (1.1B):**
- Size: 2.2GB FP16 → 600MB INT4
- Quality: Good for simple tasks
- Use case: Mobile apps

**MobileLLM (125M-350M):**
- Size: 250MB-700MB INT8
- Quality: Task-specific
- Use case: Specialized mobile apps

### Quantization for Mobile

**INT4 is standard:**
```python
# Using llama.cpp for mobile deployment
# GGUF Q4_K_M quantization

from llama_cpp import Llama

model = Llama(
    model_path="./models/phi-2.Q4_K_M.gguf",
    n_ctx=2048,
    n_threads=4,  # Mobile CPU threads
    n_gpu_layers=0  # CPU-only on mobile
)

# Model size: ~1.5GB
# Runs on iPhone 14+, Android flagships
```

## Mobile Frameworks

### llama.cpp (Cross-Platform)

**Best for:** iOS and Android deployment

```cpp
// iOS/Android C++ integration
#include "llama.h"

struct llama_context* ctx = llama_init_from_file(
    "model.gguf",
    {.n_ctx = 2048, .n_gpu_layers = 0}
);

// Inference
auto result = llama_generate(ctx, prompt, 100);
```

**Swift wrapper (iOS):**
```swift
import LlamaCpp

class LLMService {
    let model: LlamaModel

    init() {
        model = LlamaModel(path: "phi-2-q4.gguf")
    }

    func generate(_ prompt: String) -> String {
        return model.generate(prompt, maxTokens: 100)
    }
}
```

### ONNX Runtime Mobile

**Optimized inference engine:**

```python
# Convert model to ONNX
import torch
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained("phi-2")

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "phi-2.onnx",
    opset_version=14,
    do_constant_folding=True
)

# Optimize for mobile
from onnxruntime.quantization import quantize_dynamic

quantize_dynamic(
    "phi-2.onnx",
    "phi-2-int8.onnx",
    weight_type=QuantType.QInt8
)
```

**Mobile inference:**
```java
// Android
import ai.onnxruntime.OrtEnvironment;
import ai.onnxruntime.OrtSession;

OrtEnvironment env = OrtEnvironment.getEnvironment();
OrtSession session = env.createSession("phi-2-int8.onnx");

// Run inference
OrtSession.Result result = session.run(inputTensor);
```

### Core ML (iOS)

**Apple's ML framework:**

```python
# Convert to Core ML
import coremltools as ct

model = ct.convert(
    torch_model,
    inputs=[ct.TensorType(shape=(1, 512))],
    compute_units=ct.ComputeUnit.ALL  # Use Neural Engine
)

model.save("phi-2.mlpackage")
```

**iOS usage:**
```swift
import CoreML

class MLService {
    let model = try! phi_2(configuration: MLModelConfiguration())

    func generate(_ input: String) -> String {
        let prediction = try! model.prediction(input: input)
        return prediction.output
    }
}
```

## Hybrid Cloud-Edge Architecture

### When to Use Each

**On-Device (Edge):**
- Privacy-sensitive data
- Offline requirement
- Low latency (<100ms)
- Simple queries

**Cloud:**
- Complex queries
- Unlimited context
- Latest models
- Cost-efficient at scale

### Smart Routing

```python
class HybridLLM:
    def __init__(self):
        self.edge_model = load_edge_model()  # Tiny model on device
        self.cloud_endpoint = "https://api.llm-service.com"

    async def generate(self, prompt: str, max_tokens: int = 100):
        # Decision logic
        if self.should_use_edge(prompt):
            return self.edge_model.generate(prompt, max_tokens)
        else:
            return await self.cloud_generate(prompt, max_tokens)

    def should_use_edge(self, prompt: str) -> bool:
        # Use edge if:
        # 1. Offline mode
        if not self.is_online():
            return True

        # 2. Privacy-sensitive
        if self.is_sensitive(prompt):
            return True

        # 3. Simple query
        if len(prompt) < 100 and self.is_simple_query(prompt):
            return True

        # 4. Low latency required
        if self.latency_requirement < 0.2:
            return True

        return False

    async def cloud_generate(self, prompt: str, max_tokens: int):
        async with aiohttp.ClientSession() as session:
            async with session.post(
                self.cloud_endpoint,
                json={"prompt": prompt, "max_tokens": max_tokens}
            ) as response:
                return await response.json()
```

### Progressive Enhancement

```python
# Start with edge, upgrade to cloud if needed
class ProgressiveInference:
    async def generate(self, prompt: str):
        # Quick edge inference first
        edge_result = await self.edge_model.generate(
            prompt,
            max_tokens=50,
            timeout=0.5  # 500ms timeout
        )

        # Check if edge result is good enough
        if self.is_satisfactory(edge_result):
            return edge_result

        # Upgrade to cloud for better quality
        cloud_result = await self.cloud_model.generate(
            prompt,
            max_tokens=200
        )

        return cloud_result
```

## Memory and Power Optimization

### Reducing Memory Footprint

```python
# Memory-efficient inference on mobile
import gc
import torch

def mobile_generate(model, prompt, max_tokens=100):
    # Clear cache before inference
    gc.collect()
    torch.cuda.empty_cache()  # If using GPU

    # Generate with minimal memory
    with torch.no_grad():  # No gradient tracking
        with torch.inference_mode():  # Further optimization
            output = model.generate(
                prompt,
                max_new_tokens=max_tokens,
                do_sample=False,  # Greedy decode (faster, less memory)
                num_beams=1  # No beam search
            )

    # Clear cache after inference
    del output
    gc.collect()

    return output
```

### Battery Optimization

```swift
// iOS: Optimize for battery life
import Foundation

class BatteryOptimizedInference {
    func generate(_ prompt: String) -> String {
        // Check battery level
        let batteryLevel = UIDevice.current.batteryLevel

        if batteryLevel < 0.2 {
            // Low battery: Skip inference or use cached response
            return getCachedResponse(prompt) ?? "Low battery mode"
        }

        // Check power state
        let powerState = UIDevice.current.batteryState

        if powerState == .charging {
            // Charging: Use maximum quality
            return model.generate(prompt, quality: .high)
        } else {
            // On battery: Use power-efficient mode
            return model.generate(prompt, quality: .balanced)
        }
    }
}
```

## Offline-First Design

### Model Bundling

```
App Bundle
├── app.js
├── models/
│   ├── tiny-llm-q4.gguf (800MB)
│   ├── embeddings.bin (100MB)
│   └── tokenizer.json (2MB)
└── cache/
    └── responses.db
```

**iOS App Bundle:**
```swift
// Include model in app bundle
guard let modelPath = Bundle.main.path(
    forResource: "tiny-llm-q4",
    ofType: "gguf"
) else {
    fatalError("Model not found in bundle")
}

let model = LlamaModel(path: modelPath)
```

### Incremental Model Loading

```python
class IncrementalLoader:
    """Load model progressively to reduce startup time."""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.loaded_layers = 0
        self.total_layers = 32

    async def load_next_layer(self):
        # Load one layer at a time
        load_layer(self.model_path, self.loaded_layers)
        self.loaded_layers += 1

    async def load_background(self):
        # Load in background while app initializes
        while self.loaded_layers < self.total_layers:
            await self.load_next_layer()
            await asyncio.sleep(0.1)  # Yield to UI

    def is_ready(self) -> bool:
        # Can start inference after minimum layers loaded
        return self.loaded_layers >= 8  # 25% loaded = basic functionality
```

## Edge Server Deployment

### NVIDIA Jetson

**Optimized for edge AI:**

```python
# TensorRT optimization for Jetson
import tensorrt as trt
from cuda import cudart

# Build optimized engine
builder = trt.Builder(logger)
config = builder.create_builder_config()

# Jetson-specific optimizations
config.set_memory_pool_limit(trt.MemoryPoolType.WORKSPACE, 2 << 30)  # 2GB
config.set_flag(trt.BuilderFlag.FP16)  # Use FP16
config.set_flag(trt.BuilderFlag.INT8)  # Use INT8 if available

# Build engine
engine = builder.build_engine(network, config)

# Save for deployment
with open("model_jetson.trt", "wb") as f:
    f.write(engine.serialize())
```

### Apple Silicon (M1/M2/M3)

**Leveraging unified memory:**

```python
# Use Metal Performance Shaders for inference
import torch
from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "phi-2",
    torch_dtype=torch.float16,
    device_map="mps"  # Apple Metal Performance Shaders
)

# Inference uses unified memory (CPU + GPU)
output = model.generate(input_ids, max_new_tokens=100)
```

## Case Study: Mobile Chat App

### Requirements
- Works offline
- <2GB storage
- <1s response time
- Privacy-first (no cloud)

### Solution

**Model:** TinyLlama 1.1B Q4_K_M
- Size: 600MB
- Quality: Good for chat
- Speed: ~800ms on iPhone 14

**Implementation:**
```swift
import LlamaCpp

class ChatService {
    let model: LlamaModel
    let cache: ResponseCache

    init() {
        model = LlamaModel(path: Bundle.main.path(forResource: "tinyllama", ofType: "gguf")!)
        cache = ResponseCache(maxSize: 100)
    }

    func chat(_ message: String) -> String {
        // Check cache first
        if let cached = cache.get(message) {
            return cached
        }

        // Generate
        let start = Date()
        let response = model.generate(
            buildPrompt(message),
            maxTokens: 100,
            temperature: 0.7
        )
        let latency = Date().timeIntervalSince(start)

        // Log performance
        print("Generated in \(latency)s")

        // Cache for future
        cache.set(message, response)

        return response
    }

    func buildPrompt(_ message: String) -> String {
        return """
        User: \(message)
        Assistant:
        """
    }
}
```

**Results:**
- App size: 850MB (model + app)
- Latency: 700-900ms
- Fully offline
- Privacy-preserving

## Frequently Asked Questions

**Q: Can LLMs really run on phones?**
A: Yes! Models <2B parameters work well on modern smartphones (2020+) with quantization.

**Q: What's the smallest usable LLM?**
A: ~500M parameters for specific tasks, 1B+ for general chat. Quality improves significantly at 2-3B.

**Q: Should I bundle the model in the app?**
A: For offline-first apps, yes. Otherwise, download on first launch to reduce app size.

**Q: How do I handle model updates?**
A: Download new models in background, swap atomically. Keep old model until new one is verified.

**Q: iOS or Android better for on-device LLMs?**
A: Both work well. iOS has unified memory (helpful), Android has more variety in hardware.

## Action Items

- [ ] Test tiny models (<2B) for your use case
- [ ] Measure latency and memory on target devices
- [ ] Implement hybrid cloud-edge architecture if applicable
- [ ] Set up offline caching for common queries
- [ ] Profile battery usage during inference
- [ ] Create fallback strategy for unsupported devices

## What's Next?

Chapter 10 covers efficient fine-tuning techniques—LoRA, QLoRA, and parameter-efficient methods for adapting models to your specific use case without massive compute requirements.

---

**Key Takeaway**: Edge and mobile deployment requires aggressive compression (INT4), small models (<2B parameters), and smart hybrid architectures. Modern phones can run quality models for many use cases, enabling privacy-first, offline-capable AI applications.
