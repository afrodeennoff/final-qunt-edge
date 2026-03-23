#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

function run(command, args, label) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  if (label) {
    console.log(`[sync-stack] ${label}`);
  }
}

function runCapture(command, args) {
  const result = spawnSync(command, args, {
    stdio: "pipe",
    shell: false,
    env: process.env,
    encoding: "utf8",
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  if (stdout) process.stdout.write(stdout);
  if (stderr) process.stderr.write(stderr);

  return {
    status: result.status ?? 1,
    output: `${stdout}\n${stderr}`,
  };
}

function baselineAllMigrations() {
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  const entries = readdirSync(migrationsDir, { withFileTypes: true });
  const migrationNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  console.log(
    `[sync-stack] Baseline mode: marking ${migrationNames.length} migrations as applied`,
  );

  for (const name of migrationNames) {
    run("npx", ["prisma", "migrate", "resolve", "--applied", name]);
  }
}

function parseFailedMigrationName(output) {
  const match = output.match(/The `([^`]+)` migration started at .* failed/);
  return match?.[1] ?? null;
}

function parseMigrationName(output) {
  const match = output.match(/Migration name: (\S+)/);
  return match?.[1] ?? null;
}

run("npx", ["prisma", "generate"], "Prisma client generated");

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
const migrationUrl = rawUrl ? rawUrl.replace(/^"(.*)"$/, '$1') : null;

if (migrationUrl) {
  // Inject the direct connection URL into process.env so Prisma uses it for deployments (bypassing PgBouncer)
  process.env.DATABASE_URL = migrationUrl;
  console.log(`[sync-stack] Using direct DB URL for migrations`);
}

const isCI = process.env.CI === "true" || process.env.CI === "1";

const applyMigrations = process.env.SYNC_STACK_APPLY_MIGRATIONS === "true";
const baselineMode = process.env.SYNC_STACK_BASELINE === "true";

if (baselineMode) {
  baselineAllMigrations();
} else if (applyMigrations) {
  const result = runCapture("npx", ["prisma", "migrate", "deploy"]);

  if (result.status !== 0) {
    const failedMigration = parseFailedMigrationName(result.output);
    if (failedMigration && !isCI) {
      console.log(`[sync-stack] Migration ${failedMigration} failed`);
      console.log(`[sync-stack] In CI, failing migrations stop the build. Locally, you can:`);
      console.log(`[sync-stack]   - Run \`npx prisma migrate resolve --rolled-back ${failedMigration}\` to mark as rolled back`);
      console.log(`[sync-stack]   - Run \`npx prisma migrate resolve --applied ${failedMigration}\` to mark as applied`);
      console.log(`[sync-stack]   - Run \`SYNC_STACK_APPLY_MIGRATIONS=true npm run build\` to attempt again`);
    }
    process.exit(result.status);
  }
} else {
  run("npx", ["prisma", "migrate", "status"], "Prisma migrations up to date");
}
