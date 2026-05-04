#!/usr/bin/env node

/**
 * Black Screen Diagnostic Script
 * 
 * Automated checks for the homepage black screen issue.
 * Run with: node scripts/diagnose-black-screen.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${title}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

function check(name, condition, details = '') {
  const status = condition ? '✓' : '✗';
  const color = condition ? 'green' : 'red';
  log(`  ${colors[color]}${status}${colors.reset} ${name}`, condition ? 'green' : 'red');
  if (details && !condition) {
    log(`    → ${details}`, 'yellow');
  }
}

function fileExists(filePath, description) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  const exists = fs.existsSync(fullPath);
  check(
    `${description} exists`,
    exists,
    `Expected at: ${filePath}`
  );
  return exists;
}

function fileContains(filePath, searchText, description) {
  const fullPath = path.join(PROJECT_ROOT, filePath);
  if (!fs.existsSync(fullPath)) {
    check(`${description}`, false, `File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf-8');
  const found = content.includes(searchText);
  check(
    `${description}`,
    found,
    `Pattern not found in ${filePath}`
  );
  return found;
}

// ============================================
// RUN DIAGNOSTICS
// ============================================

log('\n🔍 Black Screen Diagnostic Tool', 'blue');
log('Scanning project configuration...', 'gray');

// 1. Check CSS Files
section('CSS & Styling Configuration');
fileExists('app/globals.css', 'Global CSS file');
fileContains('app/globals.css', '@import', 'CSS imports configured');
fileContains('app/globals.css', '@config', 'Tailwind config reference');
fileExists('styles/tokens.css', 'Design tokens file');
fileExists('styles/styleseed-tokens.css', 'Styleseed tokens file');
fileExists('tailwind.config.ts', 'Tailwind configuration');

// 2. Check Layout Files
section('Layout & HTML Structure');
fileExists('app/layout.tsx', 'Root layout');
fileContains(
  'app/layout.tsx',
  'suppressHydrationWarning',
  'Hydration compatibility flag set'
);
fileContains(
  'app/layout.tsx',
  'bg-background',
  'Using design token for background'
);

// 3. Check Homepage Files
section('Homepage Files');
fileExists('app/page.tsx', 'Root page');
fileContains('app/page.tsx', "redirect('/en')", 'Locale redirect configured');
fileExists('app/[locale]/(home)/page.tsx', 'Locale-specific home page');
fileExists('app/[locale]/(home)/components/HomeContent.tsx', 'HomeContent component');

// 4. Check Localization
section('Internationalization Setup');
const localesPath = path.join(PROJECT_ROOT, 'locales');
const localesExist = fs.existsSync(localesPath);
check('Locales directory exists', localesExist);
if (localesExist) {
  const files = fs.readdirSync(localesPath);
  log(`    Found: ${files.join(', ')}`, 'gray');
}

// 5. Check Error Handling
section('Error Handling & Boundaries');
fileExists('components/error-boundary.tsx', 'Error boundary component');
fileContains(
  'components/error-boundary.tsx',
  'ErrorBoundary',
  'Error boundary implementation'
);

// 6. Check Public Assets
section('Public Assets');
const publicPath = path.join(PROJECT_ROOT, 'public');
const publicExists = fs.existsSync(publicPath);
check('Public directory exists', publicExists);

if (publicExists) {
  fileExists('public/favicon.ico', 'Favicon');
  fileExists('public/apple-icon.png', 'Apple icon');
  fileExists('public/opengraph-image.png', 'OG image');
}

// 7. Check Dependencies
section('Dependencies');
const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

check('Next.js installed', !!packageJson.dependencies.next);
check('React 19+ installed', packageJson.dependencies.react?.startsWith('19'));
check('Tailwind CSS installed', !!packageJson.dependencies.tailwindcss);
check('Lucide icons installed', !!packageJson.dependencies['lucide-react']);
check('Error boundary present', !!packageJson.dependencies['react-error-boundary']);

// 8. Check Build Configuration
section('Build Configuration');
fileContains('package.json', '"dev":', 'Dev script configured');
fileContains('package.json', '"build":', 'Build script configured');
fileContains('package.json', '"start":', 'Start script configured');

// 9. Tailwind v4 Specifics
section('Tailwind CSS v4 Compatibility');
fileContains('tailwind.config.ts', 'darkMode', 'Dark mode configured');
const tailwindConfig = fs.readFileSync(path.join(PROJECT_ROOT, 'tailwind.config.ts'), 'utf-8');
check('Theme extend configured', tailwindConfig.includes('extend:'));
check('Color theme configured', tailwindConfig.includes('colors:'));

// ============================================
// QUICK DIAGNOSTICS
// ============================================

section('Next Steps');
log(`
1. Check browser DevTools (F12):
   • Console tab: Look for red error messages
   • Network tab: Check if CSS files loaded (not 404)
   • Elements tab: Verify <html>, <body>, <main> are rendered
   
2. Look for specific patterns:
   • "Cannot find module" → Missing import
   • "Hydration mismatch" → Server/client render difference
   • "Failed to fetch" → Asset loading failure
   • Empty <body> tag → CSS not loading

3. Run development server with logging:
   ${colors.gray}bun run dev  # or npm run dev, pnpm dev${colors.reset}
   
   Then visit http://localhost:3000 and check console output.

4. If CSS doesn't load, verify:
   ${colors.gray}ls -la .next/static/css/${colors.reset}
   
   Should show one or more .css files > 100KB

5. Force rebuild if stuck:
   ${colors.gray}bun run clean:build-artifacts${colors.reset}
   ${colors.gray}rm -rf .next${colors.reset}
   ${colors.gray}bun run build${colors.reset}
   ${colors.gray}bun start${colors.reset}
`);

log('\n✓ Diagnostic scan complete!', 'green');
