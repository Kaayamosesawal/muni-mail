/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Syncing with --font-heading and --font-body
        heading: ['Poppins', 'Syne', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
        // Legacy support for your existing components
        head: ['Poppins', 'sans-serif'],
        'dm': ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef5ff',   // Matches --brand-light
          500: '#0066FF',  // Matches --brand (Primary)
          600: '#004dc2',  // Matches --brand-deep
          700: '#003daa',
        },
        accent: {
          500: '#F59E0B',  // Matches --accent
        },
        dark: {
          bg: '#020617',     // Matches --bg in dark mode
          card: '#0f172a',   // Matches --surface in dark mode
          border: '#1e293b'  // Matches --border in dark mode
        },
        // Semantic Colors
        success: '#10B981',
        danger: '#EF4444',
        warn: '#F59E0B',
        
        // Surface colors for utility classes
        surface: {
          light: '#F8FAFC',
          soft: '#F1F5F9',
          muted: '#64748B',
        }
      },
      borderRadius: {
        'sm': '0.5rem',    // Matches --radius-sm
        'md': '0.75rem',   // Matches --radius-md
        'lg': '1.25rem',   // Matches --radius-lg
        'xl': '2.5rem',    // Matches --radius-xl (Pill shape)
      },
      boxShadow: {
        // Syncing with your index.css shadow requirements
        'card': '0 1px 4px rgba(15,25,41,0.06), 0 4px 20px rgba(0,102,255,0.07)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.4)',
        'btn': '0 10px 15px -3px rgba(0, 102, 255, 0.25)',
        'btn-hover': '0 20px 25px -5px rgba(0, 102, 255, 0.35)',
      },
      spacing: {
        'nav-h': '64px',
        'bottom-h': '68px',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.3s ease-in-out',
      }
    },
  },
  plugins: [],
}