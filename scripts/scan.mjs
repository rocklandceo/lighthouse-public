#!/usr/bin/env node

import fs from 'fs';
import { spawn } from 'child_process';

// Get device parameter (mobile or desktop, defaults to mobile)
const device = process.argv[2] || 'mobile';

if (!['mobile', 'desktop'].includes(device)) {
  console.error(`Error: Invalid device "${device}". Must be "mobile" or "desktop".`);
  process.exit(1);
}

// Read URLs from urls.txt
const urlsFile = './urls.txt';

if (!fs.existsSync(urlsFile)) {
  console.error(`Error: ${urlsFile} does not exist. Run 'npm run urls' first.`);
  process.exit(1);
}

const urls = fs.readFileSync(urlsFile, 'utf-8')
  .split('\n')
  .map(url => url.trim())
  .filter(url => url.length > 0);

if (urls.length === 0) {
  console.error(`Error: ${urlsFile} is empty.`);
  process.exit(1);
}

console.log(`Found ${urls.length} URLs to scan (${device} device)`);

// Run unlighthouse-ci with device-specific config
const configFile = `unlighthouse.${device}.config.mjs`;
// URLs must be comma-separated for unlighthouse-ci --urls flag
const urlsArg = urls.join(',');
console.log(`Scanning URLs: ${urlsArg}`);
const args = ['unlighthouse-ci', '--urls', urlsArg, '--config-file', configFile];
const proc = spawn('npx', args, {
  stdio: 'inherit',
  shell: true
});

proc.on('close', (code) => {
  process.exit(code);
});
