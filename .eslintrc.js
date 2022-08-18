module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'commonjs',
  },

  env: {
    browser: false,
    node: true,
  },

  extends: [
    'airbnb-base',
  ],

  // add your custom rules here
  rules: {
    'no-param-reassign': ['error', { props: false }],
    'import/no-unresolved': ['error', { commonjs: true }],
  },

  overrides: [
    {
      files: 'src/boot/*.js',

      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },

      env: {
        node: false,
        browser: true,
      },

      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};
