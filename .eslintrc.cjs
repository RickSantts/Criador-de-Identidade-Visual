module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    'no-undef': 'error',
    'react/jsx-no-undef': 'error',
    'react-hooks/rules-of-hooks': 'error',
  },
};
