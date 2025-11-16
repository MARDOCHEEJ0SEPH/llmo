# Complete Page Examples

Full HTML page implementations demonstrating LLMO best practices.

## 📄 Available Examples

### Business Pages
- **[saas-product-page.html](#)** - Complete SaaS product page
  - SoftwareApplication schema
  - Multiple pricing tiers (Offer schema)
  - Feature lists and screenshots
  - Customer reviews and ratings
  - Related products and integrations

- **[ecommerce-product-page.html](#)** - E-commerce product page
  - Product schema with variants
  - Pricing and availability
  - Customer reviews (Review + AggregateRating)
  - Product specifications (additionalProperty)
  - Breadcrumb navigation

- **[service-page.html](#)** - Professional services page
  - ProfessionalService schema
  - Organization and team Person schemas
  - Service deliverables and pricing
  - Case study references

### Content Pages
- **[blog-post.html](#)** - Blog article page
  - Article schema with full properties
  - Author Person schema and bio
  - Related articles
  - Comments and engagement

- **[news-article.html](#)** - News publisher article
  - NewsArticle schema
  - NewsMediaOrganization publisher
  - Author byline and credentials
  - Update/correction handling

### Company Pages
- **[homepage.html](#)** - Company homepage
  - Organization schema
  - Leadership team (Person schemas)
  - Product/service overview
  - Navigation and structure

- **[about-page.html](#)** - About/Team page
  - Organization schema with complete properties
  - All team members (Person schemas)
  - Company history and values
  - Office locations (LocalBusiness)

- **[team-member-bio.html](#)** - Individual team member page
  - Person schema with full properties
  - Articles authored
  - Expertise areas and achievements
  - Contact information

## 🎯 What These Examples Demonstrate

### Schema Implementation
- ✅ Multiple related entities on one page using @graph
- ✅ Entity references using @id
- ✅ Bidirectional relationships
- ✅ Complete property sets (Tier 1+2+3)
- ✅ Proper @context and @type usage

### Semantic HTML5
- ✅ Proper document structure (header, main, article, aside, footer)
- ✅ Heading hierarchy (H1-H6, no skipped levels)
- ✅ Semantic elements (nav, section, figure, time)
- ✅ Lists and tables for structured data
- ✅ Breadcrumb navigation

### Content Quality
- ✅ Information density (1-2 facts per sentence)
- ✅ Sentence length (15-25 words average)
- ✅ Active voice (<20% passive)
- ✅ Clear entity names (canonical, consistent)
- ✅ Contextual completeness (self-contained paragraphs)

### Navigation and Structure
- ✅ Breadcrumb navigation (BreadcrumbList schema)
- ✅ Internal linking (5-15 links per page)
- ✅ Related content sections
- ✅ Clear visual hierarchy
- ✅ Mobile-responsive design

## 📚 How to Use These Examples

### 1. Choose Your Template

Pick the example closest to your use case:
- Selling software? → `saas-product-page.html`
- Selling physical products? → `ecommerce-product-page.html`
- Offering services? → `service-page.html`
- Publishing content? → `blog-post.html` or `news-article.html`

### 2. Copy and Customize

```bash
# Copy the example
cp saas-product-page.html my-product-page.html

# Open in editor
nano my-product-page.html

# Replace placeholder data with your actual data
# Search for "YOUR_" to find all placeholders
```

### 3. Update Schema

Find the `<script type="application/ld+json">` section and update:
- Entity names (@id and name properties)
- Descriptions and content
- URLs (use your actual domain)
- Images (your actual image URLs)
- Dates (actual publication/update dates)
- People, products, organizations (your entities)

### 4. Update HTML Content

Update the visible HTML to match your schema:
- Headlines must match schema headline
- Prices must match schema price
- Names must match schema name (canonical consistency)
- Dates must match schema dates

### 5. Validate

```bash
# Validate HTML structure
node ../validation/validate-html.js my-product-page.html

# Validate JSON-LD schema
node ../validation/validate-schema.js my-product-page.html

# Check content quality
node ../validation/check-content-quality.js my-product-page.html

# Test LLM comprehension
node ../testing/test-page-comprehension.js my-product-page.html
```

### 6. Deploy and Test

After deployment:
- Test with Google Rich Results Test
- Query LLMs about your page content
- Check citation accuracy
- Monitor ongoing performance

## 🔍 Example Walkthrough: SaaS Product Page

Let's walk through `saas-product-page.html`:

### 1. Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Schema in HEAD for immediate parsing -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      { /* Organization schema */ },
      { /* SoftwareApplication schema */ },
      { /* BreadcrumbList schema */ }
    ]
  }
  </script>
</head>
<body>
  <header><!-- Site header with logo and nav --></header>
  <main>
    <nav aria-label="Breadcrumb"><!-- Breadcrumbs --></nav>
    <article>
      <h1><!-- Product name (matches schema) --></h1>
      <!-- Product content -->
    </article>
    <aside><!-- Related products, CTA --></aside>
  </main>
  <footer><!-- Site footer --></footer>
</body>
</html>
```

### 2. Schema @graph Pattern

Multiple entities use @graph:

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
      "@type": "SoftwareApplication",
      "@id": "https://acme.com/products/crm#product",
      "name": "Acme CRM",
      "provider": {
        "@id": "https://acme.com/#organization"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [...]
    }
  ]
}
```

### 3. Entity References

Notice how SoftwareApplication references Organization:

```json
"provider": {
  "@id": "https://acme.com/#organization"
}
```

This creates the relationship without duplicating the full Organization object.

### 4. Semantic HTML

Content structure mirrors schema:

```html
<article itemscope itemtype="https://schema.org/SoftwareApplication">
  <h1 itemprop="name">Acme CRM</h1>
  <p itemprop="description">Customer relationship management...</p>

  <section id="features">
    <h2>Features</h2>
    <ul>
      <li itemprop="featureList">Contact Management</li>
      <li itemprop="featureList">Pipeline Tracking</li>
    </ul>
  </section>

  <section id="pricing">
    <h2>Pricing</h2>
    <!-- Pricing tiers match Offer schemas -->
  </section>
</article>
```

### 5. Content Quality

Notice information density:

```html
<p>Acme CRM helps sales teams manage 10,000+ contacts, track deals through
5-stage pipelines, and integrate with Gmail and Outlook for automated email
tracking. Teams of 5-50 people see 40% faster deal closure within 6 months.</p>
```

This paragraph contains:
- 6 specific facts
- 3 sentences
- ~2 facts per sentence
- Specific numbers (10,000+, 5-stage, 5-50, 40%, 6 months)
- Clear product benefits

## 🎨 Customization Patterns

### Adding More Products

In `@graph`, add another SoftwareApplication:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { /* Organization */ },
    { /* Product 1 */ },
    { /* Product 2 - NEW */ },
    { /* BreadcrumbList */ }
  ]
}
```

### Adding Team Members

Reference Person entities in Organization:

```json
{
  "@type": "Organization",
  "employee": [
    { "@id": "https://acme.com/team/ceo#person" },
    { "@id": "https://acme.com/team/cto#person" }
  ]
}
```

### Adding Reviews

Add Review objects in Product schema:

```json
{
  "@type": "Product",
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "John Smith" },
      "reviewRating": { "@type": "Rating", "ratingValue": "5" },
      "reviewBody": "Excellent product..."
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "127"
  }
}
```

## ✅ Quality Checklist

Before deploying, verify your page has:

**Schema**:
- [ ] Valid JSON-LD (no syntax errors)
- [ ] All Tier 1 properties included
- [ ] 70%+ of Tier 2 properties
- [ ] Proper @id references
- [ ] Bidirectional relationships

**HTML**:
- [ ] Semantic HTML5 elements
- [ ] Proper heading hierarchy (H1-H6)
- [ ] Breadcrumb navigation
- [ ] 5-15 internal links
- [ ] Alt text on all images

**Content**:
- [ ] 1-2 facts per sentence
- [ ] 15-25 word sentences
- [ ] <20% passive voice
- [ ] All entities clearly named
- [ ] Self-contained paragraphs

**Consistency**:
- [ ] HTML content matches schema
- [ ] Canonical names used consistently
- [ ] Prices match in schema and HTML
- [ ] Dates match in schema and HTML

**Testing**:
- [ ] Google Rich Results Test: Pass
- [ ] LLM extraction test: >80% accuracy
- [ ] W3C HTML validation: No errors
- [ ] Mobile responsive: Yes

## 📖 Further Reading

- **LLMO Book Chapter 10-12**: Machine Parsing Layer
- **LLMO Book Chapter 13-15**: Human Experience Layer
- **Schema Templates**: ../schema-templates/ for individual schemas
- **Industry Examples**: ../industry-examples/ for industry-specific pages

---

**Ready to build your optimized page?** Choose an example, customize it, validate it, and deploy. Your LLM-optimized content starts here.
