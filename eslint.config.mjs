import js from '@eslint/js';
// Remove unused imports
import { defineConfig, globalIgnores } from 'eslint/config';
// Base JavaScript rules
import importPlugin from 'eslint-plugin-import';
// Handles import-related rules
import prettier from 'eslint-plugin-prettier';
// Integrates Prettier
import reactCompiler from 'eslint-plugin-react-compiler';
// Compiler-level React rules
import simpleImportSort from 'eslint-plugin-simple-import-sort';
// Auto-sort imports
import tailwindcss from 'eslint-plugin-tailwindcss';
// Tailwind class validation
import unicorn from 'eslint-plugin-unicorn';
// Extra useful rules for JS
import unusedImports from 'eslint-plugin-unused-imports';
// Flat config helpers
import globals from 'globals';
// Common global variables (like window, document)
import tseslint from 'typescript-eslint';

// TypeScript support

export default defineConfig([
  // ❌ Files to ignore explicitly
  globalIgnores(
    ['env.js', 'jest-setup.ts', 'metro.config.js', 'tailwind.config.js'],
    'Ignore configurations'
  ),

  globalIgnores([
    'node_modules/',
    '__tests__/',
    '.vscode/',
    'android/',
    'ios/',
    'coverage/',
    '.expo/',
    '.expo-shared/',
    'docs/',
    'cli/',
  ]),

  // Base configuration for JS/JSX files WITHOUT type-aware linting
  {
    files: ['**/*.{js,mjs,cjs,jsx}'],
    languageOptions: {
      // No "project" here — avoids errors on config and JS files
      globals: globals.browser, // enables window, document, etc.
      sourceType: 'module',
    },
    plugins: {
      js,
      prettier,
      unicorn,
      'unused-imports': unusedImports,
      tailwindcss,
      'simple-import-sort': simpleImportSort,
      'react-compiler': reactCompiler,
      import: importPlugin,
    },
    rules: {
      // ✅ Prettier formatting
      'prettier/prettier': 'warn',

      // ✅ Enforce file name style
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: ['/android', '/ios'],
        },
      ],

      // ✅ Limit complexity
      'max-params': ['error', 3],
      'max-lines-per-function': ['error', 1000],

      // ✅ Handle unused imports/vars
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ✅ Import organization
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/prefer-default-export': 'off',
      'import/no-cycle': ['error', { maxDepth: '∞' }],

      // ✅ Tailwind rules
      'tailwindcss/classnames-order': ['warn', { officialSorting: true }],
      'tailwindcss/no-custom-classname': 'off',
    },
  },

  // TypeScript files WITH project (type-aware linting enabled)
  {
    ignores: ['**/node_modules/**', '**/node_modules/react-native/**'],
    files: ['**/*.{ts,mts,cts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json', // required for rules that need type info
      },
      globals: globals.browser,
      sourceType: 'module',
    },
    plugins: {
      js,
      prettier,
      unicorn,
      '@typescript-eslint': tseslint.plugin,
      'unused-imports': unusedImports,
      tailwindcss,
      'simple-import-sort': simpleImportSort,
      'react-compiler': reactCompiler,
      import: importPlugin,
    },
    rules: {
      // ✅ TypeScript style
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
          disallowTypeAnnotations: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': 'off',

      // Keep unused-imports rules (same as JS)
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Import organization
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'import/prefer-default-export': 'off',
      'import/no-cycle': ['error', { maxDepth: '∞' }],

      // Tailwind rules
      'tailwindcss/classnames-order': ['warn', { officialSorting: true }],
      'tailwindcss/no-custom-classname': 'off',
    },
  },

  // ✅ TypeScript recommended rules (includes types-aware rules)
  tseslint.configs.recommended,

  // ✅ Testing Library rules (for React Testing Library)
  {
    files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    // Use async function to dynamically load the plugin
    async plugins() {
      const testingLibrary = await import('@testing-library/eslint-plugin');
      return {
        'testing-library': testingLibrary.default,
      };
    },
    // Dynamically spread recommended rules from plugin
    async rules() {
      const testingLibrary = await import('@testing-library/eslint-plugin');
      return {
        ...testingLibrary.default.configs.react.rules,
      };
    },
  },

  // ✅ Optional: Add this later if you want to lint translations JSON files
  {
    files: ['src/translations/*.json'],
    async plugins() {
      const i18nJson = await import('eslint-plugin-i18n-json');
      return { 'i18n-json': i18nJson.default };
    },
    rules: {
      'i18n-json/valid-json': 2,
      'i18n-json/sorted-keys': [2, { order: 'asc', indentSpaces: 2 }],
      'i18n-json/identical-keys': [
        2,
        {
          filePath: './src/translations/en.json',
        },
      ],
    },
  },
]);
