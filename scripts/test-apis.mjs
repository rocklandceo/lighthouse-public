#!/usr/bin/env node

/**
 * API Endpoint Testing Script
 * Tests all dashboard API endpoints for correct responses
 *
 * Usage: node scripts/test-apis.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';

const endpoints = [
  { name: 'AI Insights', path: '/api/ai-insights', method: 'GET', auth: true },
  { name: 'Analytics', path: '/api/analytics', method: 'GET', auth: true },
  { name: 'Competitors', path: '/api/competitors', method: 'GET', auth: true },
  { name: 'Search Console', path: '/api/search-console', method: 'GET', auth: true },
  { name: 'Trigger Scan', path: '/api/trigger-scan', method: 'POST', auth: true },
];

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

async function testEndpoint(endpoint) {
  const url = `${baseUrl}${endpoint.path}`;
  console.log(`\n${colors.cyan}Testing: ${endpoint.name}${colors.reset}`);
  console.log(`${colors.dim}${endpoint.method} ${url}${colors.reset}`);

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const status = response.status;
    const statusText = response.statusText;

    // For protected endpoints, 401 is expected without auth
    if (endpoint.auth && status === 401) {
      console.log(`${colors.yellow}⚠ Status: ${status} ${statusText} (Expected - requires authentication)${colors.reset}`);
      return { name: endpoint.name, status: 'auth_required', statusCode: status };
    }

    if (status >= 200 && status < 300) {
      const data = await response.json();
      console.log(`${colors.green}✓ Status: ${status} ${statusText}${colors.reset}`);
      console.log(`${colors.dim}Response keys: ${Object.keys(data).join(', ')}${colors.reset}`);
      return { name: endpoint.name, status: 'success', statusCode: status, keys: Object.keys(data) };
    } else {
      let errorMessage = '';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch {
        errorMessage = await response.text();
      }
      console.log(`${colors.red}✗ Status: ${status} ${statusText}${colors.reset}`);
      console.log(`${colors.dim}Error: ${errorMessage}${colors.reset}`);
      return { name: endpoint.name, status: 'error', statusCode: status, error: errorMessage };
    }
  } catch (error) {
    console.log(`${colors.red}✗ Network Error: ${error.message}${colors.reset}`);
    return { name: endpoint.name, status: 'network_error', error: error.message };
  }
}

async function main() {
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Dashboard API Testing Suite${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`\n${colors.dim}Base URL: ${baseUrl}${colors.reset}`);
  console.log(`${colors.dim}Note: Protected endpoints will return 401 without valid session${colors.reset}`);

  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }

  // Summary
  console.log(`\n${colors.cyan}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  Summary${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════${colors.reset}\n`);

  const success = results.filter(r => r.status === 'success').length;
  const authRequired = results.filter(r => r.status === 'auth_required').length;
  const errors = results.filter(r => r.status === 'error' || r.status === 'network_error').length;

  console.log(`${colors.green}✓ Success: ${success}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Auth Required: ${authRequired}${colors.reset}`);
  console.log(`${colors.red}✗ Errors: ${errors}${colors.reset}`);

  if (authRequired > 0) {
    console.log(`\n${colors.dim}To test authenticated endpoints, you need to:${colors.reset}`);
    console.log(`${colors.dim}1. Run the development server: npm run dev${colors.reset}`);
    console.log(`${colors.dim}2. Sign in through the browser at ${baseUrl}${colors.reset}`);
    console.log(`${colors.dim}3. Use browser dev tools to test endpoints manually${colors.reset}`);
  }

  // Return exit code based on results
  process.exit(errors > 0 ? 1 : 0);
}

main().catch(console.error);
