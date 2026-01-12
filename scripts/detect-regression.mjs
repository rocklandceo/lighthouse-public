#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const REGRESSION_THRESHOLD = parseInt(process.env.REGRESSION_THRESHOLD || '10', 10);
const REPORTS_DIR = './public/reports';

// Parse timestamp directory name to Date
function parseTimestamp(timestamp) {
  return new Date(
    parseInt(timestamp.slice(0, 4)),     // year
    parseInt(timestamp.slice(4, 6)) - 1, // month (0-indexed)
    parseInt(timestamp.slice(6, 8)),     // day
    parseInt(timestamp.slice(9, 11)),    // hours
    parseInt(timestamp.slice(11, 13)),   // minutes
    parseInt(timestamp.slice(13, 15))    // seconds
  );
}

// Get all run directories sorted by date
function getAllRuns() {
  const runsPath = path.join(REPORTS_DIR, 'runs');

  if (!fs.existsSync(runsPath)) {
    return [];
  }

  const timestampPattern = /^\d{8}-\d{6}$/;
  const dirs = fs.readdirSync(runsPath);

  const runs = dirs
    .filter(dir => timestampPattern.test(dir))
    .map(dir => ({
      timestamp: dir,
      date: parseTimestamp(dir),
      path: path.join(runsPath, dir, 'ci-result.json'),
    }))
    .filter(run => fs.existsSync(run.path))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  return runs;
}

// Read scores from a report
function readScores(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const results = Array.isArray(data) ? data : [data];

    if (results.length === 0) {
      throw new Error('Report contains no results');
    }

    // Calculate average scores across all URLs (scores are 0-1, convert to 0-100)
    const avgScores = results.reduce((acc, result) => {
      acc.performance += (result.performance || 0) * 100;
      acc.accessibility += (result.accessibility || 0) * 100;
      acc['best-practices'] += (result['best-practices'] || 0) * 100;
      acc.seo += (result.seo || 0) * 100;
      return acc;
    }, { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 });

    const count = results.length;

    return {
      performance: Math.round(avgScores.performance / count),
      accessibility: Math.round(avgScores.accessibility / count),
      'best-practices': Math.round(avgScores['best-practices'] / count),
      seo: Math.round(avgScores.seo / count),
    };
  } catch (error) {
    throw new Error(`Failed to read scores from ${filePath}: ${error.message}`);
  }
}

// Detect regressions
function detectRegressions(currentScores, previousScores, threshold) {
  const regressions = [];
  const categories = ['performance', 'accessibility', 'best-practices', 'seo'];

  categories.forEach(category => {
    const current = currentScores[category];
    const previous = previousScores[category];
    const diff = current - previous;

    if (diff < -threshold) {
      regressions.push({
        category,
        current,
        previous,
        diff,
        severity: diff <= -20 ? 'critical' : diff <= -10 ? 'major' : 'minor',
      });
    }
  });

  return regressions;
}

// Main function
async function main() {
  console.log('Starting regression detection...');
  console.log(`Regression threshold: ${REGRESSION_THRESHOLD} points`);

  // Get all runs
  const allRuns = getAllRuns();

  if (allRuns.length < 2) {
    console.log('✓ Need at least 2 runs for regression detection, skipping');
    return { regressions: [], currentScores: null, previousScores: null };
  }

  // Compare latest two runs
  const currentRun = allRuns[0];
  const previousRun = allRuns[1];

  const currentScores = readScores(currentRun.path);
  console.log(`Current run: ${currentRun.timestamp}`);
  console.log('Current scores:', currentScores);

  const previousScores = readScores(previousRun.path);
  console.log(`Previous run: ${previousRun.timestamp}`);
  console.log('Previous scores:', previousScores);

  // Detect regressions
  const regressions = detectRegressions(currentScores, previousScores, REGRESSION_THRESHOLD);

  if (regressions.length === 0) {
    console.log('✓ No regressions detected');
  } else {
    console.log(`⚠ Found ${regressions.length} regression(s):`);
    regressions.forEach(r => {
      console.log(`  - ${r.category}: ${r.previous} → ${r.current} (${r.diff}) [${r.severity}]`);
    });
  }

  // Return results for use in other scripts
  return {
    regressions,
    currentScores,
    previousScores,
    threshold: REGRESSION_THRESHOLD,
  };
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(result => {
      // Write regressions array to JSON file for the notify script to consume
      if (result.regressions && result.regressions.length > 0) {
        const outputPath = './regression-report.json';
        fs.writeFileSync(outputPath, JSON.stringify(result.regressions, null, 2), 'utf-8');
        console.log(`✓ Regression results written to ${outputPath}`);

        // Exit with code 1 if critical regressions found
        const criticalRegressions = result.regressions.filter(r => r.severity === 'critical');
        if (criticalRegressions.length > 0) {
          console.error(`❌ Found ${criticalRegressions.length} critical regression(s)`);
          process.exit(1);
        }
      } else {
        console.log('✓ No regressions to report');
      }
    })
    .catch(error => {
      console.error('Error:', error.message);
      process.exit(1);
    });
}

export { main, detectRegressions };
