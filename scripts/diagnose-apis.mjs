#!/usr/bin/env node

import { config } from 'dotenv';
import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 API Configuration Diagnostics\n');

// Test 1: Check Anthropic API Key
console.log('1️⃣  Testing Anthropic API...');
try {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    console.log('   ❌ ANTHROPIC_API_KEY is not set');
  } else {
    console.log('   ✅ ANTHROPIC_API_KEY is set');
    console.log(`   📝 Key prefix: ${anthropicKey.substring(0, 20)}...`);

    const anthropic = new Anthropic({ apiKey: anthropicKey });

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Say "API test successful" and nothing else.',
          },
        ],
      });
      console.log('   ✅ API call successful');
      console.log(`   📝 Response: ${message.content[0].text}`);
    } catch (error) {
      console.log(`   ❌ API call failed: ${error.message}`);
      if (error.status === 401) {
        console.log('   💡 This indicates an invalid API key');
      }
    }
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

console.log('\n2️⃣  Testing Google Search Console API...');
try {
  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) {
    console.log('   ❌ GOOGLE_SERVICE_ACCOUNT_JSON is not set');
  } else {
    console.log('   ✅ GOOGLE_SERVICE_ACCOUNT_JSON is set');

    try {
      const serviceAccountKey = JSON.parse(credentials);
      console.log(`   📝 Service account email: ${serviceAccountKey.client_email}`);
      console.log(`   📝 Project ID: ${serviceAccountKey.project_id}`);

      const auth = new google.auth.JWT({
        email: serviceAccountKey.client_email,
        key: serviceAccountKey.private_key,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      const searchconsole = google.searchconsole({
        version: 'v1',
        auth,
      });

      const siteUrl = process.env.TARGET_BASE_URL || process.env.SITE_URL;
      if (!siteUrl) {
        console.log('   ❌ TARGET_BASE_URL environment variable not set');
        throw new Error('TARGET_BASE_URL not configured');
      }
      console.log(`   📝 Testing access to: ${siteUrl}`);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const formatDate = (date) => date.toISOString().split('T')[0];

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
        console.log('   ✅ API call successful');
        console.log(`   📝 Retrieved ${response.data.rows?.length || 0} data points`);
      } catch (error) {
        console.log(`   ❌ API call failed: ${error.message}`);
        if (error.code === 403) {
          console.log('   💡 This indicates the service account does not have access to Search Console');
          console.log('   💡 Steps to fix:');
          console.log('      1. Go to https://search.google.com/search-console');
          console.log('      2. Select your property');
          console.log('      3. Go to Settings → Users and permissions');
          console.log(`      4. Add this email as a user: ${serviceAccountKey.client_email}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ JSON parse error: ${error.message}`);
      console.log('   💡 GOOGLE_SERVICE_ACCOUNT_JSON may be malformed');
    }
  }
} catch (error) {
  console.log(`   ❌ Error: ${error.message}`);
}

console.log('\n✅ Diagnostics complete\n');
