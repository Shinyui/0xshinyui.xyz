// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}', // 如果你是本地 markdown
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}