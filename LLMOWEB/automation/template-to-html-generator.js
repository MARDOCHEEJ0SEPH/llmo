#!/usr/bin/env node

/**
 * LLMO Template-to-HTML Generator
 * Generates complete HTML pages from schema templates
 *
 * Usage: node template-to-html-generator.js --schema product.json --output product-page.html
 */

const fs = require('fs');
const path = require('path');

let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  chalk = {
    green: (text) => text,
    red: (text) => text,
    yellow: (text) => text,
    blue: (text) => text,
    bold: (text) => text
  };
}

/**
 * Generate HTML for Product schema
 */
function generateProductHTML(schema) {
  const product = schema;
  const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
  const primaryOffer = offers[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${product.name} | Buy Online</title>
    <meta name="description" content="${product.description}">

    <!-- JSON-LD Schema Markup -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 6)}
    </script>

    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .product-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .price { font-size: 2em; font-weight: bold; color: #c00; }
        .rating { color: #ffa500; }
        .features { list-style: none; padding: 0; }
        .features li { padding: 8px 0; border-bottom: 1px solid #eee; }
        .add-to-cart { background: #28a745; color: white; padding: 15px 30px; font-size: 1.1em; border: none; border-radius: 5px; cursor: pointer; width: 100%; }
        .review { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 3px solid #007bff; }
        @media (max-width: 768px) { .product-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <main class="product-grid">
        <article class="product-images">
            <h1>${product.name}</h1>
            ${product.image && product.image.length > 0 ? product.image.map((img, i) =>
                `<img src="${img}" alt="${product.name} - Image ${i + 1}" style="width: 100%; margin-bottom: 10px;">`
            ).join('\n            ') : ''}
        </article>

        <article class="product-details">
            <div class="rating">
                ${product.aggregateRating ? `★★★★★ ${product.aggregateRating.ratingValue} (${product.aggregateRating.reviewCount} reviews)` : ''}
            </div>

            <p class="price">$${primaryOffer?.price || '0.00'}</p>

            <p>${product.description}</p>

            ${product.brand ? `<p><strong>Brand:</strong> ${product.brand.name}</p>` : ''}
            ${product.sku ? `<p><strong>SKU:</strong> ${product.sku}</p>` : ''}

            <button class="add-to-cart">Add to Cart</button>

            ${product.additionalProperty ? `
            <section>
                <h2>Specifications</h2>
                <ul class="features">
                    ${product.additionalProperty.map(prop =>
                        `<li><strong>${prop.name}:</strong> ${prop.value}</li>`
                    ).join('\n                    ')}
                </ul>
            </section>
            ` : ''}

            ${product.review ? `
            <section>
                <h2>Customer Reviews</h2>
                ${product.review.map(review => `
                <div class="review">
                    <div class="rating">${'★'.repeat(parseInt(review.reviewRating.ratingValue))}${'☆'.repeat(5 - parseInt(review.reviewRating.ratingValue))}</div>
                    <p><strong>${review.author.name}</strong> - ${review.datePublished}</p>
                    <p>${review.reviewBody}</p>
                </div>
                `).join('\n                ')}
            </section>
            ` : ''}
        </article>
    </main>
</body>
</html>`;
}

/**
 * Generate HTML for Organization schema
 */
function generateOrganizationHTML(schema) {
  const org = schema;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About ${org.name}</title>
    <meta name="description" content="${org.description || `Learn about ${org.name}`}">

    <!-- JSON-LD Schema Markup -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 6)}
    </script>

    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; }
        header { text-align: center; padding: 40px 0; }
        .logo { max-width: 200px; }
        section { margin: 40px 0; }
        .contact-info { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .social-links a { margin: 0 10px; }
    </style>
</head>
<body>
    <header>
        ${org.logo ? `<img src="${org.logo.url}" alt="${org.name} Logo" class="logo">` : ''}
        <h1>${org.name}</h1>
        ${org.legalName && org.legalName !== org.name ? `<p><em>${org.legalName}</em></p>` : ''}
    </header>

    <main>
        <section>
            <h2>About Us</h2>
            <p>${org.description || `${org.name} is a leading organization.`}</p>
            ${org.foundingDate ? `<p><strong>Founded:</strong> ${org.foundingDate}</p>` : ''}
        </section>

        ${org.contactPoint || org.address ? `
        <section class="contact-info">
            <h2>Contact Information</h2>
            ${org.contactPoint ? `
            <p><strong>Email:</strong> <a href="mailto:${org.contactPoint.email}">${org.contactPoint.email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${org.contactPoint.telephone}">${org.contactPoint.telephone}</a></p>
            ` : ''}
            ${org.address ? `
            <p><strong>Address:</strong><br>
            ${org.address.streetAddress}<br>
            ${org.address.addressLocality}, ${org.address.addressRegion} ${org.address.postalCode}<br>
            ${org.address.addressCountry}
            </p>
            ` : ''}
        </section>
        ` : ''}

        ${org.sameAs ? `
        <section class="social-links">
            <h2>Follow Us</h2>
            ${org.sameAs.map(link => {
                const platform = link.includes('linkedin') ? 'LinkedIn' :
                               link.includes('twitter') ? 'Twitter' :
                               link.includes('facebook') ? 'Facebook' :
                               link.includes('instagram') ? 'Instagram' : 'Website';
                return `<a href="${link}" target="_blank">${platform}</a>`;
            }).join('\n            ')}
        </section>
        ` : ''}
    </main>
</body>
</html>`;
}

/**
 * Generate HTML for Article schema
 */
function generateArticleHTML(schema) {
  const article = schema;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.headline}</title>
    <meta name="description" content="${article.description || article.headline}">

    <!-- JSON-LD Schema Markup -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 6)}
    </script>

    <style>
        body { font-family: Georgia, serif; line-height: 1.8; max-width: 800px; margin: 0 auto; padding: 20px; }
        header { text-align: center; margin-bottom: 40px; }
        .author { color: #666; }
        .date { color: #999; font-size: 0.9em; }
        article p { margin: 1.5em 0; text-align: justify; }
        .featured-image { width: 100%; height: auto; margin: 30px 0; }
    </style>
</head>
<body>
    <header>
        <h1>${article.headline}</h1>
        ${article.author ? `<p class="author">By ${article.author.name || 'Unknown Author'}</p>` : ''}
        ${article.datePublished ? `<p class="date">Published: ${article.datePublished}</p>` : ''}
    </header>

    <main>
        ${article.image ? `<img src="${article.image.url || article.image}" alt="${article.headline}" class="featured-image">` : ''}

        <article>
            ${article.articleBody ?
                article.articleBody.split('\n\n').map(para => `<p>${para}</p>`).join('\n            ')
                : `<p>${article.description || 'Article content goes here.'}</p>`
            }
        </article>

        ${article.keywords ? `
        <footer>
            <p><strong>Keywords:</strong> ${article.keywords}</p>
        </footer>
        ` : ''}
    </main>
</body>
</html>`;
}

/**
 * Generate HTML for SoftwareApplication schema
 */
function generateSoftwareHTML(schema) {
  const software = schema;
  const offers = Array.isArray(software.offers) ? software.offers : [software.offers];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${software.name} | ${software.applicationCategory || 'Software'}</title>
    <meta name="description" content="${software.description}">

    <!-- JSON-LD Schema Markup -->
    <script type="application/ld+json">
${JSON.stringify(schema, null, 6)}
    </script>

    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .hero { text-align: center; padding: 60px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; }
        .pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
        .pricing-card { border: 2px solid #ddd; border-radius: 8px; padding: 30px; text-align: center; }
        .pricing-card.featured { border-color: #007bff; box-shadow: 0 4px 12px rgba(0,123,255,0.2); }
        .price { font-size: 2.5em; font-weight: bold; color: #333; }
        .features { list-style: none; padding: 0; }
        .features li { padding: 10px 0; border-bottom: 1px solid #eee; }
        .cta-button { background: #007bff; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 1.1em; cursor: pointer; }
    </style>
</head>
<body>
    <div class="hero">
        <h1>${software.name}</h1>
        <p style="font-size: 1.3em; margin: 20px 0;">${software.description}</p>
    </div>

    <main>
        ${software.featureList ? `
        <section>
            <h2>Features</h2>
            <ul class="features">
                ${software.featureList.map(feature => `<li>${feature}</li>`).join('\n                ')}
            </ul>
        </section>
        ` : ''}

        <section>
            <h2>Pricing</h2>
            <div class="pricing">
                ${offers.map((offer, index) => `
                <div class="pricing-card ${index === 1 ? 'featured' : ''}">
                    <h3>${offer.name || `Plan ${index + 1}`}</h3>
                    <p class="price">$${offer.price}<span style="font-size: 0.4em;">/mo</span></p>
                    ${offer.description ? `<p>${offer.description}</p>` : ''}
                    <button class="cta-button">Get Started</button>
                </div>
                `).join('\n                ')}
            </div>
        </section>

        ${software.aggregateRating ? `
        <section>
            <h2>Customer Rating</h2>
            <p style="font-size: 1.5em;">★★★★★ ${software.aggregateRating.ratingValue}/5</p>
            <p>Based on ${software.aggregateRating.reviewCount} reviews</p>
        </section>
        ` : ''}

        ${software.screenshot ? `
        <section>
            <h2>Screenshots</h2>
            ${software.screenshot.map((img, i) =>
                `<img src="${img}" alt="${software.name} Screenshot ${i + 1}" style="width: 100%; margin: 10px 0; border-radius: 5px;">`
            ).join('\n            ')}
        </section>
        ` : ''}
    </main>
</body>
</html>`;
}

/**
 * Generate HTML from schema file
 */
function generateHTML(schemaPath, outputPath) {
  try {
    // Read schema
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const schema = JSON.parse(schemaContent);

    // Determine type and generate appropriate HTML
    const type = schema['@type'];
    let html;

    switch (type) {
      case 'Product':
        html = generateProductHTML(schema);
        break;
      case 'Organization':
        html = generateOrganizationHTML(schema);
        break;
      case 'Article':
      case 'NewsArticle':
        html = generateArticleHTML(schema);
        break;
      case 'SoftwareApplication':
        html = generateSoftwareHTML(schema);
        break;
      default:
        console.log(chalk.yellow(`⚠ No HTML template for type: ${type}`));
        console.log(chalk.yellow('Using generic template'));
        html = generateGenericHTML(schema);
    }

    // Write HTML file
    fs.writeFileSync(outputPath, html);

    console.log(chalk.green(`✓ Generated: ${outputPath}`));
    console.log(chalk.gray(`  Schema type: ${type}`));
    console.log(chalk.gray(`  File size: ${html.length} bytes`));

    return true;

  } catch (error) {
    console.log(chalk.red(`✗ Error: ${error.message}`));
    return false;
  }
}

/**
 * Generic HTML template for unsupported schema types
 */
function generateGenericHTML(schema) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${schema.name || 'Page'}</title>
    <meta name="description" content="${schema.description || ''}">

    <script type="application/ld+json">
${JSON.stringify(schema, null, 6)}
    </script>
</head>
<body>
    <h1>${schema.name || 'Content'}</h1>
    ${schema.description ? `<p>${schema.description}</p>` : ''}

    <pre>${JSON.stringify(schema, null, 2)}</pre>
</body>
</html>`;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log('LLMO Template-to-HTML Generator');
    console.log('================================\n');
    console.log('Usage: node template-to-html-generator.js --schema <schema.json> --output <output.html>\n');
    console.log('Options:');
    console.log('  --schema <file>   Path to schema JSON file');
    console.log('  --output <file>   Path to output HTML file\n');
    console.log('Examples:');
    console.log('  node template-to-html-generator.js --schema product.json --output product-page.html');
    console.log('  node template-to-html-generator.js --schema organization.json --output about.html');
    process.exit(0);
  }

  const schemaIndex = args.indexOf('--schema');
  const outputIndex = args.indexOf('--output');

  if (schemaIndex === -1 || outputIndex === -1) {
    console.error('Error: Both --schema and --output are required');
    process.exit(1);
  }

  const schemaPath = args[schemaIndex + 1];
  const outputPath = args[outputIndex + 1];

  if (!fs.existsSync(schemaPath)) {
    console.error(`Error: Schema file not found: ${schemaPath}`);
    process.exit(1);
  }

  console.log(chalk.blue.bold('\n🏭 LLMO Template-to-HTML Generator'));
  console.log('='.repeat(60));

  const success = generateHTML(schemaPath, outputPath);

  if (success) {
    console.log(chalk.green('\n✅ HTML generation successful'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ HTML generation failed'));
    process.exit(1);
  }
}

module.exports = {
  generateHTML,
  generateProductHTML,
  generateOrganizationHTML,
  generateArticleHTML,
  generateSoftwareHTML
};
