/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#2563EB',      // Primary / Focus Blue
          navy: '#172554',      // Deep Navy
        },
        focus: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
        },
        navy: {
          deep: '#172554',
          muted: '#1E293B',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#F8FAFC',
          subtle: '#F1F5F9',
        },
        content: {
          body: '#334155',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: {
          subtle: '#E2E8F0',
          hover: '#CBD5E1',
        },
        status: {
          success: '#16A34A',
          error: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'card-sm': '14px',
        'card-lg': '18px',
      },
      maxWidth: {
        'site': '1200px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)',
      },
      transitionDuration: {
        'fast': '150ms',
        'standard': '200ms',
      },
    },
  },
  plugins: [],
}
