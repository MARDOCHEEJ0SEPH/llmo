#!/usr/bin/env node

/**
 * LLMO Entity Extraction Test
 * Tests whether LLMs can accurately extract entities from optimized content
 *
 * Usage: node entity-extraction-test.js <html-file> [--provider openai|anthropic|both]
 * Example: node entity-extraction-test.js ../complete-examples/saas-product-page.html --provider both
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Optional: Try to load AI SDKs (install separately)
let openai, anthropic;
try {
  const { OpenAI } = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (e) {
  console.log('OpenAI SDK not installed. Run: npm install openai');
}

try {
  const { Anthropic } = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} catch (e) {
  console.log('Anthropic SDK not installed. Run: npm install @anthropic-ai/sdk');
}

// Chalk for colored output
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
 * Extract embedded JSON-LD schema from HTML
 */
function extractSchemaFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  const schemas = [];
  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      const schemaText = $(elem).html();
      const schema = JSON.parse(schemaText);
      schemas.push(schema);
    } catch (e) {
      console.error('Error parsing schema:', e.message);
    }
  });

  return schemas;
}

/**
 * Extract text content from HTML (removing scripts, styles)
 */
function extractTextContent(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);

  // Remove scripts and styles
  $('script, style').remove();

  // Get text content
  const text = $('body').text()
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim();

  return text;
}

/**
 * Test entity extraction with OpenAI GPT-4
 */
async function testWithOpenAI(textContent, expectedEntities) {
  if (!openai) {
    console.log(chalk.yellow('⚠ OpenAI SDK not available, skipping GPT-4 test'));
    return null;
  }

  console.log(chalk.blue('\n🤖 Testing with GPT-4...'));

  const prompt = `Extract all entities from the following content. Return them as JSON with these categories:
- organizations (name, type, description)
- products (name, category, price if available)
- people (name, role if available)
- locations (name, address if available)

Content:
${textContent.substring(0, 3000)}...

Return ONLY valid JSON, no explanation.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an entity extraction system. Extract entities and return only valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    });

    const extracted = JSON.parse(response.choices[0].message.content);

    // Compare with expected entities
    const results = compareEntities(extracted, expectedEntities);

    console.log(chalk.green('✓ GPT-4 extracted entities:'));
    console.log(`  Organizations: ${extracted.organizations?.length || 0}`);
    console.log(`  Products: ${extracted.products?.length || 0}`);
    console.log(`  People: ${extracted.people?.length || 0}`);
    console.log(`  Locations: ${extracted.locations?.length || 0}`);

    return { provider: 'OpenAI GPT-4', extracted, results };
  } catch (error) {
    console.log(chalk.red(`✗ GPT-4 error: ${error.message}`));
    return null;
  }
}

/**
 * Test entity extraction with Anthropic Claude
 */
async function testWithClaude(textContent, expectedEntities) {
  if (!anthropic) {
    console.log(chalk.yellow('⚠ Anthropic SDK not available, skipping Claude test'));
    return null;
  }

  console.log(chalk.blue('\n🤖 Testing with Claude...'));

  const prompt = `Extract all entities from the following content. Return them as JSON with these categories:
- organizations (name, type, description)
- products (name, category, price if available)
- people (name, role if available)
- locations (name, address if available)

Content:
${textContent.substring(0, 3000)}...

Return ONLY valid JSON, no explanation.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    });

    const extracted = JSON.parse(response.content[0].text);

    console.log(chalk.green('✓ Claude extracted entities:'));
    console.log(`  Organizations: ${extracted.organizations?.length || 0}`);
    console.log(`  Products: ${extracted.products?.length || 0}`);
    console.log(`  People: ${extracted.people?.length || 0}`);
    console.log(`  Locations: ${extracted.locations?.length || 0}`);

    const results = compareEntities(extracted, expectedEntities);

    return { provider: 'Anthropic Claude', extracted, results };
  } catch (error) {
    console.log(chalk.red(`✗ Claude error: ${error.message}`));
    return null;
  }
}

/**
 * Compare extracted entities with expected entities from schema
 */
function compareEntities(extracted, expected) {
  const results = {
    precision: 0,
    recall: 0,
    f1: 0,
    correct: 0,
    missing: 0,
    extra: 0
  };

  // Simplified comparison (in production, use fuzzy matching)
  const extractedNames = new Set();
  Object.values(extracted).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(item => extractedNames.add(item.name?.toLowerCase()));
    }
  });

  const expectedNames = new Set();
  Object.values(expected).forEach(category => {
    if (Array.isArray(category)) {
      category.forEach(item => expectedNames.add(item.name?.toLowerCase()));
    }
  });

  // Calculate metrics
  const intersection = new Set([...extractedNames].filter(x => expectedNames.has(x)));
  results.correct = intersection.size;
  results.missing = expectedNames.size - intersection.size;
  results.extra = extractedNames.size - intersection.size;

  results.precision = extractedNames.size > 0 ? results.correct / extractedNames.size : 0;
  results.recall = expectedNames.size > 0 ? results.correct / expectedNames.size : 0;
  results.f1 = (results.precision + results.recall) > 0
    ? 2 * (results.precision * results.recall) / (results.precision + results.recall)
    : 0;

  return results;
}

/**
 * Convert JSON-LD schema to expected entities format
 */
function schemaToExpectedEntities(schemas) {
  const entities = {
    organizations: [],
    products: [],
    people: [],
    locations: []
  };

  schemas.forEach(schema => {
    // Handle @graph pattern
    const items = schema['@graph'] || [schema];

    items.forEach(item => {
      switch (item['@type']) {
        case 'Organization':
          entities.organizations.push({
            name: item.name,
            type: 'Organization',
            description: item.description
          });
          break;
        case 'Product':
        case 'SoftwareApplication':
          entities.products.push({
            name: item.name,
            category: item.applicationCategory || item.category,
            price: item.offers?.[0]?.price || item.offers?.price
          });
          break;
        case 'Person':
          entities.people.push({
            name: item.name,
            role: item.jobTitle
          });
          break;
        case 'LocalBusiness':
          entities.locations.push({
            name: item.name,
            address: item.address
          });
          break;
      }
    });
  });

  return entities;
}

/**
 * Main test runner
 */
async function runEntityExtractionTest(htmlPath, provider = 'both') {
  console.log(chalk.blue.bold('\n🧪 LLMO Entity Extraction Test'));
  console.log(chalk.blue.bold(`Testing: ${path.basename(htmlPath)}`));
  console.log('='.repeat(60));

  // Extract schema (ground truth)
  const schemas = extractSchemaFromHTML(htmlPath);
  if (schemas.length === 0) {
    console.log(chalk.red('✗ No schema found in HTML file'));
    process.exit(1);
  }

  console.log(chalk.green(`✓ Found ${schemas.length} schema(s) in HTML`));

  const expectedEntities = schemaToExpectedEntities(schemas);
  console.log(chalk.green('✓ Expected entities:'));
  console.log(`  Organizations: ${expectedEntities.organizations.length}`);
  console.log(`  Products: ${expectedEntities.products.length}`);
  console.log(`  People: ${expectedEntities.people.length}`);
  console.log(`  Locations: ${expectedEntities.locations.length}`);

  // Extract text content
  const textContent = extractTextContent(htmlPath);
  console.log(chalk.green(`✓ Extracted ${textContent.length} characters of text content`));

  // Run tests with different providers
  const testResults = [];

  if (provider === 'openai' || provider === 'both') {
    const result = await testWithOpenAI(textContent, expectedEntities);
    if (result) testResults.push(result);
  }

  if (provider === 'anthropic' || provider === 'both') {
    const result = await testWithClaude(textContent, expectedEntities);
    if (result) testResults.push(result);
  }

  // Print summary
  console.log(chalk.blue.bold('\n📊 Test Results Summary'));
  console.log('='.repeat(60));

  testResults.forEach(result => {
    console.log(chalk.bold(`\n${result.provider}:`));
    console.log(`  Precision: ${(result.results.precision * 100).toFixed(1)}%`);
    console.log(`  Recall: ${(result.results.recall * 100).toFixed(1)}%`);
    console.log(`  F1 Score: ${(result.results.f1 * 100).toFixed(1)}%`);
    console.log(`  Correct: ${result.results.correct}`);
    console.log(`  Missing: ${result.results.missing}`);
    console.log(`  Extra: ${result.results.extra}`);

    if (result.results.f1 >= 0.8) {
      console.log(chalk.green('  ✓ Excellent entity extraction'));
    } else if (result.results.f1 >= 0.6) {
      console.log(chalk.yellow('  ⚠ Good entity extraction, room for improvement'));
    } else {
      console.log(chalk.red('  ✗ Poor entity extraction, content needs optimization'));
    }
  });

  console.log('\n' + '='.repeat(60));

  // Overall assessment
  const avgF1 = testResults.reduce((sum, r) => sum + r.results.f1, 0) / testResults.length;

  if (avgF1 >= 0.8) {
    console.log(chalk.green.bold('✅ CONTENT IS WELL-OPTIMIZED FOR LLM COMPREHENSION'));
    console.log(chalk.green(`Average F1 Score: ${(avgF1 * 100).toFixed(1)}%`));
  } else if (avgF1 >= 0.6) {
    console.log(chalk.yellow.bold('⚠️  CONTENT IS MODERATELY OPTIMIZED'));
    console.log(chalk.yellow(`Average F1 Score: ${(avgF1 * 100).toFixed(1)}%`));
    console.log(chalk.yellow('Recommendations:'));
    console.log(chalk.yellow('  - Add more schema markup for missing entities'));
    console.log(chalk.yellow('  - Improve semantic structure with proper headings'));
    console.log(chalk.yellow('  - Increase information density in content'));
  } else {
    console.log(chalk.red.bold('❌ CONTENT NEEDS SIGNIFICANT OPTIMIZATION'));
    console.log(chalk.red(`Average F1 Score: ${(avgF1 * 100).toFixed(1)}%`));
    console.log(chalk.red('Recommendations:'));
    console.log(chalk.red('  - Add comprehensive schema markup'));
    console.log(chalk.red('  - Use semantic HTML5 structure'));
    console.log(chalk.red('  - Define entities clearly in content'));
    console.log(chalk.red('  - Follow LLMO best practices from the book'));
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node entity-extraction-test.js <html-file> [--provider openai|anthropic|both]');
    console.log('Example: node entity-extraction-test.js ../complete-examples/saas-product-page.html --provider both');
    process.exit(1);
  }

  const htmlPath = args[0];
  const providerIndex = args.indexOf('--provider');
  const provider = providerIndex !== -1 ? args[providerIndex + 1] : 'both';

  if (!fs.existsSync(htmlPath)) {
    console.log(chalk.red(`✗ File not found: ${htmlPath}`));
    process.exit(1);
  }

  runEntityExtractionTest(htmlPath, provider)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(chalk.red('Fatal error:'), error);
      process.exit(1);
    });
}

module.exports = { runEntityExtractionTest, extractSchemaFromHTML, extractTextContent };
