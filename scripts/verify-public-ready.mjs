#!/usr/bin/env node

/**
 * Verification script for public release
 * Checks for company-specific content and validates required files
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Load forbidden patterns from file
async function loadForbiddenPatterns() {
  const patternsFile = join(__dirname, 'forbidden-patterns.txt');
  try {
    const content = await readFile(patternsFile, 'utf-8');
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')) // Skip empty lines and comments
      .map(pattern => new RegExp(pattern, 'gi'));
  } catch (_error) {
    console.error('⚠️  Warning: Could not load forbidden-patterns.txt, using default patterns');
    return [];
  }
}

let FORBIDDEN_PATTERNS = [];

// Allowed contexts where patterns may appear (e.g., in comments explaining the change)
const ALLOWED_CONTEXTS = [
  /example/i,
  /placeholder/i,
  /replace with/i,
  /your[- ]?domain/i,
  /your[- ]?site/i,
];

// Files to scan
const SCAN_EXTENSIONS = ['.ts', '.tsx', '.js', '.mjs', '.json', '.md', '.yml', '.yaml'];

// Files/directories to skip
const SKIP_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  '.claude',
  '.taskmaster',
  'public/reports',
  '.unlighthouse',
  'package-lock.json',
  '.env',
  '.env.local',
  '.env.example', // Skip .env.example as it has placeholder examples
  'forbidden-patterns.txt', // Skip patterns file (contains the patterns we're looking for)
];

// Required files for public release
const REQUIRED_FILES = [
  'README.md',
  'LICENSE',
  'CONTRIBUTING.md',
  'CLAUDE.md',
  '.env.example',
  'docs/SETUP.md',
  'docs/PUBLIC-RELEASE.md',
  'lib/config.ts',
  'middleware.ts',
  'app/page.tsx',
  'app/layout.tsx',
  'app/api/reports/upload/route.ts',
  'scripts/upload-reports.mjs',
  '.github/workflows/unlighthouse.yml',
];

// Environment variables that should be in .env.example
const REQUIRED_ENV_VARS = [
  'TARGET_BASE_URL',
  'TARGET_DOMAIN',
  'DASHBOARD_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
  'ANTHROPIC_API_KEY',
  'CI_UPLOAD_SIGNING_KEY',
];

let issues = [];
let warnings = [];
let filesScanned = 0;

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => filePath.includes(pattern));
}

function isAllowedContext(line) {
  return ALLOWED_CONTEXTS.some(pattern => pattern.test(line));
}

async function scanFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = filePath.replace(ROOT_DIR + '/', '');

  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (pattern.test(line) && !isAllowedContext(line)) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        const match = line.match(pattern);
        if (match) {
          issues.push({
            file: relativePath,
            line: index + 1,
            match: match[0],
            context: line.trim().substring(0, 100),
          });
        }
      }
      // Reset lastIndex after test
      pattern.lastIndex = 0;
    });
  });

  filesScanned++;
}

async function scanDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (shouldSkip(fullPath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = extname(entry.name);
      if (SCAN_EXTENSIONS.includes(ext)) {
        await scanFile(fullPath);
      }
    }
  }
}

async function checkRequiredFiles() {
  const missing = [];

  for (const file of REQUIRED_FILES) {
    const fullPath = join(ROOT_DIR, file);
    try {
      await stat(fullPath);
    } catch {
      missing.push(file);
    }
  }

  return missing;
}

async function checkEnvExample() {
  const envExamplePath = join(ROOT_DIR, '.env.example');
  const missing = [];

  try {
    const content = await readFile(envExamplePath, 'utf-8');

    for (const envVar of REQUIRED_ENV_VARS) {
      if (!content.includes(envVar)) {
        missing.push(envVar);
      }
    }
  } catch {
    warnings.push('.env.example file not found');
    return [];
  }

  return missing;
}

async function main() {
  console.log('🔍 Verifying public release readiness...\n');

  // Load forbidden patterns
  FORBIDDEN_PATTERNS = await loadForbiddenPatterns();
  if (FORBIDDEN_PATTERNS.length === 0) {
    console.log('⚠️  No forbidden patterns loaded, verification will be limited\n');
  } else {
    console.log(`📋 Loaded ${FORBIDDEN_PATTERNS.length} forbidden patterns\n`);
  }

  // Check for required files
  console.log('📁 Checking required files...');
  const missingFiles = await checkRequiredFiles();
  if (missingFiles.length > 0) {
    console.log(`   ❌ Missing files: ${missingFiles.join(', ')}`);
    issues.push(...missingFiles.map(f => ({ file: f, issue: 'Required file missing' })));
  } else {
    console.log('   ✅ All required files present');
  }

  // Check .env.example
  console.log('\n📝 Checking .env.example completeness...');
  const missingEnvVars = await checkEnvExample();
  if (missingEnvVars.length > 0) {
    console.log(`   ⚠️  Missing env vars: ${missingEnvVars.join(', ')}`);
    warnings.push(...missingEnvVars.map(v => `Missing env var in .env.example: ${v}`));
  } else {
    console.log('   ✅ All required environment variables documented');
  }

  // Scan for forbidden patterns
  console.log('\n🔎 Scanning for company-specific content...');
  await scanDirectory(ROOT_DIR);
  console.log(`   Scanned ${filesScanned} files`);

  // Report results
  console.log('\n' + '='.repeat(60));

  if (issues.length === 0 && warnings.length === 0) {
    console.log('\n✅ PUBLIC RELEASE READY\n');
    console.log('No company-specific content found.');
    console.log('All required files present.');
    console.log('Environment variables documented.\n');
    process.exit(0);
  }

  if (issues.length > 0) {
    console.log(`\n❌ ISSUES FOUND (${issues.length}):\n`);

    const patternIssues = issues.filter(i => i.match);
    const fileIssues = issues.filter(i => i.issue);

    if (fileIssues.length > 0) {
      console.log('Missing files:');
      fileIssues.forEach(i => {
        console.log(`  • ${i.file}`);
      });
      console.log();
    }

    if (patternIssues.length > 0) {
      console.log('Company-specific content found:');
      patternIssues.forEach(i => {
        console.log(`  • ${i.file}:${i.line}`);
        console.log(`    Match: "${i.match}"`);
        console.log(`    Context: ${i.context}`);
        console.log();
      });
    }
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  WARNINGS (${warnings.length}):\n`);
    warnings.forEach(w => {
      console.log(`  • ${w}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\nPlease fix issues before public release.\n');
  process.exit(1);
}

main().catch(err => {
  console.error('Error running verification:', err);
  process.exit(1);
});
