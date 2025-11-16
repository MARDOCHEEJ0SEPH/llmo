# LLMOWEB: Code Implementation Examples

**Companion Code Repository for the LLMO Book**

This directory contains all the code implementation examples, templates, and tools referenced throughout the LLMO book. While the book focuses on concepts and strategies, LLMOWEB provides working code you can use to implement LLMO in your projects.

## 📁 Directory Structure

### [schema-templates/](schema-templates/)
Ready-to-use JSON-LD schema templates for all entity types:
- Organization, Product, Person, Service, Article schemas
- Industry-specific templates (SaaS, E-commerce, B2B, etc.)
- Relationship patterns and bidirectional linking
- Complete property sets (Tier 1, 2, and 3)

### [html-examples/](html-examples/)
Semantic HTML5 markup examples:
- Proper heading hierarchy (H1-H6)
- Semantic elements (article, section, nav, aside)
- Breadcrumb navigation
- Lists, tables, and structured content
- Microdata integration

### [validation/](validation/)
Schema and content validation tools:
- JSON-LD schema validators
- Property completeness checkers
- Heading hierarchy validators
- Content quality analyzers
- Automated testing scripts

### [testing/](testing/)
LLM comprehension testing frameworks:
- Automated query testing against multiple LLMs
- Citation accuracy measurement
- Entity extraction verification
- Relationship understanding tests
- Competitive comparison tools

### [complete-examples/](complete-examples/)
Full page implementations:
- Complete product pages (SaaS, E-commerce)
- Service pages (Professional Services, B2B)
- Article pages (News, Blog posts)
- Team/About pages
- Landing pages

### [industry-examples/](industry-examples/)
Industry-specific implementations:
- SaaS product pages
- E-commerce product catalogs
- Professional services portfolios
- B2B manufacturing technical specs
- Publisher article pages

### [automation/](automation/)
Programmatic schema generation:
- Database-to-schema transformers (PostgreSQL, MySQL, MongoDB)
- Bulk schema update tools
- Template-to-HTML generators
- CMS integration examples
- Automated update systems

### [llm-testing/](llm-testing/)
LLM comprehension testing tools:
- Entity extraction accuracy tests
- Relationship understanding verification
- General comprehension Q&A testing
- Support for OpenAI GPT-4 and Anthropic Claude
- Before/after optimization measurement

### [technical-docs-examples/](technical-docs-examples/)
LLMO applied to technical documentation:
- System design documentation (databases, APIs, authentication)
- Architecture patterns with schema markup
- Code examples with high information density
- Technical content optimization for LLM comprehension
- Follows system design curriculum structure

## 🚀 Quick Start

### 1. Schema Templates

Copy a template and fill in your data:

```bash
# Copy Organization template
cp schema-templates/organization.json my-organization.json

# Edit with your data
nano my-organization.json

# Validate
node validation/validate-schema.js my-organization.json
```

### 2. Complete Page Example

Start with a complete example and customize:

```bash
# Copy product page template
cp complete-examples/saas-product-page.html my-product.html

# Customize with your product data
# Validate schema and structure
node validation/validate-page.js my-product.html
```

### 3. Automate Schema Generation

Generate schemas from your database:

```bash
# PostgreSQL integration
export PGHOST=localhost PGUSER=user PGDATABASE=mydb
node automation/postgres-integration-example.js --output-dir ./schemas

# MySQL integration
export MYSQL_HOST=localhost MYSQL_USER=user
node automation/mysql-integration-example.js --output-dir ./schemas

# MongoDB integration
export MONGO_URI=mongodb://localhost:27017
node automation/mongodb-integration-example.js --output-dir ./schemas
```

### 4. Test LLM Comprehension

Test how LLMs understand your content:

```bash
# Entity extraction test
node llm-testing/entity-extraction-test.js complete-examples/saas-product-page.html --provider both

# Relationship understanding test
node llm-testing/relationship-test.js complete-examples/saas-product-page.html --provider both

# General comprehension test
node llm-testing/comprehension-test.js complete-examples/saas-product-page.html --provider both
```

### 5. Technical Documentation

Apply LLMO to your technical docs:

```bash
# See examples for databases, APIs, authentication, etc.
cat technical-docs-examples/07-api-design.md
cat technical-docs-examples/12-authentication.md
cat technical-docs-examples/02-databases.md

# Use as templates for your own technical documentation
```

## 📚 How to Use with the Book

Each code example is referenced in the corresponding book chapter:

- **Chapter 4-6 (Entity Definition)**: See `schema-templates/` for entity schemas
- **Chapter 7-9 (Semantic Structure)**: See `html-examples/` for hierarchy examples
- **Chapter 10-12 (Machine Parsing)**: See `schema-templates/` and `html-examples/`
- **Chapter 13-15 (Human Experience)**: See `complete-examples/` for full implementations
- **Chapter 16 (Strategy)**: See `automation/` for workflow tools
- **Chapter 17 (Technical)**: See `automation/`, `validation/`, and `llm-testing/`
- **Chapter 18 (Cross-Reference)**: See `complete-examples/` for linking patterns

**Industry Use Cases**: See `industry-examples/` for your specific industry

**Technical Documentation**: See `technical-docs-examples/` for applying LLMO to system design, API docs, and architecture documentation

## 🛠️ Prerequisites

### For Schema Templates
- Text editor (no special tools required)
- JSON validator (online or local)

### For Validation Scripts
```bash
npm install
# Installs: ajv, schema-dts, cheerio, axios
```

### For Testing Framework
```bash
npm install
# Installs: OpenAI, Anthropic, Google AI SDKs
# Set environment variables:
export OPENAI_API_KEY=your_key
export ANTHROPIC_API_KEY=your_key
export GOOGLE_AI_API_KEY=your_key
```

## 📖 Documentation

Each directory contains its own README with:
- Detailed usage instructions
- Code examples and explanations
- Best practices and common patterns
- Troubleshooting guides

## 🎯 Most Common Use Cases

### "I want to add schema to my product pages"
→ `schema-templates/product.json` + `complete-examples/product-page.html`

### "I need to optimize my SaaS product pages"
→ `industry-examples/saas/` (complete working examples)

### "How do I implement author schemas?"
→ `schema-templates/person.json` + `complete-examples/author-page.html`

### "I want to validate my existing schema"
→ `validation/validate-schema.js` (checks syntax and completeness)

### "How do I test if LLMs understand my content?"
→ `testing/llm-comprehension-test.js` (automated testing)

### "I need to generate schema from my database"
→ `automation/database-to-schema.js` (example implementation)

## 🔄 Updates and Contributions

This repository is actively maintained and updated with:
- New schema patterns as Schema.org evolves
- Updated LLM testing for new models
- Community-contributed examples
- Industry-specific templates

### Contributing Examples

Have a great LLMO implementation? Contribute it!

1. Fork the repository
2. Add your example to the appropriate directory
3. Include README with explanation
4. Submit pull request

## 📊 Example Quality Metrics

All examples in this repository demonstrate:
- ✅ Valid JSON-LD schema (zero errors)
- ✅ 80%+ property completeness scores
- ✅ Proper heading hierarchy (H1-H6)
- ✅ Semantic HTML5 elements
- ✅ 1-2 facts per sentence (information density)
- ✅ 15-25 word sentences (readability)
- ✅ Tested with multiple LLMs (ChatGPT, Claude, Gemini)

## 🆘 Troubleshooting

### Schema Validation Errors

**Error**: "Missing required property 'name'"
**Solution**: Every entity must have a name property. See `schema-templates/README.md`

**Error**: "Invalid @type value"
**Solution**: Use valid Schema.org types. See `schema-templates/type-reference.md`

### LLM Testing Issues

**Error**: "API key not found"
**Solution**: Set environment variables for API keys. See `testing/README.md`

**Error**: "Low citation accuracy"
**Solution**: Check schema completeness. Use `validation/completeness-checker.js`

## 📞 Support

- **Issues**: Open a GitHub issue
- **Questions**: See documentation in each directory
- **Discussions**: Join the community discussions

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🔗 Related Resources

- **Main Book**: [../README.md](../README.md) - Concepts and strategies
- **Schema.org**: Official schema vocabulary reference
- **Google Rich Results Test**: Validate schema rendering
- **JSON-LD Playground**: Test schema structure

---

**Ready to implement LLMO?** Start with the [schema-templates/](schema-templates/) directory for your entity type, or jump to [industry-examples/](industry-examples/) for complete industry-specific implementations.
