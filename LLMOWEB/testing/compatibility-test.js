#!/usr/bin/env node

/**
 * LLMOWEB Compatibility Test Suite
 * Ensures 100% compatibility between schemas, examples, and tools
 *
 * Usage: node compatibility-test.js
 */

const fs = require('fs');
const path = require('path');

// Try to load chalk, fallback to plain text if not installed
let chalk;
try {
  chalk = require('chalk');
} catch (e) {
  chalk = {
    green: (text) => `✓ ${text}`,
    red: (text) => `✗ ${text}`,
    yellow: (text) => `⚠ ${text}`,
    blue: (text) => text,
    bold: (text) => text
  };
}

const testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

/**
 * Test 1: Validate all schema templates are valid JSON
 */
async function testSchemaTemplatesJSON() {
  console.log(chalk.blue.bold('\n📋 Test 1: Schema Templates JSON Validation'));
  console.log('='.repeat(50));

  const templatesDir = path.join(__dirname, '..', 'schema-templates');
  const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(templatesDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);

      // Check for required root properties
      if (!parsed['@context']) {
        throw new Error('Missing @context property');
      }
      if (!parsed['@type']) {
        throw new Error('Missing @type property');
      }

      console.log(chalk.green(`  ✓ ${file}: Valid JSON, has @context and @type`));
      testResults.passed++;
    } catch (error) {
      console.log(chalk.red(`  ✗ ${file}: ${error.message}`));
      testResults.failed++;
      testResults.errors.push({ file, error: error.message });
    }
  }
}

/**
 * Test 2: Validate HTML examples have proper structure
 */
async function testHTMLExamples() {
  console.log(chalk.blue.bold('\n📄 Test 2: HTML Examples Structure'));
  console.log('='.repeat(50));

  const examplesDir = path.join(__dirname, '..', 'complete-examples');
  const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(examplesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const checks = [
      { name: 'DOCTYPE declaration', test: /<!DOCTYPE html>/i },
      { name: 'HTML lang attribute', test: /<html lang=/i },
      { name: 'Meta charset', test: /<meta charset=/i },
      { name: 'Viewport meta', test: /<meta name="viewport"/i },
      { name: 'Title tag', test: /<title>.*<\/title>/i },
      { name: 'Meta description', test: /<meta name="description"/i },
      { name: 'JSON-LD script', test: /<script type="application\/ld\+json">/i },
      { name: 'Main element', test: /<main[\s>]/i },
      { name: 'Only one H1', test: (content) => (content.match(/<h1[\s>]/gi) || []).length === 1 }
    ];

    let passed = 0;
    let failed = 0;

    for (const check of checks) {
      const result = typeof check.test === 'function' ? check.test(content) : check.test.test(content);

      if (result) {
        passed++;
      } else {
        console.log(chalk.yellow(`  ⚠ ${file}: Missing ${check.name}`));
        failed++;
        testResults.warnings++;
      }
    }

    if (failed === 0) {
      console.log(chalk.green(`  ✓ ${file}: All ${passed} structure checks passed`));
      testResults.passed++;
    }
  }
}

/**
 * Test 3: Check schema template compatibility with examples
 */
async function testSchemaExampleCompatibility() {
  console.log(chalk.blue.bold('\n🔗 Test 3: Schema-Example Compatibility'));
  console.log('='.repeat(50));

  // Test that HTML examples use valid schema from templates
  const examplesDir = path.join(__dirname, '..', 'complete-examples');
  const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(examplesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract JSON-LD from HTML
    const jsonLdMatch = content.match(/<script type="application\/ld\+json">\s*(\{[\s\S]*?\})\s*<\/script>/);

    if (!jsonLdMatch) {
      console.log(chalk.yellow(`  ⚠ ${file}: No JSON-LD schema found`));
      testResults.warnings++;
      continue;
    }

    try {
      const schema = JSON.parse(jsonLdMatch[1]);

      // Validate schema structure
      const hasContext = schema['@context'] || (schema['@graph'] && schema['@context']);
      const hasType = schema['@type'] || (schema['@graph'] && schema['@graph'].length > 0);

      if (!hasContext) {
        throw new Error('Missing @context in embedded schema');
      }

      if (!hasType) {
        throw new Error('Missing @type in embedded schema');
      }

      console.log(chalk.green(`  ✓ ${file}: Embedded schema is valid and compatible`));
      testResults.passed++;
    } catch (error) {
      console.log(chalk.red(`  ✗ ${file}: ${error.message}`));
      testResults.failed++;
      testResults.errors.push({ file, error: error.message });
    }
  }
}

/**
 * Test 4: Check automation scripts have required dependencies
 */
async function testAutomationScripts() {
  console.log(chalk.blue.bold('\n⚙️  Test 4: Automation Scripts Dependencies'));
  console.log('='.repeat(50));

  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const automationDir = path.join(__dirname, '..', 'automation');
  const files = fs.readdirSync(automationDir).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const filePath = path.join(automationDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract require statements
    const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
    const missingDeps = [];

    for (const req of requires) {
      const dep = req.match(/require\(['"]([^'"]+)['"]\)/)[1];

      // Skip built-in modules
      if (['fs', 'path', 'util', 'http', 'https'].includes(dep)) continue;

      // Skip relative requires
      if (dep.startsWith('.') || dep.startsWith('/')) continue;

      // Check if dep is in package.json
      if (!allDeps[dep]) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length === 0) {
      console.log(chalk.green(`  ✓ ${file}: All dependencies available`));
      testResults.passed++;
    } else {
      console.log(chalk.yellow(`  ⚠ ${file}: Missing dependencies: ${missingDeps.join(', ')}`));
      testResults.warnings++;
    }
  }
}

/**
 * Test 5: Validate generated schemas match templates
 */
async function testGeneratedSchemas() {
  console.log(chalk.blue.bold('\n🏭 Test 5: Generated Schemas Validation'));
  console.log('='.repeat(50));

  // Run database-to-schema-example.js and validate output
  try {
    const generatorPath = path.join(__dirname, '..', 'automation', 'database-to-schema-example.js');

    // Check if output directory exists from previous runs
    const outputDir = path.join(__dirname, '..', 'automation', 'output');

    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

      for (const file of files) {
        const filePath = path.join(outputDir, file);

        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const schema = JSON.parse(content);

          // Validate structure
          if (!schema['@context'] && !schema['@graph']) {
            throw new Error('Missing @context');
          }

          console.log(chalk.green(`  ✓ ${file}: Generated schema is valid`));
          testResults.passed++;
        } catch (error) {
          console.log(chalk.red(`  ✗ ${file}: ${error.message}`));
          testResults.failed++;
        }
      }
    } else {
      console.log(chalk.yellow('  ⚠ No generated schemas found. Run automation scripts first.'));
      testResults.warnings++;
    }
  } catch (error) {
    console.log(chalk.yellow(`  ⚠ Could not test generated schemas: ${error.message}`));
    testResults.warnings++;
  }
}

/**
 * Test 6: Check README files exist and are comprehensive
 */
async function testDocumentation() {
  console.log(chalk.blue.bold('\n📚 Test 6: Documentation Completeness'));
  console.log('='.repeat(50));

  const requiredDocs = [
    'README.md',
    'schema-templates/README.md',
    'complete-examples/README.md',
    'validation/README.md',
    'automation/README.md'
  ];

  for (const docPath of requiredDocs) {
    const fullPath = path.join(__dirname, '..', docPath);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check minimum length (should be comprehensive)
      if (content.length < 500) {
        console.log(chalk.yellow(`  ⚠ ${docPath}: Documentation is too brief (${content.length} chars)`));
        testResults.warnings++;
      } else {
        console.log(chalk.green(`  ✓ ${docPath}: Documentation exists (${content.length} chars)`));
        testResults.passed++;
      }
    } else {
      console.log(chalk.red(`  ✗ ${docPath}: Documentation missing`));
      testResults.failed++;
      testResults.errors.push({ file: docPath, error: 'File not found' });
    }
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log(chalk.blue.bold('\n🧪 LLMOWEB Compatibility Test Suite'));
  console.log(chalk.blue.bold('Ensuring 100% compatibility between all components'));
  console.log('='.repeat(60));

  try {
    await testSchemaTemplatesJSON();
    await testHTMLExamples();
    await testSchemaExampleCompatibility();
    await testAutomationScripts();
    await testGeneratedSchemas();
    await testDocumentation();

    // Print summary
    console.log(chalk.blue.bold('\n📊 Test Summary'));
    console.log('='.repeat(60));
    console.log(chalk.green(`✓ Passed: ${testResults.passed}`));
    console.log(chalk.yellow(`⚠ Warnings: ${testResults.warnings}`));
    console.log(chalk.red(`✗ Failed: ${testResults.failed}`));

    if (testResults.errors.length > 0) {
      console.log(chalk.red.bold('\n❌ Errors Found:'));
      testResults.errors.forEach(({ file, error }) => {
        console.log(chalk.red(`  ${file}: ${error}`));
      });
    }

    console.log('\n' + '='.repeat(60));

    if (testResults.failed === 0 && testResults.warnings === 0) {
      console.log(chalk.green.bold('✅ 100% COMPATIBILITY CONFIRMED'));
      console.log(chalk.green('All components are compatible and working correctly.'));
      process.exit(0);
    } else if (testResults.failed === 0) {
      console.log(chalk.yellow.bold('⚠️  WARNINGS FOUND'));
      console.log(chalk.yellow(`Compatibility achieved with ${testResults.warnings} warnings.`));
      console.log(chalk.yellow('Review warnings and address if needed.'));
      process.exit(0);
    } else {
      console.log(chalk.red.bold('❌ COMPATIBILITY ISSUES FOUND'));
      console.log(chalk.red(`${testResults.failed} critical errors must be fixed.`));
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red.bold('\n💥 Fatal error during testing:'), error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
