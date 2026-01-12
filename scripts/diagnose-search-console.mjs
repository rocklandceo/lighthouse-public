#!/usr/bin/env node

import { config } from 'dotenv';
import { google } from 'googleapis';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Search Console Detailed Diagnostics\n');

const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
if (!credentials) {
  console.log('❌ GOOGLE_SERVICE_ACCOUNT_JSON not set');
  process.exit(1);
}

const serviceAccountKey = JSON.parse(credentials);
console.log(`📝 Service Account: ${serviceAccountKey.client_email}`);
console.log(`📝 Project ID: ${serviceAccountKey.project_id}\n`);

const auth = new google.auth.JWT({
  email: serviceAccountKey.client_email,
  key: serviceAccountKey.private_key,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});

const searchconsole = google.searchconsole({ version: 'v1', auth });

// First, list all sites the service account has access to
console.log('1️⃣  Listing all accessible sites...\n');
try {
  const sitesResponse = await searchconsole.sites.list();
  const sites = sitesResponse.data.siteEntry || [];

  if (sites.length === 0) {
    console.log('   ❌ No sites found! The service account has no access to any properties.');
    console.log('   💡 This suggests the permission hasn\'t propagated yet, or there\'s an issue.');
  } else {
    console.log(`   ✅ Found ${sites.length} site(s):\n`);
    sites.forEach((site, i) => {
      console.log(`   ${i + 1}. ${site.siteUrl}`);
      console.log(`      Permission: ${site.permissionLevel}`);
    });
  }
} catch (error) {
  console.log(`   ❌ Failed to list sites: ${error.message}`);
}

// Now try each URL format
console.log('\n2️⃣  Testing specific URL formats...\n');

// Get target domain from environment
const targetBaseUrl = process.env.TARGET_BASE_URL;
if (!targetBaseUrl) {
  console.log('❌ TARGET_BASE_URL environment variable not set');
  process.exit(1);
}
const domain = targetBaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

const urlsToTest = [
  `https://${domain}`,
  `https://${domain}/`,
  `sc-domain:${domain}`,
  `http://${domain}`,
  `https://www.${domain}`,
];

const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
const formatDate = (d) => d.toISOString().split('T')[0];

for (const siteUrl of urlsToTest) {
  console.log(`   Testing: ${siteUrl}`);
  try {
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['date'],
        rowLimit: 1,
      },
    });
    console.log(`   ✅ SUCCESS! Got ${response.data.rows?.length || 0} rows`);
    console.log(`   📊 Data available for this property\n`);
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }
}

console.log('✅ Diagnostics complete');
