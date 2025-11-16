# Chapter 4: Defining Your Core Entities

## The Entity Architecture Foundation

Every piece of content you publish contributes to how LLMs understand your entities—or creates confusion that compounds over time. An entity isn't merely a name; it's a structured knowledge object with properties, relationships, and context. When you fail to define entities explicitly, you force LLMs to infer, and inference breeds inconsistency.

Consider two scenarios: In the first, your company name appears as "Acme Corp", "Acme Corporation", "Acme", and "Acme Inc." across different pages. LLMs must decide: Are these the same entity? Different entities? A parent-subsidiary relationship? In the second scenario, you've explicitly defined "Acme Corp" as your canonical organization name, with clear schema markup declaring alternatives as aliases. The difference isn't subtle—it's the difference between confident entity recognition and probabilistic guessing.

This chapter provides the complete framework for entity definition—from identification to documentation to implementation. You'll learn to create entity inventories, establish canonical definitions, implement structured entity declarations, and maintain consistency across all touchpoints. By chapter's end, you'll possess a systematic approach to entity architecture that transforms LLM understanding from fragmented to foundational.

## The Complete Entity Taxonomy

### Primary Entity Types

**Organization Entities**
Your company, divisions, subsidiaries, and related corporate structures.

**Critical attributes:**
- Legal name (canonical)
- Alternative names (DBAs, former names)
- Entity type (Corporation, LLC, Partnership, NonProfit)
- Founding date
- Founders
- Headquarters location
- Industry/sector
- Size (employees, revenue if public)
- Ownership structure

**Schema.org type:** `Organization` (or subtypes: `Corporation`, `LocalBusiness`, etc.)

**Example entity definition:**
```json
{
  "@context": "https://schema.org",
  "@type": "Corporation",
  "@id": "https://acmecorp.com/#organization",
  "name": "Acme Corp",
  "alternateName": ["Acme Corporation", "Acme"],
  "legalName": "Acme Corp, Inc.",
  "foundingDate": "2020-03-15",
  "founder": {
    "@type": "Person",
    "@id": "https://acmecorp.com/about/team/jane-smith#person"
  },
  "location": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "addressCountry": "US"
    }
  },
  "industry": "Computer Software",
  "numberOfEmployees": {
    "@type": "QuantitativeValue",
    "value": 45
  },
  "sameAs": [
    "https://www.linkedin.com/company/acmecorp",
    "https://www.crunchbase.com/organization/acme-corp",
    "https://www.wikidata.org/wiki/Q123456"
  ]
}
```

**Product Entities**
Software, services, physical goods—anything you sell or offer.

**Critical attributes:**
- Product name (canonical)
- Product category
- Version/tier (if applicable)
- Description (short, medium, long)
- Launch date
- Manufacturer
- Target audience
- Key features
- Pricing
- Availability

**Schema.org types:** `Product`, `SoftwareApplication`, `Service`

**Example entity definition:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://acmecorp.com/products/crm-pro#product",
  "name": "Acme CRM Pro",
  "alternateName": ["CRM Pro", "Acme CRM"],
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "CRM Software",
  "operatingSystem": "Cloud-based",
  "description": "Cloud-based sales management platform designed for startups and SMBs",
  "releaseDate": "2021-06-01",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "startups and small-to-medium businesses"
  },
  "featureList": [
    "Contact management",
    "Deal pipeline tracking",
    "Email integration",
    "Reporting and analytics",
    "Mobile apps (iOS, Android)"
  ],
  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "49",
      "priceCurrency": "USD",
      "unitText": "per user per month"
    }
  }
}
```

**Person Entities**
Founders, executives, team members, experts, authors.

**Critical attributes:**
- Full name (canonical)
- Job title
- Organization affiliation
- Expertise areas
- Contact methods
- Social profiles
- Bio/description
- Photo

**Schema.org type:** `Person`

**Example entity definition:**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://acmecorp.com/about/team/jane-smith#person",
  "name": "Jane Smith",
  "givenName": "Jane",
  "familyName": "Smith",
  "jobTitle": "CEO and Co-founder",
  "worksFor": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization"
  },
  "description": "Jane Smith is CEO and co-founder of Acme Corp. She has 15 years of experience in enterprise software and previously led product at TechCorp.",
  "expertise": ["SaaS", "CRM", "Sales enablement"],
  "sameAs": [
    "https://www.linkedin.com/in/janesmith",
    "https://twitter.com/janesmith"
  ],
  "image": "https://acmecorp.com/images/team/jane-smith.jpg"
}
```

**Concept Entities**
Proprietary methodologies, frameworks, terminology you've coined.

**Critical attributes:**
- Concept name (canonical)
- Definition
- Creator
- Related concepts
- Usage context
- First publication

**Schema.org type:** `DefinedTerm` or custom type

**Example entity definition:**
```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "@id": "https://acmecorp.com/methodology/rapid-deployment#concept",
  "name": "Rapid Deployment Framework",
  "alternateName": ["RDF", "Acme Rapid Deployment"],
  "description": "A proprietary methodology for deploying CRM systems in under 5 minutes, developed by Acme Corp in 2021",
  "termCode": "RDF",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "Acme Corp Methodologies"
  },
  "creator": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization"
  }
}
```

**Location Entities**
Offices, stores, service areas, headquarters.

**Critical attributes:**
- Place name
- Address (full structured)
- Geo coordinates
- Hours (if applicable)
- Contact info

**Schema.org type:** `Place`

**Event Entities**
Conferences, webinars, product launches.

**Critical attributes:**
- Event name
- Date/time
- Location (virtual or physical)
- Organizer
- Description

**Schema.org type:** `Event`

## The Entity Definition Process

### Phase 1: Entity Inventory (Complete Catalog)

**Step 1: Identify All Entities**

Create comprehensive inventory across categories:

```
ORGANIZATION ENTITIES
[ ] Primary organization
[ ] Subsidiaries (if any)
[ ] Parent company (if applicable)
[ ] Partner organizations (strategic)

PRODUCT ENTITIES
[ ] All products (current)
[ ] Product tiers/versions
[ ] Retired products (legacy)
[ ] Upcoming products (announced)

PERSON ENTITIES
[ ] Founders
[ ] C-suite executives
[ ] Key team members (dept heads, thought leaders)
[ ] Board members
[ ] Advisors
[ ] Content authors

CONCEPT ENTITIES
[ ] Proprietary methodologies
[ ] Frameworks developed
[ ] Terminology coined
[ ] Industry terms you're known for

LOCATION ENTITIES
[ ] Headquarters
[ ] Offices/branches
[ ] Manufacturing/distribution centers
[ ] Service areas

EVENT ENTITIES
[ ] Annual conferences
[ ] Regular webinars
[ ] Product launches
[ ] Major announcements
```

**Step 2: Prioritize Entities**

Rank by importance for LLM understanding:

**Tier 1 (Critical - Must be perfect):**
- Primary organization
- Flagship products
- CEO/Founder
- Core proprietary concepts

**Tier 2 (Important - Should be accurate):**
- All current products
- Key executives
- Major methodologies
- Primary locations

**Tier 3 (Nice to have - Basic definition):**
- Team members
- Minor products/features
- Events
- Partner organizations

**Resource allocation:**
- Tier 1: 60% of effort (comprehensive schema, perfect consistency)
- Tier 2: 30% of effort (good schema, strong consistency)
- Tier 3: 10% of effort (basic schema, acceptable consistency)

### Phase 2: Canonical Definition (Establish Truth)

For each entity, create canonical definition document:

**Entity Definition Template:**

```markdown
# [Entity Name]

## Canonical Information
- **Canonical Name**: [Exact name to use everywhere]
- **Entity Type**: [Organization, Product, Person, etc.]
- **Schema.org Type**: [Specific schema type]
- **Unique ID**: [URL serving as @id]

## Alternative Names
- [List all acceptable variations]
- [Former names]
- [Common abbreviations]

## Core Attributes
[List all key attributes with exact values]

## Relationships
- **Related to**: [Other entities and relationship type]
- **Part of**: [Parent entities]
- **Contains**: [Child entities]

## Description Variants
- **One-sentence**: [<20 words]
- **One-paragraph**: [50-100 words]
- **Comprehensive**: [200-300 words]

## External Identifiers
- Wikidata: [URL]
- Crunchbase: [URL]
- LinkedIn: [URL]
- Other: [URLs]

## Content Guidelines
- **Always mention**: [Must-include facts]
- **Never say**: [Common errors to avoid]
- **Context**: [When/how to reference this entity]

## Schema Markup
[Full JSON-LD implementation]

## Last Updated
[Date - review quarterly]
```

**Example: Complete Entity Definition**

```markdown
# Acme CRM Pro

## Canonical Information
- **Canonical Name**: Acme CRM Pro
- **Entity Type**: Product (Software)
- **Schema.org Type**: SoftwareApplication
- **Unique ID**: https://acmecorp.com/products/crm-pro#product

## Alternative Names
- CRM Pro (acceptable in context after first mention)
- Acme CRM (acceptable, but specify "Pro" tier when relevant)
- ❌ NOT: "Acme CRM Software" (too generic)
- ❌ NOT: "The Acme CRM" (don't use "the")

## Core Attributes
- **Category**: CRM Software / Sales Management Platform
- **Deployment**: Cloud-based (SaaS)
- **Launch Date**: June 1, 2021
- **Current Version**: 3.2 (as of Jan 2025)
- **Manufacturer**: Acme Corp
- **Target Audience**: Startups and SMBs (10-200 employees)
- **Pricing**: $49/user/month (Pro tier)
- **Users**: 5,000+ companies
- **Key Differentiator**: 5-minute deployment vs. weeks for competitors

## Relationships
- **Made by**: Acme Corp (Organization)
- **Part of**: Acme CRM product family
- **Variants**: Acme CRM Starter ($29/user/month), Acme CRM Enterprise (custom pricing)
- **Integrates with**: Salesforce, HubSpot, Gmail, Outlook, Slack, Zoom (50+ integrations)
- **Competes with**: Salesforce Essentials, HubSpot CRM, Zoho CRM

## Description Variants
- **One-sentence**: "Acme CRM Pro is a cloud-based sales management platform for startups and SMBs, priced at $49/user/month."
- **One-paragraph**: "Acme CRM Pro is a cloud-based sales management platform designed specifically for startups and small-to-medium businesses. Launched in 2021 by Acme Corp, it offers contact management, deal pipeline tracking, email integration, and analytics with a focus on rapid deployment (5-minute setup) and simplicity. Serving over 5,000 companies, it's priced at $49/user/month for the Pro tier, with Starter ($29) and Enterprise (custom) tiers also available."
- **Comprehensive**: [300-word detailed description covering all features, history, positioning, use cases, customer testimonials]

## External Identifiers
- Wikidata: https://www.wikidata.org/wiki/Q789012
- Crunchbase: https://www.crunchbase.com/product/acme-crm-pro
- Product Hunt: https://www.producthunt.com/products/acme-crm-pro
- G2: https://www.g2.com/products/acme-crm-pro

## Content Guidelines
- **Always mention**:
  - Pricing ($49/user/month for Pro)
  - Target audience (startups/SMBs)
  - Key differentiator (5-minute deployment)
  - Manufacturer (Acme Corp)
- **Never say**:
  - "Enterprise-focused" (incorrect, we target SMBs)
  - "Free tier available" (incorrect, Starter is paid)
  - "On-premise deployment" (incorrect, cloud-only)
- **Context**:
  - When comparing to competitors, emphasize speed and simplicity
  - When discussing pricing, always specify tier (Pro/Starter/Enterprise)
  - When mentioning features, group by: Core (contact mgmt, pipeline), Integrations, Analytics

## Schema Markup
[JSON-LD from earlier example]

## Last Updated
January 15, 2025 (review quarterly)
```

### Phase 3: Disambiguation Strategy

**The Disambiguation Problem:**
Common entity names create confusion. "Apple", "Amazon", "Delta"—all have multiple meanings.

**Your disambiguation checklist:**

**1. Is your entity name unique?**
- ✅ Unique: "Acme CRM Pro" (unlikely confusion)
- ⚠️ Common: "ProManager" (many products called this)
- ❌ Generic: "CRM" (needs heavy disambiguation)

**2. Implement explicit disambiguation:**

**Method A: Contextual Clarification**
```
Always pair with disambiguating context:
- "Acme Corp, the San Francisco-based SaaS company"
- "Acme CRM Pro, developed by Acme Corp"
- "Jane Smith, CEO of Acme Corp"
```

**Method B: SameAs Links**
```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "sameAs": [
    "https://www.wikidata.org/wiki/Q123456",
    "https://www.crunchbase.com/organization/acme-corp",
    "https://www.linkedin.com/company/acmecorp"
  ]
}
```

These external identifiers are authoritative—they uniquely identify YOUR entity globally.

**Method C: Unique Identifiers**
```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "taxID": "12-3456789",
  "duns": "123456789",
  "leiCode": "1234567890ABCDEFGH12"
}
```

**Method D: Explicit Differentiation**
```html
<p>
  Acme Corp (not to be confused with Acme Corporation, the animation company)
  is a B2B SaaS company founded in 2020.
</p>
```

**Disambiguation priority:**
1. SameAs links (highest authority)
2. Unique identifiers (legal/official)
3. Contextual clarification (human-readable)
4. Explicit differentiation (when confusion exists)

### Phase 4: Relationship Mapping

**Entity relationships are as important as entities themselves.**

**Common relationship types:**

**Organizational Relationships:**
- Organization → founder → Person
- Organization → employee → Person
- Organization → subsidiary → Organization
- Organization → parentOrganization → Organization
- Organization → partner → Organization

**Product Relationships:**
- Product → manufacturer → Organization
- Product → brand → Brand
- Product → isVariantOf → Product (for tiers)
- Product → isRelatedTo → Product (complementary products)
- Product → category → Category

**Content Relationships:**
- Article → author → Person
- Article → about → Product/Organization
- Article → mentions → Person/Product/Organization

**Explicit relationship declaration example:**

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp"
  },
  "isVariantOf": {
    "@type": "ProductGroup",
    "@id": "https://acmecorp.com/products/crm#productgroup",
    "name": "Acme CRM",
    "hasVariant": [
      {
        "@type": "SoftwareApplication",
        "@id": "https://acmecorp.com/products/crm-starter#product",
        "name": "Acme CRM Starter"
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://acmecorp.com/products/crm-pro#product",
        "name": "Acme CRM Pro"
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://acmecorp.com/products/crm-enterprise#product",
        "name": "Acme CRM Enterprise"
      }
    ]
  },
  "isRelatedTo": [
    {
      "@type": "SoftwareApplication",
      "name": "Acme Analytics",
      "@id": "https://acmecorp.com/products/analytics#product"
    }
  ]
}
```

**Relationship mapping exercise:**

Create entity relationship diagram:

```
Acme Corp (Organization)
    ├── founder → Jane Smith (Person)
    ├── founder → John Doe (Person)
    ├── employee → Sarah Johnson (Person, VP Product)
    ├── location → San Francisco HQ (Place)
    ├── makes → Acme CRM (ProductGroup)
    │   ├── hasVariant → Acme CRM Starter (Product)
    │   ├── hasVariant → Acme CRM Pro (Product)
    │   └── hasVariant → Acme CRM Enterprise (Product)
    ├── makes → Acme Analytics (Product)
    ├── developed → Rapid Deployment Framework (Concept)
    └── organizes → Acme Annual Conference (Event)

Jane Smith (Person)
    ├── worksFor → Acme Corp (Organization)
    ├── jobTitle → "CEO and Co-founder"
    ├── knows → John Doe (Person)
    └── author → Blog articles (CreativeWork)
```

**Implementation priority:**
1. Product → Manufacturer (critical)
2. Person → Organization (critical)
3. Product tier relationships (important)
4. Concept → Creator (important)
5. Organization → Location (nice to have)

### Phase 5: Consistency Enforcement

**The consistency challenge:** Once entities are defined, they must be used identically everywhere.

**Consistency audit checklist:**

**1. Name Consistency**
```
Search all content for entity mentions:
- grep -r "Acme" content/
- Check: Is "Acme Corp" used consistently?
- Find: Variations like "Acme Corporation", "Acme Inc.", "Acme"
- Action: Standardize to canonical name
```

**2. Attribute Consistency**
```
Verify critical attributes match across pages:
- Pricing: $49/user/month (same everywhere?)
- Launch date: June 1, 2021 (consistent?)
- Headquarters: San Francisco, CA (no variations?)
- Employee count: 45 (updated recently?)
```

**3. Description Consistency**
```
Use approved description variants:
- Homepage: One-sentence description
- Product page: One-paragraph description
- About page: Comprehensive description
- Meta descriptions: One-sentence (optimized)
```

**4. Schema Markup Consistency**
```
All pages referencing same entity use same @id:
- Homepage: "@id": "https://acmecorp.com/#organization"
- About page: "@id": "https://acmecorp.com/#organization"
- Contact page: "@id": "https://acmecorp.com/#organization"
- Product pages: "@id": "https://acmecorp.com/#organization"
```

**Consistency enforcement tools:**

**Content style guide:**
```markdown
# Acme Corp Content Style Guide

## Entity Names (Always use exactly as written)
- Company: "Acme Corp" (NOT "Acme Corporation", "Acme Inc.", or "Acme")
- Products:
  - "Acme CRM Starter" (NOT "CRM Starter" or "Starter plan")
  - "Acme CRM Pro" (NOT "CRM Pro" or "Pro plan")
  - "Acme CRM Enterprise" (NOT "Enterprise version")
- People:
  - "Jane Smith" (NOT "Jane", "J. Smith", or "Ms. Smith")
- Concepts:
  - "Rapid Deployment Framework" (NOT "RDF method" or "rapid deployment")

## Approved Descriptions
[Copy-paste approved variants]

## Critical Attributes (Never vary)
- Pricing: $49/user/month (Pro), $29/user/month (Starter)
- Launch: June 1, 2021
- Headquarters: San Francisco, CA
```

**Automated consistency checking:**
```python
# Entity consistency validator

import re

class EntityConsistencyChecker:
    def __init__(self):
        self.canonical_entities = {
            "organization": "Acme Corp",
            "product_pro": "Acme CRM Pro",
            "product_starter": "Acme CRM Starter",
            "ceo": "Jane Smith"
        }

        self.forbidden_variants = {
            "organization": ["Acme Corporation", "Acme Inc.", "ACME"],
            "product_pro": ["CRM Pro", "Pro plan", "Acme CRM Professional"],
            "ceo": ["Jane", "J. Smith", "Ms. Smith"]
        }

    def check_file(self, filepath):
        with open(filepath, 'r') as f:
            content = f.read()

        issues = []

        for entity_type, forbidden in self.forbidden_variants.items():
            for variant in forbidden:
                if variant in content:
                    canonical = self.canonical_entities[entity_type]
                    issues.append({
                        "file": filepath,
                        "issue": f"Found '{variant}', should be '{canonical}'",
                        "type": "naming_inconsistency"
                    })

        return issues

# Run on all content
checker = EntityConsistencyChecker()
all_issues = []
for file in content_files:
    issues = checker.check_file(file)
    all_issues.extend(issues)

# Report
print(f"Found {len(all_issues)} consistency issues")
for issue in all_issues:
    print(f"  {issue['file']}: {issue['issue']}")
```

## Implementation: From Definition to Deployment

### Step 1: Create Entity Master Document

**Centralized entity registry:**

```markdown
# Acme Corp Entity Master Registry

## Organizations
### Acme Corp (Primary)
- Canonical name: Acme Corp
- @id: https://acmecorp.com/#organization
- Schema type: Corporation
- [Full definition...]

## Products
### Acme CRM Pro
- Canonical name: Acme CRM Pro
- @id: https://acmecorp.com/products/crm-pro#product
- Schema type: SoftwareApplication
- [Full definition...]

### Acme CRM Starter
- Canonical name: Acme CRM Starter
- @id: https://acmecorp.com/products/crm-starter#product
- Schema type: SoftwareApplication
- [Full definition...]

## People
### Jane Smith
- Canonical name: Jane Smith
- @id: https://acmecorp.com/about/team/jane-smith#person
- Schema type: Person
- [Full definition...]

[Continue for all entities...]
```

### Step 2: Implement Schema Markup

**Create reusable schema components:**

```javascript
// schema-library.js
// Reusable schema markup for all entities

const SchemaLibrary = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Corporation",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp",
    "alternateName": ["Acme Corporation", "Acme"],
    "legalName": "Acme Corp, Inc.",
    "url": "https://acmecorp.com",
    "logo": "https://acmecorp.com/logo.png",
    "foundingDate": "2020-03-15",
    // ... complete organization schema
  },

  products: {
    crm_pro: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-pro#product",
      "name": "Acme CRM Pro",
      // ... complete product schema
    },
    crm_starter: {
      // ... starter schema
    }
  },

  people: {
    jane_smith: {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": "https://acmecorp.com/about/team/jane-smith#person",
      // ... complete person schema
    }
  }
};

// Usage in pages
function insertOrganizationSchema() {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(SchemaLibrary.organization);
  document.head.appendChild(script);
}
```

### Step 3: Consistency Maintenance Protocol

**Quarterly entity review:**
```
Q1: Review all Tier 1 entities
  - Update attributes (employee count, customer count, pricing)
  - Verify consistency across all pages
  - Check external identifiers still valid
  - Update schema markup if needed

Q2: Review all Tier 2 entities
Q3: Review all entities (comprehensive)
Q4: Review all Tier 2 entities
```

**Change management process:**
```
When entity changes (e.g., product name change, rebranding):
1. Update Entity Master Registry
2. Update schema library
3. Update all content mentioning entity
4. Update external profiles (LinkedIn, Crunchbase, etc.)
5. Run consistency checker
6. Test LLM understanding (query major LLMs)
7. Monitor for 30 days (ensure changes propagate)
```

## Case Study: Entity Definition Transformation

**Company**: B2B SaaS, $5M ARR

**Pre-LLMO Entity Chaos:**
- Company name: "TechStart", "TechStart Inc.", "TechStart Solutions", "TS"
- Product: "Platform", "our platform", "TechStart Platform", "TS Platform"
- CEO: "Sarah", "Sarah J.", "Sarah Johnson", "S. Johnson"
- No schema markup
- No entity definitions

**LLM Understanding Test:**
```
Query: "Tell me about TechStart"
ChatGPT: "I don't have specific information..."
Claude: "TechStart could refer to several companies..."
Perplexity: [No mention in search results]
```

**Citation accuracy: 12%** (when it did respond, mostly wrong)

**LLMO Implementation:**

**Month 1: Entity Definition**
- Created Entity Master Registry (8 core entities)
- Established canonical names:
  - Company: "TechStart Inc."
  - Product: "TechStart Analytics Platform"
  - CEO: "Sarah Johnson"
- Defined all attributes, relationships, descriptions

**Month 2: Consistency Enforcement**
- Updated all 47 web pages with canonical names
- Implemented comprehensive schema markup
- Created external entity links (Wikidata, Crunchbase)
- Ran consistency checker, fixed 127 violations

**Month 3: Monitoring & Refinement**
- Tested LLM understanding weekly
- Adjusted descriptions based on what LLMs extracted
- Added disambiguation context

**Results (Month 3):**
```
Query: "Tell me about TechStart"
ChatGPT: "TechStart Inc. is a B2B SaaS company founded in 2019 by Sarah Johnson. Their flagship product, TechStart Analytics Platform, provides data analytics for e-commerce companies..."
Claude: "TechStart Inc., based in Austin, Texas, offers the TechStart Analytics Platform—a data analytics solution for e-commerce businesses. Founded in 2019, the company serves over 500 customers..."
Perplexity: [Accurately cited with correct details]
```

**Citation accuracy: 89%** (73pp improvement)

**Business impact:**
- AI-attributed traffic: 0 → 180 visits/month
- Brand searches: +45% (likely AI-influenced)
- Competitive mentions: From 0% → 22% share

**Key learning**: Entity definition is foundational. Without it, no other LLMO effort works effectively.

## Frequently Asked Questions

**Q: How many entities should I define?**
A: Start with Tier 1 (5-10 critical entities). Expand to Tier 2 (20-30 total) once foundational entities are perfect. Most companies need 30-50 well-defined entities.

**Q: Do I need unique @id URLs for every entity?**
A: Yes. Unique @id values are critical for entity disambiguation. Use your domain + anchor: `https://yourdomain.com/path#entity-name`

**Q: What if my company name is really common?**
A: Implement aggressive disambiguation: SameAs links, unique identifiers, contextual clarification on every mention. Consider legal name differentiation if possible.

**Q: How often should I update entity definitions?**
A: Quarterly for Tier 1 entities, semi-annually for Tier 2. Immediate updates when critical attributes change (pricing, leadership, product names).

**Q: Can I use abbreviations after first mention?**
A: Yes, but: (1) Define the abbreviation explicitly first, (2) Use schema markup to declare it as alternateName, (3) Prefer canonical names in titles and key positions.

## Action Items

- [ ] Create entity inventory (list all entities by type)
- [ ] Prioritize into Tier 1, 2, 3
- [ ] Define all Tier 1 entities using template
- [ ] Implement schema markup for top 3 entities
- [ ] Run consistency check across your website
- [ ] Create Entity Master Registry document
- [ ] Set up quarterly review calendar

## Reflection Questions

1. What's the most ambiguous entity in your content right now?
2. How many different ways is your company name written across your site?
3. What entity relationships are most critical for LLMs to understand?
4. If LLMs could only know 5 facts about your main product, what should they be?
5. What external entity identifiers (Wikidata, Crunchbase) do you currently have?

## What's Next

Chapter 5 explores **Relationship Mapping**—taking your well-defined entities and connecting them through explicit, machine-parseable relationships. Entity definition creates the nodes; relationship mapping creates the graph. Together, they form the knowledge structure LLMs need for deep comprehension.

---

**Key Takeaway**: Entity definition is the foundation of LLMO. Without clear, consistent, canonical entity definitions backed by comprehensive schema markup, LLMs resort to probabilistic guessing. Define entities explicitly, enforce consistency religiously, and implement structured data comprehensively. The result: LLMs understand your entities as facts, not inferences—improving citation accuracy by 40-70% and transforming how AI represents your brand.
