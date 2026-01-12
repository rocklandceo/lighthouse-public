#!/usr/bin/env node

import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';

// Fetch sitemap XML from URL
async function fetchSitemap(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const xml = await response.text();
    return xml;
  } catch (error) {
    throw new Error(`Failed to fetch sitemap from ${url}: ${error.message}`);
  }
}

// Parse XML and extract URLs recursively
async function extractUrlsFromXml(xml, depth = 0, maxDepth = 3) {
  if (depth > maxDepth) {
    console.warn(`Max recursion depth ${maxDepth} reached, stopping`);
    return [];
  }

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);

  let urls = [];

  // Check if this is a sitemap index (contains <sitemap> entries)
  if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
    console.log(`Found sitemap index at depth ${depth}`);
    const sitemaps = Array.isArray(parsed.sitemapindex.sitemap)
      ? parsed.sitemapindex.sitemap
      : [parsed.sitemapindex.sitemap];

    // Recursively fetch and parse each referenced sitemap
    for (const sitemap of sitemaps) {
      const sitemapLoc = sitemap.loc;
      console.log(`  Fetching nested sitemap: ${sitemapLoc}`);
      try {
        const nestedXml = await fetchSitemap(sitemapLoc);
        const nestedUrls = await extractUrlsFromXml(nestedXml, depth + 1, maxDepth);
        urls = urls.concat(nestedUrls);
      } catch (error) {
        console.error(`  Failed to fetch nested sitemap: ${error.message}`);
      }
    }
  }
  // Otherwise, this is a regular urlset
  else if (parsed.urlset && parsed.urlset.url) {
    const urlEntries = Array.isArray(parsed.urlset.url)
      ? parsed.urlset.url
      : [parsed.urlset.url];

    urls = urlEntries.map(entry => entry.loc).filter(Boolean);
    console.log(`Extracted ${urls.length} URLs from urlset`);
  }

  return urls;
}

// Filter and deduplicate URLs
function filterAndDeduplicateUrls(urls, maxUrls = 100) {
  // Get target domain from environment
  const targetBaseUrl = process.env.TARGET_BASE_URL;
  if (!targetBaseUrl) {
    console.error('ERROR: TARGET_BASE_URL environment variable is required');
    process.exit(1);
  }

  // Extract domain from URL
  const targetDomain = targetBaseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Homepage must always be included - it's critical for SEO
  const homepage = targetBaseUrl.endsWith('/') ? targetBaseUrl : targetBaseUrl + '/';

  // Filter to only target domain URLs (including homepage and paths)
  const domainRegex = new RegExp(`^https?:\\/\\/(www\\.)?${targetDomain.replace('.', '\\.')}(\\/.*)?$`);
  const filtered = urls
    .map(url => url.trim())
    .filter(url => domainRegex.test(url));

  // Always ensure homepage is first, dedup variations of homepage
  const homepageVariations = [
    `https://${targetDomain}`,
    `https://${targetDomain}/`,
    `https://www.${targetDomain}`,
    `https://www.${targetDomain}/`,
  ];

  const withHomepage = [
    homepage,
    ...filtered.filter(url => !homepageVariations.includes(url))
  ];

  // Deduplicate using Set
  const deduped = [...new Set(withHomepage)];

  // Cap at maxUrls
  const capped = deduped.slice(0, maxUrls);

  console.log(`Filtered: ${filtered.length}, With Homepage: ${withHomepage.length}, Deduped: ${deduped.length}, Capped: ${capped.length}`);
  return capped;
}

// Write URLs to file
function writeUrlsToFile(urls, filename = './urls.txt') {
  try {
    fs.writeFileSync(filename, urls.join('\n'), 'utf8');
    console.log(`Wrote ${urls.length} URLs to ${filename}`);
  } catch (error) {
    throw new Error(`Failed to write URLs to file: ${error.message}`);
  }
}

// Main function to extract URLs from sitemap
async function main() {
  const targetBaseUrl = process.env.TARGET_BASE_URL;
  if (!targetBaseUrl) {
    console.error('ERROR: TARGET_BASE_URL environment variable is required');
    process.exit(1);
  }
  const sitemapUrl = process.env.SITEMAP_URL || `${targetBaseUrl}/sitemap.xml`;
  console.log(`Fetching sitemap from: ${sitemapUrl}`);

  const xml = await fetchSitemap(sitemapUrl);
  console.log(`Fetched ${xml.length} bytes of XML`);

  const urls = await extractUrlsFromXml(xml);
  console.log(`Total URLs extracted: ${urls.length}`);

  const finalUrls = filterAndDeduplicateUrls(urls);
  console.log(`Final URL count: ${finalUrls.length}`);

  writeUrlsToFile(finalUrls);
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main };
