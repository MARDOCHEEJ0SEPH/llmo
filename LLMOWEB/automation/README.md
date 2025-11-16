# Automation Tools

Programmatic schema generation, bulk processing, and automated maintenance.

## 🤖 Implemented Tools

### Database Integration (Production-Ready)
- **postgres-integration-example.js** - PostgreSQL integration with connection pooling, complex joins
- **mysql-integration-example.js** - MySQL integration with relational data handling
- **mongodb-integration-example.js** - MongoDB integration for NoSQL databases
- **database-to-schema-example.js** - Mock database example for learning

### Bulk Operations
- **bulk-schema-update.js** - Update properties across multiple schema files
- **template-to-html-generator.js** - Generate complete HTML pages from schema templates

### Additional Tool Ideas

These tools demonstrate automation patterns but are not yet implemented:

- **csv-to-schema.js** - Bulk import from CSV files
- **api-to-schema.js** - Fetch data from REST API and generate schema
- **cms-plugin-example.js** - CMS integration example
- **batch-validator.js** - Validate large numbers of schema files
- **update-propagation.js** - Update all instances when entity changes
- **auto-update-prices.js** - Sync pricing from database daily
- **auto-update-availability.js** - Real-time inventory sync
- **scheduled-validation.js** - Weekly schema health checks

## 💡 Why Automate?

### Manual vs. Automated

**Manual Schema Creation**:
- ❌ 15-30 minutes per product
- ❌ Human errors (typos, inconsistencies)
- ❌ Difficult to maintain at scale
- ❌ Updates require re-editing each file
- ❌ 100 products = 25-50 hours of work

**Automated Schema Generation**:
- ✅ Seconds for 1,000s of products
- ✅ Consistent, error-free output
- ✅ Scales effortlessly
- ✅ Updates propagate automatically
- ✅ 100 products = 5 minutes setup + instant generation

## 🚀 Quick Start

### PostgreSQL Integration

Generate schemas from PostgreSQL database with production-ready connection pooling:

```bash
# Set environment variables
export PGHOST=localhost
export PGPORT=5432
export PGUSER=your_user
export PGPASSWORD=your_password
export PGDATABASE=your_database

# Generate all product schemas
node postgres-integration-example.js --output-dir ./output

# Incremental update (only changed products)
node postgres-integration-example.js --output-dir ./output --since "2024-01-01"
```

**Features:**
- ✅ Connection pooling for performance
- ✅ Complex joins (products + brands + reviews + images + specifications)
- ✅ Aggregate rating calculations
- ✅ Incremental updates
- ✅ Complete Organization schema generation

### MySQL Integration

Generate schemas from MySQL database:

```bash
# Set environment variables
export MYSQL_HOST=localhost
export MYSQL_PORT=3306
export MYSQL_USER=your_user
export MYSQL_PASSWORD=your_password
export MYSQL_DATABASE=your_database

# Generate all product schemas
node mysql-integration-example.js --output-dir ./output

# Incremental update
node mysql-integration-example.js --output-dir ./output --since "2024-01-01 00:00:00"
```

**Required Tables:**
- `products` - Product information
- `brands` - Brand data
- `reviews` - Customer reviews
- `product_images` - Product images

### MongoDB Integration

Generate schemas from MongoDB collections:

```bash
# Set environment variables
export MONGO_URI="mongodb://localhost:27017"
export MONGO_DB="your_database"

# Generate all schemas (products, articles, organization)
node mongodb-integration-example.js --output-dir ./output --base-url https://your-site.com

# Incremental update
node mongodb-integration-example.js --output-dir ./output --since "2024-01-01"
```

**Supported Collections:**
- `products` - Product documents
- `articles` - Blog/news articles
- `organizations` - Company information

### Bulk Schema Update

Update properties across many schema files at once:

```bash
# Update @context to new URL
node bulk-schema-update.js --dir ./output --update-context https://schema.org

# Add publisher to all schemas
node bulk-schema-update.js --dir ./output --add-property publisher --value '{"@id":"https://site.com/#org"}'

# Change domain across all URLs
node bulk-schema-update.js --dir ./output --update-urls old-site.com new-site.com

# Add missing required properties with placeholders
node bulk-schema-update.js --dir ./output --add-missing-required

# Preview changes without modifying files
node bulk-schema-update.js --dir ./output --add-property author --value '{"@type":"Person","name":"John"}' --dry-run
```

**Operations:**
- `--update-context <url>` - Update @context to new URL
- `--add-property <name> --value <json>` - Add or update a property
- `--remove-property <name>` - Remove a property
- `--rename-property <old> <new>` - Rename a property
- `--update-urls <old-domain> <new-domain>` - Update all URLs
- `--add-missing-required` - Add missing required properties
- `--dry-run` - Preview changes without modifying files

### Template-to-HTML Generator

Generate complete HTML pages from schema templates:

```bash
# Generate product page
node template-to-html-generator.js --schema product.json --output product-page.html

# Generate organization about page
node template-to-html-generator.js --schema organization.json --output about.html

# Generate article page
node template-to-html-generator.js --schema article.json --output blog-post.html
```

**Supported Schema Types:**
- `Product` - E-commerce product pages with pricing, reviews, specifications
- `SoftwareApplication` - SaaS product pages with pricing tiers, features
- `Organization` - About pages with contact info, social links
- `Article` / `NewsArticle` - Blog posts with author, publish date
- Generic fallback for other types

## 📖 Detailed Tool Documentation

### postgres-integration-example.js

**Purpose:** Production-ready PostgreSQL integration with complex joins and connection pooling.

**Database Requirements:**
```sql
-- Required tables structure
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  price DECIMAL(10,2),
  brand_id INT,
  category_id INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE brands (...);
CREATE TABLE reviews (...);
CREATE TABLE product_images (...);
CREATE TABLE product_specifications (...);
```

**Usage:**
```bash
node postgres-integration-example.js [--output-dir ./output] [--since "2024-01-01"]
```

**Output:**
- `organization.json` - Organization schema
- `product-{sku}.json` - One file per product with complete data

### mysql-integration-example.js

**Purpose:** MySQL database integration with relational data handling.

**Features:**
- LEFT JOIN support for related tables
- JSON aggregation not used (uses multiple queries)
- Handles NULL values gracefully
- Supports incremental updates via timestamp

**Usage:**
```bash
node mysql-integration-example.js [--output-dir ./output] [--since "2024-01-01 00:00:00"]
```

### mongodb-integration-example.js

**Purpose:** NoSQL MongoDB integration for document-based data.

**Document Structure:**
```javascript
// products collection
{
  _id: ObjectId("..."),
  name: "Product Name",
  description: "Description",
  price: 99.99,
  brand: { name: "Brand", website: "https://..." },
  reviews: [{ author: "...", rating: 5, text: "..." }],
  specifications: { weight: "250g", ... },
  images: [{ url: "...", alt: "..." }]
}
```

**Advantages:**
- Schema-less flexibility
- Embedded documents reduce joins
- Native array support

**Usage:**
```bash
node mongodb-integration-example.js [--output-dir ./output] [--base-url https://site.com] [--since "2024-01-01"]
```

### bulk-schema-update.js

**Purpose:** Update multiple schema files simultaneously.

**Use Cases:**
1. **Domain Migration:** Update all URLs when changing domains
2. **Schema Standardization:** Add missing properties across all files
3. **Property Renaming:** Rename properties consistently
4. **Publisher Addition:** Add publisher reference to all articles

**Examples:**
```bash
# Add breadcrumb to all product schemas
node bulk-schema-update.js --dir ./products --add-property breadcrumb --value '{"@type":"BreadcrumbList",...}'

# Remove deprecated property
node bulk-schema-update.js --dir ./schemas --remove-property oldPropertyName

# Update nested property
node bulk-schema-update.js --dir ./schemas --add-property "offers.priceCurrency" --value '"EUR"'
```

**Safety Features:**
- `--dry-run` mode to preview changes
- Validation before writing
- Preserves JSON formatting
- Reports success/failure per file

### template-to-html-generator.js

**Purpose:** Generate complete, valid HTML pages from JSON-LD schemas.

**Generated Pages Include:**
- Valid HTML5 structure
- Embedded JSON-LD schema (properly formatted)
- Semantic HTML elements
- Responsive CSS
- Content extracted from schema properties

**Templates:**
- **Product:** Grid layout with images, pricing, reviews, specifications
- **SoftwareApplication:** Hero section, pricing cards, features list, screenshots
- **Organization:** About page with logo, contact info, social links
- **Article:** Blog post layout with author, date, featured image

**Customization:**
Edit the generator functions to match your design system:
```javascript
// In template-to-html-generator.js
function generateProductHTML(schema) {
  // Modify HTML template here
  return `<!DOCTYPE html>...`;
}
```

## 📋 Detailed Examples

### Generate Product Schema from Database

```javascript
// Example: products table → Product schema

const products = await db.query('SELECT * FROM products');

products.forEach(product => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://yoursite.com/products/${product.slug}#product`,
    "name": product.name,
    "description": product.description,
    "sku": product.sku,
    "image": product.images.map(img => img.url),
    "brand": {
      "@type": "Brand",
      "name": product.brand_name
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
    }
  };

  fs.writeFileSync(
    `./output/products/${product.slug}.json`,
    JSON.stringify(schema, null, 2)
  );
});
```

### Generate Person Schema from Team Database

```javascript
// Example: employees table → Person schema

const employees = await db.query(`
  SELECT e.*, d.name as department
  FROM employees e
  JOIN departments d ON e.department_id = d.id
  WHERE e.public_profile = true
`);

employees.forEach(emp => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `https://yoursite.com/team/${emp.slug}#person`,
    "name": emp.full_name,
    "jobTitle": emp.job_title,
    "worksFor": {
      "@type": "Organization",
      "@id": "https://yoursite.com/#organization"
    },
    "email": emp.public_email,
    "image": emp.photo_url,
    "knowsAbout": emp.expertise_areas.split(','),
    "sameAs": [
      emp.linkedin_url,
      emp.twitter_url
    ].filter(Boolean)
  };

  fs.writeFileSync(
    `./output/team/${emp.slug}.json`,
    JSON.stringify(schema, null, 2)
  );
});
```

## 📖 Tool Documentation

### database-to-schema.js

Generate schema from database queries.

**Usage**:
```bash
node database-to-schema.js --type=product --table=products --output=./output/
```

**Configuration** (database-config.json):
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "production",
    "user": "admin",
    "password": "***"
  },
  "mappings": {
    "product": {
      "table": "products",
      "schemaType": "Product",
      "properties": {
        "name": "product_name",
        "description": "product_description",
        "sku": "sku",
        "price": "current_price",
        "image": {
          "sql": "SELECT url FROM product_images WHERE product_id = $1",
          "multiple": true
        }
      }
    }
  }
}
```

**Features**:
- ✅ SQL query to JSON-LD transformation
- ✅ Join support for related data
- ✅ Array/multiple value handling
- ✅ Custom field mapping
- ✅ Validation on generation
- ✅ Incremental updates (only changed records)

### csv-to-schema.js

Bulk import from CSV files.

**Usage**:
```bash
node csv-to-schema.js products.csv --type=Product --output=./schemas/
```

**CSV Format**:
```csv
name,description,sku,price,brand,image_url,stock
"Acme Widget","High quality widget",WID-001,99.99,"Acme","https://...",50
"Acme Gadget","Useful gadget",GAD-002,49.99,"Acme","https://...",100
```

**Generated Schema** (automatic):
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Acme Widget",
  "description": "High quality widget",
  "sku": "WID-001",
  "offers": {
    "@type": "Offer",
    "price": "99.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "brand": {
    "@type": "Brand",
    "name": "Acme"
  },
  "image": "https://..."
}
```

### bulk-generate.js

Generate schema for large datasets.

**Usage**:
```bash
# Generate schema for 10,000 products
node bulk-generate.js --source=database --type=product --batch-size=100

# Progress output:
Generating schemas...
[====================] 100% (10,000/10,000)
Generated: 10,000 schemas
Validated: 10,000 (100% valid)
Time: 45 seconds
```

**Features**:
- ✅ Batch processing (memory efficient)
- ✅ Progress tracking
- ✅ Parallel generation
- ✅ Automatic validation
- ✅ Error recovery (continues on error)
- ✅ Incremental mode (only new/changed)

### auto-update-prices.js

Real-time price synchronization.

**Setup**:
```javascript
// Schedule to run every hour
const cron = require('node-cron');

cron.schedule('0 * * * *', async () => {
  console.log('Updating prices...');

  const changedProducts = await db.query(`
    SELECT id, slug, price, special_price, sale_end_date
    FROM products
    WHERE price_updated_at > NOW() - INTERVAL '1 hour'
  `);

  for (const product of changedProducts) {
    const schemaPath = `./schemas/products/${product.slug}.json`;
    const schema = JSON.parse(fs.readFileSync(schemaPath));

    // Update price
    schema.offers.price = product.special_price || product.price;

    // Add sale end date if applicable
    if (product.sale_end_date) {
      schema.offers.priceValidUntil = product.sale_end_date;
    }

    // Write updated schema
    fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));

    console.log(`Updated: ${product.slug} → $${schema.offers.price}`);
  }

  console.log(`Updated ${changedProducts.length} product schemas`);
});
```

## 🔄 Common Automation Patterns

### Pattern 1: Database → Schema → HTML

Complete workflow from database to page:

```javascript
// 1. Fetch from database
const product = await db.products.findOne({ id: productId });

// 2. Generate schema
const schema = generateProductSchema(product);

// 3. Validate schema
const validation = validateSchema(schema);
if (!validation.valid) {
  throw new Error(`Invalid schema: ${validation.errors}`);
}

// 4. Inject into HTML template
const html = renderTemplate('product-page.html', {
  product: product,
  schema: schema
});

// 5. Write output
fs.writeFileSync(`./dist/products/${product.slug}.html`, html);
```

### Pattern 2: CMS Integration

Hook into CMS save events:

```javascript
// WordPress example
add_action('save_post', function($post_id) {
  $post = get_post($post_id);

  if ($post->post_type === 'product') {
    $schema = [
      '@context' => 'https://schema.org',
      '@type' => 'Product',
      'name' => $post->post_title,
      'description' => get_field('product_description', $post_id),
      'sku' => get_field('sku', $post_id),
      'offers' => [
        '@type' => 'Offer',
        'price' => get_field('price', $post_id),
        'priceCurrency' => 'USD'
      ]
    ];

    // Save as custom field
    update_post_meta($post_id, '_product_schema', json_encode($schema));

    // Or write to file
    file_put_contents(
      "/schemas/products/{$post->post_name}.json",
      json_encode($schema, JSON_PRETTY_PRINT)
    );
  }
});
```

### Pattern 3: API Integration

Fetch data from external API:

```javascript
// Fetch from Shopify API
const shopify = require('shopify-api-node');
const shop = new shopify({ /* credentials */ });

const products = await shop.product.list();

products.forEach(product => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.body_html.replace(/<[^>]*>/g, ''), // Strip HTML
    "sku": product.variants[0].sku,
    "image": product.images.map(img => img.src),
    "offers": product.variants.map(variant => ({
      "@type": "Offer",
      "name": variant.title,
      "price": variant.price,
      "priceCurrency": "USD",
      "availability": variant.inventory_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock"
    }))
  };

  // Save schema
  saveSchema(`products/${product.handle}.json`, schema);
});
```

## 📊 Performance Optimization

### Parallel Processing

Generate multiple schemas simultaneously:

```javascript
const { Worker } = require('worker_threads');

async function generateInParallel(products, numWorkers = 4) {
  const chunks = chunkArray(products, Math.ceil(products.length / numWorkers));
  const workers = [];

  for (let i = 0; i < numWorkers; i++) {
    workers.push(
      new Worker('./schema-generator-worker.js', {
        workerData: chunks[i]
      })
    );
  }

  const results = await Promise.all(
    workers.map(w => new Promise(resolve => w.on('message', resolve)))
  );

  return results.flat();
}

// Generate 10,000 schemas in parallel
const schemas = await generateInParallel(products, 8);
// Time: 12 seconds (vs 90 seconds sequential)
```

### Caching

Cache expensive operations:

```javascript
const cache = new Map();

function getProductSchema(productId) {
  // Check cache first
  const cached = cache.get(productId);
  if (cached && !isStale(cached)) {
    return cached.schema;
  }

  // Generate if not cached
  const product = fetchProduct(productId);
  const schema = generateSchema(product);

  // Cache with timestamp
  cache.set(productId, {
    schema: schema,
    timestamp: Date.now()
  });

  return schema;
}

function isStale(cached) {
  const MAX_AGE = 3600000; // 1 hour
  return Date.now() - cached.timestamp > MAX_AGE;
}
```

### Incremental Updates

Only regenerate changed entities:

```javascript
async function incrementalUpdate() {
  // Find products modified in last hour
  const changed = await db.query(`
    SELECT id, slug
    FROM products
    WHERE updated_at > NOW() - INTERVAL '1 hour'
  `);

  console.log(`Found ${changed.length} changed products`);

  for (const product of changed) {
    const schema = await generateProductSchema(product.id);
    await saveSchema(`products/${product.slug}.json`, schema);
    console.log(`Updated: ${product.slug}`);
  }

  return changed.length;
}

// Run every hour
setInterval(incrementalUpdate, 3600000);
```

## 🧪 Testing Automated Generation

Verify generated schemas:

```javascript
const assert = require('assert');

describe('Product Schema Generation', () => {
  it('should generate valid Product schema', () => {
    const product = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      sku: 'TEST-001'
    };

    const schema = generateProductSchema(product);

    assert.equal(schema['@type'], 'Product');
    assert.equal(schema.name, 'Test Product');
    assert.equal(schema.offers.price, '99.99');
    assert(validateSchema(schema).valid);
  });

  it('should handle missing optional fields', () => {
    const product = {
      name: 'Minimal Product',
      price: 49.99
    };

    const schema = generateProductSchema(product);

    assert.equal(schema['@type'], 'Product');
    assert(schema.name);
    assert(schema.offers);
    // Should not have undefined/null properties
    assert(!schema.sku);
  });

  it('should generate schema for 1000 products quickly', () => {
    const start = Date.now();
    const products = generateMockProducts(1000);

    products.forEach(p => generateProductSchema(p));

    const duration = Date.now() - start;
    assert(duration < 5000, `Took ${duration}ms, expected < 5000ms`);
  });
});
```

## 📚 Further Reading

- **LLMO Book Chapter 17**: Technical Optimization
- **Database Integration Examples**: ./examples/
- **CMS Plugins**: ./cms-plugins/
- **API Integration Guides**: ./api-integrations/

---

**Ready to automate?** Start with `database-to-schema.js` or `csv-to-schema.js` depending on your data source. Automate once, benefit forever.
