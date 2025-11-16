# Chapter 5: Relationship Mapping

## The Knowledge Graph Imperative

Entities without relationships are isolated data points. Entities with explicit relationships form knowledge graphs—the native language of machine intelligence. When you tell an LLM that "Acme CRM Pro" is a product, you provide one fact. When you declare that "Acme CRM Pro" is made by "Acme Corp", costs "$49/user/month", targets "startups and SMBs", and integrates with "Salesforce, HubSpot, and 50+ other tools", you create a constellation of facts that reinforce each other.

LLMs don't just catalog relationships—they use them for reasoning. Ask "What CRM should a startup use?" and the LLM traverses relationship paths: startup → needs affordable solution → Acme CRM Pro → targets startups → priced at $49/month → recommendation candidate. Without explicit relationship declarations, these paths remain probabilistic at best, nonexistent at worst.

This chapter provides the complete framework for relationship mapping—from identifying critical relationships to implementing them in machine-readable formats. You'll learn Schema.org relationship vocabulary, relationship hierarchy strategies, and implementation patterns that transform your content from isolated facts into interconnected knowledge structures.

## The Relationship Taxonomy

### Hierarchical Relationships (Part-Whole)

**Organization Hierarchies**

**parentOrganization / subOrganization**
Corporate structure relationships.

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "subOrganization": [
    {
      "@type": "Organization",
      "@id": "https://acmecorp.com/divisions/acme-labs#organization",
      "name": "Acme Labs",
      "description": "Research and development division"
    }
  ]
}
```

**department**
Internal organizational units.

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "department": [
    {
      "@type": "Organization",
      "name": "Product Development",
      "employee": [...]
    },
    {
      "@type": "Organization",
      "name": "Sales",
      "employee": [...]
    }
  ]
}
```

**Product Hierarchies**

**isVariantOf / hasVariant**
Product families and tiers.

```json
{
  "@type": "ProductGroup",
  "@id": "https://acmecorp.com/products/crm#productgroup",
  "name": "Acme CRM",
  "hasVariant": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-starter#product",
      "name": "Acme CRM Starter",
      "offers": {
        "@type": "Offer",
        "price": "29",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-pro#product",
      "name": "Acme CRM Pro",
      "offers": {
        "@type": "Offer",
        "price": "49",
        "priceCurrency": "USD"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-enterprise#product",
      "name": "Acme CRM Enterprise",
      "offers": {
        "@type": "Offer",
        "priceSpecification": {
          "@type": "PriceSpecification",
          "price": "Custom pricing"
        }
      }
    }
  ]
}
```

**isPartOf / hasPart**
Feature relationships.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "hasPart": [
    {
      "@type": "SoftwareApplication",
      "name": "Contact Management Module",
      "description": "Centralized contact database with custom fields"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Deal Pipeline Module",
      "description": "Visual pipeline with drag-and-drop deal management"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Analytics Module",
      "description": "Real-time reporting and dashboards"
    }
  ]
}
```

### Attribution Relationships (Creator-Creation)

**author / creator**
Content authorship.

```json
{
  "@type": "Article",
  "headline": "5 Ways to Optimize Your Sales Pipeline",
  "author": {
    "@type": "Person",
    "@id": "https://acmecorp.com/about/team/jane-smith#person",
    "name": "Jane Smith",
    "jobTitle": "CEO",
    "worksFor": {
      "@type": "Organization",
      "@id": "https://acmecorp.com/#organization"
    }
  },
  "publisher": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp"
  }
}
```

**manufacturer / brand**
Product creation.

```json
{
  "@type": "Product",
  "name": "Acme CRM Pro",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp"
  },
  "brand": {
    "@type": "Brand",
    "name": "Acme"
  }
}
```

**founder / foundingDate**
Organizational origins.

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "founder": [
    {
      "@type": "Person",
      "@id": "https://acmecorp.com/about/team/jane-smith#person",
      "name": "Jane Smith"
    },
    {
      "@type": "Person",
      "@id": "https://acmecorp.com/about/team/john-doe#person",
      "name": "John Doe"
    }
  ],
  "foundingDate": "2020-03-15"
}
```

### Employment Relationships

**worksFor / employee**
Organizational affiliation.

```json
{
  "@type": "Person",
  "@id": "https://acmecorp.com/about/team/jane-smith#person",
  "name": "Jane Smith",
  "jobTitle": "CEO and Co-founder",
  "worksFor": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp"
  }
}
```

Bidirectional declaration (recommended):

```json
{
  "@type": "Organization",
  "@id": "https://acmecorp.com/#organization",
  "name": "Acme Corp",
  "employee": [
    {
      "@type": "Person",
      "@id": "https://acmecorp.com/about/team/jane-smith#person",
      "name": "Jane Smith",
      "jobTitle": "CEO and Co-founder"
    },
    {
      "@type": "Person",
      "@id": "https://acmecorp.com/about/team/sarah-johnson#person",
      "name": "Sarah Johnson",
      "jobTitle": "VP of Product"
    }
  ]
}
```

**alumni / alumniOf**
Former affiliations.

```json
{
  "@type": "Person",
  "name": "Jane Smith",
  "alumniOf": [
    {
      "@type": "EducationalOrganization",
      "name": "Stanford University"
    },
    {
      "@type": "Organization",
      "name": "Previous Corp",
      "description": "Former employer (2015-2020)"
    }
  ]
}
```

### Semantic Relationships

**about / mentions**
Content subject matter.

```json
{
  "@type": "Article",
  "headline": "How Acme CRM Pro Helps Startups Scale",
  "about": {
    "@type": "SoftwareApplication",
    "@id": "https://acmecorp.com/products/crm-pro#product",
    "name": "Acme CRM Pro"
  },
  "mentions": [
    {
      "@type": "Organization",
      "name": "Acme Corp"
    },
    {
      "@type": "Audience",
      "audienceType": "startups"
    }
  ]
}
```

**isRelatedTo**
General semantic connections.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "isRelatedTo": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/analytics#product",
      "name": "Acme Analytics",
      "description": "Complementary analytics product"
    },
    {
      "@type": "Concept",
      "name": "Sales enablement",
      "description": "Core domain expertise"
    }
  ]
}
```

**category / applicationCategory**
Taxonomic classification.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "applicationCategory": "BusinessApplication",
  "applicationSubCategory": "CRM Software",
  "category": [
    "Sales Management",
    "Customer Relationship Management",
    "SaaS"
  ]
}
```

### Integration Relationships

**isAccessibleForFree / requiresSubscription**
Access model.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "isAccessibleForFree": false,
  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "USD"
  }
}
```

**operatingSystem / softwareRequirements**
Technical requirements.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "operatingSystem": "Cloud-based (web, iOS, Android)",
  "softwareRequirements": "Modern web browser (Chrome, Firefox, Safari, Edge)",
  "browserRequirements": "JavaScript enabled"
}
```

**Interoperability (custom implementation)**
Integration capabilities.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "featureList": [
    "Native integration with Salesforce",
    "Native integration with HubSpot",
    "Gmail and Outlook email sync",
    "Slack notifications",
    "Zapier connectivity (2,000+ apps)"
  ],
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Integrations",
      "value": "50+ native integrations, 2,000+ via Zapier"
    }
  ]
}
```

### Competitive Relationships

**competitors / competitorOf** (custom property)
Market positioning.

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Primary Competitors",
      "value": ["Salesforce Essentials", "HubSpot CRM", "Zoho CRM", "Pipedrive"]
    },
    {
      "@type": "PropertyValue",
      "name": "Market Position",
      "value": "Mid-market CRM focused on simplicity and rapid deployment"
    }
  ]
}
```

**Note:** Schema.org doesn't have native "competitor" property, so use additionalProperty or create custom vocabulary.

### Location Relationships

**location / address**
Physical presence.

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "location": {
    "@type": "Place",
    "name": "Acme Corp Headquarters",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Market Street, Suite 400",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94103",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "37.7749",
      "longitude": "-122.4194"
    }
  }
}
```

**areaServed**
Service geography.

```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "areaServed": [
    {
      "@type": "Country",
      "name": "United States"
    },
    {
      "@type": "Country",
      "name": "Canada"
    },
    {
      "@type": "Country",
      "name": "United Kingdom"
    }
  ]
}
```

### Temporal Relationships

**releaseDate / datePublished / dateModified**
Temporal context.

```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "releaseDate": "2021-06-01",
  "dateModified": "2024-12-15",
  "softwareVersion": "3.2"
}
```

```json
{
  "@type": "Article",
  "headline": "CRM Best Practices for 2025",
  "datePublished": "2025-01-10",
  "dateModified": "2025-01-15"
}
```

## Building Your Relationship Map

### Phase 1: Identify Critical Relationships

**Relationship Priority Framework:**

**Tier 1 (Essential - Implement First):**
- Product → Manufacturer
- Person → Organization (worksFor)
- Product → Pricing (offers)
- Product → Category
- Product tiers → Parent product (isVariantOf/hasVariant)
- Content → Author
- Organization → Location (headquarters)

**Tier 2 (Important - Implement Soon):**
- Product → Features (hasPart)
- Organization → Founders
- Product → Target Audience
- Product → Integrations
- Content → Subject (about/mentions)
- Person → Role/Title

**Tier 3 (Nice to Have - Implement Later):**
- Organization → Departments
- Product → Competitors
- Person → Alumni/Background
- Organization → Partners
- Product → Technical Requirements

**Relationship Audit Worksheet:**

```markdown
# Acme Corp Relationship Audit

## Organization Relationships
- [x] Acme Corp → Founders (Jane Smith, John Doe)
- [x] Acme Corp → Location (San Francisco)
- [x] Acme Corp → Products (Acme CRM family)
- [ ] Acme Corp → Partners
- [ ] Acme Corp → Investors

## Product Relationships
- [x] Acme CRM Pro → Manufacturer (Acme Corp)
- [x] Acme CRM Pro → Pricing ($49/user/month)
- [x] Acme CRM Pro → Category (CRM Software)
- [x] Acme CRM Pro → Variants (Starter, Pro, Enterprise)
- [ ] Acme CRM Pro → Features (detailed hasPart)
- [ ] Acme CRM Pro → Integrations (explicit list)
- [ ] Acme CRM Pro → Target Audience (structured)

## Person Relationships
- [x] Jane Smith → worksFor (Acme Corp)
- [x] Jane Smith → jobTitle (CEO and Co-founder)
- [ ] Jane Smith → alumniOf (education, previous companies)
- [ ] Jane Smith → author (blog posts)

## Content Relationships
- [ ] Blog posts → author
- [ ] Blog posts → about/mentions (products, concepts)
- [ ] Case studies → about (products used)
- [ ] Docs → about (features)

[Continue for all entity types...]
```

### Phase 2: Implement Bidirectional Relationships

**The Bidirectionality Principle:**
Declare relationships from both directions whenever possible.

**Example: Product ↔ Organization**

**From Product:**
```json
{
  "@type": "SoftwareApplication",
  "@id": "https://acmecorp.com/products/crm-pro#product",
  "name": "Acme CRM Pro",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp"
  }
}
```

**From Organization:**
```json
{
  "@type": "Organization",
  "@id": "https://acmecorp.com/#organization",
  "name": "Acme Corp",
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@type": "SoftwareApplication",
        "@id": "https://acmecorp.com/products/crm-pro#product",
        "name": "Acme CRM Pro"
      }
    }
  ]
}
```

**Why bidirectional?**
- Reinforces relationship strength
- Provides context from multiple entry points
- Helps LLMs discover relationships regardless of query path
- Reduces inference ambiguity

**Bidirectional implementation checklist:**

```
Product ↔ Manufacturer:
- [x] Product declares manufacturer
- [x] Organization declares products (makesOffer or owns)

Person ↔ Organization:
- [x] Person declares worksFor
- [x] Organization declares employee

Content ↔ Author:
- [x] Article declares author
- [x] Person declares author of articles (on bio page)

Product ↔ Category:
- [x] Product declares category
- [x] Category page lists products (if you have category pages)
```

### Phase 3: Create Relationship Hierarchy

**Nested Relationship Structure:**

Deep relationship nesting provides rich context.

**Example: Multi-level Product Relationship:**

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://acmecorp.com/products/crm-pro#product",
  "name": "Acme CRM Pro",

  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp",
    "founder": [
      {
        "@type": "Person",
        "@id": "https://acmecorp.com/about/team/jane-smith#person",
        "name": "Jane Smith"
      }
    ]
  },

  "isVariantOf": {
    "@type": "ProductGroup",
    "@id": "https://acmecorp.com/products/crm#productgroup",
    "name": "Acme CRM",
    "hasVariant": [
      {"@id": "https://acmecorp.com/products/crm-starter#product"},
      {"@id": "https://acmecorp.com/products/crm-pro#product"},
      {"@id": "https://acmecorp.com/products/crm-enterprise#product"}
    ]
  },

  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "49",
      "priceCurrency": "USD",
      "unitText": "per user per month"
    },
    "seller": {
      "@type": "Organization",
      "@id": "https://acmecorp.com/#organization"
    }
  },

  "audience": {
    "@type": "Audience",
    "audienceType": "startups and SMBs",
    "geographicArea": {
      "@type": "AdministrativeArea",
      "name": "United States, Canada, United Kingdom"
    }
  },

  "hasPart": [
    {
      "@type": "SoftwareApplication",
      "name": "Contact Management",
      "description": "Centralized contact database",
      "isPartOf": {
        "@id": "https://acmecorp.com/products/crm-pro#product"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Deal Pipeline",
      "description": "Visual pipeline management",
      "isPartOf": {
        "@id": "https://acmecorp.com/products/crm-pro#product"
      }
    }
  ]
}
```

This creates a relationship network:
```
Acme CRM Pro
  ├─ manufactured by → Acme Corp
  │   └─ founded by → Jane Smith
  ├─ variant of → Acme CRM (family)
  │   ├─ Starter variant
  │   ├─ Pro variant (self)
  │   └─ Enterprise variant
  ├─ offered at → $49/user/month
  │   └─ sold by → Acme Corp
  ├─ targets → Startups and SMBs
  │   └─ in → US, Canada, UK
  └─ contains → Contact Management, Deal Pipeline
      └─ part of → Acme CRM Pro
```

### Phase 4: Implement Cross-Document Relationships

**The @id Reference Pattern:**

Use consistent @id values to create cross-document entity references.

**Homepage (defines organization):**
```json
{
  "@type": "Organization",
  "@id": "https://acmecorp.com/#organization",
  "name": "Acme Corp",
  "url": "https://acmecorp.com"
}
```

**Product page (references organization):**
```json
{
  "@type": "SoftwareApplication",
  "@id": "https://acmecorp.com/products/crm-pro#product",
  "name": "Acme CRM Pro",
  "manufacturer": {
    "@id": "https://acmecorp.com/#organization"
    // No need to redefine all organization properties
    // @id reference links to canonical definition
  }
}
```

**Team page (references organization):**
```json
{
  "@type": "Person",
  "@id": "https://acmecorp.com/about/team/jane-smith#person",
  "name": "Jane Smith",
  "worksFor": {
    "@id": "https://acmecorp.com/#organization"
    // Same @id = same entity
  }
}
```

**Blog post (references product and author):**
```json
{
  "@type": "Article",
  "headline": "5 CRM Features Every Startup Needs",
  "author": {
    "@id": "https://acmecorp.com/about/team/jane-smith#person"
  },
  "about": {
    "@id": "https://acmecorp.com/products/crm-pro#product"
  },
  "publisher": {
    "@id": "https://acmecorp.com/#organization"
  }
}
```

**Benefits of cross-document linking:**
- Creates unified knowledge graph across your entire site
- Reinforces entity identity (same @id = same thing)
- Allows LLMs to traverse relationships across pages
- Maintains consistency without duplication

### Phase 5: Natural Language Relationship Signals

**Schema markup is critical, but natural language reinforces relationships.**

**Relationship signal patterns:**

**Manufacturing relationship:**
```
"Acme CRM Pro, developed by Acme Corp, is a..."
"Acme Corp's flagship product, Acme CRM Pro..."
"From the makers of Acme CRM Pro, Acme Corp introduces..."
```

**Employment relationship:**
```
"Jane Smith, CEO of Acme Corp, explains..."
"Acme Corp CEO Jane Smith founded the company..."
"According to Jane Smith, who leads Acme Corp..."
```

**Product tier relationship:**
```
"Acme CRM comes in three tiers: Starter ($29), Pro ($49), and Enterprise (custom)."
"Acme CRM Pro is the mid-tier option in the Acme CRM family."
"Upgrading from Acme CRM Starter to Pro unlocks..."
```

**Category relationship:**
```
"Acme CRM Pro is a customer relationship management platform..."
"As a CRM solution, Acme CRM Pro helps sales teams..."
"In the CRM category, Acme CRM Pro stands out for..."
```

**Integration relationship:**
```
"Acme CRM Pro integrates natively with Salesforce, HubSpot, and Gmail."
"Connect Acme CRM Pro to your existing tools including..."
"Acme CRM Pro works seamlessly with 50+ platforms such as..."
```

**Pattern template library:**

```markdown
# Relationship Language Patterns

## Product → Manufacturer
- "[Product], developed by [Company]..."
- "[Company]'s [Product]..."
- "From [Company], [Product] offers..."

## Person → Organization
- "[Person], [Title] of [Company]..."
- "[Company] [Title] [Person]..."
- "[Person], who leads [Company]..."

## Product → Category
- "[Product] is a [Category]..."
- "As a [Category], [Product]..."
- "In the [Category] space, [Product]..."

## Product → Price
- "[Product], priced at [Price]..."
- "[Product] costs [Price]..."
- "Starting at [Price], [Product]..."

## Product → Audience
- "[Product], designed for [Audience]..."
- "[Audience] use [Product] to..."
- "[Product] helps [Audience]..."

[Continue for all relationship types...]
```

## Advanced Relationship Strategies

### Relationship Strength Indicators

**Not all relationships are equal. Signal strength:**

**Strong relationship (explicit, critical):**
```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp"
  }
}
```

**Plus natural language:**
```
"Acme CRM Pro is developed and maintained by Acme Corp."
```

**Weak relationship (casual mention):**
```json
{
  "@type": "Article",
  "mentions": [
    {"@type": "Organization", "name": "Competitor Corp"}
  ]
}
```

**Plus natural language:**
```
"While some companies use Competitor Corp's solution, we find..."
```

**LLMs weight relationships by:**
- Schema markup presence (highest weight)
- Frequency of co-mention (medium weight)
- Linguistic proximity (medium weight)
- Explicit relationship verbs (high weight: "is made by", "works for")

**Optimization:** Make critical relationships explicit with schema + strong natural language. Casual relationships can be natural language only.

### Comparative Relationships

**Positioning through comparison:**

```json
{
  "@type": "Article",
  "headline": "Acme CRM Pro vs. Salesforce: A Comparison",
  "about": [
    {
      "@type": "SoftwareApplication",
      "@id": "https://acmecorp.com/products/crm-pro#product",
      "name": "Acme CRM Pro"
    },
    {
      "@type": "SoftwareApplication",
      "name": "Salesforce",
      "url": "https://www.salesforce.com"
    }
  ],
  "description": "Comparison of Acme CRM Pro and Salesforce for startup use cases"
}
```

**Comparison table structure:**

```html
<table itemscope itemtype="https://schema.org/Table">
  <caption>Acme CRM Pro vs. Competitors</caption>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Acme CRM Pro</th>
      <th>Salesforce Essentials</th>
      <th>HubSpot CRM</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Pricing</td>
      <td itemprop="offers" itemscope itemtype="https://schema.org/Offer">
        <span itemprop="price">$49</span>/user/month
      </td>
      <td>$25/user/month</td>
      <td>Free (limited)</td>
    </tr>
    <tr>
      <td>Setup Time</td>
      <td><strong>5 minutes</strong></td>
      <td>2-4 weeks</td>
      <td>1-2 weeks</td>
    </tr>
    <tr>
      <td>Integrations</td>
      <td>50+ native</td>
      <td>100+ native</td>
      <td>200+ native</td>
    </tr>
  </tbody>
</table>
```

**LLM benefit:** Structured comparison helps LLMs understand:
- You compete with Salesforce, HubSpot
- Your differentiator is setup speed (5 min vs. weeks)
- Your pricing is mid-range ($49 vs. $25 vs. free)

### Temporal Relationship Evolution

**Track how relationships change over time:**

```json
{
  "@type": "Person",
  "name": "Sarah Johnson",
  "worksFor": {
    "@type": "Organization",
    "@id": "https://acmecorp.com/#organization",
    "name": "Acme Corp",
    "startDate": "2021-03-01"
  },
  "alumniOf": [
    {
      "@type": "Organization",
      "name": "TechCorp",
      "description": "VP of Product, 2018-2021"
    }
  ]
}
```

**For products:**
```json
{
  "@type": "SoftwareApplication",
  "name": "Acme CRM Pro",
  "releaseDate": "2021-06-01",
  "offers": {
    "@type": "Offer",
    "price": "49",
    "priceCurrency": "USD",
    "priceValidUntil": "2025-12-31",
    "validFrom": "2024-01-01"
  },
  "additionalProperty": {
    "@type": "PropertyValue",
    "name": "Pricing History",
    "value": "Launched at $39/month (2021), increased to $49/month (2024)"
  }
}
```

**Why track temporal changes:**
- LLMs can provide current vs. historical information
- Reduces hallucination of outdated pricing/relationships
- Demonstrates company growth/evolution

## Relationship Validation and Testing

### Automated Relationship Checking

```python
# Relationship validator script

class RelationshipValidator:
    def __init__(self):
        self.required_relationships = {
            "SoftwareApplication": [
                "manufacturer",  # Product → Organization
                "offers",         # Product → Pricing
                "applicationCategory"  # Product → Category
            ],
            "Person": [
                "worksFor"  # Person → Organization
            ],
            "Article": [
                "author",    # Content → Person
                "publisher"  # Content → Organization
            ]
        }

    def validate_schema(self, schema_data):
        schema_type = schema_data.get("@type")
        issues = []

        if schema_type in self.required_relationships:
            for required_rel in self.required_relationships[schema_type]:
                if required_rel not in schema_data:
                    issues.append({
                        "type": "missing_relationship",
                        "entity": schema_data.get("name", "Unknown"),
                        "missing": required_rel,
                        "severity": "error"
                    })

        # Check for @id consistency
        if "manufacturer" in schema_data:
            if "@id" not in schema_data["manufacturer"]:
                issues.append({
                    "type": "missing_id_reference",
                    "entity": schema_data.get("name"),
                    "relationship": "manufacturer",
                    "severity": "warning",
                    "message": "Use @id reference for cross-document consistency"
                })

        return issues

# Usage
validator = RelationshipValidator()

product_schema = {
    "@type": "SoftwareApplication",
    "name": "Acme CRM Pro",
    "manufacturer": {
        "@id": "https://acmecorp.com/#organization"
    },
    "offers": {
        "@type": "Offer",
        "price": "49"
    }
    # Missing: applicationCategory
}

issues = validator.validate_schema(product_schema)
for issue in issues:
    print(f"{issue['severity'].upper()}: {issue['message']}")
```

### LLM Relationship Testing

**Test if LLMs understand your relationships:**

```python
# Relationship comprehension test

test_queries = {
    "manufacturer": "What company makes Acme CRM Pro?",
    "pricing": "How much does Acme CRM Pro cost?",
    "employment": "Who is the CEO of Acme Corp?",
    "product_tier": "What are the different versions of Acme CRM?",
    "integration": "What tools does Acme CRM Pro integrate with?",
    "category": "What type of software is Acme CRM Pro?"
}

expected_answers = {
    "manufacturer": "Acme Corp",
    "pricing": "$49/user/month",
    "employment": "Jane Smith",
    "product_tier": "Starter, Pro, Enterprise",
    "integration": ["Salesforce", "HubSpot", "Gmail", "50+ tools"],
    "category": "CRM" or "Customer Relationship Management"
}

def test_relationship_understanding(llm, query_type):
    query = test_queries[query_type]
    expected = expected_answers[query_type]

    response = llm.query(query)

    # Check if expected answer in response
    if isinstance(expected, list):
        found = any(item in response for item in expected)
    else:
        found = expected in response

    return {
        "query_type": query_type,
        "query": query,
        "response": response,
        "expected": expected,
        "success": found
    }

# Run tests
for query_type in test_queries:
    result = test_relationship_understanding(gpt4, query_type)
    print(f"{query_type}: {'✓' if result['success'] else '✗'}")
```

## Case Study: Relationship Mapping Impact

**Company**: SaaS (Marketing Automation), 50 employees

**Pre-Relationship Mapping:**
- Had basic schema (Organization, Product)
- No relationship declarations
- Product page didn't link to company
- Team bios didn't link to products
- No product tier relationships

**LLM Understanding Test (Baseline):**
```
Q: "What company makes MarketPro?"
A: "I don't have specific information..." (0/5 LLMs answered correctly)

Q: "What's the difference between MarketPro tiers?"
A: Various hallucinated answers (0/5 correct)

Q: "Who is the CEO of MarketPro's company?"
A: "I don't have that information" (0/5 correct)
```

**Relationship score: 15%** (LLMs understood minimal relationships)

**Implementation (Month 1-2):**

**Added critical relationships:**
1. Product → manufacturer (explicit @id link)
2. Product tiers → parent product (hasVariant/isVariantOf)
3. People → organization (worksFor with @id)
4. Content → author, products (about/mentions)
5. Organization → founders
6. Product → pricing (comprehensive offers)
7. Product → integrations (explicit list)

**Bidirectional declarations:**
- Organization lists products (makesOffer)
- Products declare manufacturer
- People declare worksFor
- Organization lists employees
- Articles declare author
- Author bios list articles written

**Post-Implementation Results (Month 3):**

```
Q: "What company makes MarketPro?"
A: "MarketPro is developed by MarketCo, founded in 2019..." (5/5 correct)

Q: "What's the difference between MarketPro tiers?"
A: "MarketPro offers three tiers: Starter ($99/mo), Professional ($299/mo), and Enterprise (custom pricing). Pro adds..." (5/5 correct, accurate)

Q: "Who is the CEO of MarketCo?"
A: "Rachel Anderson is the CEO and co-founder of MarketCo..." (5/5 correct)
```

**Relationship score: 91%** (+76pp improvement)

**Business Impact:**
- AI-attributed traffic: +280%
- "Competitor vs. MarketPro" searches: Now mentioned in 78% of AI responses (vs. 0% before)
- Brand authority: AI describes company with context ("founded 2019 by Rachel Anderson") vs. generic/missing before

**Key Insight:** Relationships transform isolated facts into coherent narratives. LLMs don't just cite you—they understand you.

## Frequently Asked Questions

**Q: How many relationships should I implement per entity?**
A: Start with 3-5 critical relationships per entity (Tier 1). Expand to 8-12 for comprehensive coverage. More is better if accurate.

**Q: Do bidirectional relationships really matter?**
A: Yes. They reinforce relationship strength and ensure LLMs discover connections regardless of entry point. 40-60% better relationship preservation with bidirectional implementation.

**Q: Should I link to external entities (competitors, partners)?**
A: Yes, for context. Use proper attribution (sameAs, mentions, about) but focus 80% of effort on your own entity graph. External links provide context; internal links provide authority.

**Q: What if my product tiers change frequently?**
A: Update schema immediately when tiers change. Use version control for schema files. Set calendar reminders for quarterly schema audits.

**Q: Can I use custom relationship types not in Schema.org?**
A: Yes, via additionalProperty, but prefer Schema.org vocabulary when available. Custom properties have less LLM recognition.

## Action Items

- [ ] Create relationship map for top 5 entities
- [ ] Implement Tier 1 relationships (Product→Manufacturer, Person→Organization, Product→Pricing)
- [ ] Add bidirectional declarations for critical relationships
- [ ] Implement cross-document @id references
- [ ] Test relationship understanding (query 5 LLMs, check accuracy)
- [ ] Set up automated relationship validation
- [ ] Create natural language relationship patterns style guide

## Reflection Questions

1. What's the most important relationship LLMs should understand about your business?
2. Are your product tiers clearly related in your content?
3. Do your team bios link to the company and products with schema markup?
4. What external entities (partners, competitors) provide valuable context?
5. Which relationships are implicit in your content but should be explicit?

## What's Next

Chapter 6 covers **Naming Consistency**—the final component of the Entity Definition Layer. You've defined entities and mapped relationships; now ensure every mention uses canonical names with zero variation. Consistency is the difference between confident entity recognition and probabilistic guessing.

---

**Key Takeaway**: Relationships transform entities from isolated data points into knowledge graphs. Implement critical relationships first (Product→Manufacturer, Person→Organization, Product→Pricing), use bidirectional declarations to reinforce connections, and maintain cross-document consistency with @id references. Companies that map relationships explicitly see 40-75% improvement in LLM relationship preservation and 2-3× better citation rates. Entities are nouns; relationships are the grammar that makes machines comprehend your complete narrative.
