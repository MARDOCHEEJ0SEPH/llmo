#!/usr/bin/env node

/**
 * LLMO Relationship Understanding Test
 * Tests whether LLMs can understand relationships between entities in optimized content
 *
 * Usage: node relationship-test.js <html-file> [--provider openai|anthropic|both]
 * Example: node relationship-test.js ../complete-examples/saas-product-page.html --provider both
 */

const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Optional: Try to load AI SDKs
let openai, anthropic;
try {
  const { OpenAI } = require('openai');
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
} catch (e) {
  // SDK not installed
}

try {
  const { Anthropic } = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} catch (e) {
  // SDK not installed
}

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
 * Extract relationships from JSON-LD schema
 */
function extractRelationshipsFromSchema(schemas) {
  const relationships = [];

  schemas.forEach(schema => {
    const items = schema['@graph'] || [schema];

    items.forEach(item => {
      const type = item['@type'];
      const name = item.name || item['@id'];

      // Find relationships
      Object.keys(item).forEach(key => {
        const value = item[key];

        // Check if property references another entity
        if (value && typeof value === 'object') {
          if (value['@type']) {
            relationships.push({
              source: name,
              sourceType: type,
              relationship: key,
              target: value.name || value['@id'],
              targetType: value['@type']
            });
          } else if (value['@id']) {
            relationships.push({
              source: name,
              sourceType: type,
              relationship: key,
              target: value['@id'],
              targetType: 'Referenced Entity'
            });
          }
        } else if (Array.isArray(value)) {
          value.forEach(v => {
            if (v && typeof v === 'object' && v['@type']) {
              relationships.push({
                source: name,
                sourceType: type,
                relationship: key,
                target: v.name || v['@id'],
                targetType: v['@type']
              });
            }
          });
        }
      });
    });
  });

  return relationships;
}

/**
 * Generate relationship questions from schema
 */
function generateRelationshipQuestions(relationships) {
  const questions = [];

  // Sample up to 5 relationships for testing
  const sampleSize = Math.min(5, relationships.length);
  const sampled = relationships.slice(0, sampleSize);

  sampled.forEach(rel => {
    // Generate question based on relationship type
    let question;

    switch (rel.relationship) {
      case 'author':
      case 'creator':
        question = `Who is the author/creator of ${rel.source}?`;
        break;
      case 'publisher':
        question = `Who publishes ${rel.source}?`;
        break;
      case 'manufacturer':
      case 'brand':
        question = `Who manufactures or owns the brand for ${rel.source}?`;
        break;
      case 'provider':
        question = `Who provides ${rel.source}?`;
        break;
      case 'worksFor':
        question = `Which organization does ${rel.source} work for?`;
        break;
      case 'offers':
        question = `What is being offered by ${rel.source}?`;
        break;
      case 'review':
        question = `Who reviewed ${rel.source}?`;
        break;
      case 'location':
      case 'address':
        question = `Where is ${rel.source} located?`;
        break;
      default:
        question = `What is the relationship between ${rel.source} and ${rel.target}?`;
    }

    questions.push({
      question,
      expectedAnswer: rel.target,
      relationship: rel
    });
  });

  return questions;
}

/**
 * Test relationship understanding with LLM
 */
async function testRelationshipUnderstanding(provider, textContent, questions) {
  console.log(chalk.blue(`\n🤖 Testing with ${provider}...`));

  const results = [];

  for (const q of questions) {
    const prompt = `Based on the following content, answer this question concisely in one sentence:

Question: ${q.question}

Content:
${textContent.substring(0, 3000)}...

Answer:`;

    try {
      let answer;

      if (provider === 'OpenAI GPT-4' && openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You answer questions about content concisely and accurately.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 100
        });
        answer = response.choices[0].message.content.trim();
      } else if (provider === 'Anthropic Claude' && anthropic) {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 100,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        });
        answer = response.content[0].text.trim();
      } else {
        console.log(chalk.yellow(`⚠ ${provider} SDK not available`));
        return null;
      }

      // Check if answer contains expected answer (fuzzy match)
      const correct = answer.toLowerCase().includes(q.expectedAnswer.toLowerCase());

      results.push({
        question: q.question,
        expected: q.expectedAnswer,
        actual: answer,
        correct
      });

      console.log(correct ? chalk.green('  ✓') : chalk.red('  ✗'), q.question);
      console.log(`    Expected: ${q.expectedAnswer}`);
      console.log(`    Got: ${answer}`);

    } catch (error) {
      console.log(chalk.red(`  ✗ Error: ${error.message}`));
      results.push({
        question: q.question,
        expected: q.expectedAnswer,
        actual: `Error: ${error.message}`,
        correct: false
      });
    }
  }

  return results;
}

/**
 * Extract text content from HTML
 */
function extractTextContent(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);
  $('script, style').remove();
  return $('body').text().replace(/\s+/g, ' ').trim();
}

/**
 * Extract schemas from HTML
 */
function extractSchemas(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const $ = cheerio.load(html);
  const schemas = [];

  $('script[type="application/ld+json"]').each((i, elem) => {
    try {
      schemas.push(JSON.parse($(elem).html()));
    } catch (e) {
      // Skip invalid schemas
    }
  });

  return schemas;
}

/**
 * Main test runner
 */
async function runRelationshipTest(htmlPath, provider = 'both') {
  console.log(chalk.blue.bold('\n🧪 LLMO Relationship Understanding Test'));
  console.log(chalk.blue.bold(`Testing: ${path.basename(htmlPath)}`));
  console.log('='.repeat(60));

  // Extract schemas and relationships
  const schemas = extractSchemas(htmlPath);
  if (schemas.length === 0) {
    console.log(chalk.red('✗ No schema found in HTML file'));
    process.exit(1);
  }

  const relationships = extractRelationshipsFromSchema(schemas);
  console.log(chalk.green(`✓ Found ${relationships.length} relationships in schema`));

  if (relationships.length === 0) {
    console.log(chalk.yellow('⚠ No entity relationships found to test'));
    process.exit(0);
  }

  // Generate questions
  const questions = generateRelationshipQuestions(relationships);
  console.log(chalk.green(`✓ Generated ${questions.length} relationship questions`));

  // Extract text content
  const textContent = extractTextContent(htmlPath);
  console.log(chalk.green(`✓ Extracted ${textContent.length} characters of text content`));

  // Run tests
  const allResults = [];

  if (provider === 'openai' || provider === 'both') {
    const results = await testRelationshipUnderstanding('OpenAI GPT-4', textContent, questions);
    if (results) allResults.push({ provider: 'OpenAI GPT-4', results });
  }

  if (provider === 'anthropic' || provider === 'both') {
    const results = await testRelationshipUnderstanding('Anthropic Claude', textContent, questions);
    if (results) allResults.push({ provider: 'Anthropic Claude', results });
  }

  // Print summary
  console.log(chalk.blue.bold('\n📊 Test Results Summary'));
  console.log('='.repeat(60));

  allResults.forEach(test => {
    const correct = test.results.filter(r => r.correct).length;
    const total = test.results.length;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;

    console.log(chalk.bold(`\n${test.provider}:`));
    console.log(`  Correct: ${correct}/${total}`);
    console.log(`  Accuracy: ${accuracy.toFixed(1)}%`);

    if (accuracy >= 80) {
      console.log(chalk.green('  ✓ Excellent relationship understanding'));
    } else if (accuracy >= 60) {
      console.log(chalk.yellow('  ⚠ Good understanding, some improvements needed'));
    } else {
      console.log(chalk.red('  ✗ Poor understanding, content needs better relationship clarity'));
    }
  });

  console.log('\n' + '='.repeat(60));

  // Overall assessment
  const avgAccuracy = allResults.reduce((sum, t) => {
    const correct = t.results.filter(r => r.correct).length;
    return sum + (correct / t.results.length);
  }, 0) / allResults.length * 100;

  if (avgAccuracy >= 80) {
    console.log(chalk.green.bold('✅ RELATIONSHIPS ARE CLEARLY EXPRESSED'));
    console.log(chalk.green(`Average Accuracy: ${avgAccuracy.toFixed(1)}%`));
  } else if (avgAccuracy >= 60) {
    console.log(chalk.yellow.bold('⚠️  RELATIONSHIPS ARE MODERATELY CLEAR'));
    console.log(chalk.yellow(`Average Accuracy: ${avgAccuracy.toFixed(1)}%`));
    console.log(chalk.yellow('Recommendations:'));
    console.log(chalk.yellow('  - Make entity relationships more explicit in text'));
    console.log(chalk.yellow('  - Add more contextual information about connections'));
    console.log(chalk.yellow('  - Use clearer linking phrases'));
  } else {
    console.log(chalk.red.bold('❌ RELATIONSHIPS NEED CLARIFICATION'));
    console.log(chalk.red(`Average Accuracy: ${avgAccuracy.toFixed(1)}%`));
    console.log(chalk.red('Recommendations:'));
    console.log(chalk.red('  - Explicitly state relationships in content'));
    console.log(chalk.red('  - Add schema markup for all entity connections'));
    console.log(chalk.red('  - Use semantic linking patterns'));
    console.log(chalk.red('  - Follow LLMO cross-reference best practices'));
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node relationship-test.js <html-file> [--provider openai|anthropic|both]');
    console.log('Example: node relationship-test.js ../complete-examples/saas-product-page.html');
    process.exit(1);
  }

  const htmlPath = args[0];
  const providerIndex = args.indexOf('--provider');
  const provider = providerIndex !== -1 ? args[providerIndex + 1] : 'both';

  if (!fs.existsSync(htmlPath)) {
    console.log(chalk.red(`✗ File not found: ${htmlPath}`));
    process.exit(1);
  }

  runRelationshipTest(htmlPath, provider)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(chalk.red('Fatal error:'), error);
      process.exit(1);
    });
}

module.exports = { runRelationshipTest, extractRelationshipsFromSchema };
