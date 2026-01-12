#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const DEVICES = ['mobile', 'desktop'];
const REGRESSION_RESULT_PATH = './regression-report.json';
const DASHBOARD_URL = process.env.DASHBOARD_URL;
const TARGET_DOMAIN = process.env.TARGET_DOMAIN || 'your site';

// Score thresholds - alert if scores drop below these values
const SCORE_THRESHOLDS = {
  performance: 80,
  accessibility: 85,
  'best-practices': 85,
  seo: 90,
};

// Get overall status
function getOverallStatus(scores) {
  const avgScore = Math.round(
    (scores.performance + scores.accessibility + scores['best-practices'] + scores.seo) / 4
  );

  if (avgScore >= 90) return { emoji: '✅', text: 'Excellent', color: 'good' };
  if (avgScore >= 75) return { emoji: '✔️', text: 'Good', color: 'good' };
  if (avgScore >= 50) return { emoji: '⚠️', text: 'Needs Improvement', color: 'warning' };
  return { emoji: '❌', text: 'Poor', color: 'danger' };
}

// Check for threshold breaches across all devices
function checkThresholdBreaches(deviceScores) {
  const breaches = [];

  for (const [device, scores] of Object.entries(deviceScores)) {
    for (const [category, threshold] of Object.entries(SCORE_THRESHOLDS)) {
      const score = scores[category];
      if (score !== undefined && score < threshold) {
        breaches.push({
          device: device.charAt(0).toUpperCase() + device.slice(1),
          category: category === 'best-practices' ? 'Best Practices' :
                    category.charAt(0).toUpperCase() + category.slice(1),
          score,
          threshold,
          gap: threshold - score,
        });
      }
    }
  }

  return breaches;
}

// Send Slack notification
async function sendSlackNotification() {
  // Validate webhook URL
  if (!SLACK_WEBHOOK_URL) {
    console.log('⚠ SLACK_WEBHOOK_URL not set, skipping notification');
    return;
  }

  // Read CI results from all devices
  let allResults = [];
  const deviceScores = {};

  for (const device of DEVICES) {
    const deviceReportPath = path.join('public', 'reports', 'latest', device, 'ci-result.json');

    if (fs.existsSync(deviceReportPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(deviceReportPath, 'utf-8'));
        const results = Array.isArray(data) ? data : [data];
        allResults.push(...results);

        // Calculate device-specific scores for display
        const deviceAvg = results.reduce((acc, result) => {
          acc.performance += (result.performance || 0) * 100;
          acc.accessibility += (result.accessibility || 0) * 100;
          acc['best-practices'] += (result['best-practices'] || 0) * 100;
          acc.seo += (result.seo || 0) * 100;
          return acc;
        }, { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 });

        const count = results.length;
        deviceScores[device] = {
          performance: Math.round(deviceAvg.performance / count),
          accessibility: Math.round(deviceAvg.accessibility / count),
          'best-practices': Math.round(deviceAvg['best-practices'] / count),
          seo: Math.round(deviceAvg.seo / count),
        };
      } catch (error) {
        console.warn(`Warning: Failed to read ${device} report:`, error.message);
      }
    }
  }

  if (allResults.length === 0) {
    throw new Error('No device reports found');
  }

  // Calculate overall average scores across all devices and URLs
  const avgScores = allResults.reduce((acc, result) => {
    acc.performance += (result.performance || 0) * 100;
    acc.accessibility += (result.accessibility || 0) * 100;
    acc['best-practices'] += (result['best-practices'] || 0) * 100;
    acc.seo += (result.seo || 0) * 100;
    return acc;
  }, { performance: 0, accessibility: 0, 'best-practices': 0, seo: 0 });

  const count = allResults.length;

  const scores = {
    performance: Math.round(avgScores.performance / count),
    accessibility: Math.round(avgScores.accessibility / count),
    'best-practices': Math.round(avgScores['best-practices'] / count),
    seo: Math.round(avgScores.seo / count),
  };

  const status = getOverallStatus(scores);
  const timestamp = new Date().toISOString();

  // Read regression results if available
  let regressionData = null;
  if (fs.existsSync(REGRESSION_RESULT_PATH)) {
    try {
      regressionData = JSON.parse(fs.readFileSync(REGRESSION_RESULT_PATH, 'utf-8'));
    } catch (error) {
      console.warn('Warning: Failed to read regression results:', error.message);
    }
  }

  // Build score fields with regression indicators
  const fields = [
    {
      title: 'Performance',
      value: `${scores.performance}`,
      short: true,
    },
    {
      title: 'Accessibility',
      value: `${scores.accessibility}`,
      short: true,
    },
    {
      title: 'Best Practices',
      value: `${scores['best-practices']}`,
      short: true,
    },
    {
      title: 'SEO',
      value: `${scores.seo}`,
      short: true,
    },
  ];

  // Add regression details if found
  if (regressionData && regressionData.regressions && regressionData.regressions.length > 0) {
    const regressionText = regressionData.regressions
      .map(r => {
        const emoji = r.severity === 'critical' ? '🔴' : r.severity === 'major' ? '🟠' : '🟡';
        return `${emoji} ${r.category}: ${r.previous} → ${r.current} (${r.diff})`;
      })
      .join('\n');

    fields.push({
      title: '⚠️ Regressions Detected',
      value: regressionText,
      short: false,
    });
  }

  // Check for threshold breaches
  const thresholdBreaches = checkThresholdBreaches(deviceScores);
  if (thresholdBreaches.length > 0) {
    const breachText = thresholdBreaches
      .map(b => `🚨 ${b.device} ${b.category}: ${b.score} (threshold: ${b.threshold})`)
      .join('\n');

    fields.push({
      title: '🚨 Score Threshold Alerts',
      value: breachText,
      short: false,
    });
  }

  // Determine attachment color - use danger if critical regressions or threshold breaches exist
  let attachmentColor = status.color;
  if (regressionData && regressionData.regressions) {
    const hasCritical = regressionData.regressions.some(r => r.severity === 'critical');
    if (hasCritical) {
      attachmentColor = 'danger';
    }
  }
  // Also use danger if any threshold breaches
  if (thresholdBreaches.length > 0) {
    attachmentColor = 'danger';
  }

  // Build Slack message
  const message = {
    username: 'Lighthouse CI',
    icon_emoji: ':lighthouse:',
    attachments: [
      {
        color: attachmentColor,
        fallback: `Lighthouse scan completed: ${status.text}`,
        pretext: `${status.emoji} *Lighthouse Scan Complete*`,
        title: `${TARGET_DOMAIN} Performance Report`,
        title_link: DASHBOARD_URL || undefined,
        fields,
        footer: 'Unlighthouse CI',
        footer_icon: 'https://unlighthouse.dev/logo.svg',
        ts: Math.floor(Date.parse(timestamp) / 1000),
      },
    ],
  };

  // Send to Slack
  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Slack API error: ${response.status} ${text}`);
    }

    console.log('✓ Slack notification sent successfully');
  } catch (error) {
    throw new Error(`Failed to send Slack notification: ${error.message}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  sendSlackNotification().catch(error => {
    console.error('Error:', error.message);
    // Don't fail the build on notification errors
    process.exit(0);
  });
}

export { sendSlackNotification };
