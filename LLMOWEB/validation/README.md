# Validation Tools

Automated validation scripts for schema, HTML, and content quality.

## 🛠️ Available Tools

### Schema Validation
- **validate-schema.js** - Validate JSON-LD schema against Schema.org
- **completeness-checker.js** - Calculate schema completeness scores
- **relationship-validator.js** - Verify @id references resolve correctly

### HTML Validation
- **validate-html.js** - Check HTML structure and semantics
- **heading-hierarchy.js** - Verify proper H1-H6 hierarchy
- **link-checker.js** - Find broken internal/external links

### Content Quality
- **content-quality.js** - Analyze readability and information density
- **sentence-length.js** - Measure average sentence length
- **passive-voice-detector.js** - Identify passive voice usage
- **entity-consistency.js** - Check naming consistency

## 📦 Installation

```bash
cd LLMOWEB/validation
npm install
```

This installs:
- `ajv` - JSON Schema validator
- `cheerio` - HTML parsing
- `schema-dts` - TypeScript Schema.org definitions
- `axios` - HTTP requests
- `natural` - NLP analysis

## 🚀 Quick Start

### Validate a Schema Template

```bash
# Validate organization schema
node validate-schema.js ../schema-templates/organization.json

# Output:
✓ Valid JSON syntax
✓ Valid Schema.org type: Organization
✓ All required properties present
✓ 28/32 recommended properties (87.5% complete)
⚠ Missing optional properties: award, knowsAbout
```

### Check Schema Completeness

```bash
# Check completeness score
node completeness-checker.js ../schema-templates/product.json

# Output:
Product Schema Completeness Report
==================================
Tier 1 (Essential): 8/8 properties (100%)
Tier 2 (Important): 12/15 properties (80%)
Tier 3 (Nice-to-have): 3/10 properties (30%)

Overall Score: 72.5%
Recommendation: Add more Tier 2 properties to reach 80%+
```

### Validate HTML Page

```bash
# Validate complete page
node validate-html.js ../complete-examples/saas-product-page.html

# Output:
✓ Valid HTML5
✓ Proper heading hierarchy (H1→H2→H3, no skipped levels)
✓ Semantic elements used: <header>, <main>, <article>, <aside>, <footer>
✓ All images have alt text
✓ 12 internal links found (recommended: 5-15)
⚠ Consider adding more breadcrumb navigation
```

### Check Content Quality

```bash
# Analyze content quality
node content-quality.js ../complete-examples/saas-product-page.html

# Output:
Content Quality Analysis
=======================
Average sentence length: 18.3 words (target: 15-25) ✓
Passive voice: 12% (target: <20%) ✓
Information density: 1.6 facts/sentence (target: 1-2) ✓
Undefined acronyms: 2 found
  - CRM (first use at line 45) - Define on first mention
  - API (first use at line 210) - Define on first mention

Overall Quality Score: 88/100
```

## 📖 Tool Documentation

### validate-schema.js

Validates JSON-LD schema files.

**Usage**:
```bash
node validate-schema.js <file-path>
node validate-schema.js ../schema-templates/organization.json
```

**Checks**:
- ✅ Valid JSON syntax
- ✅ @context is "https://schema.org"
- ✅ @type is valid Schema.org type
- ✅ Required properties present
- ✅ Property values match expected types
- ✅ @id follows URL pattern
- ✅ Date properties use ISO 8601 format
- ✅ URLs are absolute (start with https://)

**Output**:
- List of validation errors (if any)
- List of warnings for missing recommended properties
- Completeness score

**Exit Codes**:
- 0: Valid schema
- 1: Invalid schema (errors found)
- 2: File not found

### completeness-checker.js

Calculates schema completeness scores.

**Usage**:
```bash
node completeness-checker.js <file-path>
node completeness-checker.js ../schema-templates/product.json
```

**Scoring**:
- Tier 1 properties: Essential (must have 100%)
- Tier 2 properties: Important (aim for 80%+)
- Tier 3 properties: Nice-to-have (30%+ is good)

**Formula**:
Overall Score = (Tier1 × 50%) + (Tier2 × 35%) + (Tier3 × 15%)

**Recommendations**:
- <60%: Critical gaps, add Tier 1 properties
- 60-75%: Good foundation, add Tier 2 properties
- 75-85%: Very good, consider Tier 3 enhancements
- 85%+: Excellent, maintain and update

### heading-hierarchy.js

Validates heading structure.

**Usage**:
```bash
node heading-hierarchy.js <file-path>
node heading-hierarchy.js ../complete-examples/saas-product-page.html
```

**Checks**:
- ✅ One H1 per page
- ✅ No skipped levels (H1→H3 without H2)
- ✅ Logical hierarchy
- ✅ Headings are descriptive (not generic "Introduction")
- ⚠ Nested sections match heading levels

**Output**:
- Heading tree visualization
- Errors for skipped levels
- Warnings for generic headings

### content-quality.js

Analyzes content quality for LLM comprehension.

**Usage**:
```bash
node content-quality.js <file-path>
node content-quality.js ../complete-examples/saas-product-page.html
```

**Metrics**:
- **Sentence Length**: 15-25 words optimal
- **Passive Voice**: <20% recommended
- **Information Density**: 1-2 facts per sentence
- **Acronym Definition**: All acronyms defined on first use
- **Entity Clarity**: Clear, canonical names
- **Self-Contained Paragraphs**: Standalone comprehension

**Scoring**:
- 90-100: Excellent content quality
- 80-89: Good, minor improvements possible
- 70-79: Fair, several areas need work
- <70: Poor, significant rewriting needed

## 🔄 Automated Workflows

### Pre-Commit Validation

Add to your git pre-commit hook:

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Validate all schema templates
for file in LLMOWEB/schema-templates/*.json; do
  node LLMOWEB/validation/validate-schema.js "$file" || exit 1
done

# Validate HTML pages
for file in LLMOWEB/complete-examples/*.html; do
  node LLMOWEB/validation/validate-html.js "$file" || exit 1
done

echo "✓ All validation checks passed"
```

### Continuous Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/validate.yml
name: Validate LLMO Content

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd LLMOWEB/validation && npm install
      - run: |
          for file in LLMOWEB/schema-templates/*.json; do
            node LLMOWEB/validation/validate-schema.js "$file"
          done
      - run: |
          for file in LLMOWEB/complete-examples/*.html; do
            node LLMOWEB/validation/validate-html.js "$file"
          done
```

### Weekly Monitoring

Cron job to validate live content:

```bash
#!/bin/bash
# weekly-validation.sh

# Fetch live pages
curl https://yoursite.com/products/product1 > /tmp/product1.html

# Validate
node validate-html.js /tmp/product1.html > /tmp/validation-report.txt
node content-quality.js /tmp/product1.html >> /tmp/validation-report.txt

# Email report if issues found
if grep -q "✗" /tmp/validation-report.txt; then
  mail -s "LLMO Validation Issues Found" team@yoursite.com < /tmp/validation-report.txt
fi
```

## 🧪 Example Validation Reports

### Good Schema Example

```
✓ organization.json is valid

Schema Quality Report:
====================
Type: Organization
Tier 1 Properties: 8/8 (100%) ✓
Tier 2 Properties: 14/15 (93%) ✓
Tier 3 Properties: 6/12 (50%)

Overall Completeness: 84.5%

Missing Properties:
  Tier 3:
    - knowsAbout (optional, improves topic matching)
    - award (optional, adds credibility)
    - member (optional, shows affiliations)

Recommendations:
  ✓ Excellent completeness
  Consider adding knowsAbout for expertise signals
```

### Schema with Issues

```
✗ product.json has validation errors

Errors:
  Line 12: Missing required property "name"
  Line 24: Invalid date format "March 15 2024" (use "2024-03-15")
  Line 35: Relative URL "/image.jpg" (use absolute: "https://...")
  Line 42: Invalid @type "Products" (did you mean "Product"?)

Warnings:
  Missing recommended Tier 2 properties:
    - aggregateRating (improves credibility)
    - review (provides social proof)
    - manufacturer (establishes provenance)

Completeness: 52% (Below recommended 70%)

Fix these errors before deployment.
```

### HTML Quality Report

```
Content Quality Analysis: saas-product-page.html
===============================================

Overall Score: 88/100

Strengths:
  ✓ Sentence length: 18.3 words avg (target: 15-25)
  ✓ Passive voice: 12% (target: <20%)
  ✓ Information density: 1.6 facts/sentence (target: 1-2)
  ✓ Heading hierarchy: Proper H1→H2→H3
  ✓ Internal links: 12 (recommended: 5-15)

Improvements:
  ⚠ Acronyms: Define CRM, API, ROI on first use
  ⚠ Generic headings: "Features" (be more specific: "Key CRM Features")
  ⚠ Long paragraph on line 156: 8 sentences (split to 4-6)

Suggestions:
  - Add breadcrumb schema (BreadcrumbList)
  - Include author Person schema for thought leadership
  - Add FAQ schema for common questions
```

## 🆘 Troubleshooting

### "Module not found"

```bash
# Install dependencies
cd LLMOWEB/validation
npm install
```

### "Cannot read file"

```bash
# Use absolute or relative path
node validate-schema.js ../schema-templates/organization.json
# Not: node validate-schema.js organization.json
```

### "Invalid JSON"

Check for:
- Trailing commas: `"value",` ← remove comma before `}`
- Missing quotes: `name: "value"` should be `"name": "value"`
- Comments: Remove `//` or `/* */` comments (not valid in JSON)

### "Schema type not recognized"

Check:
- Capitalization: `Organization` not `organization`
- Spelling: `SoftwareApplication` not `SoftwareApp`
- Valid type: See https://schema.org for valid types

## 📚 Further Reading

- **LLMO Book Chapter 10**: Schema Markup Mastery
- **LLMO Book Chapter 16**: Content Optimization Strategy
- **Schema.org Validator**: https://validator.schema.org
- **Google Rich Results Test**: https://search.google.com/test/rich-results

---

**Next Steps**: Run validation on your schema templates and HTML pages. Fix any errors. Aim for 75%+ completeness scores. Integrate validation into your deployment workflow.
