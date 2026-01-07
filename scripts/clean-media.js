#!/usr/bin/env node

/**
 * Cleanup script to remove media symlinks
 * Useful for debugging or manual cleanup
 *
 * Usage: node scripts/clean-media.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicDir = path.join(rootDir, 'public');
const mediaDir = path.join(publicDir, 'media');

console.log('🧹 Cleaning media symlinks...');
console.log(`   Target directory: ${mediaDir}`);

if (!fs.existsSync(mediaDir)) {
  console.log('   ℹ️  Media directory does not exist, nothing to clean');
  process.exit(0);
}

let removedCount = 0;

try {
  const entries = fs.readdirSync(mediaDir);

  for (const entry of entries) {
    const entryPath = path.join(mediaDir, entry);
    const stats = fs.lstatSync(entryPath);

    if (stats.isSymbolicLink()) {
      fs.unlinkSync(entryPath);
      console.log(`   ✓ Removed symlink: ${entry}`);
      removedCount++;
    } else {
      console.log(`   ⚠️  Skipped (not a symlink): ${entry}`);
    }
  }

  console.log('');
  console.log(`✨ Cleanup complete! Removed ${removedCount} symlink(s)`);

} catch (error) {
  console.error(`❌ Error during cleanup: ${error.message}`);
  process.exit(1);
}
