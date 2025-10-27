// import { withUt } from "uploadthing/tw";
 
// import type { Config } from "tailwindcss"

// export default withUt({
//   darkMode: ["class"],
//   content: [
//     './pages/**/*.{ts,tsx}',
//     './components/**/*.{ts,tsx}',
//     './app/**/*.{ts,tsx}',
//     './src/**/*.{ts,tsx}',
// 	],
//   prefix: "",
//   theme: {
//     backgroundImage: {
//       'home-background': "url('../public/homebg.svg')",
//     },
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       colors: {
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         primary: {
//           DEFAULT: "hsl(var(--primary))",
//           foreground: "hsl(var(--primary-foreground))",
//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))",
//           foreground: "hsl(var(--secondary-foreground))",
//         },
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))",
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//         'custom-primary':'#9C88FB',
//         'input-border': '#5925DC',
//         'active': '#EEEAFE',
//         'text-secondary': '#1E265E',
//       },
//       borderRadius: {
//         lg: "var(--radius)",
//         md: "calc(var(--radius) - 2px)",
//         sm: "calc(var(--radius) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//       },
//     },
//   },
//   plugins: [require("tailwindcss-animate")],
// }) satisfies Config


// import { withUt } from "uploadthing/tw";
 
// import type { Config } from "tailwindcss"

// export default withUt({
//   darkMode: ["class"],
//   content: [
//     './pages/**/*.{ts,tsx}',
//     './components/**/*.{ts,tsx}',
//     './app/**/*.{ts,tsx}',
//     './src/**/*.{ts,tsx}',
//   ],
//   prefix: "",
//   theme: {
//     backgroundImage: {
//       'home-background': "url('../public/homebg.svg')",
//     },
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       colors: {
//         // These map to the new HSL variables defined in global.css
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         primary: {
//           DEFAULT: "hsl(var(--primary))",
//           foreground: "hsl(var(--primary-foreground))",
//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))",
//           foreground: "hsl(var(--secondary-foreground))",
//         },
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))",
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//         // These are custom hex colors from the original config, kept as is
//         'custom-primary':'#9C88FB',
//         'input-border': '#5925DC',
//         'active': '#EEEAFE',
//         'text-secondary': '#1E265E',
//       },
//       borderRadius: {
//         lg: "var(--radius)",
//         md: "calc(var(--radius) - 2px)",
//         sm: "calc(var(--radius) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//       },
//     },
//   },
//   plugins: [require("tailwindcss-animate")],
// }) satisfies Config


import { withUt } from "uploadthing/tw";
import type { Config } from "tailwindcss";

export default withUt({
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    backgroundImage: {
      'home-background': "url('../public/homebg.svg')",
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Syncing Tailwind colors with CSS variables from globals.css
        border: "hsl(var(--border))",            // #334155
        input: "hsl(var(--input))",              // #334155
        ring: "hsl(var(--ring))",                // #334155
        background: "hsl(var(--background))",    // #0F172A
        foreground: "hsl(var(--foreground))",    // #F9FAFB

        primary: {
          DEFAULT: "hsl(var(--primary))",        // #0D9488
          foreground: "hsl(var(--primary-foreground))", // #F9FAFB
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",      // #1E293B
          foreground: "hsl(var(--secondary-foreground))", // #E5E7EB
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",    // red tone
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",          // #1E293B
          foreground: "hsl(var(--muted-foreground))", // #E5E7EB
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",         // #1E293B
          foreground: "hsl(var(--accent-foreground))", // #F9FAFB
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",        // #1E293B
          foreground: "hsl(var(--popover-foreground))", // #F9FAFB
        },
        card: {
          DEFAULT: "hsl(var(--card))",           // #1E293B
          foreground: "hsl(var(--card-foreground))", // #F9FAFB
        },

        // Additional custom colors for direct usage
        // 'custom-primary': '#22D3EE',     // Used for calendar or accent elements
        // 'input-border': '#5925DC',
        // 'active': '#EEEAFE',
        // 'text-secondary': '#E5E7EB',     // matches gray-300 for secondary text
        // 'hover-accent': '#06B6D4',       
        // cyan hover for buttons
        
        'custom-primary': '#14B8A6',   // teal-500 — matches your accent (balanced & modern)
        'input-border': '#334155',     // slate-700 — blends naturally with dark cards
        'active': '#1E40AF',           // blue-800 — subtle active state, fits dark mode well
        'text-secondary': '#E5E7EB',   // gray-300 — perfect for subtext on dark background
        'hover-accent': '#06B6D4',     // cyan-500 — energetic hover color for buttons
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}) satisfies Config;
