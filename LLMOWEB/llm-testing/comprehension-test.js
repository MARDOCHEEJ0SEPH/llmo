#!/usr/bin/env node

/**
 * LLMO Comprehension Test
 * Tests general LLM comprehension of optimized content through Q&A
 *
 * Usage: node comprehension-test.js <html-file> [--provider openai|anthropic|both]
 * Example: node comprehension-test.js ../complete-examples/saas-product-page.html --provider both
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
 * Generate comprehension questions based on content type
 */
function generateComprehensionQuestions(schemas, textContent) {
  const questions = [];

  schemas.forEach(schema => {
    const items = schema['@graph'] || [schema];

    items.forEach(item => {
      const type = item['@type'];

      switch (type) {
        case 'Product':
        case 'SoftwareApplication':
          if (item.name) {
            questions.push({
              question: `What is ${item.name}?`,
              category: 'entity_definition',
              expectedKeywords: [item.name, item.description?.split(' ').slice(0, 5).join(' ')]
            });

            if (item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers : [item.offers];
              questions.push({
                question: `What is the price of ${item.name}?`,
                category: 'factual',
                expectedKeywords: offers.map(o => o.price).filter(Boolean)
              });
            }

            if (item.featureList) {
              questions.push({
                question: `What are the key features of ${item.name}?`,
                category: 'features',
                expectedKeywords: item.featureList.slice(0, 3)
              });
            }
          }
          break;

        case 'Organization':
          if (item.name) {
            questions.push({
              question: `What does ${item.name} do?`,
              category: 'entity_definition',
              expectedKeywords: [item.description?.split(' ').slice(0, 5).join(' ')]
            });

            if (item.foundingDate) {
              questions.push({
                question: `When was ${item.name} founded?`,
                category: 'factual',
                expectedKeywords: [item.foundingDate]
              });
            }
          }
          break;

        case 'Article':
        case 'NewsArticle':
          if (item.headline) {
            questions.push({
              question: `What is the article about?`,
              category: 'summary',
              expectedKeywords: [item.headline, item.description]
            });

            if (item.author) {
              const authorName = item.author.name || item.author;
              questions.push({
                question: `Who wrote this article?`,
                category: 'factual',
                expectedKeywords: [authorName]
              });
            }
          }
          break;

        case 'Person':
          if (item.name) {
            questions.push({
              question: `Who is ${item.name}?`,
              category: 'entity_definition',
              expectedKeywords: [item.name, item.jobTitle, item.description]
            });
          }
          break;
      }
    });
  });

  // Add general comprehension questions
  questions.push({
    question: 'What is the main topic or purpose of this page?',
    category: 'main_topic',
    expectedKeywords: [] // Will be evaluated qualitatively
  });

  questions.push({
    question: 'What problem does this product/service solve?',
    category: 'problem_solving',
    expectedKeywords: []
  });

  questions.push({
    question: 'Who is the target audience for this content?',
    category: 'audience',
    expectedKeywords: []
  });

  return questions;
}

/**
 * Evaluate answer quality
 */
function evaluateAnswer(answer, expectedKeywords) {
  if (!expectedKeywords || expectedKeywords.length === 0) {
    // Qualitative evaluation - check if answer is substantive
    return answer.length > 20 ? 1 : 0.5;
  }

  const answerLower = answer.toLowerCase();
  let matches = 0;

  expectedKeywords.forEach(keyword => {
    if (keyword && answerLower.includes(keyword.toString().toLowerCase())) {
      matches++;
    }
  });

  return matches / Math.max(expectedKeywords.length, 1);
}

/**
 * Test comprehension with LLM
 */
async function testComprehension(provider, textContent, questions) {
  console.log(chalk.blue(`\n🤖 Testing with ${provider}...`));

  const results = [];

  for (const q of questions) {
    const prompt = `Based on the following content, answer this question clearly and concisely:

Question: ${q.question}

Content:
${textContent.substring(0, 4000)}...

Answer:`;

    try {
      let answer;

      if (provider === 'OpenAI GPT-4' && openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You answer questions about content accurately based only on the provided information.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.1,
          max_tokens: 150
        });
        answer = response.choices[0].message.content.trim();
      } else if (provider === 'Anthropic Claude' && anthropic) {
        const response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 150,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        });
        answer = response.content[0].text.trim();
      } else {
        console.log(chalk.yellow(`⚠ ${provider} SDK not available`));
        return null;
      }

      const score = evaluateAnswer(answer, q.expectedKeywords);

      results.push({
        question: q.question,
        category: q.category,
        answer,
        score
      });

      const icon = score >= 0.7 ? chalk.green('✓') : score >= 0.4 ? chalk.yellow('~') : chalk.red('✗');
      console.log(icon, q.question);
      console.log(`    ${answer.substring(0, 100)}${answer.length > 100 ? '...' : ''}`);
      console.log(`    Score: ${(score * 100).toFixed(0)}%`);

    } catch (error) {
      console.log(chalk.red(`  ✗ Error: ${error.message}`));
      results.push({
        question: q.question,
        category: q.category,
        answer: `Error: ${error.message}`,
        score: 0
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
async function runComprehensionTest(htmlPath, provider = 'both') {
  console.log(chalk.blue.bold('\n🧪 LLMO Comprehension Test'));
  console.log(chalk.blue.bold(`Testing: ${path.basename(htmlPath)}`));
  console.log('='.repeat(60));

  // Extract content
  const schemas = extractSchemas(htmlPath);
  const textContent = extractTextContent(htmlPath);

  console.log(chalk.green(`✓ Extracted ${textContent.length} characters of text content`));
  console.log(chalk.green(`✓ Found ${schemas.length} schema(s)`));

  // Generate questions
  const questions = generateComprehensionQuestions(schemas, textContent);
  console.log(chalk.green(`✓ Generated ${questions.length} comprehension questions`));

  // Run tests
  const allResults = [];

  if (provider === 'openai' || provider === 'both') {
    const results = await testComprehension('OpenAI GPT-4', textContent, questions);
    if (results) allResults.push({ provider: 'OpenAI GPT-4', results });
  }

  if (provider === 'anthropic' || provider === 'both') {
    const results = await testComprehension('Anthropic Claude', textContent, questions);
    if (results) allResults.push({ provider: 'Anthropic Claude', results });
  }

  // Print summary
  console.log(chalk.blue.bold('\n📊 Test Results Summary'));
  console.log('='.repeat(60));

  allResults.forEach(test => {
    const avgScore = test.results.reduce((sum, r) => sum + r.score, 0) / test.results.length;

    // Category breakdown
    const categories = {};
    test.results.forEach(r => {
      if (!categories[r.category]) {
        categories[r.category] = { total: 0, sum: 0 };
      }
      categories[r.category].total++;
      categories[r.category].sum += r.score;
    });

    console.log(chalk.bold(`\n${test.provider}:`));
    console.log(`  Overall Score: ${(avgScore * 100).toFixed(1)}%`);

    console.log('  Category Breakdown:');
    Object.entries(categories).forEach(([cat, data]) => {
      const catScore = (data.sum / data.total) * 100;
      console.log(`    ${cat}: ${catScore.toFixed(1)}%`);
    });

    if (avgScore >= 0.8) {
      console.log(chalk.green('  ✓ Excellent comprehension'));
    } else if (avgScore >= 0.6) {
      console.log(chalk.yellow('  ⚠ Good comprehension, room for improvement'));
    } else {
      console.log(chalk.red('  ✗ Poor comprehension, content needs optimization'));
    }
  });

  console.log('\n' + '='.repeat(60));

  // Overall assessment
  const avgScore = allResults.reduce((sum, t) => {
    return sum + t.results.reduce((s, r) => s + r.score, 0) / t.results.length;
  }, 0) / allResults.length;

  if (avgScore >= 0.8) {
    console.log(chalk.green.bold('✅ CONTENT IS HIGHLY COMPREHENSIBLE'));
    console.log(chalk.green(`Average Score: ${(avgScore * 100).toFixed(1)}%`));
    console.log(chalk.green('\nStrengths:'));
    console.log(chalk.green('  - Information is clearly presented'));
    console.log(chalk.green('  - Entity definitions are unambiguous'));
    console.log(chalk.green('  - Key facts are easily extractable'));
  } else if (avgScore >= 0.6) {
    console.log(chalk.yellow.bold('⚠️  CONTENT IS MODERATELY COMPREHENSIBLE'));
    console.log(chalk.yellow(`Average Score: ${(avgScore * 100).toFixed(1)}%`));
    console.log(chalk.yellow('\nRecommendations:'));
    console.log(chalk.yellow('  - Increase information density (1-2 facts/sentence)'));
    console.log(chalk.yellow('  - Define entities more clearly'));
    console.log(chalk.yellow('  - Add more schema markup'));
    console.log(chalk.yellow('  - Improve semantic structure'));
  } else {
    console.log(chalk.red.bold('❌ CONTENT COMPREHENSION NEEDS IMPROVEMENT'));
    console.log(chalk.red(`Average Score: ${(avgScore * 100).toFixed(1)}%`));
    console.log(chalk.red('\nCritical Issues:'));
    console.log(chalk.red('  - Information is difficult to extract'));
    console.log(chalk.red('  - Entities are poorly defined'));
    console.log(chalk.red('  - Missing schema markup'));
    console.log(chalk.red('  - Follow LLMO framework systematically:'));
    console.log(chalk.red('    1. Layer 1: Entity Definition'));
    console.log(chalk.red('    2. Layer 2: Semantic Structure'));
    console.log(chalk.red('    3. Layer 3: Machine Parsing'));
    console.log(chalk.red('    4. Layer 4: Human Experience'));
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node comprehension-test.js <html-file> [--provider openai|anthropic|both]');
    console.log('Example: node comprehension-test.js ../complete-examples/saas-product-page.html');
    process.exit(1);
  }

  const htmlPath = args[0];
  const providerIndex = args.indexOf('--provider');
  const provider = providerIndex !== -1 ? args[providerIndex + 1] : 'both';

  if (!fs.existsSync(htmlPath)) {
    console.log(chalk.red(`✗ File not found: ${htmlPath}`));
    process.exit(1);
  }

  runComprehensionTest(htmlPath, provider)
    .then(() => process.exit(0))
    .catch(error => {
      console.error(chalk.red('Fatal error:'), error);
      process.exit(1);
    });
}

module.exports = { runComprehensionTest, generateComprehensionQuestions };
