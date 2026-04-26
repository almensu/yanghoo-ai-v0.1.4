/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workbench: {
          page: "var(--wb-bg-page)",
          panel: "var(--wb-bg-panel)",
          border: "var(--wb-border-base)",
          accent: "var(--wb-accent)",
        }
      }
    },
  },
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        "yanghoo-workbench": {
          "primary": "#2563eb",
          "primary-content": "#ffffff",
          "secondary": "#475569",
          "accent": "#10b981",
          "neutral": "#0f172a",
          "base-100": "#ffffff",
          "base-200": "#f8fafc",
          "base-300": "#e2e8f0",
          "base-content": "#0f172a",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",

          "--rounded-box": "0.5rem", 
          "--rounded-btn": "0.375rem", 
          "--rounded-badge": "9999px",
          "--animation-btn": "0.25s", 
          "--animation-input": "0.2s",
          "--btn-text-case": "none", 
          "--btn-focus-scale": "0.95", 
          "--border-btn": "1px", 
          "--tab-border": "1px", 
          "--tab-radius": "0.5rem",
        },
      },
    ],
  },
}
