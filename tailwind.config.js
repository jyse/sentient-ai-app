/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Chromotherapy Phase Colors
        awareness: {
          DEFAULT: "hsl(262, 83%, 58%)",
          bright: "hsl(262, 83%, 68%)",
          dark: "hsl(262, 83%, 20%)"
        },
        acceptance: {
          DEFAULT: "hsl(194, 75%, 45%)",
          bright: "hsl(194, 75%, 55%)",
          dark: "hsl(194, 75%, 25%)"
        },
        processing: {
          DEFAULT: "hsl(142, 71%, 40%)",
          bright: "hsl(142, 71%, 50%)",
          dark: "hsl(142, 71%, 25%)"
        },
        reframing: {
          DEFAULT: "hsl(45, 93%, 55%)",
          bright: "hsl(45, 93%, 65%)",
          dark: "hsl(45, 93%, 35%)"
        },
        integration: {
          DEFAULT: "hsl(25, 85%, 55%)",
          bright: "hsl(25, 85%, 65%)",
          dark: "hsl(25, 85%, 35%)"
        },
        maintenance: {
          DEFAULT: "hsl(315, 60%, 50%)",
          bright: "hsl(315, 60%, 60%)",
          dark: "hsl(315, 60%, 30%)"
        },
        // Override default primary to use awareness color
        primary: {
          DEFAULT: "hsl(262, 83%, 58%)",
          foreground: "hsl(0, 0%, 98%)"
        }
      }
    }
  },
  plugins: []
};
