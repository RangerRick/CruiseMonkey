module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    'jest',
    '@typescript-eslint',
  ],
  env: {
    browser: true,
    commonjs: true,
    jest: true,
    node: true,
    es6: true,
  },
  globals: {
    __BUILD__: true,
    __DEVELOPMENT__: true,
    __VERSION__: true,
    $: true,
    angular: true,
    cordova: true,
    ionic: true,
    /** global cordova plugins */
    Camera: true,
    FileTransfer: true,
    FileUploadOptions: true,
    ImagePicker: true,
    PhotoViewer: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    /** keep these */
    'object-curly-newline': 'warn',
    /** remove these after refactoring */
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-redeclare': 'warn',
    'no-var': 'warn',
    'prefer-rest-params': 'warn',
  }
};
