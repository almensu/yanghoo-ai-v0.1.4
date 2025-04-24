/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan React components for Tailwind classes
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("daisyui"), // Enable daisyUI plugin
  ],
  // Optional: daisyUI config (themes, etc.)
  daisyui: {
    themes: ["light", "dark", "cupcake"], // Add themes you want to use
  },
} 