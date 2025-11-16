# Chapter 7: Production Deployment Strategies

## Learning Objectives

- Deploy LLMs using production-grade serving frameworks
- Implement load balancing and auto-scaling
- Set up monitoring and observability
- Handle errors and failures gracefully
- Optimize for reliability and uptime

## Production vs Development

| Aspect | Development | Production |
|--------|-------------|------------|
| Uptime | Not critical | 99.9%+ required |
| Monitoring | Basic logs | Full observability |
| Error handling | Simple | Comprehensive |
| Scaling | Fixed resources | Dynamic scaling |
| Cost | Per experiment | Optimized per request |

## Serving Frameworks

### vLLM Production Deployment

**Setup:**
```python
from vllm import LLM, SamplingParams
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

# Initialize model once at startup
llm = LLM(
    model="meta-llama/Llama-2-13b-hf",
    tensor_parallel_size=1,
    gpu_memory_utilization=0.9,
    max_model_len=4096,
)

class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 200
    temperature: float = 0.7

@app.post("/generate")
async def generate(request: GenerateRequest):
    try:
        sampling_params = SamplingParams(
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        outputs = llm.generate([request.prompt], sampling_params)
        return {"response": outputs[0].outputs[0].text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### TensorRT-LLM Deployment

**Build optimized engine:**
```bash
# Convert and optimize model
trtllm-build \
    --checkpoint_dir ./llama-2-13b \
    --output_dir ./llama-2-13b-trt \
    --max_batch_size 16 \
    --max_input_len 2048 \
    --max_output_len 512 \
    --quant_mode int8
```

**Serve:**
```python
from tensorrt_llm import LLM
from tensorrt_llm.runtime import ModelRunner

# Load optimized engine
runner = ModelRunner.from_dir("./llama-2-13b-trt")

# Inference
output = runner.generate(
    input_text="Your prompt here",
    max_new_tokens=100
)
```

### Triton Inference Server

**For multi-model serving:**

```python
# model_repository/
#   llama-2-13b/
#     config.pbtxt
#     1/
#       model.py

# config.pbtxt
name: "llama-2-13b"
backend: "python"
max_batch_size: 16

# Launch Triton
docker run --gpus all --rm \
    -p 8000:8000 -p 8001:8001 -p 8002:8002 \
    -v $(pwd)/model_repository:/models \
    nvcr.io/nvidia/tritonserver:24.01-py3 \
    tritonserver --model-repository=/models
```

## Load Balancing

### NGINX Configuration

```nginx
upstream llm_backends {
    least_conn;  # Route to least busy server
    server 10.0.1.10:8000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:8000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:8000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;

    location /generate {
        proxy_pass http://llm_backends;
        proxy_connect_timeout 5s;
        proxy_read_timeout 60s;
        proxy_buffering off;  # For streaming responses
    }
}
```

### Application-Level Load Balancing

```python
import random
from typing import List

class LoadBalancer:
    def __init__(self, backends: List[str]):
        self.backends = backends
        self.health_status = {b: True for b in backends}

    def get_backend(self) -> str:
        healthy = [b for b in self.backends if self.health_status[b]]
        if not healthy:
            raise Exception("No healthy backends")
        return random.choice(healthy)

    async def health_check(self):
        for backend in self.backends:
            try:
                # Check if backend is responding
                response = await client.get(f"{backend}/health")
                self.health_status[backend] = response.status_code == 200
            except:
                self.health_status[backend] = False
```

## Auto-Scaling

### Kubernetes HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: gpu_utilization
      target:
        type: AverageValue
        averageValue: "80"
```

### Custom Auto-Scaling Logic

```python
class AutoScaler:
    def __init__(self, min_replicas=2, max_replicas=10):
        self.min_replicas = min_replicas
        self.max_replicas = max_replicas
        self.current_replicas = min_replicas

    def should_scale_up(self, metrics):
        # Scale up if queue length > 10 or latency > 3s
        return (
            metrics['queue_length'] > 10 or
            metrics['p95_latency'] > 3.0
        )

    def should_scale_down(self, metrics):
        # Scale down if utilization < 30% for 5 minutes
        return (
            metrics['gpu_utilization'] < 30 and
            metrics['stable_period'] > 300
        )

    def scale(self, metrics):
        if self.should_scale_up(metrics):
            self.current_replicas = min(
                self.current_replicas + 1,
                self.max_replicas
            )
        elif self.should_scale_down(metrics):
            self.current_replicas = max(
                self.current_replicas - 1,
                self.min_replicas
            )
        return self.current_replicas
```

## Monitoring and Observability

### Key Metrics to Track

**Latency Metrics:**
```python
import time
from prometheus_client import Histogram, Counter, Gauge

# Define metrics
REQUEST_LATENCY = Histogram(
    'llm_request_duration_seconds',
    'Time spent processing request',
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)

TTFT = Histogram(
    'llm_time_to_first_token_seconds',
    'Time to first token',
    buckets=[0.1, 0.2, 0.5, 1.0, 2.0]
)

REQUESTS_TOTAL = Counter(
    'llm_requests_total',
    'Total requests',
    ['status']
)

GPU_MEMORY = Gauge(
    'llm_gpu_memory_used_bytes',
    'GPU memory usage'
)

# Instrument your code
@app.post("/generate")
async def generate(request: GenerateRequest):
    start_time = time.time()

    try:
        output = await llm.generate(request.prompt)
        REQUESTS_TOTAL.labels(status='success').inc()
        return output
    except Exception as e:
        REQUESTS_TOTAL.labels(status='error').inc()
        raise
    finally:
        REQUEST_LATENCY.observe(time.time() - start_time)
        GPU_MEMORY.set(torch.cuda.memory_allocated())
```

### Prometheus + Grafana Setup

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'llm-service'
    scrape_interval: 10s
    static_configs:
      - targets: ['localhost:8000']

# Grafana dashboard queries
# P95 latency
histogram_quantile(0.95, rate(llm_request_duration_seconds_bucket[5m]))

# Request rate
rate(llm_requests_total[1m])

# Error rate
rate(llm_requests_total{status="error"}[5m]) /
rate(llm_requests_total[5m])
```

### Logging Best Practices

```python
import logging
import json

# Structured logging
logger = logging.getLogger(__name__)

class StructuredLogger:
    @staticmethod
    def log_request(request_id, prompt, response, latency):
        log_data = {
            "request_id": request_id,
            "prompt_length": len(prompt),
            "response_length": len(response),
            "latency": latency,
            "timestamp": time.time(),
            "model": "llama-2-13b"
        }
        logger.info(json.dumps(log_data))

# Usage
@app.post("/generate")
async def generate(request: GenerateRequest):
    request_id = str(uuid.uuid4())
    start = time.time()

    response = await llm.generate(request.prompt)

    StructuredLogger.log_request(
        request_id,
        request.prompt,
        response,
        time.time() - start
    )

    return {"response": response, "request_id": request_id}
```

## Error Handling and Retries

### Graceful Error Handling

```python
from tenacity import retry, stop_after_attempt, wait_exponential

class LLMService:
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    async def generate_with_retry(self, prompt: str):
        try:
            return await self.llm.generate(prompt)
        except torch.cuda.OutOfMemoryError:
            torch.cuda.empty_cache()
            raise  # Retry
        except Exception as e:
            logger.error(f"Generation failed: {e}")
            raise

    async def generate_safe(self, prompt: str):
        try:
            return await self.generate_with_retry(prompt)
        except Exception as e:
            # Fallback to smaller model or cached response
            return await self.fallback_generate(prompt)
```

### Circuit Breaker Pattern

```python
from datetime import datetime, timedelta

class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            if datetime.now() - self.last_failure_time > timedelta(seconds=self.timeout):
                self.state = "half-open"
            else:
                raise Exception("Circuit breaker is open")

        try:
            result = func(*args, **kwargs)
            if self.state == "half-open":
                self.state = "closed"
                self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            self.last_failure_time = datetime.now()

            if self.failures >= self.failure_threshold:
                self.state = "open"
            raise
```

## Caching Strategies

### Response Caching

```python
from functools import lru_cache
import hashlib

class ResponseCache:
    def __init__(self, max_size=1000):
        self.cache = {}
        self.max_size = max_size

    def get_key(self, prompt: str, params: dict) -> str:
        # Create deterministic hash
        key_str = f"{prompt}:{json.dumps(params, sort_keys=True)}"
        return hashlib.sha256(key_str.encode()).hexdigest()

    def get(self, prompt: str, params: dict):
        key = self.get_key(prompt, params)
        return self.cache.get(key)

    def set(self, prompt: str, params: dict, response: str):
        if len(self.cache) >= self.max_size:
            # Evict oldest
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]

        key = self.get_key(prompt, params)
        self.cache[key] = response

# Usage
cache = ResponseCache(max_size=10000)

@app.post("/generate")
async def generate(request: GenerateRequest):
    # Check cache
    cached = cache.get(request.prompt, {"temperature": request.temperature})
    if cached:
        return {"response": cached, "cached": True}

    # Generate
    response = await llm.generate(request.prompt)

    # Store in cache
    cache.set(request.prompt, {"temperature": request.temperature}, response)

    return {"response": response, "cached": False}
```

### Redis-Based Caching

```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def cached_generate(prompt: str, max_tokens: int = 200):
    cache_key = f"llm:{hashlib.sha256(prompt.encode()).hexdigest()}"

    # Try cache
    cached = redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Generate
    response = llm.generate(prompt, max_tokens=max_tokens)

    # Cache for 1 hour
    redis_client.setex(
        cache_key,
        3600,
        json.dumps(response)
    )

    return response
```

## Deployment Patterns

### Blue-Green Deployment

```yaml
# Service always points to "live" version
apiVersion: v1
kind: Service
metadata:
  name: llm-service
spec:
  selector:
    app: llm
    version: blue  # Switch to green when ready

---
# Blue deployment (current)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: llm
      version: blue
  template:
    spec:
      containers:
      - name: llm
        image: llm-service:v1.0

---
# Green deployment (new version)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: llm
      version: green
  template:
    spec:
      containers:
      - name: llm
        image: llm-service:v2.0
```

### Canary Deployment

```yaml
# 90% to stable, 10% to canary
apiVersion: v1
kind: Service
metadata:
  name: llm-stable
spec:
  selector:
    app: llm
    version: stable

---
apiVersion: v1
kind: Service
metadata:
  name: llm-canary
spec:
  selector:
    app: llm
    version: canary

---
# NGINX weighted routing
upstream llm {
    server llm-stable:8000 weight=9;
    server llm-canary:8000 weight=1;
}
```

## Case Study: Production Deployment

### Requirements
- 10,000 requests/day
- P95 latency < 2s
- 99.9% uptime
- Cost < $1,000/month

### Solution Architecture

```
Internet
    ↓
[Load Balancer - NGINX]
    ↓
[LLM Service Pods (3 replicas)]
    ↓
[vLLM + Llama-2 13B INT8]
    ↓
[GPU: 3× T4]
```

**Configuration:**
```python
# vLLM with optimal settings
llm = LLM(
    model="meta-llama/Llama-2-13b-hf",
    quantization="awq",  # INT4
    max_model_len=2048,
    gpu_memory_utilization=0.95
)

# Runs on T4 16GB
# Cost: 3 × $0.35/hour × 24 × 30 = $756/month
# Headroom for traffic spikes
```

**Monitoring:**
- Prometheus + Grafana
- Alerting on P95 > 2s or error rate > 0.1%
- Daily cost tracking

**Results:**
- P95 latency: 1.2s
- Uptime: 99.95%
- Cost: $756/month
- Headroom: Can scale to 20K requests/day

## Frequently Asked Questions

**Q: How many replicas should I start with?**
A: Start with 2-3 for redundancy, then scale based on traffic patterns.

**Q: Should I cache responses?**
A: If you see repeated prompts (>10%), yes. Otherwise, caching overhead may not be worth it.

**Q: What's the best deployment platform?**
A: Kubernetes for flexibility and scale. For simpler use cases, managed services like AWS ECS or Google Cloud Run work well.

**Q: How do I handle model updates?**
A: Use blue-green or canary deployments. Always test new models thoroughly before switching production traffic.

## Action Items

- [ ] Set up production serving framework (vLLM or TensorRT-LLM)
- [ ] Implement health checks and graceful error handling
- [ ] Configure monitoring with Prometheus/Grafana
- [ ] Set up auto-scaling based on GPU utilization
- [ ] Implement response caching for common queries
- [ ] Create deployment pipeline (blue-green or canary)

## What's Next?

Chapter 8 covers cost optimization strategies—how to minimize infrastructure costs while maintaining quality and performance, including spot instances, model selection, and cost analysis.

---

**Key Takeaway**: Production deployment requires robust serving frameworks, monitoring, error handling, and scaling strategies. Start with a solid foundation (vLLM + FastAPI), add monitoring early, and scale gradually based on actual traffic patterns.
