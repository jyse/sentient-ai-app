/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))"
        },
        // Chromotherapy Phase Colors - The Heart of Sentient
        awareness: {
          DEFAULT: "hsl(var(--awareness))",
          bright: "hsl(var(--awareness-bright))",
          glow: "hsl(var(--awareness-glow))"
        },
        acceptance: {
          DEFAULT: "hsl(var(--acceptance))",
          bright: "hsl(var(--acceptance-bright))",
          glow: "hsl(var(--acceptance-glow))"
        },
        processing: {
          DEFAULT: "hsl(var(--processing))",
          bright: "hsl(var(--processing-bright))",
          glow: "hsl(var(--processing-glow))"
        },
        reframing: {
          DEFAULT: "hsl(var(--reframing))",
          bright: "hsl(var(--reframing-bright))",
          glow: "hsl(var(--reframing-glow))"
        },
        integration: {
          DEFAULT: "hsl(var(--integration))",
          bright: "hsl(var(--integration-bright))",
          glow: "hsl(var(--integration-glow))"
        },
        maintenance: {
          DEFAULT: "hsl(var(--maintenance))",
          bright: "hsl(var(--maintenance-bright))",
          glow: "hsl(var(--maintenance-glow))"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Crimson Text", "serif"]
      },
      backgroundImage: {
        "gradient-awareness": "var(--gradient-awareness)",
        "gradient-acceptance": "var(--gradient-acceptance)",
        "gradient-processing": "var(--gradient-processing)",
        "gradient-reframing": "var(--gradient-reframing)",
        "gradient-integration": "var(--gradient-integration)",
        "gradient-maintenance": "var(--gradient-maintenance)",
        "gradient-ambient": "var(--gradient-ambient)",
        "gradient-subtle": "var(--gradient-subtle)"
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        meditation: "var(--shadow-meditation)",
        "glow-awareness": "var(--glow-awareness)",
        "glow-warm": "var(--glow-warm)"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0"
          },
          to: {
            height: "var(--radix-accordion-content-height)"
          }
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)"
          },
          to: {
            height: "0"
          }
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0) rotate(0deg)"
          },
          "25%": {
            transform: "translateY(-20px) rotate(90deg)"
          },
          "50%": {
            transform: "translateY(-10px) rotate(180deg)"
          },
          "75%": {
            transform: "translateY(-30px) rotate(270deg)"
          }
        },
        "breathe-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px) scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          }
        },
        "breathe-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0) scale(1)"
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-20px) scale(1.05)"
          }
        },
        ripple: {
          "0%": {
            transform: "scale(0)",
            opacity: "0.8"
          },
          "50%": {
            opacity: "0.4"
          },
          "100%": {
            transform: "scale(4)",
            opacity: "0"
          }
        },
        "pulse-glow": {
          "0%, 100%": {
            boxShadow: "var(--glow-awareness)"
          },
          "50%": {
            boxShadow: "var(--glow-warm)"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 8s ease-in-out infinite",
        "breathe-in": "breathe-in 0.8s ease-out",
        "breathe-out": "breathe-out 0.8s ease-in",
        ripple: "ripple 4s ease-out infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
