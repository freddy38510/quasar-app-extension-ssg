module.exports = {
  overrides: [
    {
      files: 'entry/*.js',

      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },

      env: {
        node: false,
        browser: true,
      },

      globals: {
        __dirname: 'readonly',
      },

      extends: [
        'airbnb-base',
        'plugin:lodash-template/recommended-with-script',
      ],

      settings: {
        'lodash-template/globals': [
          'ssr',
          'ssg',
        ],
      },

      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};
