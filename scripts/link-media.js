#!/usr/bin/env node

/**
 * Post-build script to create symlinks for media directories
 * This avoids copying large media files during Hugo builds
 *
 * Usage: node scripts/link-media.js [--skip-validation]
 *
 * Options:
 *   --skip-validation  Skip checking if source paths exist (useful for CI/CD)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import toml from 'toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const skipValidation = args.includes('--skip-validation');

// Try to find config file in multiple locations
const configPaths = [
  path.join(rootDir, 'config/development/hugo.toml'),  // Dev overrides first
  path.join(rootDir, 'config/production/hugo.toml'),   // Production overrides
  path.join(rootDir, 'config/_default/hugo.toml'),     // Base config
  path.join(rootDir, 'config.toml'),                   // Legacy fallback
  path.join(rootDir, 'hugo.toml'),                   // Legacy fallback
];

let config = null;
let configPath = null;

for (const tryPath of configPaths) {
  if (fs.existsSync(tryPath)) {
    configPath = tryPath;
    const configContent = fs.readFileSync(tryPath, 'utf-8');
    config = toml.parse(configContent);
    console.log(`   📄 Using config: ${path.relative(rootDir, tryPath)}`);
    break;
  }
}

if (!config) {
  console.error('❌ No config file found. Tried:');
  configPaths.forEach(p => console.error(`   - ${path.relative(rootDir, p)}`));
  process.exit(1);
}

// Get media configuration from params
const mediaConfig = config.params?.mediaPaths || {};
const publicDir = path.join(rootDir, 'public');
const mediaDir = path.join(publicDir, 'media');

console.log('🔗 Creating media symlinks...');
console.log(`   Target directory: ${mediaDir}`);

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  console.log('   ⚠️  Public directory does not exist yet, skipping symlinks');
  console.log('   💡 Run hugo build first, then symlinks will be created');
  process.exit(0);
}

// Ensure media directory exists
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
  console.log('   ✓ Created media directory');
}

// Track successes and failures
let successCount = 0;
let errorCount = 0;

// Create symlinks for each system
for (const [systemId, sourcePath] of Object.entries(mediaConfig)) {
  const targetLink = path.join(mediaDir, systemId);

  try {
    // Auto-append /media if path doesn't end with it
    let actualSourcePath = sourcePath;
    if (!sourcePath.endsWith('/media') && !sourcePath.endsWith('\\media')) {
      const testMediaPath = path.join(sourcePath, 'media');
      if (!skipValidation && fs.existsSync(testMediaPath)) {
        actualSourcePath = testMediaPath;
        console.log(`   💡 Using ${systemId}: ${actualSourcePath}`);
      }
    }

    // Remove existing symlink or directory if it exists
    if (fs.existsSync(targetLink)) {
      const stats = fs.lstatSync(targetLink);
      if (stats.isSymbolicLink()) {
        fs.unlinkSync(targetLink);
        console.log(`   ⚠️  Removed existing symlink: ${systemId}`);
      } else if (stats.isDirectory()) {
        console.log(`   ⚠️  Directory exists (not a symlink), skipping: ${systemId}`);
        continue;
      }
    }

    // Verify source path exists (unless skipping validation)
    if (!skipValidation && !fs.existsSync(actualSourcePath)) {
      console.error(`   ❌ Source path does not exist: ${actualSourcePath}`);
      console.error(`      💡 Use --skip-validation to skip this check`);
      errorCount++;
      continue;
    }

    // Create symlink
    fs.symlinkSync(actualSourcePath, targetLink, 'dir');
    console.log(`   ✓ Linked ${systemId} -> ${actualSourcePath}`);
    successCount++;

  } catch (error) {
    console.error(`   ❌ Failed to link ${systemId}: ${error.message}`);
    errorCount++;
  }
}

console.log('');
console.log(`✨ Media linking complete!`);
console.log(`   Success: ${successCount}`);
if (errorCount > 0) {
  console.log(`   Errors: ${errorCount}`);
  process.exit(1);
}
