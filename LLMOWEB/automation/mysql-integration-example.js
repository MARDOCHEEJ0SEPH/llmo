#!/usr/bin/env node

/**
 * LLMO MySQL Integration Example
 * Demonstrates how to generate schema markup from MySQL database
 *
 * Usage: node mysql-integration-example.js [--output-dir ./output]
 */

const fs = require('fs');
const path = require('path');

// MySQL connection (install with: npm install mysql2)
let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.log('MySQL not installed. Run: npm install mysql2');
  console.log('This is an example script - install mysql2 to use it.');
  process.exit(1);
}

/**
 * Database Configuration
 * Set these via environment variables or config file
 */
const DB_CONFIG = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'your_user',
  password: process.env.MYSQL_PASSWORD || 'your_password',
  database: process.env.MYSQL_DATABASE || 'your_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

/**
 * Required Database Schema
 *
 * CREATE TABLE products (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(255) NOT NULL,
 *   description TEXT,
 *   sku VARCHAR(100),
 *   price DECIMAL(10,2),
 *   currency VARCHAR(3) DEFAULT 'USD',
 *   category_id INT,
 *   brand_id INT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
 *   INDEX idx_category (category_id),
 *   INDEX idx_brand (brand_id),
 *   INDEX idx_sku (sku)
 * );
 *
 * CREATE TABLE brands (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   name VARCHAR(255) NOT NULL,
 *   website VARCHAR(255)
 * );
 *
 * CREATE TABLE reviews (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   product_id INT,
 *   author_name VARCHAR(255),
 *   rating DECIMAL(2,1),
 *   review_text TEXT,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   FOREIGN KEY (product_id) REFERENCES products(id),
 *   INDEX idx_product (product_id)
 * );
 *
 * CREATE TABLE product_images (
 *   id INT PRIMARY KEY AUTO_INCREMENT,
 *   product_id INT,
 *   image_url VARCHAR(500),
 *   alt_text VARCHAR(255),
 *   position INT DEFAULT 0,
 *   FOREIGN KEY (product_id) REFERENCES products(id),
 *   INDEX idx_product_position (product_id, position)
 * );
 */

/**
 * Generate Product Schema from MySQL
 */
async function generateProductSchema(connection, productId) {
  // Query product with related data
  const [products] = await connection.execute(`
    SELECT
      p.*,
      b.name as brand_name,
      b.website as brand_website,
      (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
      (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
    FROM products p
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = ?
  `, [productId]);

  if (products.length === 0) {
    return null;
  }

  const product = products[0];

  // Get images
  const [images] = await connection.execute(`
    SELECT image_url, alt_text
    FROM product_images
    WHERE product_id = ?
    ORDER BY position ASC
  `, [productId]);

  // Get reviews (limit to recent 5)
  const [reviews] = await connection.execute(`
    SELECT author_name, rating, review_text, created_at
    FROM reviews
    WHERE product_id = ?
    ORDER BY created_at DESC
    LIMIT 5
  `, [productId]);

  // Build schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `https://your-site.com/products/${product.sku}#product`,
    "name": product.name,
    "description": product.description,
    "sku": product.sku,
    "image": images.map(img => img.image_url)
  };

  // Add brand
  if (product.brand_name) {
    schema.brand = {
      "@type": "Brand",
      "name": product.brand_name
    };

    if (product.brand_website) {
      schema.manufacturer = {
        "@type": "Organization",
        "name": product.brand_name,
        "url": product.brand_website
      };
    }
  }

  // Add offer
  schema.offers = {
    "@type": "Offer",
    "price": product.price.toString(),
    "priceCurrency": product.currency,
    "availability": "https://schema.org/InStock",
    "url": `https://your-site.com/products/${product.sku}`
  };

  // Add aggregate rating
  if (product.review_count > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": parseFloat(product.avg_rating).toFixed(1),
      "reviewCount": product.review_count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add reviews
  if (reviews.length > 0) {
    schema.review = reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author_name
      },
      "datePublished": review.created_at.toISOString().split('T')[0],
      "reviewBody": review.review_text,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5"
      }
    }));
  }

  return schema;
}

/**
 * Generate Organization Schema from MySQL
 */
async function generateOrganizationSchema(connection) {
  // This would typically query from a settings/config table
  // For this example, we'll use hardcoded values

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://your-site.com/#organization",
    "name": "Your Company Name",
    "url": "https://your-site.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://your-site.com/images/logo.png"
    }
  };

  // In production, query from database:
  // SELECT * FROM settings WHERE key = 'organization_info';

  return schema;
}

/**
 * Bulk generate schemas for all products
 */
async function generateAllProductSchemas(outputDir) {
  console.log('Connecting to MySQL database...');

  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    console.log('Connected successfully');

    // Get all product IDs
    const [products] = await connection.execute(
      'SELECT id, sku FROM products ORDER BY id'
    );

    console.log(`Found ${products.length} products`);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate organization schema once
    const orgSchema = await generateOrganizationSchema(connection);
    fs.writeFileSync(
      path.join(outputDir, 'organization.json'),
      JSON.stringify(orgSchema, null, 2)
    );
    console.log('✓ Generated organization.json');

    // Generate product schemas
    for (const product of products) {
      try {
        const schema = await generateProductSchema(connection, product.id);

        if (schema) {
          const filename = `product-${product.sku}.json`;
          fs.writeFileSync(
            path.join(outputDir, filename),
            JSON.stringify(schema, null, 2)
          );
          console.log(`✓ Generated ${filename}`);
        }
      } catch (error) {
        console.error(`✗ Error generating schema for product ${product.id}:`, error.message);
      }
    }

    console.log(`\n✅ Generated ${products.length + 1} schema files in ${outputDir}`);

  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

/**
 * Incremental update - only regenerate changed products
 */
async function incrementalUpdate(outputDir, sinceDate) {
  const connection = await mysql.createConnection(DB_CONFIG);

  try {
    // Query products updated since last run
    const [products] = await connection.execute(
      'SELECT id, sku FROM products WHERE updated_at > ? ORDER BY updated_at DESC',
      [sinceDate]
    );

    console.log(`Found ${products.length} products updated since ${sinceDate}`);

    for (const product of products) {
      const schema = await generateProductSchema(connection, product.id);

      if (schema) {
        const filename = `product-${product.sku}.json`;
        fs.writeFileSync(
          path.join(outputDir, filename),
          JSON.stringify(schema, null, 2)
        );
        console.log(`✓ Updated ${filename}`);
      }
    }

    console.log(`✅ Updated ${products.length} schemas`);

  } finally {
    await connection.end();
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output-dir');
  const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : path.join(__dirname, 'output');

  const incrementalIndex = args.indexOf('--since');
  const sinceDate = incrementalIndex !== -1 ? args[incrementalIndex + 1] : null;

  console.log('LLMO MySQL Schema Generator');
  console.log('===========================');

  if (sinceDate) {
    incrementalUpdate(outputDir, sinceDate)
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else {
    generateAllProductSchemas(outputDir)
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  }
}

module.exports = {
  generateProductSchema,
  generateOrganizationSchema,
  generateAllProductSchemas,
  incrementalUpdate
};
