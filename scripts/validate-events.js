#!/usr/bin/env node
/**
 * Validates events.json to catch common issues before deployment
 * Run: npm run validate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const eventsPath = path.join(__dirname, '../public/events.json');

function validate() {
  console.log('Validating events.json...\n');

  const data = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  const errors = [];
  const warnings = [];

  for (const event of data.events) {
    const imageUrl = event.imageUrl;
    if (!imageUrl) continue;

    // Check 1: External URLs ending in .webp are suspicious
    // We don't control external servers - the scraper should get the actual URL
    if (imageUrl.startsWith('http') && imageUrl.endsWith('.webp')) {
      warnings.push({
        event: event.title,
        issue: `External URL ends with .webp - verify this is correct (we don't control external files)`,
        url: imageUrl
      });
    }

    // Check 2: Local astro images should be .webp (we converted them)
    if (imageUrl.startsWith('/images/astro/') && imageUrl.endsWith('.png')) {
      errors.push({
        event: event.title,
        issue: `Local astro image references .png but files are .webp`,
        url: imageUrl
      });
    }

    // Check 3: Ensure required fields exist
    if (!event.id) errors.push({ event: event.title, issue: 'Missing id' });
    if (!event.title) errors.push({ event: '(unknown)', issue: 'Missing title' });
    if (!event.date) errors.push({ event: event.title, issue: 'Missing date' });
    if (!event.venue) errors.push({ event: event.title, issue: 'Missing venue' });
    if (!event.source) errors.push({ event: event.title, issue: 'Missing source' });
  }

  // Report results
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} warning(s):\n`);
    for (const w of warnings.slice(0, 10)) { // Show max 10
      console.log(`  ${w.event}: ${w.issue}`);
      console.log(`    URL: ${w.url}\n`);
    }
    if (warnings.length > 10) {
      console.log(`  ... and ${warnings.length - 10} more warnings\n`);
    }
  }

  if (errors.length > 0) {
    console.log(`❌ ${errors.length} error(s):\n`);
    for (const e of errors) {
      console.log(`  ${e.event}: ${e.issue}`);
      if (e.url) console.log(`    URL: ${e.url}`);
    }
    console.log('');
    process.exit(1);
  }

  console.log(`✅ Validated ${data.events.length} events`);
  if (warnings.length === 0) {
    console.log('   No issues found!');
  }
}

validate();
