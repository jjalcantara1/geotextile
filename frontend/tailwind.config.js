/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Dark Mode Palette ---
        'dark-bg': '#0D0D0D',          // Even darker background for more contrast
        'medium-dark': '#1A1A1A',      // Slightly lighter dark for components (Bot Messages, Header Base, Input Base)
        'light-text': '#E0E0E0',       // Off-white for main text (softer than pure white)
        'subtle-text': '#888888',      // More subtle grey for secondary/placeholder text
        
        // --- Maroon Gradient/Accent Colors ---
        'maroon-start': '#6A1C2F',     // Deeper, richer maroon for gradient start
        'maroon-end': '#8C2D43',       // Slightly brighter for gradient end
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