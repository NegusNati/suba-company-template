// Root ESLint Flat Config
// Covers JS/TS and React across the monorepo
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  // Ignore generated and build outputs
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
      "**/.bun/**",
      "**/.bun-cache/**",
      "**/.bun-tmp/**",
      "apps/web/dev-dist/**",
      "apps/web/src/routeTree.gen.ts",
    ],
  },

  // Base JS rules
  js.configs.recommended,

  // Base TS recommendations (non type-checked for speed/portability)
  ...tseslint.configs.recommended,

  // Project-wide rules and React setup
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      // General quality
      "no-console": "warn",
      eqeqeq: ["error", "smart"],

      // Imports hygiene
      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/newline-after-import": "warn",

      // React
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": "off",

      // TypeScript niceties
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // Disable formatting rules that conflict with Prettier
  prettier,
];
