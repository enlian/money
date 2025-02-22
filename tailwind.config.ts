import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214, 32%, 91%)",
        background: "hsl(220, 14%, 96%)",
        foreground: "hsl(222, 47%, 11%)",
        primary: "hsl(221, 83%, 53%)",
        secondary: "hsl(210, 40%, 96%)",
        accent: "hsl(174, 70%, 60%)",
        destructive: "hsl(348, 100%, 61%)",
        muted: "hsl(215, 16%, 47%)",
      },
    },
  },
  plugins: [],
}

export default config
