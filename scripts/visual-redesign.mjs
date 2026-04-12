import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const TARGET_DIRS = [
  path.join(ROOT, 'app/[locale]/(home)'),
  path.join(ROOT, 'app/[locale]/(landing)'),
  path.join(ROOT, 'app/[locale]/dashboard'),
  path.join(ROOT, 'app/[locale]/(authentication)'),
  path.join(ROOT, 'app/[locale]/teams'),
  path.join(ROOT, 'app/[locale]/admin'),
  path.join(ROOT, 'app/[locale]/shared'),
  path.join(ROOT, 'app/[locale]/embed'),
  path.join(ROOT, 'components/ui'),
  path.join(ROOT, 'components/layout'),
  path.join(ROOT, 'components/animation'),
  path.join(ROOT, 'components/emails'),
];

const REPLACEMENTS = [
  [/border-\[var\(--frost-border\)\]/g, 'border-white/[0.06]'],
  [/border-\[var\(--frost-border-strong\)\]/g, 'border-white/[0.12]'],
  [/border-\[var\(--frost-border-alt\)\]/g, 'border-white/[0.04]'],
  [/bg-\[var\(--surface-card\)\]/g, 'bg-white/[0.02]'],
  [/bg-\[oklch\(0\.06_0_0\)\]/g, 'bg-white/[0.04]'],
  [/bg-\[oklch\(0\.08_0_0\)\]/g, 'bg-white/[0.05]'],
  [/bg-\[oklch\(0\.05_0_0\)\]/g, 'bg-white/[0.03]'],
  [/bg-\[oklch\(0\.035_0_0\)\]/g, 'bg-white/[0.02]'],
  [/bg-\[rgba\(255,255,255,0\.08\)\]/g, 'bg-white/[0.06]'],
  [/bg-\[rgba\(255,255,255,0\.06\)\]/g, 'bg-white/[0.04]'],
  [/bg-\[rgba\(255,255,255,0\.04\)\]/g, 'bg-white/[0.03]'],
  [/hover:bg-\[rgba\(255,255,255,0\.08\)\]/g, 'hover:bg-white/[0.06]'],
  [/hover:bg-\[rgba\(255,255,255,0\.06\)\]/g, 'hover:bg-white/[0.04]'],
  [/rounded-\[4px\]/g, 'rounded-sm'],
  [/rounded-\[6px\]/g, 'rounded-md'],
  [/rounded-\[2px\]/g, 'rounded-sm'],
  [/py-\[5px\]/g, 'py-1'],
  [/py-\[6px\]/g, 'py-1.5'],
  [/py-\[12px\]/g, 'py-3'],
  [/px-\[16px\]/g, 'px-4'],
];

function getAllTsxFiles(dirs) {
  const files = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    function walk(d) {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) walk(full);
        } else if (entry.name.endsWith('.tsx')) files.push(full);
      }
    }
    walk(dir);
  }
  return files;
}

const files = getAllTsxFiles(TARGET_DIRS);
console.log(`Found ${files.length} files`);
let totalReplacements = 0;
let modifiedCount = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let modified = false;
    for (const [pat, rep] of REPLACEMENTS) {
      const m = content.match(pat);
      if (m) { content = content.replace(pat, rep); modified = true; totalReplacements += m.length; }
    }
    if (modified) { fs.writeFileSync(file, content, 'utf8'); modifiedCount++; }
  } catch {}
}

console.log(`Applied ${totalReplacements} visual fixes across ${modifiedCount} files`);
