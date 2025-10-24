/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Light Mode Palette ---
        'light-bg': '#FFFFFF',         // White background for primary
        'component-bg': '#F5F5F5',     // Light gray for components (Bot Messages, Header Base, Input Base)
        'dark-text': '#333333',        // Dark gray for main text (high readability)
        'subtle-text': '#666666',      // Subtle gray for secondary/placeholder text

        // --- Muted Red Accent ---
        'muted-red': '#800000',        // Muted red for accents (replacing maroon gradients)
      },
      borderRadius: {
        'bubble': '22px', // Larger, softer radius for chat bubbles
        'input': '30px',  // Very rounded for the input pill
        'header': '20px', // Header top corners
        'tail': '6px',    // Small radius for the 'tail' corner
      },
      boxShadow: {
        'custom-light': '0 4px 15px rgba(0, 0, 0, 0.3)', // Lighter shadow for raised elements
        'custom-deep': '0 8px 30px rgba(0, 0, 0, 0.6)', // Deeper shadow for prominent elements
      },
      fontSize: {
        'md': '1.05rem', // Slightly larger medium text
        'lg': '1.15rem', // Slightly larger large text
      }
    },
  },
  plugins: [],
}