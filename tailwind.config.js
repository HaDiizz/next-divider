/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["selector", '[data-mantine-color-scheme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        primary: "#2563eb",
        secondary: "#729af2",
        tertiary: "#bfd1f9",
      },
      keyframes: {
        shake: {
          "0%, 100%": {
            transform: "rotate(0deg)",
          },
          "10%, 30%, 50%, 70%, 90%": {
            transform: "rotate(-10deg)",
          },
          "20%, 40%, 60%, 80%": {
            transform: "rotate(10deg)",
          },
        },
      },
      animation: {
        shake: "shake 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
