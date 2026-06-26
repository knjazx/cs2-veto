/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: '3px',
        sm: '3px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "#000000",
        surface: "#111111",
        border: "#333333",
        muted: "#666666",
        fg: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
