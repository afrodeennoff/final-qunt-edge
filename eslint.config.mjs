import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // Transitional hardening: keep signal while reducing legacy churn.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-this-alias": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "no-unreachable": "warn",
      "no-constant-condition": "warn",
      "no-var": "warn",
      "complexity": ["warn", 10],
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "no-console": ["error", { "allow": ["warn", "error"] }],
    },
  },
  {
    files: [
      "scripts/**/*.{js,mjs,ts,mts}",
      "prisma/seeders/**/*.{js,ts}",
      "check-db.ts",
      "extract-css.mjs",
      "standalone-check-db.js",
      "test-validation-fix.ts",
      "tests/e2e/**/*.ts",
      "tests/e2e/**/*.tsx",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "next.config.optimized.js",
    "next.config.compiled.js",
    "prisma/generated/**",
    ".worktrees/**",
    ".claude/worktrees/**",
    "hyperframes/**",
    "components/sidebar/__tests__/**",
  ]),
]);

export default eslintConfig;
