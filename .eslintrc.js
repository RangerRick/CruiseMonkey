module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  env: {
    browser: true,
    commonjs: true,
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
    'object-curly-newline': [ 'warn', {
      ExportDeclaration: {
        multiline: true,
        minProperties: 6,
      },
      ImportDeclaration: {
        multiline: true,
        minProperties: 6,
      },
      ObjectExpression: {
        multiline: true,
        minProperties: 2,
      },
      ObjectPattern: {
        multiline: true,
        minProperties: 2,
      }
    }],
    /** remove these after refactoring */
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'no-redeclare': 'warn',
    'no-var': 'warn',
    'prefer-rest-params': 'warn',
  }
  /*
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true
  },
  "globals": {
    "angular": true,
    "$": true
  },
  "extends": "eslint:recommended",
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  },
  "rules": {
    "accessor-pairs": "error",
    "array-bracket-newline": "off",
    "array-bracket-spacing": "off",
    "array-callback-return": "off",
    "array-element-newline": "off",
    "arrow-body-style": "off",
    "arrow-parens": "off",
    "arrow-spacing": [
      "error",
      {
        "after": true,
        "before": true
      }
    ],
    "block-scoped-var": "off",
    "block-spacing": "off",
    "brace-style": "off",
    "callback-return": "off",
    "camelcase": "off",
    "capitalized-comments": "off",
    "class-methods-use-this": "off",
    "comma-dangle": "off",
    "comma-spacing": "off",
    "comma-style": [
      "error",
      "last"
    ],
    "complexity": "off",
    "computed-property-spacing": [
      "error",
      "never"
    ],
    "consistent-return": "off",
    "consistent-this": "off",
    "curly": "off",
    "default-case": "off",
    "dot-location": [
      "error",
      "property"
    ],
    "dot-notation": "off",
    "eol-last": "off",
    "eqeqeq": "off",
    "func-call-spacing": "off",
    "func-name-matching": "off",
    "func-names": "off",
    "func-style": "off",
    "function-paren-newline": "off",
    "generator-star-spacing": "error",
    "global-require": "error",
    "guard-for-in": "error",
    "handle-callback-err": "off",
    "id-blacklist": "error",
    "id-length": "off",
    "id-match": "error",
    "implicit-arrow-linebreak": [
      "error",
      "beside"
    ],
    "indent": "off",
    "indent-legacy": "off",
    "init-declarations": "off",
    "jsx-quotes": "error",
    "key-spacing": "off",
    "keyword-spacing": "off",
    "line-comment-position": "off",
    "linebreak-style": [
      "error",
      "unix"
    ],
    "lines-around-comment": "off",
    "lines-around-directive": "off",
    "lines-between-class-members": "off",
    "max-classes-per-file": "off",
    "max-depth": "off",
    "max-len": "off",
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-nested-callbacks": "error",
    "max-params": "off",
    "max-statements": "off",
    "max-statements-per-line": "off",
    "multiline-comment-style": "off",
    "multiline-ternary": "off",
    "new-cap": "error",
    "new-parens": "error",
    "newline-after-var": "off",
    "newline-before-return": "off",
    "newline-per-chained-call": "off",
    "no-alert": "error",
    "no-array-constructor": "error",
    "no-async-promise-executor": "error",
    "no-await-in-loop": "error",
    "no-bitwise": "error",
    "no-buffer-constructor": "error",
    "no-caller": "error",
    "no-catch-shadow": "error",
    "no-cond-assign": [
      "error",
      "except-parens"
    ],
    "no-confusing-arrow": "error",
    "no-console": "off",
    "no-continue": "off",
    "no-div-regex": "error",
    "no-duplicate-imports": "off",
    "no-else-return": "off",
    "no-empty-function": "off",
    "no-eq-null": "off",
    "no-eval": [
      "error",
      {
        "allowIndirect": true
      }
    ],
    "no-extend-native": "error",
    "no-extra-bind": "off",
    "no-extra-label": "error",
    "no-extra-parens": "off",
    "no-floating-decimal": "off",
    "no-implicit-globals": "error",
    "no-implied-eval": "error",
    "no-inline-comments": "off",
    "no-inner-declarations": [
      "error",
      "functions"
    ],
    "no-invalid-this": "off",
    "no-iterator": "error",
    "no-label-var": "error",
    "no-labels": "error",
    "no-lone-blocks": "error",
    "no-lonely-if": "off",
    "no-loop-func": "error",
    "no-magic-numbers": "off",
    "no-misleading-character-class": "error",
    "no-mixed-operators": "off",
    "no-mixed-requires": "error",
    "no-multi-assign": "error",
    "no-multi-spaces": "off",
    "no-multi-str": "error",
    "no-multiple-empty-lines": "error",
    "no-native-reassign": "error",
    "no-negated-condition": "off",
    "no-negated-in-lhs": "error",
    "no-nested-ternary": "off",
    "no-new": "off",
    "no-new-func": "error",
    "no-new-object": "error",
    "no-new-require": "error",
    "no-new-wrappers": "error",
    "no-octal-escape": "error",
    "no-param-reassign": "off",
    "no-path-concat": "error",
    "no-plusplus": "off",
    "no-process-env": "error",
    "no-process-exit": "warn",
    "no-proto": "error",
    "no-prototype-builtins": "off",
    "no-restricted-globals": "error",
    "no-restricted-imports": "error",
    "no-restricted-modules": "error",
    "no-restricted-properties": "error",
    "no-restricted-syntax": "error",
    "no-return-assign": "off",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-shadow": "off",
    "no-shadow-restricted-names": "error",
    "no-spaced-func": "off",
    "no-sync": "warn",
    "no-tabs": "error",
    "no-template-curly-in-string": "error",
    "no-ternary": "off",
    "no-throw-literal": "off",
    "no-trailing-spaces": "off",
    "no-undef-init": "off",
    "no-undefined": "off",
    "no-underscore-dangle": "off",
    "no-unmodified-loop-condition": "off",
    "no-unneeded-ternary": "error",
    "no-unused-expressions": "off",
    "no-use-before-define": "off",
    "no-useless-call": "error",
    "no-useless-catch": "error",
    "no-useless-computed-key": "error",
    "no-useless-concat": "error",
    "no-useless-constructor": "error",
    "no-useless-rename": "error",
    "no-useless-return": "off",
    "no-var": "off",
    "no-void": "off",
    "no-warning-comments": "off",
    "no-whitespace-before-property": "error",
    "no-with": "error",
    "nonblock-statement-body-position": [
      "error",
      "any"
    ],
    "object-curly-newline": "error",
    "object-curly-spacing": "off",
    "object-shorthand": "off",
    "one-var": "off",
    "one-var-declaration-per-line": "off",
    "operator-assignment": "off",
    "operator-linebreak": "off",
    "padded-blocks": "off",
    "padding-line-between-statements": "error",
    "prefer-arrow-callback": "off",
    "prefer-const": "off",
    "prefer-destructuring": "off",
    "prefer-numeric-literals": "error",
    "prefer-object-spread": "off",
    "prefer-promise-reject-errors": "error",
    "prefer-reflect": "off",
    "prefer-rest-params": "error",
    "prefer-spread": "off",
    "prefer-template": "off",
    "quote-props": "off",
    "quotes": "off",
    "radix": [
      "error",
      "always"
    ],
    "require-atomic-updates": "error",
    "require-await": "error",
    "require-jsdoc": "off",
    "require-unicode-regexp": "off",
    "rest-spread-spacing": [
      "error",
      "never"
    ],
    "semi": "off",
    "semi-spacing": "off",
    "semi-style": [
      "error",
      "last"
    ],
    "sort-keys": "off",
    "sort-vars": "off",
    "space-before-blocks": "off",
    "space-before-function-paren": "off",
    "space-in-parens": "off",
    "space-infix-ops": "off",
    "space-unary-ops": [
      "error",
      {
        "nonwords": false,
        "words": false
      }
    ],
    "spaced-comment": "off",
    "strict": "off",
    "switch-colon-spacing": [
      "error",
      {
        "after": true,
        "before": false
      }
    ],
    "symbol-description": "error",
    "template-curly-spacing": [
      "error",
      "never"
    ],
    "template-tag-spacing": "error",
    "unicode-bom": [
      "error",
      "never"
    ],
    "valid-jsdoc": "off",
    "vars-on-top": "off",
    "wrap-iife": "error",
    "wrap-regex": "error",
    "yield-star-spacing": "error",
    "yoda": [
      "error",
      "never"
    ]
  }
  */
};
