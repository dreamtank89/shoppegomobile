/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#635BFF",
        primary_faint: "rgba(99, 91, 255, 0.1)",
        tooltip_bg: "#1F2937",
        text_main: "#111827",
        text_muted: "#9CA3AF"
      }
    },
  },
  plugins: [],
}
