#!/usr/bin/env node

/**
 * LLMO Schema Validator
 * Validates JSON-LD schema files against Schema.org vocabulary
 *
 * Usage: node validate-schema.js <file-path>
 * Example: node validate-schema.js ../schema-templates/organization.json
 */

const fs = require('fs');
const path = require('path');

// Color output (if chalk is not installed, falls back to plain text)
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  // Fallback if chalk not installed
  chalk = {
    green: (text) => text,
    red: (text) => text,
    yellow: (text) => text,
    blue: (text) => text,
    bold: (text) => text
  };
}

// Schema.org required properties by type
const REQUIRED_PROPERTIES = {
  'Organization': ['name', 'url'],
  'Product': ['name', 'description', 'image', 'offers'],
  'SoftwareApplication': ['name', 'applicationCategory', 'offers'],
  'Person': ['name'],
  'Article': ['headline', 'author', 'publisher', 'datePublished'],
  'NewsArticle': ['headline', 'author', 'publisher', 'datePublished'],
  'Service': ['name', 'provider']
};

// Recommended Tier 2 properties by type
const RECOMMENDED_PROPERTIES = {
  'Organization': ['logo', 'description', 'address', 'contactPoint', 'sameAs', 'foundingDate'],
  'Product': ['brand', 'manufacturer', 'sku', 'aggregateRating', 'review'],
  'SoftwareApplication': ['featureList', 'screenshot', 'operatingSystem', 'provider', 'aggregateRating'],
  'Person': ['jobTitle', 'worksFor', 'email', 'sameAs', 'alumniOf', 'knowsAbout'],
  'Article': ['articleBody', 'wordCount', 'articleSection', 'keywords', 'about', 'mentions'],
  'Service': ['serviceType', 'areaServed', 'provider', 'offers']
};

function validateSchema(filePath) {
  console.log(chalk.blue.bold(`\nValidating: ${filePath}\n`));

  // Check file exists
  if (!fs.existsSync(filePath)) {
    console.log(chalk.red('✗ File not found'));
    process.exit(2);
  }

  // Read and parse JSON
  let schema;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    schema = JSON.parse(content);
    console.log(chalk.green('✓ Valid JSON syntax'));
  } catch (e) {
    console.log(chalk.red(`✗ Invalid JSON: ${e.message}`));
    process.exit(1);
  }

  const errors = [];
  const warnings = [];

  // Check @context
  if (!schema['@context']) {
    errors.push('Missing @context property');
  } else if (schema['@context'] !== 'https://schema.org') {
    warnings.push(`@context should be "https://schema.org", found "${schema['@context']}"`);
  } else {
    console.log(chalk.green('✓ Valid @context'));
  }

  // Check @type
  if (!schema['@type']) {
    errors.push('Missing @type property');
  } else {
    console.log(chalk.green(`✓ Schema type: ${schema['@type']}`));
  }

  const entityType = schema['@type'];

  // Check required properties
  if (REQUIRED_PROPERTIES[entityType]) {
    const required = REQUIRED_PROPERTIES[entityType];
    const missing = required.filter(prop => !schema[prop] && !prop.startsWith('_'));

    if (missing.length === 0) {
      console.log(chalk.green(`✓ All ${required.length} required properties present`));
    } else {
      missing.forEach(prop => {
        errors.push(`Missing required property: ${prop}`));
      });
    }
  }

  // Check recommended properties
  if (RECOMMENDED_PROPERTIES[entityType]) {
    const recommended = RECOMMENDED_PROPERTIES[entityType];
    const present = recommended.filter(prop => schema[prop]);
    const missing = recommended.filter(prop => !schema[prop]);

    const percentage = Math.round((present.length / recommended.length) * 100);

    if (percentage >= 80) {
      console.log(chalk.green(`✓ ${present.length}/${recommended.length} recommended properties (${percentage}%)`));
    } else if (percentage >= 50) {
      console.log(chalk.yellow(`⚠ ${present.length}/${recommended.length} recommended properties (${percentage}%)`));
      warnings.push(`Consider adding more Tier 2 properties. Missing: ${missing.join(', ')}`);
    } else {
      console.log(chalk.red(`✗ Only ${present.length}/${recommended.length} recommended properties (${percentage}%)`));
      errors.push(`Low property coverage. Add: ${missing.slice(0, 3).join(', ')}...`);
    }
  }

  // Check URL format
  ['url', '@id', 'sameAs'].forEach(prop => {
    if (schema[prop]) {
      const urls = Array.isArray(schema[prop]) ? schema[prop] : [schema[prop]];
      urls.forEach(url => {
        if (typeof url === 'string' && !url.startsWith('http://') && !url.startsWith('https://')) {
          warnings.push(`${prop} should be absolute URL (starts with https://): ${url}`);
        }
      });
    }
  });

  // Check date format (ISO 8601)
  ['datePublished', 'dateModified', 'foundingDate', 'releaseDate'].forEach(prop => {
    if (schema[prop]) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2}))?$/;
      if (!dateRegex.test(schema[prop])) {
        warnings.push(`${prop} should use ISO 8601 format (YYYY-MM-DD): ${schema[prop]}`);
      }
    }
  });

  // Remove comment fields for clean schema check
  const cleanSchema = Object.keys(schema).filter(key => !key.startsWith('_'));
  const propertyCount = cleanSchema.length;

  // Output results
  console.log('');

  if (errors.length > 0) {
    console.log(chalk.red.bold('ERRORS:'));
    errors.forEach(error => console.log(chalk.red(`  ✗ ${error}`)));
    console.log('');
  }

  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('WARNINGS:'));
    warnings.forEach(warning => console.log(chalk.yellow(`  ⚠ ${warning}`)));
    console.log('');
  }

  // Summary
  if (errors.length === 0) {
    console.log(chalk.green.bold('✓ Schema is valid'));
    console.log(chalk.gray(`  Properties: ${propertyCount}`));
    console.log(chalk.gray(`  Type: ${entityType || 'Unknown'}`));

    if (warnings.length > 0) {
      console.log(chalk.yellow(`  ${warnings.length} warning(s) - consider addressing for better quality`));
    }

    console.log('');
    process.exit(0);
  } else {
    console.log(chalk.red.bold(`✗ Schema has ${errors.length} error(s)`));
    console.log(chalk.red('  Fix errors before deployment'));
    console.log('');
    process.exit(1);
  }
}

// Main execution
if (process.argv.length < 3) {
  console.log(chalk.yellow('Usage: node validate-schema.js <file-path>'));
  console.log(chalk.yellow('Example: node validate-schema.js ../schema-templates/organization.json'));
  process.exit(1);
}

const filePath = process.argv[2];
validateSchema(filePath);
