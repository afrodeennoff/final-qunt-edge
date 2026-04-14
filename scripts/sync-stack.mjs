#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import net from "node:net";
import { join } from "node:path";

function info(message) {
  process.stdout.write(`${message}\n`);
}

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
    info(`[sync-stack] ${label}`);
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

function hasGeneratedPrismaClient() {
  return existsSync(join(process.cwd(), "node_modules", ".prisma", "client"));
}

function isPrismaCliInteropFailure(output) {
  return (
    output.includes("Error [ERR_REQUIRE_ESM]") &&
    output.includes("@prisma/dev") &&
    output.includes("zeptomatch")
  );
}

function baselineAllMigrations() {
  const migrationsDir = join(process.cwd(), "prisma", "migrations");
  const entries = readdirSync(migrationsDir, { withFileTypes: true });
  const migrationNames = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  info(`[sync-stack] Baseline mode: marking ${migrationNames.length} migrations as applied`);

  for (const name of migrationNames) {
    run("bunx", ["prisma", "migrate", "resolve", "--applied", name]);
  }
}

function parseFailedMigrationName(output) {
  const match = output.match(/The `([^`]+)` migration started at .* failed/);
  return match?.[1] ?? null;
}

function parseDatabaseEndpoint(urlString) {
  try {
    const url = new URL(urlString);
    return {
      host: url.hostname,
      port: Number(url.port || "5432"),
    };
  } catch {
    return null;
  }
}

function probeTcpPort(host, port, timeoutMs = 750) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;

    function finish(reachable, errorCode = null) {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ reachable, errorCode });
    }

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false, "ETIMEDOUT"));
    socket.once("error", (error) => {
      const maybeError = error;
      finish(false, typeof maybeError.code === "string" ? maybeError.code : "EUNKNOWN");
    });
  });
}

async function canReachDatabase(urlString) {
  const endpoint = parseDatabaseEndpoint(urlString);
  if (!endpoint?.host || !Number.isFinite(endpoint.port)) {
    return {
      reachable: false,
      reason: "missing or invalid database URL",
    };
  }

  const result = await probeTcpPort(endpoint.host, endpoint.port);
  if (!result.reachable) {
    return {
      reachable: false,
      reason: `${endpoint.host}:${endpoint.port} (${result.errorCode})`,
    };
  }

  return {
    reachable: true,
    reason: `${endpoint.host}:${endpoint.port}`,
  };
}

const shouldForcePrismaGenerate = process.env.PRISMA_GENERATE_STRICT === "true";

if (hasGeneratedPrismaClient() && !shouldForcePrismaGenerate) {
  info("[sync-stack] Using existing generated Prisma client");
} else {
  const prismaGenerateResult = runCapture("bunx", ["prisma", "generate"]);

  if (prismaGenerateResult.status !== 0) {
    if (isPrismaCliInteropFailure(prismaGenerateResult.output) && hasGeneratedPrismaClient()) {
      console.warn(
        "[sync-stack] Prisma generate hit the known @prisma/dev ↔ zeptomatch ESM interop failure. Continuing with the existing generated client.",
      );
    } else {
      process.exit(prismaGenerateResult.status);
    }
  }

  info("[sync-stack] Prisma client generated");
}

const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
const migrationUrl = rawUrl ? rawUrl.replace(/^"(.*)"$/, '$1') : null;

if (migrationUrl) {
  // Inject the direct connection URL into process.env so Prisma uses it for deployments (bypassing PgBouncer)
  process.env.DATABASE_URL = migrationUrl;
  info(`[sync-stack] Using direct DB URL for migrations`);
}

const isCI = process.env.CI === "true" || process.env.CI === "1";

const applyMigrations = process.env.SYNC_STACK_APPLY_MIGRATIONS === "true";
const baselineMode = process.env.SYNC_STACK_BASELINE === "true";

if (baselineMode) {
  baselineAllMigrations();
} else if (applyMigrations) {
  const result = runCapture("bunx", ["prisma", "migrate", "deploy"]);

  if (result.status !== 0) {
    const failedMigration = parseFailedMigrationName(result.output);
    if (failedMigration && !isCI) {
      info(`[sync-stack] Migration ${failedMigration} failed`);
      info(`[sync-stack] In CI, failing migrations stop the build. Locally, you can:`);
      info(`[sync-stack]   - Run \`npx prisma migrate resolve --rolled-back ${failedMigration}\` to mark as rolled back`);
      info(`[sync-stack]   - Run \`npx prisma migrate resolve --applied ${failedMigration}\` to mark as applied`);
      info(`[sync-stack]   - Run \`SYNC_STACK_APPLY_MIGRATIONS=true npm run build\` to attempt again`);
    }
    process.exit(result.status);
  }
} else {
  const dbCheck = migrationUrl ? await canReachDatabase(migrationUrl) : { reachable: false, reason: "no database URL configured" };

  if (!dbCheck.reachable) {
    console.warn(
      `[sync-stack] Skipping Prisma migrate status: ${dbCheck.reason}. Continuing build.`,
    );
  } else {
    const migrationStatusResult = runCapture("bunx", ["prisma", "migrate", "status"]);

    if (migrationStatusResult.status !== 0) {
      if (isPrismaCliInteropFailure(migrationStatusResult.output)) {
        console.warn(
          "[sync-stack] Prisma migrate status hit the known @prisma/dev ↔ zeptomatch ESM interop failure. Skipping status verification for this build.",
        );
      } else {
        process.exit(migrationStatusResult.status);
      }
    } else {
      info("[sync-stack] Prisma migrations up to date");
    }
  }
}
