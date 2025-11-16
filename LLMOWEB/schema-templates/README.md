# Schema Templates

Ready-to-use JSON-LD schema templates for all common entity types.

## 📋 Template Categories

### Core Business Entities
- [organization.json](#) - Your company/organization
- [product.json](#) - Physical or digital products
- [software-application.json](#) - SaaS products and software
- [service.json](#) - Professional services
- [person.json](#) - Team members, authors, leadership

### Content Entities
- [article.json](#) - Blog posts and articles
- [news-article.json](#) - News content
- [how-to.json](#) - Guides and tutorials
- [faq-page.json](#) - FAQ sections
- [video.json](#) - Video content

### E-Commerce Specific
- [product-with-variants.json](#) - Products with size/color variants
- [offer.json](#) - Pricing and availability
- [review.json](#) - Customer reviews
- [aggregate-rating.json](#) - Rating summaries

### Advanced Patterns
- [breadcrumb-list.json](#) - Navigation breadcrumbs
- [item-list.json](#) - Lists of products/articles
- [local-business.json](#) - Location-based businesses
- [professional-service.json](#) - Service providers

## 🎯 Quick Start

### 1. Choose Your Template

Pick the template that matches your entity type:
- Company info → `organization.json`
- Product → `product.json` or `software-application.json`
- Team member → `person.json`
- Blog post → `article.json`

### 2. Copy and Customize

```bash
# Copy template
cp organization.json my-company.json

# Edit with your data
nano my-company.json
```

### 3. Validate

```bash
# Basic JSON syntax check
json_verify < my-company.json

# Full schema validation
node ../validation/validate-schema.js my-company.json
```

### 4. Embed in Your Page

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  ...
}
</script>
```

## 📖 Template Usage Guide

### Property Tiers

Each template includes properties in three tiers:

**Tier 1 (Essential)** - Required for basic functionality:
- Always include these
- Validation will flag if missing
- Critical for LLM comprehension

**Tier 2 (Important)** - Significantly improves comprehension:
- Include when data is available
- Provides richer context
- Measurable impact on citation accuracy

**Tier 3 (Nice-to-Have)** - Additional context:
- Include for comprehensive coverage
- Lower priority if time/data limited
- Marginal improvements

### Template Format

All templates follow this structure:

```json
{
  "@context": "https://schema.org",
  "@type": "EntityType",

  "// TIER 1: ESSENTIAL PROPERTIES": "Always include these",
  "name": "Entity Name",
  "description": "Clear description",

  "// TIER 2: IMPORTANT PROPERTIES": "Include when available",
  "image": "https://example.com/image.jpg",

  "// TIER 3: NICE-TO-HAVE": "Optional enhancements",
  "award": "Industry awards"
}
```

## 🔗 Relationship Patterns

### Referencing Other Entities

**Option 1: Inline Full Object**
```json
{
  "@type": "Product",
  "name": "Acme CRM",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://acme.com/#organization",
    "name": "Acme Corp"
  }
}
```

**Option 2: Reference by @id**
```json
{
  "@type": "Product",
  "name": "Acme CRM",
  "manufacturer": {
    "@id": "https://acme.com/#organization"
  }
}
```

**Recommendation**: Use Option 1 for primary entities, Option 2 for secondary references to avoid duplication.

### Bidirectional Relationships

Always declare relationships from both directions:

**On Product Page:**
```json
{
  "@type": "Product",
  "name": "Acme CRM",
  "manufacturer": {
    "@id": "https://acme.com/#organization"
  }
}
```

**On Organization Page:**
```json
{
  "@type": "Organization",
  "name": "Acme Corp",
  "makesOffer": [
    {
      "@type": "Offer",
      "itemOffered": {
        "@id": "https://acme.com/products/crm#product"
      }
    }
  ]
}
```

## 🎨 Customization Guidelines

### Names and IDs

**Use canonical names:**
```json
"name": "Acme Corporation"  // ✓ Correct
"name": "Acme Corp"          // ✗ Avoid variants
```

**Consistent @id patterns:**
```json
"@id": "https://yoursite.com/#organization"    // Organization
"@id": "https://yoursite.com/products/x#product"  // Product
"@id": "https://yoursite.com/team/john#person"    // Person
```

### Descriptions

**Good descriptions are:**
- **Factual**: "CRM software for sales teams" not "The best CRM ever!"
- **Specific**: "Contact management, pipeline tracking, email integration" not "Lots of features"
- **Concise**: 120-160 characters optimal
- **Complete**: Standalone understandable

**Example:**
```json
"description": "Cloud-based CRM software providing contact management, sales pipeline tracking, and email integration for small to medium businesses."
```

### Images

**Best practices:**
```json
"image": {
  "@type": "ImageObject",
  "contentUrl": "https://example.com/product.jpg",
  "width": "1200",
  "height": "630",
  "caption": "Acme CRM dashboard showing pipeline view"
}
```

Or simplified:
```json
"image": "https://example.com/product.jpg"
```

### Dates

**Use ISO 8601 format:**
```json
"datePublished": "2024-03-15"           // Date only
"datePublished": "2024-03-15T10:30:00Z" // Date and time
```

### URLs

**Always use absolute URLs:**
```json
"url": "https://example.com/product"  // ✓ Correct
"url": "/product"                      // ✗ Wrong
```

## ✅ Validation Checklist

Before using a template, verify:

- [ ] All Tier 1 properties filled in
- [ ] Tier 2 properties included where data available
- [ ] Valid JSON syntax (no trailing commas)
- [ ] @context is "https://schema.org"
- [ ] @type is valid Schema.org type
- [ ] @id follows consistent pattern
- [ ] Names are canonical (no variants)
- [ ] Descriptions are factual and specific
- [ ] URLs are absolute (start with https://)
- [ ] Dates are ISO 8601 format
- [ ] Images are high quality and accessible
- [ ] Relationships use @id references correctly

## 🧪 Testing Your Schema

### 1. Syntax Validation
```bash
# Check JSON is valid
node -e "JSON.parse(require('fs').readFileSync('organization.json'))"
```

### 2. Schema Validation
```bash
# Validate against Schema.org
node ../validation/validate-schema.js organization.json
```

### 3. Google Rich Results Test
Paste schema into: https://search.google.com/test/rich-results

### 4. LLM Comprehension Test
```bash
# Test if LLMs extract correctly
node ../testing/test-extraction.js organization.json
```

## 📊 Completeness Scoring

Calculate your schema completeness:

**Formula**: (Properties Included / Properties Recommended) × 100

**Example: Product Schema**
- Tier 1 properties: 8 (all required)
- Tier 2 properties: 6 of 10 included
- Tier 3 properties: 2 of 8 included

**Score**: (8 + 6 + 2) / (8 + 10 + 8) = 61.5%

**Targets**:
- Minimum: 60% (All Tier 1 + half of Tier 2)
- Good: 75% (All Tier 1 + most Tier 2)
- Excellent: 85%+ (All Tier 1-2 + some Tier 3)

## 🔧 Common Customizations

### Adding Custom Properties

Use `additionalProperty` for custom data:

```json
{
  "@type": "Product",
  "name": "Industrial Pump",
  "additionalProperty": [
    {
      "@type": "PropertyValue",
      "name": "Operating Pressure",
      "value": "150 PSI",
      "unitCode": "BAR"
    },
    {
      "@type": "PropertyValue",
      "name": "Material",
      "value": "316 Stainless Steel"
    }
  ]
}
```

### Multiple Languages

```json
{
  "@type": "Product",
  "name": "Acme CRM",
  "description": "CRM software for sales teams",
  "inLanguage": "en-US",
  "sameAs": "https://acme.com/fr/products/crm"  // French version
}
```

### Multiple Entities on One Page

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://acme.com/#organization",
      "name": "Acme Corp"
    },
    {
      "@type": "Product",
      "name": "Acme CRM",
      "manufacturer": {
        "@id": "https://acme.com/#organization"
      }
    }
  ]
}
```

## 📚 Template Reference

### By Industry

**SaaS Companies**:
- `software-application.json` (products)
- `organization.json` (company)
- `offer.json` (pricing tiers)
- `person.json` (team)
- `article.json` (blog)

**E-Commerce**:
- `product.json` (products)
- `product-with-variants.json` (size/color variants)
- `offer.json` (pricing)
- `aggregate-rating.json` (reviews)
- `breadcrumb-list.json` (navigation)

**Professional Services**:
- `professional-service.json` or `service.json`
- `organization.json` (firm)
- `person.json` (team members)
- `article.json` (case studies)
- `how-to.json` (methodology guides)

**B2B Manufacturing**:
- `product.json` (with extensive additionalProperty)
- `organization.json` (manufacturer)
- `offer.json` (pricing/quotes)
- `how-to.json` (application guides)

**Publishers**:
- `news-article.json` or `article.json`
- `person.json` (authors)
- `organization.json` (publication)
- `video.json` (multimedia)

## 🆘 Troubleshooting

### "Property not recognized"
**Cause**: Using non-existent Schema.org property
**Solution**: Check https://schema.org for valid properties

### "Missing required property"
**Cause**: Tier 1 essential property not included
**Solution**: Review template comments for required properties

### "@id reference not found"
**Cause**: Referencing entity that doesn't exist
**Solution**: Ensure referenced entity is defined on same or linked page

### "Invalid date format"
**Cause**: Date not in ISO 8601 format
**Solution**: Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ

### "Validation passes but LLMs don't understand"
**Cause**: Schema valid but descriptions unclear/incomplete
**Solution**: Improve description quality, add more Tier 2 properties

## 📖 Further Reading

- **Schema.org Documentation**: https://schema.org
- **Google Schema Guidelines**: https://developers.google.com/search/docs/appearance/structured-data
- **LLMO Book Chapter 10**: Schema Markup Mastery
- **LLMO Book Chapter 11**: JSON-LD Implementation

---

**Next Steps**: Choose your template, customize with your data, validate, and embed in your pages. Start with `organization.json` for your company, then expand to products, services, and content.
