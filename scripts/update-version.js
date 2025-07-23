#!/usr/bin/env node

/**
 * Version Update Script for Chatter App
 * 
 * This script helps automate version updates with each deployment or major change.
 * 
 * Usage:
 *   node scripts/update-version.js [patch|minor|major]
 *   
 * Examples:
 *   node scripts/update-version.js minor  # 1.1.0 -> 1.2.0
 *   node scripts/update-version.js patch  # 1.1.0 -> 1.1.1
 *   node scripts/update-version.js major  # 1.1.0 -> 2.0.0
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const versionType = process.argv[2] || 'minor';

if (!['patch', 'minor', 'major'].includes(versionType)) {
  console.error('❌ Invalid version type. Use: patch, minor, or major');
  process.exit(1);
}

try {
  // Read current package.json
  const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const oldVersion = packageJson.version;

  // Update version
  execSync(`npm version ${versionType} --no-git-tag-version`, { stdio: 'inherit' });

  // Read updated package.json
  const updatedPackageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
  const newVersion = updatedPackageJson.version;

  console.log(`✅ Version updated: ${oldVersion} → ${newVersion}`);
  console.log(`📦 The application footer will now display "Version ${newVersion}"`);
  console.log(`🚀 Ready for build and deployment!`);

  // Suggest next steps
  console.log('\n📝 Suggested next steps:');
  console.log('1. npm run build');
  console.log('2. git add -A');
  console.log(`3. git commit -m "chore: bump version to ${newVersion}"`);
  console.log('4. Deploy to production');

} catch (error) {
  console.error('❌ Error updating version:', error.message);
  process.exit(1);
}
