module.exports = {
  root: true,
  extends: [
    '@nuxt/eslint-config',
    'plugin:prettier/recommended',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-v-html': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
}
