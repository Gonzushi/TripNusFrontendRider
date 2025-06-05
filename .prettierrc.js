/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  endOfLine: 'auto',
  trailingComma: 'es5',
  plugins: ['@trivago/prettier-plugin-sort-imports'],
  importOrder: ['^react$', '^[a-z]', '^@/', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

module.exports = config;
