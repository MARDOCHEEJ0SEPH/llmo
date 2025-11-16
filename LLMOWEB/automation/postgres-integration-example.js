#!/usr/bin/env node

/**
 * PostgreSQL to Schema Generator
 * Production-ready example for generating schema from PostgreSQL database
 *
 * Installation:
 * npm install pg dotenv
 *
 * Usage:
 * node postgres-integration-example.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration (use environment variables in production)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'production',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

/**
 * Generate Product schema from PostgreSQL database
 */
async function generateProductSchemas() {
  const client = await pool.connect();

  try {
    console.log('🔌 Connected to PostgreSQL database');
    console.log('📊 Fetching products...\n');

    // Fetch products with related data (reviews, images, specifications)
    const productQuery = `
      SELECT
        p.id,
        p.slug,
        p.name,
        p.description,
        p.sku,
        p.price,
        p.stock_quantity,
        p.created_at,
        p.updated_at,
        b.name as brand_name,
        b.url as brand_url,
        c.name as category_name,
        c.slug as category_slug,
        -- Aggregate ratings
        AVG(r.rating)::numeric(3,2) as avg_rating,
        COUNT(r.id) as review_count,
        -- Aggregate images as JSON array
        json_agg(DISTINCT jsonb_build_object(
          'url', pi.url,
          'alt', pi.alt_text,
          'position', pi.position
        )) FILTER (WHERE pi.url IS NOT NULL) as images,
        -- Aggregate specifications as JSON array
        json_agg(DISTINCT jsonb_build_object(
          'name', ps.spec_name,
          'value', ps.spec_value,
          'unit', ps.unit
        )) FILTER (WHERE ps.spec_name IS NOT NULL) as specifications
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_specifications ps ON p.id = ps.product_id
      LEFT JOIN reviews r ON p.id = r.product_id
      WHERE p.is_active = true
        AND p.updated_at > NOW() - INTERVAL '7 days'  -- Only recent updates
      GROUP BY p.id, b.name, b.url, c.name, c.slug
      ORDER BY p.updated_at DESC
      LIMIT 100
    `;

    const productsResult = await client.query(productQuery);
    console.log(`✓ Found ${productsResult.rows.length} products\n`);

    // Fetch reviews separately for each product
    const reviewQuery = `
      SELECT
        r.id,
        r.product_id,
        r.rating,
        r.review_text,
        r.created_at,
        u.name as author_name,
        u.verified_purchase
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ANY($1)
        AND r.is_approved = true
      ORDER BY r.created_at DESC
    `;

    const productIds = productsResult.rows.map(p => p.id);
    const reviewsResult = await client.query(reviewQuery, [productIds]);

    // Group reviews by product_id
    const reviewsByProduct = reviewsResult.rows.reduce((acc, review) => {
      if (!acc[review.product_id]) acc[review.product_id] = [];
      acc[review.product_id].push(review);
      return acc;
    }, {});

    console.log(`✓ Found ${reviewsResult.rows.length} reviews\n`);

    // Generate schemas
    const outputDir = path.join(__dirname, 'output', 'postgres');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let generatedCount = 0;

    for (const product of productsResult.rows) {
      const reviews = reviewsByProduct[product.id] || [];
      const schema = buildProductSchema(product, reviews);

      // Write to file
      const filename = `${product.slug}.json`;
      const filepath = path.join(outputDir, filename);
      fs.writeFileSync(filepath, JSON.stringify(schema, null, 2));

      console.log(`✓ Generated: ${filename} (${reviews.length} reviews)`);
      generatedCount++;
    }

    console.log(`\n✅ Successfully generated ${generatedCount} product schemas`);
    console.log(`📁 Output directory: ${outputDir}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Build Product schema object from database row
 */
function buildProductSchema(product, reviews = []) {
  const baseUrl = process.env.SITE_URL || 'https://yoursite.com';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseUrl}/products/${product.slug}#product`,

    // Essential properties
    "name": product.name,
    "description": product.description,
    "sku": product.sku,
    "url": `${baseUrl}/products/${product.slug}`,

    // Brand
    "brand": {
      "@type": "Brand",
      "name": product.brand_name,
      ...(product.brand_url && { "url": product.brand_url })
    },

    // Category
    "category": product.category_name,

    // Pricing and availability
    "offers": {
      "@type": "Offer",
      "price": parseFloat(product.price).toFixed(2),
      "priceCurrency": "USD",
      "availability": product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": `${baseUrl}/products/${product.slug}`,
      "seller": {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`
      }
    }
  };

  // Add images if available
  if (product.images && product.images.length > 0) {
    schema.image = product.images
      .sort((a, b) => a.position - b.position)
      .map(img => ({
        "@type": "ImageObject",
        "url": img.url,
        "caption": img.alt
      }));
  }

  // Add specifications if available
  if (product.specifications && product.specifications.length > 0) {
    schema.additionalProperty = product.specifications.map(spec => ({
      "@type": "PropertyValue",
      "name": spec.name,
      "value": spec.value,
      ...(spec.unit && { "unitCode": spec.unit })
    }));
  }

  // Add aggregate rating if available
  if (product.avg_rating && product.review_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": parseFloat(product.avg_rating).toFixed(1),
      "reviewCount": product.review_count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add reviews (top 5 most recent)
  if (reviews.length > 0) {
    schema.review = reviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author_name
      },
      "datePublished": review.created_at.toISOString().split('T')[0],
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5"
      },
      "reviewBody": review.review_text,
      ...(review.verified_purchase && { "itemReviewed": { "@id": schema["@id"] } })
    }));
  }

  // Add dates
  if (product.created_at) {
    schema.releaseDate = product.created_at.toISOString().split('T')[0];
  }
  if (product.updated_at) {
    schema.dateModified = product.updated_at.toISOString().split('T')[0];
  }

  return schema;
}

/**
 * Generate Organization schema from company settings table
 */
async function generateOrganizationSchema() {
  const client = await pool.connect();

  try {
    const query = `
      SELECT
        s.company_name,
        s.company_legal_name,
        s.company_description,
        s.founding_date,
        s.company_email,
        s.company_phone,
        s.address_street,
        s.address_city,
        s.address_state,
        s.address_zip,
        s.address_country,
        s.logo_url,
        s.website_url,
        json_agg(DISTINCT sm.url) FILTER (WHERE sm.url IS NOT NULL) as social_urls
      FROM settings s
      LEFT JOIN social_media sm ON s.id = sm.settings_id
      WHERE s.id = 1
      GROUP BY s.id
    `;

    const result = await client.query(query);
    const company = result.rows[0];

    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${company.website_url}/#organization`,
      "name": company.company_name,
      "legalName": company.company_legal_name,
      "url": company.website_url,
      "logo": {
        "@type": "ImageObject",
        "url": company.logo_url
      },
      "description": company.company_description,
      "foundingDate": company.founding_date,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": company.address_street,
        "addressLocality": company.address_city,
        "addressRegion": company.address_state,
        "postalCode": company.address_zip,
        "addressCountry": company.address_country
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": company.company_phone,
        "email": company.company_email,
        "contactType": "customer service"
      },
      "sameAs": company.social_urls || []
    };

    const outputPath = path.join(__dirname, 'output', 'postgres', 'organization.json');
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    console.log('✓ Generated: organization.json');

    return schema;
  } finally {
    client.release();
  }
}

/**
 * Incremental update - only regenerate changed products
 */
async function incrementalUpdate(lastRunTimestamp) {
  const client = await pool.connect();

  try {
    const query = `
      SELECT id, slug
      FROM products
      WHERE updated_at > $1
        AND is_active = true
    `;

    const result = await client.query(query, [lastRunTimestamp]);
    console.log(`📊 Found ${result.rows.length} products updated since ${lastRunTimestamp}`);

    // Generate schemas only for changed products
    // (Implementation similar to generateProductSchemas but with WHERE clause)

    return result.rows.length;
  } finally {
    client.release();
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 PostgreSQL to Schema Generator\n');
    console.log('================================\n');

    // Generate organization schema
    await generateOrganizationSchema();
    console.log('');

    // Generate product schemas
    await generateProductSchemas();

    console.log('\n✅ Schema generation complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Review generated schemas in ./output/postgres/');
    console.log('   2. Validate: node ../validation/validate-schema.js output/postgres/[filename].json');
    console.log('   3. Deploy to production');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = {
  generateProductSchemas,
  generateOrganizationSchema,
  incrementalUpdate,
  buildProductSchema
};

/*
DATABASE SCHEMA REQUIREMENTS:

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  sku VARCHAR(100),
  price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  brand_id INTEGER REFERENCES brands(id),
  category_id INTEGER REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500)
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(500),
  position INTEGER DEFAULT 0
);

CREATE TABLE product_specifications (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  spec_name VARCHAR(255) NOT NULL,
  spec_value VARCHAR(500) NOT NULL,
  unit VARCHAR(50)
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  user_id INTEGER REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  verified_purchase BOOLEAN DEFAULT false
);

INDEXES FOR PERFORMANCE:
CREATE INDEX idx_products_updated ON products(updated_at);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
*/
