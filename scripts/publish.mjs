#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM module URL (for import.meta.url comparison)
const __filename = fileURLToPath(import.meta.url);
void __filename; // Referenced via import.meta.url

// Configuration
const KEEP_RUNS = parseInt(process.env.KEEP_RUNS || '14', 10);
const DEVICES = ['mobile', 'desktop'];
const REPORTS_DIR = './public/reports';

// Generate timestamp
function getTimestamp(fixedDate = null) {
  const date = fixedDate || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

// Copy reports to timestamped directory
function publishToTimestampedDir(timestamp) {
  try {
    const runDir = path.join(REPORTS_DIR, 'runs', timestamp);

    // Ensure target directory exists
    fs.ensureDirSync(runDir);

    // Copy each device's reports to device-specific subdirectories
    DEVICES.forEach(device => {
      const sourceDir = `./.unlighthouse-${device}`;
      const targetDir = path.join(runDir, device);

      if (fs.existsSync(sourceDir)) {
        fs.copySync(sourceDir, targetDir, { recursive: true });
        console.log(`✓ Copied ${device} reports to ${targetDir}`);
      } else {
        console.warn(`⚠ Warning: ${sourceDir} does not exist, skipping`);
      }
    });

    return runDir;
  } catch (error) {
    throw new Error(`Failed to publish to timestamped directory: ${error.message}`);
  }
}

// List and sort run directories
function getRunDirectories() {
  const runsDir = path.join(REPORTS_DIR, 'runs');

  if (!fs.existsSync(runsDir)) {
    return [];
  }

  const timestampPattern = /^\d{8}-\d{6}$/;
  const dirs = fs.readdirSync(runsDir);

  // Filter for valid timestamp directories
  const runs = dirs
    .filter(dir => timestampPattern.test(dir))
    .map(dir => ({
      path: path.join(runsDir, dir),
      timestamp: dir,
      // Parse for sorting
      date: new Date(
        dir.slice(0, 4),     // year
        dir.slice(4, 6) - 1, // month (0-indexed)
        dir.slice(6, 8),     // day
        dir.slice(9, 11),    // hours
        dir.slice(11, 13),   // minutes
        dir.slice(13, 15)    // seconds
      )
    }))
    // Sort newest first
    .sort((a, b) => b.date - a.date);

  console.log(`Found ${runs.length} run directories`);
  return runs;
}

// Enforce retention policy
function enforceRetention(runs, keepRuns) {
  try {
    if (runs.length <= keepRuns) {
      console.log(`✓ Retention OK: ${runs.length}/${keepRuns} runs`);
      return;
    }

    const toDelete = runs.slice(keepRuns);
    console.log(`⚠ Retention cleanup: ${toDelete.length} old runs to delete`);

    let deleteCount = 0;
    let errors = [];

    toDelete.forEach(run => {
      try {
        fs.removeSync(run.path);
        console.log(`  ✓ Deleted: ${run.timestamp}`);
        deleteCount++;
      } catch (error) {
        console.error(`  ✗ Failed to delete ${run.timestamp}: ${error.message}`);
        errors.push({ timestamp: run.timestamp, error: error.message });
      }
    });

    console.log(`✓ Retention enforced: ${keepRuns} runs kept (${deleteCount} deleted)`);

    if (errors.length > 0) {
      console.warn(`⚠ ${errors.length} deletion(s) failed`);
    }
  } catch (error) {
    throw new Error(`Failed to enforce retention: ${error.message}`);
  }
}

// Update latest symlink/copy
function updateLatest(sourceRunDir) {
  try {
    const latestDir = path.join(REPORTS_DIR, 'latest');

    // Ensure latest directory exists
    fs.ensureDirSync(latestDir);

    // Copy each device's reports to latest/device
    DEVICES.forEach(device => {
      const sourceDeviceDir = path.join(sourceRunDir, device);
      const targetDeviceDir = path.join(latestDir, device);

      // Remove existing device directory in latest
      if (fs.existsSync(targetDeviceDir)) {
        fs.removeSync(targetDeviceDir);
      }

      // Copy device reports if they exist
      if (fs.existsSync(sourceDeviceDir)) {
        fs.copySync(sourceDeviceDir, targetDeviceDir, { recursive: true });
        console.log(`✓ Updated latest/${device}`);
      } else {
        console.warn(`⚠ Warning: ${sourceDeviceDir} does not exist, skipping`);
      }
    });

    console.log(`✓ Updated latest -> ${path.basename(sourceRunDir)}`);
  } catch (error) {
    throw new Error(`Failed to update latest directory: ${error.message}`);
  }
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--timestamp' && i + 1 < args.length) {
      options.timestamp = args[i + 1];
      i++;
    }
  }

  return options;
}

// Main function
async function main() {
  console.log('Starting report publishing...');
  console.log(`KEEP_RUNS: ${KEEP_RUNS}`);
  console.log(`Devices: ${DEVICES.join(', ')}`);
  console.log(`Target: ${REPORTS_DIR}`);

  // Parse CLI arguments
  const options = parseArgs();

  // Validate configuration
  if (isNaN(KEEP_RUNS) || KEEP_RUNS < 1) {
    throw new Error(`Invalid KEEP_RUNS value: ${KEEP_RUNS}. Must be a positive integer.`);
  }

  // Check if at least one device source directory exists
  const existingDevices = DEVICES.filter(device =>
    fs.existsSync(`./.unlighthouse-${device}`)
  );

  if (existingDevices.length === 0) {
    throw new Error(`No device reports found. Run scans first.`);
  }

  console.log(`Found reports for: ${existingDevices.join(', ')}`);

  // Generate timestamp (allow override for testing)
  let timestamp;
  if (options.timestamp) {
    // Validate timestamp format
    const timestampPattern = /^\d{8}-\d{6}$/;
    if (!timestampPattern.test(options.timestamp)) {
      throw new Error(`Invalid timestamp format: ${options.timestamp}. Expected YYYYMMDD-HHMMSS`);
    }
    timestamp = options.timestamp;
    console.log(`Timestamp (deterministic): ${timestamp}`);
  } else {
    timestamp = getTimestamp();
    console.log(`Timestamp: ${timestamp}`);
  }

  const runDir = publishToTimestampedDir(timestamp);
  console.log(`Published to: ${runDir}`);

  // Update latest
  updateLatest(runDir);

  // List all runs and enforce retention
  const allRuns = getRunDirectories();
  console.log(`Total runs: ${allRuns.length}`);

  // Enforce retention policy
  enforceRetention(allRuns, KEEP_RUNS);
  if (allRuns.length > 0) {
    console.log(`Newest: ${allRuns[0].timestamp}`);
    console.log(`Oldest: ${allRuns[allRuns.length - 1].timestamp}`);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

export { main };
