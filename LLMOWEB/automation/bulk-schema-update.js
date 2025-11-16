#!/usr/bin/env node

/**
 * LLMO Bulk Schema Update Tool
 * Update properties across multiple schema files
 *
 * Usage: node bulk-schema-update.js --dir ./schemas --update '{"@context":"https://schema.org"}'
 * Example: node bulk-schema-update.js --dir ./output --add-property publisher --value '{"@id":"https://site.com/#org"}'
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
 * Update @context to new URL
 */
function updateContext(schema, newContext) {
  schema['@context'] = newContext;
  return schema;
}

/**
 * Add or update a property
 */
function addOrUpdateProperty(schema, property, value) {
  // Handle nested properties like "offers.priceCurrency"
  const parts = property.split('.');

  if (parts.length === 1) {
    // Simple property
    schema[property] = value;
  } else {
    // Nested property
    let current = schema;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }

  return schema;
}

/**
 * Remove a property
 */
function removeProperty(schema, property) {
  const parts = property.split('.');

  if (parts.length === 1) {
    delete schema[property];
  } else {
    let current = schema;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        return schema; // Property doesn't exist
      }
      current = current[parts[i]];
    }

    delete current[parts[parts.length - 1]];
  }

  return schema;
}

/**
 * Rename a property
 */
function renameProperty(schema, oldName, newName) {
  if (schema[oldName]) {
    schema[newName] = schema[oldName];
    delete schema[oldName];
  }
  return schema;
}

/**
 * Update URLs in schema (e.g., changing domain)
 */
function updateUrls(schema, oldDomain, newDomain) {
  const jsonString = JSON.stringify(schema);
  const updated = jsonString.replace(new RegExp(oldDomain, 'g'), newDomain);
  return JSON.parse(updated);
}

/**
 * Add missing required properties with defaults
 */
function addMissingRequired(schema) {
  const type = schema['@type'];
  let modified = false;

  // Organization required properties
  if (type === 'Organization') {
    if (!schema.name) {
      schema.name = "[TO BE FILLED]";
      modified = true;
    }
    if (!schema.url) {
      schema.url = "[TO BE FILLED]";
      modified = true;
    }
  }

  // Product required properties
  if (type === 'Product' || type === 'SoftwareApplication') {
    if (!schema.name) {
      schema.name = "[TO BE FILLED]";
      modified = true;
    }
    if (!schema.description) {
      schema.description = "[TO BE FILLED]";
      modified = true;
    }
    if (!schema.image) {
      schema.image = [];
      modified = true;
    }
    if (!schema.offers) {
      schema.offers = {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "USD"
      };
      modified = true;
    }
  }

  // Article required properties
  if (type === 'Article' || type === 'NewsArticle') {
    if (!schema.headline) {
      schema.headline = "[TO BE FILLED]";
      modified = true;
    }
    if (!schema.author) {
      schema.author = {
        "@type": "Person",
        "name": "[TO BE FILLED]"
      };
      modified = true;
    }
    if (!schema.publisher) {
      schema.publisher = {
        "@id": "[TO BE FILLED]"
      };
      modified = true;
    }
    if (!schema.datePublished) {
      schema.datePublished = new Date().toISOString().split('T')[0];
      modified = true;
    }
  }

  return { schema, modified };
}

/**
 * Process a single schema file
 */
function processSchemaFile(filePath, operations, dryRun = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let schema = JSON.parse(content);
    let modified = false;

    // Apply operations
    for (const op of operations) {
      switch (op.type) {
        case 'update-context':
          schema = updateContext(schema, op.value);
          modified = true;
          break;

        case 'add-property':
          schema = addOrUpdateProperty(schema, op.property, op.value);
          modified = true;
          break;

        case 'remove-property':
          schema = removeProperty(schema, op.property);
          modified = true;
          break;

        case 'rename-property':
          schema = renameProperty(schema, op.oldName, op.newName);
          modified = true;
          break;

        case 'update-urls':
          schema = updateUrls(schema, op.oldDomain, op.newDomain);
          modified = true;
          break;

        case 'add-missing-required':
          const result = addMissingRequired(schema);
          schema = result.schema;
          if (result.modified) modified = true;
          break;
      }
    }

    if (modified && !dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(schema, null, 2) + '\n');
      return { success: true, modified: true };
    } else if (modified && dryRun) {
      return { success: true, modified: true, preview: schema };
    } else {
      return { success: true, modified: false };
    }

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Process all schema files in a directory
 */
function bulkUpdateSchemas(directory, operations, dryRun = false) {
  console.log(chalk.blue.bold('\n🔄 LLMO Bulk Schema Update'));
  console.log('='.repeat(60));

  if (dryRun) {
    console.log(chalk.yellow('DRY RUN MODE - No files will be modified'));
  }

  const files = fs.readdirSync(directory).filter(f => f.endsWith('.json'));

  console.log(`Found ${files.length} schema files\n`);

  const results = {
    total: files.length,
    modified: 0,
    unchanged: 0,
    errors: 0
  };

  for (const file of files) {
    const filePath = path.join(directory, file);
    const result = processSchemaFile(filePath, operations, dryRun);

    if (result.success) {
      if (result.modified) {
        console.log(chalk.green(`✓ ${file} - Modified`));
        results.modified++;

        if (dryRun && result.preview) {
          console.log(chalk.gray(`  Preview: ${JSON.stringify(result.preview, null, 2).substring(0, 200)}...`));
        }
      } else {
        console.log(chalk.gray(`  ${file} - No changes needed`));
        results.unchanged++;
      }
    } else {
      console.log(chalk.red(`✗ ${file} - Error: ${result.error}`));
      results.errors++;
    }
  }

  // Print summary
  console.log(chalk.blue.bold('\n📊 Update Summary'));
  console.log('='.repeat(60));
  console.log(`Total files: ${results.total}`);
  console.log(chalk.green(`Modified: ${results.modified}`));
  console.log(chalk.gray(`Unchanged: ${results.unchanged}`));
  console.log(chalk.red(`Errors: ${results.errors}`));

  if (dryRun && results.modified > 0) {
    console.log(chalk.yellow('\nRun without --dry-run to apply changes'));
  } else if (!dryRun && results.modified > 0) {
    console.log(chalk.green(`\n✅ Successfully updated ${results.modified} files`));
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    console.log('LLMO Bulk Schema Update Tool');
    console.log('============================\n');
    console.log('Usage: node bulk-schema-update.js --dir <directory> <operation> [options]\n');
    console.log('Operations:');
    console.log('  --update-context <url>                  Update @context to new URL');
    console.log('  --add-property <name> --value <json>    Add or update a property');
    console.log('  --remove-property <name>                Remove a property');
    console.log('  --rename-property <old> <new>           Rename a property');
    console.log('  --update-urls <old-domain> <new-domain> Update all URLs from old to new domain');
    console.log('  --add-missing-required                  Add missing required properties with placeholders\n');
    console.log('Options:');
    console.log('  --dry-run                               Preview changes without modifying files\n');
    console.log('Examples:');
    console.log('  # Update @context');
    console.log('  node bulk-schema-update.js --dir ./output --update-context https://schema.org\n');
    console.log('  # Add publisher to all schemas');
    console.log('  node bulk-schema-update.js --dir ./output --add-property publisher --value \'{"@id":"https://site.com/#org"}\'');
    console.log('\n  # Change domain across all URLs');
    console.log('  node bulk-schema-update.js --dir ./output --update-urls old-site.com new-site.com\n');
    console.log('  # Add missing required properties');
    console.log('  node bulk-schema-update.js --dir ./output --add-missing-required\n');
    console.log('  # Dry run to preview changes');
    console.log('  node bulk-schema-update.js --dir ./output --add-property author --value \'{"@type":"Person","name":"John"}\' --dry-run');
    process.exit(0);
  }

  const dirIndex = args.indexOf('--dir');
  if (dirIndex === -1) {
    console.error('Error: --dir is required');
    process.exit(1);
  }

  const directory = args[dirIndex + 1];
  if (!fs.existsSync(directory)) {
    console.error(`Error: Directory not found: ${directory}`);
    process.exit(1);
  }

  const dryRun = args.includes('--dry-run');

  // Parse operations
  const operations = [];

  if (args.includes('--update-context')) {
    const index = args.indexOf('--update-context');
    operations.push({
      type: 'update-context',
      value: args[index + 1]
    });
  }

  if (args.includes('--add-property')) {
    const propIndex = args.indexOf('--add-property');
    const valueIndex = args.indexOf('--value');
    operations.push({
      type: 'add-property',
      property: args[propIndex + 1],
      value: JSON.parse(args[valueIndex + 1])
    });
  }

  if (args.includes('--remove-property')) {
    const index = args.indexOf('--remove-property');
    operations.push({
      type: 'remove-property',
      property: args[index + 1]
    });
  }

  if (args.includes('--rename-property')) {
    const index = args.indexOf('--rename-property');
    operations.push({
      type: 'rename-property',
      oldName: args[index + 1],
      newName: args[index + 2]
    });
  }

  if (args.includes('--update-urls')) {
    const index = args.indexOf('--update-urls');
    operations.push({
      type: 'update-urls',
      oldDomain: args[index + 1],
      newDomain: args[index + 2]
    });
  }

  if (args.includes('--add-missing-required')) {
    operations.push({
      type: 'add-missing-required'
    });
  }

  if (operations.length === 0) {
    console.error('Error: No operations specified');
    process.exit(1);
  }

  bulkUpdateSchemas(directory, operations, dryRun);
}

module.exports = {
  bulkUpdateSchemas,
  processSchemaFile,
  updateContext,
  addOrUpdateProperty,
  removeProperty,
  renameProperty,
  updateUrls,
  addMissingRequired
};
