import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#E63946',
        dark: '#0D0D0D',
        dark2: '#1A1A1A',
        muted: '#AAAAAA',
      },
    },
  },
  plugins: [],
}
export default config
