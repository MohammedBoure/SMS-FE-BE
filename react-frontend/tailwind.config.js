/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand (keep blue, but modern tone)
        primary: "#3b82f6",        // softer modern blue
        primaryDark: "#1e40af",

        // Neutrals (modern UI feel)
        background: "#0f172a",     // dark slate (main bg)
        surface: "#111827",        // cards / panels
        surfaceLight: "#1f2937",   // hover / secondary panels

        // Text
        textPrimary: "#e5e7eb",
        textSecondary: "#9ca3af",

        // Status
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",

        // Borders
        border: "#1f2937",
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["0.95rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
      },

      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
      },

      boxShadow: {
        soft: "0 4px 20px rgba(0,0,0,0.25)",
        card: "0 2px 10px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
}