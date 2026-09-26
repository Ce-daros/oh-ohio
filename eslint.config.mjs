import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: [
      'dist/**',
      'dist-baseline/**',
      '.ssr/**',
      '.vercel/**',
      'public/**',
      'artwork/**',
      'editorial/**',
      'src/content/**/*.json',
    ],
  },
  // TypeScript rules across .ts, .vue script blocks, and build scripts.
  ...tseslint.configs.recommended,
  // Vue template rules (essential: correctness only, no style opinions).
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, sourceType: 'module' },
    },
  },
  {
    files: ['src/**/*.{ts,vue}', 'vite.config.ts'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ['scripts/**/*.mjs', 'eslint.config.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    rules: {
      // App.vue and single-word page names are intentional.
      'vue/multi-word-component-names': 'off',
    },
  },
];
