#!/usr/bin/env node

/**
 * Database to Schema Generator
 * Example implementation showing how to generate JSON-LD schema from database records
 *
 * This is a simplified example. In production, use proper ORM and error handling.
 */

const fs = require('fs');
const path = require('path');

// ===== MOCK DATABASE (Replace with actual database connection) =====

// Mock product database
const mockProductDatabase = [
  {
    id: 1,
    slug: 'acme-crm',
    name: 'Acme CRM',
    description: 'Customer relationship management software for small teams with contact management, pipeline tracking, and email integration.',
    category: 'Business Software',
    sku: 'ACRM-001',
    price: 49.00,
    currency: 'USD',
    stock_quantity: 999,
    brand_name: 'Acme Corp',
    rating_value: 4.8,
    rating_count: 1247,
    features: ['Contact Management', 'Pipeline Tracking', 'Email Integration', 'Mobile Apps'],
    image_urls: [
      'https://acme.com/images/crm-dashboard.png',
      'https://acme.com/images/crm-contacts.png'
    ],
    created_at: '2018-06-20',
    updated_at: '2024-03-10'
  },
  {
    id: 2,
    slug: 'acme-project-manager',
    name: 'Acme Project Manager',
    description: 'Project management software with task tracking, Gantt charts, team collaboration, and time tracking features.',
    category: 'Business Software',
    sku: 'APM-001',
    price: 39.00,
    currency: 'USD',
    stock_quantity: 999,
    brand_name: 'Acme Corp',
    rating_value: 4.6,
    rating_count: 892,
    features: ['Task Management', 'Gantt Charts', 'Team Collaboration', 'Time Tracking'],
    image_urls: [
      'https://acme.com/images/pm-dashboard.png',
      'https://acme.com/images/pm-gantt.png'
    ],
    created_at: '2019-03-15',
    updated_at: '2024-03-08'
  }
];

// Mock reviews database
const mockReviewsDatabase = [
  {
    product_id: 1,
    author_name: 'Mike Johnson',
    rating: 5,
    review_text: 'Excellent CRM for small teams. Easy to use and great customer support.',
    published_date: '2024-03-01'
  },
  {
    product_id: 1,
    author_name: 'Sarah Chen',
    rating: 5,
    review_text: 'Perfect for our 12-person sales team. Gmail integration works flawlessly.',
    published_date: '2024-02-15'
  }
];

// ===== SCHEMA GENERATION FUNCTIONS =====

/**
 * Generate Product schema from database record
 */
function generateProductSchema(product, reviews = []) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication", // Use Product for physical products
    "@id": `https://acme.com/products/${product.slug}#product`,

    // Essential properties (Tier 1)
    "name": product.name,
    "description": product.description,
    "applicationCategory": "BusinessApplication",
    "url": `https://acme.com/products/${product.slug}`,

    // Pricing (Offer)
    "offers": {
      "@type": "Offer",
      "price": product.price.toFixed(2),
      "priceCurrency": product.currency,
      "availability": product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": `https://acme.com/products/${product.slug}`,
      "seller": {
        "@type": "Organization",
        "@id": "https://acme.com/#organization",
        "name": "Acme Corp"
      }
    }
  };

  // Add images if available
  if (product.image_urls && product.image_urls.length > 0) {
    schema.screenshot = product.image_urls.map(url => ({
      "@type": "ImageObject",
      "url": url
    }));
  }

  // Add features if available
  if (product.features && product.features.length > 0) {
    schema.featureList = product.features;
  }

  // Add ratings if available
  if (product.rating_value && product.rating_count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": product.rating_value.toString(),
      "ratingCount": product.rating_count.toString(),
      "bestRating": "5",
      "worstRating": "1"
    };
  }

  // Add reviews if available
  if (reviews && reviews.length > 0) {
    schema.review = reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.author_name
      },
      "datePublished": review.published_date,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5"
      },
      "reviewBody": review.review_text
    }));
  }

  // Add SKU
  if (product.sku) {
    schema.sku = product.sku;
  }

  // Add brand
  if (product.brand_name) {
    schema.brand = {
      "@type": "Brand",
      "name": product.brand_name
    };
  }

  // Add dates
  if (product.created_at) {
    schema.datePublished = product.created_at;
  }
  if (product.updated_at) {
    schema.dateModified = product.updated_at;
  }

  // Add provider
  schema.provider = {
    "@type": "Organization",
    "@id": "https://acme.com/#organization"
  };

  // Additional properties for software
  schema.operatingSystem = "Web-based";
  schema.softwareVersion = "4.2.1";

  return schema;
}

/**
 * Generate Organization schema from company data
 */
function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://acme.com/#organization",
    "name": "Acme Corp",
    "legalName": "Acme Corporation Inc.",
    "url": "https://acme.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://acme.com/images/logo.png",
      "width": "600",
      "height": "60"
    },
    "description": "Provider of cloud-based business software for small to medium businesses",
    "foundingDate": "2018-03-15",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Tech Boulevard, Suite 400",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94105",
      "addressCountry": "US"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-415-555-0100",
      "contactType": "customer service",
      "email": "support@acme.com"
    },
    "sameAs": [
      "https://www.linkedin.com/company/acme-corp",
      "https://twitter.com/acmecorp"
    ]
  };
}

/**
 * Generate BreadcrumbList schema
 */
function generateBreadcrumbSchema(productName, productSlug) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://acme.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Products",
        "item": "https://acme.com/products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": productName,
        "item": `https://acme.com/products/${productSlug}`
      }
    ]
  };
}

// ===== MAIN EXECUTION =====

function generateAllSchemas() {
  console.log('🚀 Starting schema generation from database...\n');

  // Create output directory
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate Organization schema (once)
  const orgSchema = generateOrganizationSchema();
  const orgPath = path.join(outputDir, 'organization.json');
  fs.writeFileSync(orgPath, JSON.stringify(orgSchema, null, 2));
  console.log(`✓ Generated: organization.json`);

  // Generate Product schemas
  let productCount = 0;

  mockProductDatabase.forEach(product => {
    // Get reviews for this product
    const reviews = mockReviewsDatabase.filter(r => r.product_id === product.id);

    // Generate Product schema
    const productSchema = generateProductSchema(product, reviews);

    // Generate Breadcrumb schema
    const breadcrumbSchema = generateBreadcrumbSchema(product.name, product.slug);

    // Combine using @graph
    const combinedSchema = {
      "@context": "https://schema.org",
      "@graph": [
        orgSchema,
        productSchema,
        breadcrumbSchema
      ]
    };

    // Write to file
    const filename = `${product.slug}.json`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(combinedSchema, null, 2));

    console.log(`✓ Generated: ${filename} (${reviews.length} reviews)`);
    productCount++;
  });

  console.log(`\n✅ Successfully generated ${productCount} product schemas + 1 organization schema`);
  console.log(`📁 Output directory: ${outputDir}`);
  console.log('\n📊 Schema Statistics:');
  console.log(`   - Products: ${productCount}`);
  console.log(`   - Total reviews: ${mockReviewsDatabase.length}`);
  console.log(`   - Average rating: ${(mockProductDatabase.reduce((sum, p) => sum + p.rating_value, 0) / mockProductDatabase.length).toFixed(1)}`);
  console.log('\n💡 Next steps:');
  console.log('   1. Review generated schemas in ./output/');
  console.log('   2. Validate: node ../validation/validate-schema.js output/acme-crm.json');
  console.log('   3. Integrate into your HTML pages');
}

// Run if executed directly
if (require.main === module) {
  try {
    generateAllSchemas();
  } catch (error) {
    console.error('❌ Error generating schemas:', error.message);
    process.exit(1);
  }
}

// ===== EXPORTS FOR USE AS MODULE =====

module.exports = {
  generateProductSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema
};

// ===== USAGE NOTES =====

/*

PRODUCTION USAGE:

1. Replace mock database with actual database connection:

   const db = require('./db-connection');
   const products = await db.query('SELECT * FROM products');

2. Add error handling and logging:

   try {
     const schema = generateProductSchema(product, reviews);
   } catch (error) {
     logger.error(`Failed to generate schema for product ${product.id}:`, error);
   }

3. Add validation before writing:

   const validation = validateSchema(schema);
   if (!validation.valid) {
     throw new Error(`Invalid schema: ${validation.errors}`);
   }

4. Implement incremental updates:

   const changed = await db.query(`
     SELECT * FROM products
     WHERE updated_at > $1
   `, [lastRunTime]);

5. Add batch processing for large datasets:

   const batchSize = 100;
   for (let i = 0; i < products.length; i += batchSize) {
     const batch = products.slice(i, i + batchSize);
     await processBatch(batch);
   }

6. Schedule automated runs:

   const cron = require('node-cron');
   cron.schedule('0 * * * *', generateAllSchemas); // Every hour

*/
