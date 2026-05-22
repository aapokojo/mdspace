import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdecd7',
          200: '#fad5ae',
          300: '#f6b87b',
          400: '#f19146',
          500: '#ed741d',
          600: '#de5a18',
          700: '#b84316',
          800: '#93361a',
          900: '#772f18',
          950: '#40150a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
