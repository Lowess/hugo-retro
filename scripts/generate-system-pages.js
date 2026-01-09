#!/usr/bin/env node

/**
 * Generate content pages for each system in the data directory
 * This enables individual system JSON endpoints at /systems/{system}/index.json
 *
 * Usage: node scripts/generate-system-pages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import toml from 'toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const dataDir = path.join(rootDir, 'data');
const systemsContentDir = path.join(rootDir, 'content/systems');

console.log('🎮 Generating system pages...');

// Ensure systems content directory exists
if (!fs.existsSync(systemsContentDir)) {
  fs.mkdirSync(systemsContentDir, { recursive: true });
  console.log('   ✓ Created systems content directory');
}

// Function to extract system IDs from config mounts
function getSystemsFromConfig(configPath) {
  if (!fs.existsSync(configPath)) return [];

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = toml.parse(configContent);
    const systems = new Set();

    if (config.module && config.module.mounts) {
      for (const mount of config.module.mounts) {
        // Check if target starts with 'data/'
        if (mount.target && mount.target.startsWith('data/')) {
          const systemId = mount.target.replace('data/', '').split('/')[0];
          if (systemId) {
            systems.add(systemId);
          }
        }
      }
    }

    return Array.from(systems);
  } catch (error) {
    console.error(`   ⚠️  Error reading config ${configPath}: ${error.message}`);
    return [];
  }
}

// Get systems from multiple sources
let systems = [];

// Try to get from data directory
if (fs.existsSync(dataDir)) {
  const dataSystems = fs.readdirSync(dataDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  systems.push(...dataSystems);
  console.log(`   Found ${dataSystems.length} system(s) in data directory`);
}

// Also check config files for mounts
const configPaths = [
  path.join(rootDir, 'config/development/hugo.toml'),
  path.join(rootDir, 'config/production/hugo.toml'),
  path.join(rootDir, 'config/_default/hugo.toml'),
];

for (const configPath of configPaths) {
  const configSystems = getSystemsFromConfig(configPath);
  if (configSystems.length > 0) {
    console.log(`   Found ${configSystems.length} system(s) in ${path.relative(rootDir, configPath)}`);
    systems.push(...configSystems);
  }
}

// Remove duplicates
systems = [...new Set(systems)];

if (systems.length === 0) {
  console.log('   ⚠️  No systems found, skipping');
  process.exit(0);
}

console.log(`   Total unique system(s): ${systems.sort().join(', ')}`);

// Create page for each system
let createdCount = 0;
for (const systemId of systems) {
  const pageContent = `---
title: "${systemId}"
systemId: "${systemId}"
outputs:
  - json
---
`;

  const pagePath = path.join(systemsContentDir, `${systemId}.md`);
  fs.writeFileSync(pagePath, pageContent, 'utf-8');
  console.log(`   ✓ Created ${systemId}.md`);
  createdCount++;
}

// Create special "all" system page
const allPageContent = `---
title: "all"
systemId: "all"
outputs:
  - json
---
`;

const allPagePath = path.join(systemsContentDir, 'all.md');
fs.writeFileSync(allPagePath, allPageContent, 'utf-8');
console.log(`   ✓ Created all.md (combined systems)`);
createdCount++;

console.log('');
console.log(`✨ Generated ${createdCount} system page(s)!`);
console.log('   Build your site to generate JSON endpoints at:');
console.log('   - /systems/{system}/index.json (e.g., /systems/snes/index.json)');
console.log('   - /systems/all/index.json (all games combined)');
