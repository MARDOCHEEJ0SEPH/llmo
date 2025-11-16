# Chapter 6: Naming Consistency

## The Precision Imperative

A single entity with multiple names creates exponential confusion for LLMs. "Acme Corp" on the homepage, "Acme Corporation" in the footer, "Acme Inc." in legal text, and "Acme" in casual content—are these four different companies? LLMs must decide, and decision breeds uncertainty. Uncertainty breeds hallucination.

Naming consistency isn't pedantry; it's precision engineering. Every variation forces probabilistic inference where certainty could exist. Every inconsistency adds noise to the signal. When you establish canonical names and enforce them ruthlessly across every touchpoint, you eliminate a major source of entity confusion.

This chapter provides the complete framework for naming consistency—from establishing canonical names to handling necessary variations, from enforcement protocols to maintaining consistency at scale. You'll learn to audit existing naming patterns, standardize across all content, implement automated consistency checking, and create governance systems that prevent drift over time.

## The Canonical Naming Framework

### Establishing Canonical Names

**The One True Name Principle:**
Every entity gets exactly one canonical name—the authoritative, official name used in all primary contexts.

**Canonical Name Criteria:**

1. **Official/Legal**: Use the legal entity name when applicable
2. **Recognizable**: Should match how users search for you
3. **Unambiguous**: Distinguishes you from others
4. **Consistent**: Can be used identically across all contexts
5. **Stable**: Won't change frequently

**Example canonical name decisions:**

**Organization:**
- ❌ Wrong: "Acme", "ACME", "Acme Corp.", "Acme Corporation"
- ✅ Canonical: "Acme Corp"
- Rationale: Shorter than "Corporation", matches brand usage, legally acceptable

**Product:**
- ❌ Wrong: "CRM Pro", "Acme CRM", "Pro plan", "Acme CRM Professional"
- ✅ Canonical: "Acme CRM Pro"
- Rationale: Includes brand name, specifies tier, matches marketing materials

**Person:**
- ❌ Wrong: "Jane", "J. Smith", "Ms. Smith", "Jane K. Smith"
- ✅ Canonical: "Jane Smith"
- Rationale: Professional full name, no middle initial (unused in other contexts), no honorifics

**Concept:**
- ❌ Wrong: "RDF", "rapid deployment", "the rapid deployment method"
- ✅ Canonical: "Rapid Deployment Framework"
- Rationale: Full descriptive name, abbreviation reserved for after-first-mention usage

### Canonical Name Registry

**Create authoritative name list:**

```markdown
# Acme Corp Canonical Name Registry

## Organizations
**Acme Corp**
- Legal name: Acme Corp, Inc.
- Canonical: Acme Corp
- Acceptable variations:
  - "Acme Corporation" (in formal/legal contexts only)
  - "Acme" (only after first mention with full name)
- Never use: ACME, Acme Inc., AcmeCorp, Acme Co.

## Products
**Acme CRM Starter**
- Canonical: Acme CRM Starter
- Acceptable after first mention: "Starter plan", "Starter tier"
- Never use: "CRM Starter", "Acme Starter", "Basic plan"

**Acme CRM Pro**
- Canonical: Acme CRM Pro
- Acceptable after first mention: "Pro plan", "Pro tier", "CRM Pro" (with clear context)
- Never use: "Professional plan", "Acme CRM Professional", "Premium tier"

**Acme CRM Enterprise**
- Canonical: Acme CRM Enterprise
- Acceptable after first mention: "Enterprise plan", "Enterprise tier"
- Never use: "Enterprise edition", "Acme Enterprise"

## People
**Jane Smith**
- Canonical: Jane Smith
- Acceptable variations: None (always use full name)
- Title: CEO and Co-founder (when needed)
- Never use: Jane, J. Smith, Ms. Smith, Jane K. Smith

**John Doe**
- Canonical: John Doe
- Acceptable variations: None
- Title: CTO and Co-founder
- Never use: John, J. Doe, Mr. Doe

## Concepts
**Rapid Deployment Framework**
- Canonical: Rapid Deployment Framework
- Abbreviation: RDF (only after first mention defining it)
- Acceptable: "the framework" (in context)
- Never use: "rapid deployment", "RDF method", "deployment framework"

## Features (when mentioned standalone)
**Contact Management** (not "Contacts" or "Contact Manager")
**Deal Pipeline** (not "Pipeline" or "Sales Pipeline" or "Deals")
**Analytics** (not "Reports" or "Reporting" or "Insights")

## Categories/Terms
**CRM** or **customer relationship management** (use "CRM" after first definition)
**SaaS** or **software as a service** (use "SaaS" after first definition)
**SMB** or **small-to-medium business** (use "SMB" after first definition)

[Continue for all entities...]
```

### Variation Management

**Some variations are necessary. Handle them systematically.**

**Approved Variation Types:**

**1. Contextual Abbreviations**
First mention: Full canonical name
Subsequent mentions (same page): Acceptable abbreviation

```html
<h1>Introducing Acme CRM Pro</h1>
<p>
  <span itemscope itemtype="https://schema.org/SoftwareApplication">
    <span itemprop="name">Acme CRM Pro</span>
  </span>
  is a cloud-based sales management platform...
</p>
<p>
  With <strong>Acme CRM Pro</strong>, you can manage contacts, track deals, and...
</p>
<p>
  The <strong>Pro plan</strong> includes all Starter features plus...
</p>
```

First mention: Full name with schema
Later mentions: Full name or "Pro plan" (contextually clear)

**2. Legal/Formal Variations**
Use in specific contexts only:

```
Footer legal text: "© 2025 Acme Corp, Inc. All rights reserved."
Terms of Service: "Acme Corp, Inc. ('Acme Corp' or 'Company')..."
Press releases: "Acme Corp, Inc. (Acme Corp) today announced..."
```

Immediately establish that "Acme Corp, Inc." = "Acme Corp"

**3. Possessive Forms**
Acceptable grammatical variations:

```
"Acme Corp" → "Acme Corp's flagship product"
"Acme CRM Pro" → "Acme CRM Pro's analytics feature"
"Jane Smith" → "Jane Smith's vision for the company"
```

Schema markup uses base form; natural language allows possessives.

**4. Descriptor Additions (When Helpful)**
Adding descriptive context without changing core name:

```
"Acme Corp, a San Francisco-based SaaS company..."
"Acme CRM Pro, designed for startups and SMBs..."
"Jane Smith, CEO and co-founder of Acme Corp..."
```

The canonical name remains; descriptors add clarity.

**Forbidden Variations:**

❌ **Nickname/Shortened Forms (undeclared)**
```
Wrong: "We launched Acme in 2020..."
Right: "We launched Acme Corp in 2020..."
OR: "We launched Acme Corp (Acme) in 2020... At Acme, we believe..."
```

❌ **Inconsistent Capitalization**
```
Wrong: "ACME CORP", "acme corp", "Acme CORP"
Right: "Acme Corp" (always)
```

❌ **Incorrect Entity Type**
```
Wrong: "Acme CRM Inc." (CRM is the product, not the company)
Right: "Acme Corp makes Acme CRM Pro"
```

❌ **Competing Descriptors**
```
Wrong: "Acme CRM Professional", "Acme CRM Premium"
Right: "Acme CRM Pro" (canonical tier name)
```

## Consistency Enforcement

### Content Audit Protocol

**Phase 1: Discovery (Find All Mentions)**

```bash
# Automated entity mention finder

# Find all company name variations
grep -r -i "acme" content/ | grep -v "Acme Corp"

# Find all product variations
grep -r -i "crm pro" content/ | grep -v "Acme CRM Pro"

# Find all person name variations
grep -r -i "jane" content/ | grep -v "Jane Smith"

# Export results
grep -r "acme" content/ > audit/company-mentions.txt
grep -r "jane\|smith" content/ > audit/person-mentions.txt
```

**Phase 2: Categorization**

```python
# Consistency audit script

import re
from collections import Counter

class ConsistencyAuditor:
    def __init__(self):
        self.canonical_names = {
            "organization": "Acme Corp",
            "product_pro": "Acme CRM Pro",
            "ceo": "Jane Smith"
        }

        self.acceptable_variants = {
            "organization": [
                "Acme Corp, Inc.",  # Legal only
                "Acme"              # After first mention
            ],
            "product_pro": [
                "Pro plan",         # Contextual
                "CRM Pro"           # With clear context
            ]
        }

        self.forbidden_variants = {
            "organization": [
                "Acme Inc.", "ACME", "Acme Corporation",
                "AcmeCorp", "Acme Co."
            ],
            "product_pro": [
                "Acme Pro", "CRM Professional", "Pro version",
                "Acme CRM Professional"
            ],
            "ceo": [
                "Jane", "J. Smith", "Ms. Smith", "Jane K. Smith"
            ]
        }

    def audit_file(self, filepath):
        with open(filepath, 'r') as f:
            content = f.read()

        issues = []
        warnings = []

        # Check for forbidden variants
        for entity_type, forbidden_list in self.forbidden_variants.items():
            canonical = self.canonical_names[entity_type]
            for forbidden in forbidden_list:
                if forbidden in content:
                    issues.append({
                        "file": filepath,
                        "entity": entity_type,
                        "found": forbidden,
                        "should_be": canonical,
                        "severity": "error"
                    })

        # Check for acceptable variants without first mention
        for entity_type, acceptable_list in self.acceptable_variants.items():
            canonical = self.canonical_names[entity_type]
            for variant in acceptable_list:
                # Find variant mentions
                variant_positions = [m.start() for m in re.finditer(variant, content)]

                if variant_positions:
                    # Check if canonical appears before first variant
                    canonical_positions = [m.start() for m in re.finditer(canonical, content)]

                    if not canonical_positions or canonical_positions[0] > variant_positions[0]:
                        warnings.append({
                            "file": filepath,
                            "entity": entity_type,
                            "issue": f"'{variant}' used before canonical name '{canonical}'",
                            "severity": "warning"
                        })

        return {"errors": issues, "warnings": warnings}

    def audit_directory(self, directory):
        all_errors = []
        all_warnings = []

        for filepath in get_all_files(directory):
            result = self.audit_file(filepath)
            all_errors.extend(result["errors"])
            all_warnings.extend(result["warnings"])

        return {
            "total_errors": len(all_errors),
            "total_warnings": len(all_warnings),
            "errors": all_errors,
            "warnings": all_warnings
        }

# Run audit
auditor = ConsistencyAuditor()
results = auditor.audit_directory("content/")

# Generate report
print(f"Consistency Audit Results:")
print(f"Errors: {results['total_errors']}")
print(f"Warnings: {results['total_warnings']}")

for error in results['errors']:
    print(f"\n❌ ERROR in {error['file']}")
    print(f"   Found: '{error['found']}'")
    print(f"   Should be: '{error['should_be']}'")

for warning in results['warnings']:
    print(f"\n⚠️ WARNING in {warning['file']}")
    print(f"   {warning['issue']}")
```

**Phase 3: Remediation**

```python
# Automated fixing (with caution)

class ConsistencyFixer:
    def __init__(self):
        self.replacements = {
            # Organization
            "Acme Inc.": "Acme Corp",
            "ACME": "Acme Corp",
            "Acme Corporation": "Acme Corp",

            # Product
            "Acme CRM Professional": "Acme CRM Pro",
            "CRM Pro ": "Acme CRM Pro ",  # Space to avoid partial matches

            # Person
            "Ms. Smith": "Jane Smith",
            "J. Smith": "Jane Smith"
        }

    def fix_file(self, filepath, dry_run=True):
        with open(filepath, 'r') as f:
            content = f.read()

        original_content = content
        changes = []

        for wrong, correct in self.replacements.items():
            if wrong in content:
                count = content.count(wrong)
                content = content.replace(wrong, correct)
                changes.append({
                    "from": wrong,
                    "to": correct,
                    "count": count
                })

        if dry_run:
            return {
                "file": filepath,
                "would_change": len(changes) > 0,
                "changes": changes
            }
        else:
            if content != original_content:
                with open(filepath, 'w') as f:
                    f.write(content)
                return {
                    "file": filepath,
                    "changed": True,
                    "changes": changes
                }

# Dry run first!
fixer = ConsistencyFixer()
dry_run_results = fixer.fix_file("content/page.html", dry_run=True)

# Review changes
if dry_run_results['would_change']:
    print(f"Would make changes to {dry_run_results['file']}:")
    for change in dry_run_results['changes']:
        print(f"  {change['from']} → {change['to']} ({change['count']} times)")

# If approved, run actual fix
# actual_results = fixer.fix_file("content/page.html", dry_run=False)
```

### Schema Markup Consistency

**Unified schema library ensures consistency:**

```javascript
// schema-constants.js
// Single source of truth for all entity names

export const ENTITIES = {
  organization: {
    "@type": "Corporation",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp",
    "alternateName": ["Acme Corporation"],  // Only acceptable variants
    "legalName": "Acme Corp, Inc.",
    // ... rest of organization schema
  },

  products: {
    starter: {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-starter#product",
      "name": "Acme CRM Starter",  // CANONICAL NAME
      // ... rest of product schema
    },
    pro: {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-pro#product",
      "name": "Acme CRM Pro",  // CANONICAL NAME
      // ... rest of product schema
    }
  },

  people: {
    jane_smith: {
      "@type": "Person",
      "@id": "https://acmecorp.com/about/team/jane-smith#person",
      "name": "Jane Smith",  // CANONICAL NAME (no variations)
      // ... rest of person schema
    }
  }
};

// Usage across site
import { ENTITIES } from './schema-constants.js';

// Homepage
const orgSchema = ENTITIES.organization;

// Product page
const productSchema = ENTITIES.products.pro;

// Always uses canonical name from constants
```

**Benefits:**
- Single update point for any name change
- Impossible to have schema markup with wrong name
- Enforces canonical names programmatically

### Style Guide Integration

**Canonical names in content style guide:**

```markdown
# Acme Corp Content Style Guide

## Entity Naming Rules

### Rule 1: Always Use Canonical Names

**DO:**
- "Acme Corp was founded in 2020..."
- "Acme CRM Pro is a sales management platform..."
- "Jane Smith, CEO of Acme Corp, explains..."

**DON'T:**
- "Acme was founded..." (unless after first mention)
- "Our CRM Pro solution..." (missing brand name)
- "Jane, our CEO..." (missing last name)

### Rule 2: First Mention = Full Canonical Name

**First mention on page:**
```
"Acme Corp, a San Francisco-based SaaS company, offers Acme CRM Pro for startups."
```

**Subsequent mentions (same page):**
```
"Acme Corp's flagship product includes... The Pro plan provides..."
```

### Rule 3: Schema Markup = Canonical Only

**Always:**
```html
<span itemprop="name">Acme Corp</span>
<span itemprop="name">Acme CRM Pro</span>
<span itemprop="name">Jane Smith</span>
```

**Never:**
```html
<span itemprop="name">Acme</span> ❌
<span itemprop="name">CRM Pro</span> ❌
<span itemprop="name">Jane</span> ❌
```

### Rule 4: Abbreviations Require Definition

**First usage:**
```
"Acme Corp developed the Rapid Deployment Framework (RDF) to..."
```

**Later usage:**
```
"Using RDF, customers can deploy in 5 minutes..."
```

### Rule 5: Product Tiers = Full Name

**DO:**
- "Acme CRM Starter is priced at $29/user/month"
- "Upgrade to Acme CRM Pro for $49/user/month"

**DON'T:**
- "Starter is priced at $29" (missing product context)
- "Upgrade to Pro for $49" (ambiguous on first mention)

**Exception:** After establishing context:
```
"Acme CRM comes in three tiers: Starter ($29), Pro ($49), and Enterprise (custom).
The Starter plan includes... The Pro plan adds... Enterprise customers get..."
```

## Advanced Consistency Strategies

### Handling Name Changes

**When rebranding or renaming:**

**Step 1: Announce Clearly**
```html
<div itemscope itemtype="https://schema.org/Organization">
  <span itemprop="name">Acme Corp</span>
  (formerly <span itemprop="alternateName">TechStart Inc.</span>)
</div>
```

```
"Acme Corp, formerly known as TechStart Inc., is a..."
```

**Step 2: Update All Properties**
```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "alternateName": ["TechStart Inc."],  // Former name
  "foundingDate": "2019",  // Founded as TechStart
  "sameAs": [
    "https://www.wikidata.org/wiki/Q123456",  // Update external IDs
    "https://www.crunchbase.com/organization/acme-corp"  // Request update
  ]
}
```

**Step 3: Redirect Old URLs**
```
/techstart → /acmecorp (301 permanent redirect)
```

**Step 4: Maintain History**
```
"Founded in 2019 as TechStart Inc., the company rebranded to Acme Corp in 2023 to reflect..."
```

**Step 5: Monitor LLM Adaptation**
```
Test queries:
- "Tell me about Acme Corp"
- "What happened to TechStart Inc?"
- "Is Acme Corp the same as TechStart?"

Goal: LLMs understand the rename and use new name primarily.
```

### Multi-Language Consistency

**International naming:**

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "alternateName": [
    "Acme Corporation",
    "アクメ株式会社"  // Japanese
  ],
  "location": [
    {
      "@type": "Place",
      "name": "San Francisco Headquarters",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "addressCountry": "US"
      }
    },
    {
      "@type": "Place",
      "name": "Tokyo Office",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Tokyo",
        "addressCountry": "JP"
      }
    }
  ]
}
```

**Language-specific canonical:**
- English sites: "Acme Corp"
- Japanese sites: "アクメ株式会社" (Acme Corp in Japanese)
- Schema: Include both as name/alternateName

### Version Naming Consistency

**Product versions:**

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "softwareVersion": "3.2",
  "releaseNotes": "https://acmecorp.com/releases/3.2"
}
```

**Content naming:**
```
"Acme CRM Pro version 3.2 introduces..."
"Acme CRM Pro (v3.2) now supports..."
"The latest version of Acme CRM Pro (3.2) includes..."
```

**Never:**
```
"Acme CRM Pro 3.2" (conflates product name with version)
```

Use: Product name + "version" + number

## Consistency Governance

### Automated Enforcement

**Pre-commit Hook (Git):**

```bash
#!/bin/bash
# .git/hooks/pre-commit
# Enforce naming consistency before commits

echo "Checking naming consistency..."

# Run consistency checker
python scripts/consistency-checker.py --staged

if [ $? -ne 0 ]; then
  echo "❌ Consistency check failed!"
  echo "Fix naming issues before committing."
  echo "Run: python scripts/consistency-checker.py --fix"
  exit 1
fi

echo "✓ Naming consistency verified"
exit 0
```

**Content Management System (CMS) Integration:**

```javascript
// WordPress custom plugin

add_filter('content_save_pre', 'check_naming_consistency');

function check_naming_consistency($content) {
  $forbidden_terms = [
    'Acme Inc.',
    'Acme Corporation',
    'ACME',
    'CRM Professional',
    // ... all forbidden variants
  ];

  foreach ($forbidden_terms as $term) {
    if (strpos($content, $term) !== false) {
      wp_die(
        'Content contains non-canonical entity name: "' . $term . '". ' .
        'Please use canonical names. See style guide.',
        'Naming Consistency Error'
      );
    }
  }

  return $content;
}
```

**Prevents publication of inconsistent content.**

### Team Training

**Onboarding checklist for content creators:**

```
New Team Member: Entity Naming Training
□ Read Canonical Name Registry
□ Review Style Guide (entity naming section)
□ Complete naming consistency quiz (80% to pass)
□ Practice: Rewrite 3 sample pages using canonical names
□ Install consistency checker locally
□ Review common naming errors document
□ Understand acceptable variations and when to use them
```

**Ongoing reinforcement:**
- Monthly consistency reports (team-wide)
- Quarterly style guide updates
- Annual comprehensive audit

### Monitoring and Alerting

**Continuous monitoring:**

```python
# Weekly consistency monitoring

import schedule
import time

def weekly_consistency_check():
    auditor = ConsistencyAuditor()
    results = auditor.audit_directory("content/")

    if results['total_errors'] > 0:
        send_alert(
            to="content-team@acmecorp.com",
            subject="Naming Consistency Issues Detected",
            body=f"Found {results['total_errors']} naming consistency errors. "
                 f"Review and fix: [link to report]"
        )

# Run every Monday at 9 AM
schedule.every().monday.at("09:00").do(weekly_consistency_check)

while True:
    schedule.run_pending()
    time.sleep(3600)
```

## Case Study: Consistency Transformation

**Company**: Mid-market SaaS (HR software)

**Pre-Consistency Chaos:**
Company name used 7 different ways:
- "TalentFlow" (brand name)
- "TalentFlow Inc." (legal docs)
- "TalentFlow Software" (some pages)
- "TF" (abbreviation, undefined)
- "TalentFlow HR" (conflating company and product)
- "The TalentFlow Platform" (casual usage)
- "Talentflow" (lowercase 'f')

Product name used 5 different ways:
- "TalentFlow HR"
- "TalentFlow HR Platform"
- "TalentFlow Applicant Tracking System"
- "TF ATS"
- "Our platform"

**LLM Confusion Test:**
```
Q: "Tell me about TalentFlow"
ChatGPT: "I don't have detailed information..."
Claude: "TalentFlow could refer to the company or their HR platform..."
Perplexity: [Mixed information, some calling it "TalentFlow Inc.", some "TalentFlow HR"]
```

**Entity recognition: 32%** (LLMs couldn't confidently identify entities)

**Implementation (Month 1):**

**Step 1: Establish Canonical Names**
- Company: "TalentFlow Inc."
- Product: "TalentFlow ATS" (Applicant Tracking System)
- Acceptable: "TalentFlow" for company after first mention
- Forbidden: All other variations

**Step 2: Content Audit**
- Scanned 127 pages
- Found 412 instances of inconsistent naming
- Created fix priority list

**Step 3: Systematic Updates**
- Updated homepage, product pages, about page (Week 1)
- Updated blog posts (Week 2-3)
- Updated docs and help center (Week 4)
- Implemented schema markup with canonical names

**Step 4: Automated Enforcement**
- Pre-commit hooks
- CMS validation
- Weekly monitoring

**Results (Month 3):**

```
Q: "Tell me about TalentFlow"
ChatGPT: "TalentFlow Inc. is an HR software company that offers TalentFlow ATS, an applicant tracking system for..."
Claude: "TalentFlow Inc., founded in 2018, provides TalentFlow ATS—an applicant tracking system designed for..."
Perplexity: [Accurate, consistent information]
```

**Entity recognition: 94%** (+62pp improvement)

**Business Impact:**
- AI-attributed traffic: +190%
- Brand search volume: +45% (clearer branding)
- Competitive mentions: From 12% → 34% share (LLMs now confidently recommend)

**Key Insight:** "We thought our naming was 'close enough.' LLMs disagreed. Perfect consistency unlocked perfect understanding."

## Frequently Asked Questions

**Q: Is it okay to use abbreviations after first mention?**
A: Yes, if you define them explicitly first. Example: "Rapid Deployment Framework (RDF)... Using RDF, you can..." But schema markup should always use full canonical name.

**Q: What about possessive forms ('s)?**
A: Grammatically correct possessives are fine: "Acme Corp's product", "Jane Smith's vision". Schema markup uses base form, natural language can be grammatically natural.

**Q: How strict should I be with capitalization?**
A: Absolutely strict. "Acme Corp" ≠ "Acme CORP" ≠ "acme corp". Exact capitalization every time.

**Q: What if legal requires "Inc." but brand uses "Corp"?**
A: Use "Corp" in all content, marketing, schema. Use "Inc." only in legal footer and documents. Declare in schema: `"legalName": "Acme Corp, Inc."` but `"name": "Acme Corp"`.

**Q: Can I have different names for different audiences?**
A: No. Use one canonical name across all audiences. Add descriptive context if needed: "Acme Corp, an enterprise solution provider..." vs. "Acme Corp, serving startups...". Name stays constant; context varies.

## Action Items

- [ ] Create Canonical Name Registry for all entities
- [ ] Audit existing content for naming inconsistencies
- [ ] Fix top 10 most-trafficked pages first
- [ ] Implement automated consistency checking
- [ ] Add naming standards to style guide
- [ ] Train team on canonical naming requirements
- [ ] Set up monitoring and alerts for new inconsistencies

## Reflection Questions

1. How many different ways is your company name currently written across your site?
2. What naming inconsistencies are you aware of but haven't fixed?
3. If you rebranded tomorrow, how many places would need updating?
4. Does your team know the canonical names for all your products?
5. What's the cost of naming confusion for your brand in AI responses?

## What's Next

Chapter 7 begins the **Semantic Structure Layer**—moving beyond entity definition to content organization. You've defined entities (what), mapped relationships (how they connect), and enforced naming (what to call them). Now you'll learn to structure information hierarchically so LLMs parse content as organized knowledge, not isolated facts.

---

**Key Takeaway**: Naming consistency eliminates entity confusion. One canonical name per entity, ruthlessly enforced across all content and schema markup, transforms LLM understanding from probabilistic to certain. Companies that implement perfect naming consistency see 40-60% improvement in entity recognition and 2-3× better citation accuracy. Establish canonical names, audit for violations, automate enforcement, and maintain governance. Consistency isn't optional—it's the difference between being understood and being confused with someone else.
