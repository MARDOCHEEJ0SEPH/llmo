# Chapter 8: Cost Optimization

## Learning Objectives

- Analyze and reduce LLM infrastructure costs
- Use spot/preemptible instances effectively
- Optimize model selection for budget constraints
- Implement cost tracking and forecasting
- Balance cost, performance, and quality

## Understanding LLM Costs

### Cost Components

**Infrastructure:**
- GPU compute ($0.35-$8/hour depending on GPU)
- Storage (model weights, caching)
- Network bandwidth (data transfer)
- Load balancers and orchestration

**Operational:**
- Monitoring and logging services
- Development and testing environments
- Staff time and tooling

### Cost Calculation

```python
def calculate_monthly_cost(
    gpu_type="T4",
    num_gpus=2,
    utilization=0.7,  # 70% uptime
    requests_per_day=10000,
    avg_tokens_per_request=300
):
    # GPU costs (example)
    gpu_costs = {
        "T4": 0.35,
        "L4": 0.70,
        "A10G": 1.00,
        "A100": 3.00,
        "H100": 8.00
    }

    hourly_cost = gpu_costs[gpu_type] * num_gpus
    monthly_cost = hourly_cost * 24 * 30 * utilization

    # Additional costs
    storage_cost = 50  # $50/month for model storage
    monitoring_cost = 30  # $30/month for monitoring
    network_cost = (requests_per_day * 30 * avg_tokens_per_request) / 1e9 * 0.12

    total_cost = monthly_cost + storage_cost + monitoring_cost + network_cost

    cost_per_1k_requests = total_cost / (requests_per_day * 30 / 1000)

    return {
        "monthly_total": total_cost,
        "cost_per_1k_requests": cost_per_1k_requests,
        "gpu_hours_per_month": num_gpus * 24 * 30 * utilization
    }

# Example
costs = calculate_monthly_cost(gpu_type="A10G", num_gpus=2)
print(f"Monthly cost: ${costs['monthly_total']:.2f}")
print(f"Cost per 1K requests: ${costs['cost_per_1k_requests']:.2f}")
```

## Model Selection for Cost

### Cost vs Quality Trade-offs

| Model | Size | GPU Required | Cost/Hour | Quality | Best For |
|-------|------|--------------|-----------|---------|----------|
| Llama-2 7B INT4 | 3.5GB | T4 16GB | $0.35 | Good | Budget-conscious |
| Llama-2 13B INT4 | 6.5GB | T4 16GB | $0.35 | Better | Balanced |
| Llama-2 13B INT8 | 13GB | L4 24GB | $0.70 | Better+ | Quality-focused |
| Llama-2 70B INT4 | 35GB | A100 40GB | $3.00 | Best | Premium |
| Mistral 7B INT4 | 3.5GB | T4 16GB | $0.35 | Excellent | Best value |

**Key insight**: Mistral 7B often outperforms Llama-2 13B at half the size!

### Right-Sizing Your Model

```python
def recommend_model(requirements):
    """Recommend most cost-effective model for requirements."""

    if requirements['budget'] < 300:
        # Ultra budget: <$300/month
        return {
            "model": "Mistral 7B INT4",
            "gpu": "T4",
            "estimated_cost": 252  # $0.35 * 24 * 30
        }

    elif requirements['quality'] == 'premium':
        # Quality-first
        return {
            "model": "Llama-2 70B INT4",
            "gpu": "A100 40GB",
            "estimated_cost": 2160  # $3 * 24 * 30
        }

    else:
        # Balanced
        return {
            "model": "Llama-2 13B INT4" or "Mistral 7B INT8",
            "gpu": "T4 or L4",
            "estimated_cost": 252-504
        }

# Usage
recommendation = recommend_model({
    'budget': 500,
    'quality': 'good',
    'latency_requirement': 2.0
})
```

## Spot/Preemptible Instances

### What Are Spot Instances?

**Spot instances** (AWS) / **Preemptible VMs** (GCP):
- Unused cloud capacity sold at discount (60-90% off)
- Can be terminated with short notice (30s-2min)
- Excellent for batch workloads and stateless services

### Spot Instance Strategy

```python
# AWS Spot instance with fallback
import boto3

def request_spot_instance_with_fallback(
    instance_type="g4dn.xlarge",
    max_price=0.30  # 60% of on-demand
):
    ec2 = boto3.client('ec2')

    # Try spot first
    try:
        response = ec2.request_spot_instances(
            InstanceType=instance_type,
            SpotPrice=str(max_price),
            InstanceCount=1
        )
        return response
    except Exception as e:
        # Fall back to on-demand if spot unavailable
        print("Spot unavailable, using on-demand")
        return ec2.run_instances(
            InstanceType=instance_type,
            MinCount=1,
            MaxCount=1
        )
```

### Handling Spot Interruptions

```python
# Monitor for interruption warnings
import requests
import time

def check_spot_interruption():
    """Check AWS spot interruption notice."""
    try:
        r = requests.get(
            "http://169.254.169.254/latest/meta-data/spot/instance-action",
            timeout=1
        )
        if r.status_code == 200:
            return True  # Interruption imminent!
    except:
        pass
    return False

# Graceful shutdown handler
def graceful_shutdown():
    print("Spot interruption detected, graceful shutdown...")

    # 1. Stop accepting new requests
    app.state.accepting_requests = False

    # 2. Complete in-flight requests (30s timeout)
    time.sleep(30)

    # 3. Save state if needed
    save_cache_to_s3()

    # 4. Exit
    sys.exit(0)

# Run in background
while True:
    if check_spot_interruption():
        graceful_shutdown()
    time.sleep(5)
```

### Spot Fleet Configuration

```yaml
# Kubernetes with spot instances
apiVersion: karpenter.sh/v1alpha5
kind: Provisioner
metadata:
  name: llm-spot
spec:
  requirements:
    - key: karpenter.sh/capacity-type
      operator: In
      values: ["spot", "on-demand"]  # Prefer spot, fallback to on-demand
    - key: node.kubernetes.io/instance-type
      operator: In
      values: ["g4dn.xlarge", "g4dn.2xlarge"]  # GPU instances

  # Spot instance strategy
  limits:
    resources:
      cpu: 1000
      nvidia.com/gpu: 10

  # Fallback to on-demand if spot unavailable
  weight: 100  # Prefer spot
```

## Batch Processing for Cost Efficiency

### Batch vs Real-Time Trade-off

**Real-time:**
- Always-on infrastructure
- Instant responses
- Higher cost per request

**Batch:**
- On-demand infrastructure
- Delayed responses (minutes to hours)
- Much lower cost per request

### Implementing Batch Processing

```python
import time
from typing import List

class BatchProcessor:
    def __init__(self, batch_size=100, max_wait_time=300):
        self.batch_size = batch_size
        self.max_wait_time = max_wait_time
        self.queue = []
        self.results = {}

    def submit_job(self, job_id, prompt):
        """Submit job to queue."""
        self.queue.append({"id": job_id, "prompt": prompt})

        # Process if batch full
        if len(self.queue) >= self.batch_size:
            self.process_batch()

        return job_id

    def process_batch(self):
        """Process accumulated jobs."""
        if not self.queue:
            return

        # Start GPU instance (spot)
        instance = start_spot_instance()

        # Process all jobs
        prompts = [job["prompt"] for job in self.queue]
        outputs = model.generate(prompts)  # Large batch

        # Store results
        for job, output in zip(self.queue, outputs):
            self.results[job["id"]] = output

        # Terminate instance (save costs!)
        terminate_instance(instance)

        self.queue = []

    def get_result(self, job_id):
        """Poll for result."""
        return self.results.get(job_id)

# Schedule periodic batch processing
while True:
    time.sleep(max_wait_time)
    if processor.queue:
        processor.process_batch()
```

**Cost savings:** 70-90% vs always-on infrastructure!

## Cost Tracking and Monitoring

### Prometheus Cost Metrics

```python
from prometheus_client import Counter, Gauge

# Track costs in real-time
GPU_COST_PER_HOUR = Gauge(
    'llm_gpu_cost_per_hour',
    'GPU cost per hour',
    ['gpu_type']
)

REQUESTS_TOTAL_COST = Counter(
    'llm_requests_total_cost',
    'Total cost of requests',
    ['model']
)

def track_request_cost(gpu_type, duration_seconds, model):
    """Track cost of individual request."""

    cost_rates = {
        "T4": 0.35,
        "A10G": 1.00,
        "A100": 3.00
    }

    cost_per_second = cost_rates[gpu_type] / 3600
    request_cost = cost_per_second * duration_seconds

    REQUESTS_TOTAL_COST.labels(model=model).inc(request_cost)

    return request_cost

# Usage in endpoint
@app.post("/generate")
async def generate(request):
    start = time.time()

    response = await model.generate(request.prompt)

    duration = time.time() - start
    cost = track_request_cost("T4", duration, "llama-2-13b")

    return {
        "response": response,
        "cost": cost,  # Return cost to user if needed
        "duration": duration
    }
```

### Cost Forecasting

```python
import pandas as pd
from datetime import datetime, timedelta

class CostForecaster:
    def __init__(self):
        self.historical_data = []

    def log_daily_cost(self, date, cost, requests):
        self.historical_data.append({
            "date": date,
            "cost": cost,
            "requests": requests,
            "cost_per_request": cost / requests if requests > 0 else 0
        })

    def forecast_monthly_cost(self, expected_daily_requests):
        """Forecast next month's cost."""

        df = pd.DataFrame(self.historical_data)

        # Calculate average cost per request
        avg_cost_per_request = df['cost_per_request'].mean()

        # Forecast
        daily_cost = expected_daily_requests * avg_cost_per_request
        monthly_cost = daily_cost * 30

        return {
            "forecasted_monthly_cost": monthly_cost,
            "avg_cost_per_request": avg_cost_per_request,
            "assumptions": f"{expected_daily_requests} requests/day"
        }

# Usage
forecaster = CostForecaster()
forecast = forecaster.forecast_monthly_cost(expected_daily_requests=15000)
print(f"Forecasted cost: ${forecast['forecasted_monthly_cost']:.2f}")
```

## Cost Optimization Strategies

### 1. Request Routing

**Route to cheapest model that meets quality:**

```python
class SmartRouter:
    def __init__(self):
        self.models = {
            "small": {"name": "mistral-7b", "cost": 0.001, "quality": 0.8},
            "medium": {"name": "llama-2-13b", "cost": 0.002, "quality": 0.9},
            "large": {"name": "llama-2-70b", "cost": 0.01, "quality": 0.95}
        }

    def route_request(self, prompt, min_quality=0.85):
        """Route to cheapest model meeting quality requirement."""

        # Simple heuristic: use prompt complexity
        complexity = self.estimate_complexity(prompt)

        if complexity < 0.5 and self.models["small"]["quality"] >= min_quality:
            return "small"
        elif complexity < 0.8 and self.models["medium"]["quality"] >= min_quality:
            return "medium"
        else:
            return "large"

    def estimate_complexity(self, prompt):
        """Estimate prompt complexity (0-1)."""
        # Heuristics: length, keywords, etc.
        keywords = ["explain", "analyze", "complex", "detail"]
        complexity = len(prompt) / 1000  # Length factor
        complexity += sum(1 for kw in keywords if kw in prompt.lower()) * 0.2
        return min(complexity, 1.0)
```

### 2. Response Caching

**Reduce duplicate requests:**

```python
# Cache hit rate = cost savings
# If 30% cache hit rate, save 30% of costs!

cache_stats = {
    "hits": 0,
    "misses": 0,
    "saved_cost": 0.0
}

@app.post("/generate")
async def generate_with_cache(request):
    cache_key = hash(request.prompt)

    # Check cache
    if cache_key in cache:
        cache_stats["hits"] += 1
        cache_stats["saved_cost"] += cost_per_request
        return cache[cache_key]

    # Generate
    cache_stats["misses"] += 1
    response = await model.generate(request.prompt)
    cache[cache_key] = response

    return response

# Monitor savings
print(f"Cache hit rate: {cache_stats['hits'] / (cache_stats['hits'] + cache_stats['misses']):.2%}")
print(f"Cost saved: ${cache_stats['saved_cost']:.2f}")
```

### 3. Prompt Optimization

**Shorter prompts = lower costs:**

```python
# Before: 500 tokens
long_prompt = """
You are a helpful assistant. Please provide a detailed and comprehensive
answer to the following question, making sure to cover all aspects...
[400 more tokens]

Question: What is Python?
"""

# After: 50 tokens
short_prompt = "Explain Python programming language concisely."

# Cost savings: 90% on input tokens!
```

### 4. Auto-Scaling Down

**Scale to zero during low traffic:**

```python
# Kubernetes: Scale to 0 replicas during night
apiVersion: autoscaling.k8s.io/v1
kind: ScheduledScaling
spec:
  schedule:
    - start: "22:00"
      end: "06:00"
      minReplicas: 0  # Scale to zero at night

  # Weekends
  - days: ["Saturday", "Sunday"]
    minReplicas: 1  # Reduce on weekends

# Save 8 hours/day × 30 days = 240 hours/month
# At $1/hour = $240 saved!
```

## Case Study: $5,000 → $800/month

### Initial Setup
- Model: Llama-2 70B FP16
- GPU: 2× A100 80GB
- Always-on (24/7)
- Cost: $3/hour × 2 GPUs × 24 × 30 = $4,320/month
- Requests: 8,000/day

### Optimization Journey

**Phase 1: Model Quantization**
```
Llama-2 70B FP16 → Llama-2 70B INT4
2× A100 80GB → 1× A100 40GB
Cost: $3/hour × 24 × 30 = $2,160/month (-50%)
```

**Phase 2: Model Selection**
```
Llama-2 70B INT4 → Llama-2 13B INT4
A100 40GB → T4 16GB
Cost: $0.35/hour × 24 × 30 = $252/month (-88% from phase 1)
Quality: -3% (acceptable for use case)
```

**Phase 3: Spot Instances**
```
On-demand T4 → Spot T4 (70% discount)
Cost: $252 × 0.3 = $76/month (-70%)
```

**Phase 4: Smart Scaling**
```
24/7 → Scale down 8 hours/night + weekends
Effective hours: 24 × 5 × 12 + 16 × 2 × 8 = 1,696 hours/month
Cost: $76 × (1,696/720) = $179/month (adjusted for uptime)
```

**Phase 5: Caching (40% hit rate)**
```
Effective cost: $179 × 0.6 = $107/month
```

**Total savings: $4,320 → $107 (97.5% reduction!)**

## Frequently Asked Questions

**Q: Are spot instances reliable enough for production?**
A: For stateless services with proper interruption handling, yes. Use spot for batch processing and dev/test. Consider on-demand for critical real-time services.

**Q: How do I convince stakeholders to use smaller models?**
A: Run A/B tests showing quality metrics. Often users can't distinguish between 70B and 13B for specific tasks.

**Q: What's the minimum viable infrastructure budget?**
A: ~$250/month for basic production (single T4, modest traffic). Less for batch processing.

**Q: Should I use managed services or self-host?**
A: Managed services (OpenAI, Anthropic) are cost-effective for <1M requests/month. Self-hosting wins at higher volumes.

## Action Items

- [ ] Calculate current monthly infrastructure costs
- [ ] Identify optimization opportunities (smaller model, quantization, spot instances)
- [ ] Set up cost tracking and alerts
- [ ] Implement caching for common queries
- [ ] Test spot instances for non-critical workloads
- [ ] Create cost forecast for next quarter

## What's Next?

Chapter 9 explores edge and mobile deployment—optimizing LLMs for resource-constrained environments, on-device inference, and hybrid architectures.

---

**Key Takeaway**: Cost optimization is about smart choices: right-size your model, use spot instances, implement caching, and scale dynamically. Most workloads can achieve 70-90% cost reduction without sacrificing quality through systematic optimization.
