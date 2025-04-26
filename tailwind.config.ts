import type { Config } from "tailwindcss";

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
        // 默认背景和前景为黑夜模式
        border: "hsl(214, 32%, 30%)", // 边框颜色
        background: "hsl(220, 20%, 15%)", // 背景颜色
        foreground: "hsl(222, 47%, 90%)", // 文字颜色
        primary: "#132f6e", // 主要按钮颜色
        secondary: "#0035a9", // 次要按钮颜色
        accent: "hsl(174, 70%, 45%)", // 高亮颜色
        destructive: "hsl(348, 100%, 61%)", // 销毁按钮颜色
        muted: "hsl(215, 16%, 25%)", // 背景加深的颜色
        ring: "hsl(215, 20%, 55%)", // 焦点环颜色
      },
      ringWidth: {
        3: "3px",
      },
      outline: {
        ring: "2px solid hsl(215, 20%, 65%)", // 焦点环
      },
    },
  },
  plugins: [],
};

export default config;
