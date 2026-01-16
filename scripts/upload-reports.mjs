#!/usr/bin/env node

/**
 * Upload Lighthouse reports to KV storage via API
 *
 * This script reads the scan results from the local filesystem
 * and uploads them to the dashboard API for storage in Vercel KV.
 *
 * Environment variables:
 * - DASHBOARD_URL: The base URL of the dashboard (required)
 * - TARGET_BASE_URL: The base URL of the target site (required)
 * - CI_UPLOAD_SIGNING_KEY: HMAC signing key for secure uploads (required)
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const REPORTS_DIR = path.join(process.cwd(), 'public', 'reports');

/**
 * Generate timestamp in YYYYMMDD-HHMMSS format
 */
function generateTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Read and aggregate scores from ci-result.json files
 */
function readDeviceScores(devicePath, targetBaseUrl) {
  const ciResultPath = path.join(devicePath, 'ci-result.json');

  if (!fs.existsSync(ciResultPath)) {
    console.log(`No ci-result.json found at ${ciResultPath}`);
    return null;
  }

  try {
    const data = JSON.parse(fs.readFileSync(ciResultPath, 'utf-8'));
    const results = Array.isArray(data) ? data : [data];

    if (results.length === 0) {
      return null;
    }

    // Calculate average scores (scores are 0-1, convert to 0-100)
    const totals = results.reduce(
      (acc, result) => {
        acc.performance += (result.performance || 0) * 100;
        acc.accessibility += (result.accessibility || 0) * 100;
        acc['best-practices'] += (result['best-practices'] || 0) * 100;
        acc.seo += (result.seo || 0) * 100;
        return acc;
      },
      { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 }
    );

    const count = results.length;

    return {
      scores: {
        performance: Math.round(totals.performance / count),
        accessibility: Math.round(totals.accessibility / count),
        'best-practices': Math.round(totals['best-practices'] / count),
        seo: Math.round(totals.seo / count),
      },
      pageScores: results.map((result) => ({
        path: result.path || '/',
        url: `${targetBaseUrl}${result.path === '/' ? '' : result.path || ''}`,
        scores: {
          performance: Math.round((result.performance || 0) * 100),
          accessibility: Math.round((result.accessibility || 0) * 100),
          'best-practices': Math.round((result['best-practices'] || 0) * 100),
          seo: Math.round((result.seo || 0) * 100),
        },
      })),
    };
  } catch (error) {
    console.error(`Error reading ${ciResultPath}:`, error.message);
    return null;
  }
}

/**
 * Build the latest report data from local scan results
 */
function buildLatestReportData(targetBaseUrl) {
  const latestDir = path.join(REPORTS_DIR, 'latest');
  const devices = ['mobile', 'desktop'];
  const deviceScores = {};
  let allPageScores = [];

  for (const device of devices) {
    const devicePath = path.join(latestDir, device);
    const deviceData = readDeviceScores(devicePath, targetBaseUrl);

    if (deviceData) {
      deviceScores[device] = deviceData.scores;

      // Merge page scores (prefer desktop scores for same page)
      for (const pageScore of deviceData.pageScores) {
        const existing = allPageScores.find((p) => p.path === pageScore.path);
        if (existing) {
          existing.scores[device] = pageScore.scores;
        } else {
          allPageScores.push({
            path: pageScore.path,
            url: pageScore.url,
            scores: { [device]: pageScore.scores },
          });
        }
      }
    }
  }

  if (!deviceScores.mobile && !deviceScores.desktop) {
    console.error('No device scores found');
    return null;
  }

  const timestamp = generateTimestamp();

  return {
    latest: {
      timestamp,
      scores: deviceScores,
      pageScores: allPageScores,
    },
    run: {
      timestamp,
      date: new Date().toISOString(),
      reports: [
        {
          timestamp,
          scores: deviceScores,
          url: 'Multiple URLs',
        },
      ],
      pageScores: allPageScores,
    },
  };
}

/**
 * Generate HMAC signature for secure uploads
 */
function generateHmacSignature(bodyString, signingKey) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const bodyHash = crypto.createHash('sha256').update(bodyString).digest('hex');
  const signatureBase = `${timestamp}.${nonce}.${bodyHash}`;
  const signature = crypto.createHmac('sha256', signingKey).update(signatureBase).digest('hex');

  return { timestamp, nonce, signature };
}

/**
 * Upload reports to the dashboard API with HMAC signature
 */
async function uploadWithHmac(uploadUrl, data, signingKey) {
  const bodyString = JSON.stringify(data);
  const { timestamp, nonce, signature } = generateHmacSignature(bodyString, signingKey);

  console.log('Using HMAC signature authentication');

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      'X-Signature': signature,
    },
    body: bodyString,
  });

  return response;
}

/**
/**
 * Upload reports to the dashboard API
 */
async function uploadReports(data) {
  const dashboardUrl = process.env.DASHBOARD_URL;
  const signingKey = process.env.CI_UPLOAD_SIGNING_KEY;

  if (!dashboardUrl) {
    throw new Error('DASHBOARD_URL environment variable is required');
  }

  if (!signingKey) {
    throw new Error('CI_UPLOAD_SIGNING_KEY is required');
  }

  const uploadUrl = `${dashboardUrl}/api/reports/upload`;

  console.log(`Uploading reports to ${uploadUrl}...`);

  const response = await uploadWithHmac(uploadUrl, data, signingKey);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed (${response.status}): ${errorText}`);
  }

  // Log rate limit info if present
  const remaining = response.headers.get('X-RateLimit-Remaining');
  if (remaining !== null) {
    console.log(`Rate limit remaining: ${remaining}`);
  }

  return response.json();
}

/**
 * Main execution
 */
async function main() {
  console.log('=== Lighthouse Report Upload ===\n');

  // Validate required environment variables
  const targetBaseUrl = process.env.TARGET_BASE_URL;
  if (!targetBaseUrl) {
    console.error('ERROR: TARGET_BASE_URL environment variable is required');
    process.exit(1);
  }

  // Build report data from local files
  console.log('Reading local scan results...');
  const reportData = buildLatestReportData(targetBaseUrl);

  if (!reportData) {
    console.error('Failed to build report data from local scans');
    process.exit(1);
  }

  console.log(`Built report data with timestamp: ${reportData.latest.timestamp}`);
  console.log(`Desktop scores:`, reportData.latest.scores.desktop || 'N/A');
  console.log(`Mobile scores:`, reportData.latest.scores.mobile || 'N/A');
  console.log(`Page count: ${reportData.latest.pageScores.length}`);

  // Upload to API
  try {
    const result = await uploadReports(reportData);
    console.log('\nUpload successful:', result);

    if (result.authMethod) {
      console.log(`Authentication method used: ${result.authMethod}`);
    }
  } catch (error) {
    console.error('\nUpload failed:', error.message);
    process.exit(1);
  }

  console.log('\n=== Upload Complete ===');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
