#!/usr/bin/env node

/**
 * LLMO MongoDB Integration Example
 * Demonstrates how to generate schema markup from MongoDB database
 *
 * Usage: node mongodb-integration-example.js [--output-dir ./output]
 */

const fs = require('fs');
const path = require('path');

// MongoDB connection (install with: npm install mongodb)
let MongoClient;
try {
  MongoClient = require('mongodb').MongoClient;
} catch (e) {
  console.log('MongoDB not installed. Run: npm install mongodb');
  console.log('This is an example script - install mongodb to use it.');
  process.exit(1);
}

/**
 * Database Configuration
 */
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGO_DB || 'your_database';

/**
 * Example MongoDB Document Structure
 *
 * products collection:
 * {
 *   _id: ObjectId("..."),
 *   name: "Product Name",
 *   description: "Product description",
 *   sku: "PROD-123",
 *   price: 99.99,
 *   currency: "USD",
 *   brand: {
 *     name: "Brand Name",
 *     website: "https://brand.com"
 *   },
 *   images: [
 *     { url: "https://...", alt: "..." },
 *     { url: "https://...", alt: "..." }
 *   ],
 *   reviews: [
 *     {
 *       author: "John Doe",
 *       rating: 5,
 *       text: "Great product!",
 *       date: ISODate("2024-01-15T10:00:00Z")
 *     }
 *   ],
 *   specifications: {
 *     weight: "250g",
 *     dimensions: "10x10x5cm",
 *     material: "Aluminum"
 *   },
 *   category: "Electronics",
 *   tags: ["wireless", "bluetooth", "audio"],
 *   inStock: true,
 *   createdAt: ISODate("2024-01-01T00:00:00Z"),
 *   updatedAt: ISODate("2024-01-15T00:00:00Z")
 * }
 *
 * organizations collection:
 * {
 *   _id: ObjectId("..."),
 *   name: "Company Name",
 *   legalName: "Company Legal Name Inc.",
 *   website: "https://company.com",
 *   description: "Company description",
 *   logo: "https://company.com/logo.png",
 *   foundingDate: "2020-01-01",
 *   address: {
 *     street: "123 Main St",
 *     city: "San Francisco",
 *     state: "CA",
 *     postalCode: "94105",
 *     country: "US"
 *   },
 *   contactPoint: {
 *     type: "customer service",
 *     telephone: "+1-800-555-0100",
 *     email: "support@company.com"
 *   },
 *   socialLinks: {
 *     linkedin: "https://linkedin.com/company/...",
 *     twitter: "https://twitter.com/..."
 *   }
 * }
 */

/**
 * Generate Product Schema from MongoDB document
 */
function generateProductSchema(product, baseUrl = 'https://your-site.com') {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseUrl}/products/${product.sku}#product`,
    "name": product.name,
    "description": product.description,
    "sku": product.sku
  };

  // Add images
  if (product.images && product.images.length > 0) {
    schema.image = product.images.map(img => img.url);
  }

  // Add brand
  if (product.brand) {
    schema.brand = {
      "@type": "Brand",
      "name": product.brand.name
    };

    if (product.brand.website) {
      schema.manufacturer = {
        "@type": "Organization",
        "name": product.brand.name,
        "url": product.brand.website
      };
    }
  }

  // Add offer
  schema.offers = {
    "@type": "Offer",
    "price": product.price.toFixed(2),
    "priceCurrency": product.currency || "USD",
    "availability": product.inStock
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    "url": `${baseUrl}/products/${product.sku}`
  };

  // Add aggregate rating
  if (product.reviews && product.reviews.length > 0) {
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = totalRating / product.reviews.length;

    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": avgRating.toFixed(1),
      "reviewCount": product.reviews.length.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };

    // Add individual reviews (limit to 5 most recent)
    schema.review = product.reviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.author
        },
        "datePublished": new Date(review.date).toISOString().split('T')[0],
        "reviewBody": review.text,
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating.toString(),
          "bestRating": "5"
        }
      }));
  }

  // Add category
  if (product.category) {
    schema.category = product.category;
  }

  // Add specifications as additionalProperty
  if (product.specifications) {
    schema.additionalProperty = Object.entries(product.specifications).map(([key, value]) => ({
      "@type": "PropertyValue",
      "name": key.charAt(0).toUpperCase() + key.slice(1),
      "value": value
    }));
  }

  return schema;
}

/**
 * Generate Organization Schema from MongoDB document
 */
function generateOrganizationSchema(org, baseUrl = 'https://your-site.com') {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": org.name,
    "url": org.website || baseUrl
  };

  if (org.legalName) {
    schema.legalName = org.legalName;
  }

  if (org.description) {
    schema.description = org.description;
  }

  if (org.logo) {
    schema.logo = {
      "@type": "ImageObject",
      "url": org.logo
    };
  }

  if (org.foundingDate) {
    schema.foundingDate = org.foundingDate;
  }

  if (org.address) {
    schema.address = {
      "@type": "PostalAddress",
      "streetAddress": org.address.street,
      "addressLocality": org.address.city,
      "addressRegion": org.address.state,
      "postalCode": org.address.postalCode,
      "addressCountry": org.address.country
    };
  }

  if (org.contactPoint) {
    schema.contactPoint = {
      "@type": "ContactPoint",
      "contactType": org.contactPoint.type || "customer service",
      "telephone": org.contactPoint.telephone,
      "email": org.contactPoint.email
    };
  }

  if (org.socialLinks) {
    schema.sameAs = Object.values(org.socialLinks).filter(Boolean);
  }

  return schema;
}

/**
 * Generate Article Schema from MongoDB document
 */
function generateArticleSchema(article, baseUrl = 'https://your-site.com') {
  const schema = {
    "@context": "https://schema.org",
    "@type": article.type === 'news' ? "NewsArticle" : "Article",
    "@id": `${baseUrl}/articles/${article.slug}#article`,
    "headline": article.title,
    "description": article.excerpt,
    "articleBody": article.content,
    "datePublished": new Date(article.publishedAt).toISOString(),
    "dateModified": new Date(article.updatedAt).toISOString()
  };

  // Add author
  if (article.author) {
    schema.author = {
      "@type": "Person",
      "name": article.author.name
    };

    if (article.author.url) {
      schema.author.url = article.author.url;
    }
  }

  // Add publisher (link to organization)
  schema.publisher = {
    "@id": `${baseUrl}/#organization`
  };

  // Add featured image
  if (article.featuredImage) {
    schema.image = {
      "@type": "ImageObject",
      "url": article.featuredImage.url,
      "width": article.featuredImage.width,
      "height": article.featuredImage.height
    };
  }

  // Add keywords
  if (article.tags && article.tags.length > 0) {
    schema.keywords = article.tags.join(', ');
  }

  // Add word count
  if (article.wordCount) {
    schema.wordCount = article.wordCount;
  }

  return schema;
}

/**
 * Bulk generate schemas from MongoDB
 */
async function generateAllSchemas(outputDir, baseUrl = 'https://your-site.com') {
  console.log('Connecting to MongoDB...');

  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    console.log('Connected successfully');

    const db = client.db(DB_NAME);

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate organization schema
    const orgCollection = db.collection('organizations');
    const org = await orgCollection.findOne({});

    if (org) {
      const orgSchema = generateOrganizationSchema(org, baseUrl);
      fs.writeFileSync(
        path.join(outputDir, 'organization.json'),
        JSON.stringify(orgSchema, null, 2)
      );
      console.log('✓ Generated organization.json');
    }

    // Generate product schemas
    const productsCollection = db.collection('products');
    const products = await productsCollection.find({}).toArray();

    console.log(`Found ${products.length} products`);

    for (const product of products) {
      const schema = generateProductSchema(product, baseUrl);
      const filename = `product-${product.sku}.json`;

      fs.writeFileSync(
        path.join(outputDir, filename),
        JSON.stringify(schema, null, 2)
      );
      console.log(`✓ Generated ${filename}`);
    }

    // Generate article schemas
    const articlesCollection = db.collection('articles');
    const articles = await articlesCollection.find({ published: true }).toArray();

    console.log(`Found ${articles.length} published articles`);

    for (const article of articles) {
      const schema = generateArticleSchema(article, baseUrl);
      const filename = `article-${article.slug}.json`;

      fs.writeFileSync(
        path.join(outputDir, filename),
        JSON.stringify(schema, null, 2)
      );
      console.log(`✓ Generated ${filename}`);
    }

    console.log(`\n✅ Generated ${1 + products.length + articles.length} schema files`);

  } catch (error) {
    console.error('Database error:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

/**
 * Incremental update - only regenerate changed documents
 */
async function incrementalUpdate(outputDir, sinceDate, baseUrl = 'https://your-site.com') {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const query = { updatedAt: { $gt: new Date(sinceDate) } };

    // Update products
    const products = await db.collection('products').find(query).toArray();
    console.log(`Found ${products.length} updated products`);

    for (const product of products) {
      const schema = generateProductSchema(product, baseUrl);
      fs.writeFileSync(
        path.join(outputDir, `product-${product.sku}.json`),
        JSON.stringify(schema, null, 2)
      );
      console.log(`✓ Updated product-${product.sku}.json`);
    }

    // Update articles
    const articles = await db.collection('articles').find(query).toArray();
    console.log(`Found ${articles.length} updated articles`);

    for (const article of articles) {
      const schema = generateArticleSchema(article, baseUrl);
      fs.writeFileSync(
        path.join(outputDir, `article-${article.slug}.json`),
        JSON.stringify(schema, null, 2)
      );
      console.log(`✓ Updated article-${article.slug}.json`);
    }

    console.log(`✅ Updated ${products.length + articles.length} schemas`);

  } finally {
    await client.close();
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const outputIndex = args.indexOf('--output-dir');
  const outputDir = outputIndex !== -1 ? args[outputIndex + 1] : path.join(__dirname, 'output');

  const baseUrlIndex = args.indexOf('--base-url');
  const baseUrl = baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : 'https://your-site.com';

  const incrementalIndex = args.indexOf('--since');
  const sinceDate = incrementalIndex !== -1 ? args[incrementalIndex + 1] : null;

  console.log('LLMO MongoDB Schema Generator');
  console.log('=============================');

  if (sinceDate) {
    incrementalUpdate(outputDir, sinceDate, baseUrl)
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
      });
  } else {
    generateAllSchemas(outputDir, baseUrl)
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
  generateArticleSchema,
  generateAllSchemas,
  incrementalUpdate
};
