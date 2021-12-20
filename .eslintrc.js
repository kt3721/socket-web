module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    // 首个参数 0 = off, 1 = warn, 2 = error

    // js
    'no-console': process.env.NODE_ENV === 'production' ? 1 : 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // 禁止使用拖尾逗号
    'comma-dangle': [2, 'never'],
    // 禁止使用分号
    semi: [2, 'never'],
    // 禁用行尾空白
    'no-trailing-spaces': 2,
    // 强制在花括号内使用一致的换行符
    'object-curly-newline': [0, { multiline: true }],
    // 强制使用 单引号
    quotes: [2, 'single'],

    // ts
    // 禁用 any
    '@typescript-eslint/no-explicit-any': 0
  }
}
