module.exports = {
  "env": {
    "node": true,
    "commonjs": true,
    "es2021": true
  },
  "globals": {
    "test": "true",
    "expect": "true"
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    // Suppress warning for overRide prop from react-drag-drop-files
    "react/no-unknown-property": ["error", { "ignore": ["overRide"] }]
  },
  "plugins": ["react"],
  "overrides": [
    {
      "files": ["**/functions/**/*.{js,jsx}", "**/edge-src/**/*.{js,jsx}"],
      "env": {
        "node": false,
        "worker": true,
      },
      "globals": {
        "HTMLRewriter": "readonly"
      },
    },
    {
      "files": ["**/client-src/**/*.{js,jsx}"],
      "env": {
        "node": false,
        "worker": false,
        "browser": true,
      },
    },
    {
      "files": ["**/common-src/**/*.{js,jsx}"],
      "env": {
        "node": true,
        "worker": true,
        "browser": true,
      },
    },
    {
      "files": ["**/*.test.{js,jsx}", "**/__tests__/**/*.{js,jsx}"],
      "env": {
        "jest": true,
        "node": true
      },
      "globals": {
        "jest": "readonly"
      }
    }
  ]
};
