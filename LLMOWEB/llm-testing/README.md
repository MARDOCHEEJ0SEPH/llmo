# LLM Comprehension Testing

Automated tools to test whether LLMs can actually comprehend your LLMO-optimized content.

## 🎯 Purpose

These tools validate that your content optimization efforts result in **measurable improvements** in LLM comprehension. They test:

1. **Entity Extraction** - Can LLMs identify all entities?
2. **Relationship Understanding** - Can LLMs understand connections between entities?
3. **General Comprehension** - Can LLMs answer questions about the content?

## 📦 Installation

```bash
cd LLMOWEB/llm-testing
npm install
```

### Required Dependencies

- `cheerio` - HTML parsing
- `chalk` - Colored terminal output

### Optional (for AI testing)

- `openai` - OpenAI GPT-4 API
- `@anthropic-ai/sdk` - Anthropic Claude API

Install AI SDKs if you want to run live LLM tests:

```bash
npm install openai @anthropic-ai/sdk
```

### API Keys

Set environment variables for the LLM providers you want to test:

```bash
export OPENAI_API_KEY="sk-..."
export ANTHROPIC_API_KEY="sk-ant-..."
```

## 🚀 Quick Start

### Test 1: Entity Extraction

Tests whether LLMs can extract all entities from your content.

```bash
node entity-extraction-test.js ../complete-examples/saas-product-page.html --provider both
```

**Output:**
```
✓ Found 3 schema(s) in HTML
✓ Expected entities:
  Organizations: 1
  Products: 1
  People: 0
  Locations: 0

🤖 Testing with GPT-4...
✓ GPT-4 extracted entities:
  Organizations: 1
  Products: 1
  People: 2
  Locations: 0

OpenAI GPT-4:
  Precision: 75.0%
  Recall: 100.0%
  F1 Score: 85.7%
  ✓ Excellent entity extraction

✅ CONTENT IS WELL-OPTIMIZED FOR LLM COMPREHENSION
Average F1 Score: 85.7%
```

### Test 2: Relationship Understanding

Tests whether LLMs understand relationships between entities.

```bash
node relationship-test.js ../complete-examples/saas-product-page.html --provider both
```

**Output:**
```
✓ Found 8 relationships in schema
✓ Generated 5 relationship questions

🤖 Testing with GPT-4...
  ✓ Who provides CloudSync CRM?
    Expected: AcmeTech Inc.
    Got: AcmeTech Inc. provides CloudSync CRM.

OpenAI GPT-4:
  Correct: 5/5
  Accuracy: 100.0%
  ✓ Excellent relationship understanding

✅ RELATIONSHIPS ARE CLEARLY EXPRESSED
Average Accuracy: 100.0%
```

### Test 3: General Comprehension

Tests general understanding through Q&A.

```bash
node comprehension-test.js ../complete-examples/saas-product-page.html --provider both
```

**Output:**
```
✓ Generated 12 comprehension questions

🤖 Testing with GPT-4...
✓ What is CloudSync CRM?
    CloudSync CRM is a customer relationship management platform that helps...
    Score: 95%

OpenAI GPT-4:
  Overall Score: 87.5%
  Category Breakdown:
    entity_definition: 92.0%
    factual: 88.0%
    features: 85.0%
    main_topic: 90.0%
  ✓ Excellent comprehension

✅ CONTENT IS HIGHLY COMPREHENSIBLE
Average Score: 87.5%
```

## 📖 Tool Documentation

### entity-extraction-test.js

Tests entity extraction accuracy.

**Usage:**
```bash
node entity-extraction-test.js <html-file> [--provider openai|anthropic|both]
```

**How It Works:**
1. Extracts JSON-LD schema from HTML (ground truth)
2. Extracts text content
3. Asks LLM to extract entities from text
4. Compares extracted entities with schema
5. Calculates precision, recall, and F1 score

**Metrics:**
- **Precision**: % of extracted entities that are correct
- **Recall**: % of actual entities that were extracted
- **F1 Score**: Harmonic mean of precision and recall

**Scoring:**
- 80%+ F1: Excellent - content is well-optimized
- 60-80% F1: Good - room for improvement
- <60% F1: Poor - content needs optimization

### relationship-test.js

Tests relationship understanding accuracy.

**Usage:**
```bash
node relationship-test.js <html-file> [--provider openai|anthropic|both]
```

**How It Works:**
1. Extracts relationships from JSON-LD schema
2. Generates natural language questions about relationships
3. Asks LLM to answer questions based on content
4. Checks if answers contain expected information
5. Calculates accuracy percentage

**Example Questions:**
- "Who is the author of [Article]?"
- "Who provides [Service]?"
- "Which organization does [Person] work for?"

**Scoring:**
- 80%+ accuracy: Excellent - relationships clearly expressed
- 60-80% accuracy: Good - some improvements needed
- <60% accuracy: Poor - relationships need clarification

### comprehension-test.js

Tests general comprehension through Q&A.

**Usage:**
```bash
node comprehension-test.js <html-file> [--provider openai|anthropic|both]
```

**How It Works:**
1. Analyzes schema to understand content type
2. Generates category-specific questions:
   - Entity definition questions
   - Factual questions (prices, dates, etc.)
   - Feature questions
   - Summary questions
3. Asks LLM to answer based on content
4. Evaluates answer quality and keyword matching
5. Calculates overall comprehension score

**Question Categories:**
- `entity_definition`: "What is [Product]?"
- `factual`: "What is the price of [Product]?"
- `features`: "What are key features of [Product]?"
- `main_topic`: "What is the main topic?"
- `problem_solving`: "What problem does this solve?"
- `audience`: "Who is the target audience?"

**Scoring:**
- 80%+ score: Highly comprehensible
- 60-80% score: Moderately comprehensible
- <60% score: Needs improvement

## 🔄 Testing Workflow

### Before and After Comparison

Test your content **before** and **after** LLMO optimization:

```bash
# Test original content
node entity-extraction-test.js original-page.html --provider both > before.txt

# Apply LLMO optimizations
# - Add schema markup
# - Improve semantic structure
# - Increase information density

# Test optimized content
node entity-extraction-test.js optimized-page.html --provider both > after.txt

# Compare results
diff before.txt after.txt
```

### Continuous Monitoring

Add to CI/CD pipeline:

```bash
#!/bin/bash
# test-comprehension.sh

THRESHOLD=80

# Run all tests
node entity-extraction-test.js $1 --provider openai | grep "Average F1 Score"
node relationship-test.js $1 --provider openai | grep "Average Accuracy"
node comprehension-test.js $1 --provider openai | grep "Average Score"

# Fail if below threshold
# (Add parsing logic to extract scores and compare)
```

### A/B Testing Different Approaches

Test multiple optimization strategies:

```bash
# Test schema-first approach
node comprehension-test.js schema-first.html --provider both > schema-first.txt

# Test content-first approach
node comprehension-test.js content-first.html --provider both > content-first.txt

# Test combined approach
node comprehension-test.js combined.html --provider both > combined.txt

# Compare results to find best approach
```

## 📊 Interpreting Results

### Good Results (80%+ scores)

Your content is well-optimized! LLMs can:
- Extract entities accurately
- Understand relationships clearly
- Answer questions correctly
- Comprehend main topics and details

**Next Steps:**
- Maintain quality as content evolves
- Monitor for regression
- Apply same patterns to other pages

### Medium Results (60-80% scores)

Your content is moderately optimized. Areas for improvement:

**If entity extraction is low:**
- Add more comprehensive schema markup
- Define entities clearly in text (first mention)
- Use consistent entity names throughout

**If relationship understanding is low:**
- Make connections explicit in text
- Add schema markup for relationships
- Use linking phrases (e.g., "provided by", "created by")

**If comprehension is low:**
- Increase information density (1-2 facts/sentence)
- Improve heading hierarchy
- Add more schema properties

### Poor Results (<60% scores)

Your content needs significant optimization:

**Action Plan:**
1. **Add Schema Markup**: Start with essential entities (Organization, Product, etc.)
2. **Improve Structure**: Use semantic HTML5 (header, main, article, etc.)
3. **Clarify Entities**: Define what things are on first mention
4. **Increase Density**: Pack more factual information per sentence
5. **Test Again**: Re-run tests to measure improvement

## 🧪 Example Test Scenarios

### Scenario 1: E-commerce Product Page

```bash
# Test product comprehension
node entity-extraction-test.js product-page.html

# Expected results:
# - Product entity extracted (name, price, features)
# - Brand/manufacturer extracted
# - Reviews and ratings extracted
# - Shipping/return policy understood
```

### Scenario 2: SaaS Product Page

```bash
# Test software comprehension
node comprehension-test.js saas-page.html

# Expected results:
# - SoftwareApplication entity extracted
# - Pricing tiers understood
# - Features clearly identified
# - Target audience comprehended
```

### Scenario 3: Company About Page

```bash
# Test organization comprehension
node relationship-test.js about-page.html

# Expected results:
# - Organization entity extracted
# - Team members and roles understood
# - Relationships between people and org clear
# - Company mission/values comprehended
```

## 🔧 Customization

### Adding Custom Questions

Edit `comprehension-test.js` to add domain-specific questions:

```javascript
// In generateComprehensionQuestions()
questions.push({
  question: 'What industries does this product serve?',
  category: 'industry_specific',
  expectedKeywords: ['healthcare', 'finance', 'retail']
});
```

### Testing With Custom LLM Providers

Add new providers by creating test functions:

```javascript
async function testWithCustomLLM(textContent, questions) {
  // Your LLM API integration here
  const response = await customLLM.complete(prompt);
  return processResults(response);
}
```

### Adjusting Scoring Thresholds

Modify thresholds based on your requirements:

```javascript
// In entity-extraction-test.js
if (avgF1 >= 0.90) {  // Stricter threshold
  console.log('Excellent optimization');
}
```

## 💡 Best Practices

### 1. Test Multiple LLM Providers

Different LLMs have different strengths:
- GPT-4: Strong at factual extraction
- Claude: Excellent at nuanced understanding
- Test with both to ensure broad compatibility

### 2. Test Regularly

Run tests:
- Before deploying content changes
- Weekly on production content
- After major site updates

### 3. Track Trends Over Time

```bash
# Log results with timestamps
echo "$(date): $(node entity-extraction-test.js page.html)" >> test-history.log
```

### 4. Set Quality Gates

```yaml
# In CI/CD pipeline
quality_gates:
  entity_extraction_f1: 0.80
  relationship_accuracy: 0.80
  comprehension_score: 0.75
```

### 5. Test Representative Pages

Don't just test one page - test:
- Homepage
- Product/service pages
- About page
- Blog articles
- Category/listing pages

## 🆘 Troubleshooting

### "SDK not available"

Install the required SDK:
```bash
npm install openai @anthropic-ai/sdk
```

### "API key not found"

Set environment variables:
```bash
export OPENAI_API_KEY="your-key-here"
export ANTHROPIC_API_KEY="your-key-here"
```

### Low scores on optimized content

Common issues:
- Schema doesn't match visible content
- Text is too sparse (low information density)
- Entities not clearly defined
- Missing semantic structure

### Rate limit errors

Add delays between requests or use lower-rate testing:
```bash
# Test with one provider at a time
node entity-extraction-test.js page.html --provider openai
sleep 5
node entity-extraction-test.js page.html --provider anthropic
```

## 📚 Related Documentation

- **LLMO Book Chapter 17**: Technical Optimization
- **LLMO Book Chapter 11**: Schema Markup Mastery
- **LLMOWEB/validation**: Schema and HTML validation tools
- **Schema.org**: https://schema.org

---

**Next Steps**: Run these tests on your content before and after LLMO optimization to measure improvement. Aim for 80%+ scores across all three test types.
