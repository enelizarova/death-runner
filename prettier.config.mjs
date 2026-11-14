/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindStylesheet: './src/styles/index.css',
    printWidth: 100,
    tabWidth: 4,
    singleAttributePerLine: true,
    singleQuote: true,
    semi: true,
    trailingComma: 'all',
};
