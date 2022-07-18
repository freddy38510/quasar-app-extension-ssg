module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },

  env: {
    node: true,
    browser: true,
    es2020: true,
  },

  extends: [
    'airbnb-base',
    'plugin:lodash-template/base',
  ],

  processor: 'lodash-template/script',

  settings: {
    'lodash-template/ignoreRules': ['no-undef', 'no-tabs'],
  },

  rules: {
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'max-len': ['error', 150],
  },
};
