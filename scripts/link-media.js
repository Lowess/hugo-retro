#!/usr/bin/env node

/**
 * Post-build script to create symlinks for media directories
 * This avoids copying large media files during Hugo builds
 *
 * Usage: node scripts/link-media.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import toml from 'toml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read config.toml to get media paths
const configPath = path.join(rootDir, 'config.toml');
const configContent = fs.readFileSync(configPath, 'utf-8');
const config = toml.parse(configContent);

// Get media configuration from params
const mediaConfig = config.params?.mediaPaths || {};
const publicDir = path.join(rootDir, 'public');
const mediaDir = path.join(publicDir, 'media');

console.log('🔗 Creating media symlinks...');
console.log(`   Target directory: ${mediaDir}`);

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

    // Verify source path exists
    if (!fs.existsSync(sourcePath)) {
      console.error(`   ❌ Source path does not exist: ${sourcePath}`);
      errorCount++;
      continue;
    }

    // Create symlink
    // Use relative path if possible for portability
    const relativeSource = path.isAbsolute(sourcePath)
      ? sourcePath
      : path.relative(mediaDir, path.resolve(rootDir, sourcePath));

    fs.symlinkSync(sourcePath, targetLink, 'dir');
    console.log(`   ✓ Linked ${systemId} -> ${sourcePath}`);
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
