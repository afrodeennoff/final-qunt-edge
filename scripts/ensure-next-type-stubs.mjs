import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const NEXT_TYPES_DIR = path.join(ROOT, ".next", "types");
const NEXT_DEV_TYPES_DIR = path.join(ROOT, ".next", "dev", "types");
const CACHE_LIFE_STUB = path.join(NEXT_TYPES_DIR, "cache-life.d.ts");
const CACHE_LIFE_DEV_STUB = path.join(NEXT_DEV_TYPES_DIR, "cache-life.d.ts");
const ROUTE_TYPE_STUBS = [
  path.join(NEXT_TYPES_DIR, "app", "[locale]", "(authentication)", "authentication", "page.ts"),
];

fs.mkdirSync(NEXT_TYPES_DIR, { recursive: true });
fs.mkdirSync(NEXT_DEV_TYPES_DIR, { recursive: true });

fs.writeFileSync(CACHE_LIFE_STUB, "export {};\n", "utf8");
fs.writeFileSync(CACHE_LIFE_DEV_STUB, "export {};\n", "utf8");
for (const file of ROUTE_TYPE_STUBS) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, "export {};\n", "utf8");
  }
}
console.log("[typecheck] Ensured cache-life.d.ts stubs");
