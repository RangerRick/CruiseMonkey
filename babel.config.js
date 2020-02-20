module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "targets": {
        "node": "current",
        "browsers": [ "last 2 versions", "safari >= 7", "> 5%" ]
      },
      "modules": "commonjs",
      "useBuiltIns": "usage",
      "corejs": 2
    }],
    ["@babel/preset-typescript", { "allExtensions": true }],
  ],
  "plugins": [
    "angularjs-annotate",
    ["module-resolver", {
      "root": [
        "node_modules"
      ]
      }],
    ["@babel/plugin-transform-runtime", {
      "corejs": 2,
      "helpers": false,
      "regenerator": true
      }],
    "@babel/plugin-proposal-async-generator-functions",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "@babel/plugin-transform-destructuring",
    "@babel/plugin-transform-for-of",
    "@babel/plugin-transform-modules-commonjs",
    "@babel/plugin-transform-regenerator"
  ]
};
