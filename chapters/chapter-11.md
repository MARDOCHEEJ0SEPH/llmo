# Chapter 11: JSON-LD Implementation

## The Structured Data Format LLMs Trust

JSON-LD (JavaScript Object Notation for Linked Data) is the recommended format for schema markup because it separates structure from presentation. While microdata embeds schema directly in HTML, JSON-LD places it in a clean script block that both humans and machines parse easily. LLMs processing your pages extract JSON-LD first—it's the authoritative source of structured truth about your entities.

This chapter reveals the patterns, practices, and principles for implementing JSON-LD that LLMs parse flawlessly and humans maintain effortlessly.

## JSON-LD Fundamentals

### Basic Structure

Every JSON-LD block follows a consistent pattern:

The structure begins with @context declaring the Schema.org vocabulary, followed by @type specifying the entity type, then properties describing the entity. The @id property provides a unique identifier for cross-document references.

### The @context Declaration

The @context property tells parsers which vocabulary defines your properties. Always use "https://schema.org" as the context—it's the most widely supported vocabulary for business entities.

Multiple contexts can be declared as an array if you need properties from different vocabularies, but Schema.org alone covers 95% of business use cases.

### The @type Property

@type declares what kind of entity you're describing. It can be:
- A single type: "Organization"
- Multiple types: ["Organization", "LocalBusiness", "Restaurant"]
- A nested type with full context

Use the most specific type available. "Restaurant" is better than "FoodEstablishment" which is better than "LocalBusiness" which is better than "Organization". Specificity helps LLMs understand precise entity categories.

### The @id Property

The @id acts as a permanent identifier for your entity. Choose @id values carefully:

**Best practices:**
- Use your domain: "https://yourdomain.com/#entity-name"
- Add fragment identifier: The "#" indicates an entity on the page
- Keep it permanent: Never change @id values
- Be consistent: Same entity = same @id across all pages

Good @id examples:
- "https://acmecorp.com/#organization" (main company)
- "https://acmecorp.com/products/crm-pro#product" (product)
- "https://acmecorp.com/about/team/jane-smith#person" (person)

@id enables powerful cross-document linking. When your Product schema references the manufacturer, use {"@id": "https://acmecorp.com/#organization"} instead of redefining the entire Organization object.

## Entity Reference Patterns

### Full Definition vs. Reference

**Full Definition (use on entity's primary page)**:
Define all properties comprehensively where the entity is the main subject. The Organization's full definition belongs on the homepage or about page. The Product's full definition belongs on its product page.

**Reference (use when mentioning elsewhere)**:
When referencing an entity from another page, use @id-only references. Don't duplicate the full definition—just point to it.

This creates a clean knowledge graph where each entity has one authoritative definition referenced by all other entities.

### Inline vs. Referenced Entities

**Inline Entities (embed full object)**:
Use for entities that only exist in context of the parent:
- An Offer that belongs to a specific Product
- A PostalAddress that belongs to an Organization
- A ContactPoint specific to one entity

**Referenced Entities (use @id pointer)**:
Use for entities that exist independently:
- Organizations (referenced by Products, People, Articles)
- People (referenced as authors, founders, employees)
- Products (referenced by Articles, related Products)

The rule: If the entity appears on its own page or could be referenced from multiple places, define it once with an @id and reference it everywhere else.

## Multi-Entity Pages

### Multiple Top-Level Entities

Many pages describe multiple entities. A product page might include:
- Product (primary entity)
- Organization (manufacturer)
- Multiple Offers (pricing tiers)
- BreadcrumbList (navigation)
- Person (author if there's content)

Implement multiple entities using an array of JSON-LD blocks or a single block with @graph.

**Array Approach**: Multiple separate script tags, each with one entity. This is cleaner and easier to maintain.

**@graph Approach**: Single script tag with @graph property containing an array of entities. This reduces code but makes updates more complex.

Choose the approach that matches your content management system's capabilities.

### Entity Priority on Multi-Entity Pages

When a page has multiple entities, establish clear priority:

**Primary entity**: The main subject (appears first, most complete definition)
**Secondary entities**: Supporting entities (can be @id references or partial definitions)
**Tertiary entities**: Minimal entities (navigation, metadata)

LLMs weight the first/primary entity higher, so ensure your most important entity appears first.

## Property Value Patterns

### Text vs. Structured Values

Many properties accept either simple text or structured objects:

**Simple Text** (easier, less precise):
Use for straightforward values: name, description, headline

**Structured Objects** (more complex, more precise):
Use for values with multiple components: address, geo coordinates, prices, dates

Example: Address as text vs. PostalAddress object

Text version: "123 Main St, San Francisco, CA 94103"
This works but loses structure.

Structured version: PostalAddress object with streetAddress, addressLocality, addressRegion, postalCode, addressCountry properties.
This preserves each component for precise parsing.

LLMs extract more value from structured objects. Use them for addresses, prices, and measurements.

### Date and Time Formats

Always use ISO 8601 format for dates and times:

- Date: "YYYY-MM-DD" (e.g., "2025-01-15")
- DateTime: "YYYY-MM-DDTHH:MM:SSZ" (e.g., "2025-01-15T14:30:00Z")
- Duration: "PTXXHXXM" (e.g., "PT2H30M" for 2 hours 30 minutes)

Don't use regional formats ("1/15/2025" or "15-Jan-2025"). LLMs parse ISO 8601 reliably; other formats create ambiguity.

### URL Properties

Properties like url, image, logo, and sameAs expect full URLs:

**Absolute URLs (required)**: "https://acmecorp.com/logo.png"
**Relative URLs (don't use)**: "/logo.png" (parsers may not resolve correctly)

Always provide complete URLs including protocol (https://).

### Arrays vs. Single Values

Some properties accept single values or arrays:

**Single value**: "author": {"@id": "..."}
**Array**: "author": [{"@id": "..."}, {"@id": "..."}]

Use arrays when multiple values exist (multiple authors, multiple founders, multiple sameAs links). Even with one value, arrays future-proof your schema for additions.

## Relationship Implementation

### Bidirectional Relationships

Strong relationships are declared from both directions:

**Product → Organization** (via manufacturer)
**Organization → Product** (via makesOffer or owns)

**Person → Organization** (via worksFor)
**Organization → Person** (via employee or founder)

**Article → Person** (via author)
**Person → Article** (via authored works on bio page)

Bidirectionality reinforces relationships and helps LLMs discover connections from either direction.

### Relationship Chains

Chain relationships to provide multi-hop context:

**Article about Product manufactured by Organization founded by Person**

This creates a path: Article → Product → Organization → Person

LLMs traverse these chains to build complete entity understanding. A 3-4 hop chain provides rich context without excessive nesting.

### Relationship Strength Signals

Not all relationships are equal. Signal strength through completeness:

**Strong relationship (critical connection)**:
Use full object with multiple properties, bidirectional declaration, both JSON-LD and microdata reinforcement.

**Medium relationship (important but not central)**:
Use @id reference with basic properties, declared in one direction.

**Weak relationship (casual mention)**:
Use simple mention property with minimal detail.

Invest your implementation effort in strong relationships that define your entity graph.

## JSON-LD Optimization

### Minimizing Redundancy

Avoid repeating identical information:

**Bad pattern**: Redefining the Organization in every Product schema with all 30 properties.

**Good pattern**: Define Organization once on homepage, reference it by @id in all Product schemas.

This reduces code volume, ensures consistency, and makes updates manageable. Change the Organization once, all references automatically reflect the update.

### Property Selection Economics

Every property has maintenance cost. Prioritize properties by value:

**High value properties** (implement first):
- Identity: @id, name, description, url
- Critical relationships: manufacturer, author, worksFor
- Business-critical facts: price, availability, features

**Medium value properties** (implement soon):
- Enhanced identity: alternateName, sameAs, identifier
- Secondary relationships: isPartOf, mentions, about
- Enrichment: image, logo, datePublished

**Low value properties** (implement last):
- Polish: award, slogan, knowsLanguage
- Rare use: potentialAction, honorificSuffix
- Specialized: geo (unless location-critical)

Implement high and medium value properties before adding low value ones.

### Schema Reusability

Create reusable schema components:

**Pattern 1: Template Library**
Define schema templates for each entity type with placeholder values. When creating new Product pages, copy the Product template and fill in specific values.

**Pattern 2: Data-Driven Generation**
Store entity data in structured format (database, CMS), generate JSON-LD programmatically from data. This ensures consistency and makes bulk updates trivial.

**Pattern 3: Component Injection**
Define common components (Organization, key People) once, inject into pages that need them. Changes to the component automatically propagate to all pages.

Choose the pattern that fits your technical infrastructure.

## Validation and Testing

### Pre-Deployment Validation

Before publishing JSON-LD, validate:

**Syntax Validation**:
Ensure valid JSON syntax (proper brackets, quotes, commas)
Use JSON validators to catch syntax errors

**Schema Validation**:
Verify @type exists and is valid Schema.org type
Check all properties are valid for the type
Confirm required properties are present

**Relationship Validation**:
Verify all @id references point to defined entities
Check bidirectional relationships are properly linked
Ensure relationship property types match (don't link Product to Person via manufacturer)

**Value Validation**:
Confirm dates use ISO 8601 format
Verify URLs are absolute and accessible
Check enums use valid values (availability: InStock, not "in stock")

### LLM Parsing Tests

After deploying JSON-LD, test how LLMs parse it:

**Test queries**:
Ask LLMs factual questions answerable from your schema (pricing, features, relationships)

**Expected answers**:
Define what correct answers should contain

**Actual answers**:
Query multiple LLMs (GPT-4, Claude, Perplexity, Gemini)

**Accuracy scoring**:
Calculate how often LLMs provide correct answers from your schema

If accuracy is below 80%, investigate:
- Is schema valid and error-free?
- Are critical properties missing?
- Is data accurate and current?
- Are relationships properly declared?

## Common JSON-LD Mistakes

### Mistake 1: Inconsistent @id Usage

**Problem**: Using different @id for same entity across pages
Example: "#organization" on one page, "#company" on another

**Impact**: LLMs treat them as different entities, lose relationship connections

**Fix**: Establish canonical @id for each entity, use consistently everywhere

### Mistake 2: Over-Nesting

**Problem**: Nesting entities 5+ levels deep
Example: Organization contains Products which contain Features which contain SubFeatures which contain...

**Impact**: Complexity makes maintenance impossible, parsers may truncate deep nesting

**Fix**: Keep nesting to 3-4 levels, use @id references instead of deep nesting

### Mistake 3: Stale Data

**Problem**: JSON-LD contains outdated information (old prices, former employees, deprecated products)

**Impact**: LLMs cite incorrect information, damages trust and accuracy

**Fix**: Implement schema update schedules, automated validation for staleness

### Mistake 4: Missing @context

**Problem**: Forgetting "@context": "https://schema.org" in JSON-LD block

**Impact**: Parsers don't know which vocabulary defines your properties, may ignore schema entirely

**Fix**: Always include @context as first property in every JSON-LD block

### Mistake 5: Conflicting Data

**Problem**: JSON-LD says one thing, HTML says another (price mismatch, different descriptions)

**Impact**: LLMs must choose which to trust, may cite the wrong version

**Fix**: Ensure JSON-LD and HTML always match, preferably generate both from same data source

### Mistake 6: Invalid Property Combinations

**Problem**: Using properties that don't apply to the type
Example: Adding "operatingSystem" to Organization (it's for SoftwareApplication)

**Impact**: Validators throw errors, LLMs may ignore invalid properties

**Fix**: Check Schema.org documentation for each type, only use applicable properties

## JSON-LD and Page Performance

### Schema Size Considerations

JSON-LD adds to page weight. Manage it:

**Small schema** (<5KB): Negligible performance impact
**Medium schema** (5-20KB): Minor impact, acceptable for most pages
**Large schema** (>20KB): Consider optimization

If schema exceeds 20KB:
- Remove low-value properties
- Use @id references instead of full objects
- Consider splitting across multiple pages
- Minify JSON (remove whitespace)

### Rendering Strategies

JSON-LD placement affects rendering:

**In <head>**: Doesn't block rendering, parsers find it easily (recommended)
**In <body>**: Might block rendering, can be close to relevant HTML
**Dynamically injected**: Loaded via JavaScript after page render (works but slower for parsers)

Place JSON-LD in <head> for best performance and parser accessibility.

## Case Study: JSON-LD Implementation Evolution

**Company**: E-commerce (Furniture), $8M annual revenue

**Implementation Journey**:

**Phase 1: Basic JSON-LD (Month 1)**
- Organization schema on homepage (15 properties)
- Product schema on 200 top products (10 properties each)
- No relationships, no @id references
- Validation errors: 45 across all pages
- LLM citation accuracy: 52%

**Phase 2: Relationship Implementation (Month 2)**
- Added @id to all entities
- Linked Products to Organization via manufacturer
- Added BreadcrumbList for navigation
- Fixed all validation errors
- LLM citation accuracy: 71% (+19pp)

**Phase 3: Comprehensive Properties (Month 3)**
- Expanded to 25 properties per Product
- Added offers with detailed pricing
- Implemented aggregateRating
- Added hasPart for product components
- LLM citation accuracy: 87% (+16pp)

**Phase 4: Bidirectional Relationships (Month 4)**
- Organization now lists products via makesOffer
- Products reference related items via isRelatedTo
- Added review authors (Person entities)
- LLM citation accuracy: 93% (+6pp)

**Results (Month 6)**:

**Technical Metrics**:
- Pages with valid schema: 100% (up from 78%)
- Average properties per Product: 28 (up from 10)
- Relationship coverage: 94% (up from 0%)
- Validation errors: 0 (down from 45)

**LLM Impact**:
- Citation accuracy: 52% → 93%
- Perplexity product recommendations: +340%
- ChatGPT mentions in shopping queries: +280%
- Product detail accuracy in AI responses: 95% (vs 45%)

**Business Impact**:
- AI-attributed traffic: 320 visits/month → 2,100 visits/month
- AI-attributed revenue: $8K/month → $54K/month
- Cost per AI-attributed customer: 40% lower than paid search

**Key Insight**: "We thought JSON-LD was a one-time setup. The real value came from iterative improvement—each phase brought measurable accuracy gains."

## Action Items

- [ ] Audit all current JSON-LD for validation errors
- [ ] Establish canonical @id for each entity type
- [ ] Implement @id references to eliminate redundant definitions
- [ ] Add missing high-value properties to existing schemas
- [ ] Validate all schemas with automated tools
- [ ] Test LLM parsing accuracy before and after improvements
- [ ] Create JSON-LD maintenance schedule (monthly updates minimum)

## Reflection Questions

1. Do you currently use JSON-LD, microdata, or no structured data?
2. How many validation errors exist in your current implementation?
3. Are your @id values consistent across all pages?
4. What's your process for updating JSON-LD when business information changes?
5. How do you validate that LLMs correctly parse your JSON-LD?

## What's Next

Chapter 12 covers **Semantic HTML5**—using HTML elements and attributes that reinforce your JSON-LD with additional structural signals LLMs use to build complete understanding.

---

**Key Takeaway**: JSON-LD is the authoritative structured data layer that LLMs trust unconditionally. Proper implementation requires consistent @id usage, appropriate nesting depth, comprehensive property coverage, and bidirectional relationships. Validate rigorously, update frequently, and test LLM parsing regularly. Companies that implement comprehensive JSON-LD with proper relationships see citation accuracy improve from 50-60% to 85-95% within 3-6 months, driving 200-400% increases in AI-attributed traffic and revenue.
