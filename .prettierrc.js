/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  endOfLine: 'auto',
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss'],
  importOrder: ['^react$', '^[a-z]', '^@/', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

module.exports = config;
