import js from '@eslint/js';

import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(
    ['env.js', 'jest-setup.ts', 'metro.config.js', 'tailwind.config.js'],
    'Ignore configurations'
  ),

  globalIgnores([
    '.aunused/',
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

  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  { files: ['**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.node },
  },
  tseslint.configs.recommended,
]);
