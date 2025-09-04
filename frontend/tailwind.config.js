/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f3f3',
          100: '#e8e4f0',
          200: '#d1c7e1',
          300: '#b4a3d2',
          400: '#9778c3',
          500: '#4B3B6F',
          600: '#3d2f5a',
          700: '#2f2345',
          800: '#211730',
          900: '#130b1a',
        },
        accent: {
          50: '#fdf9f0',
          100: '#faf1d9',
          200: '#f5e1b3',
          300: '#efd08d',
          400: '#e9bf67',
          500: '#C09D3E',
          600: '#9a7d32',
          700: '#745d26',
          800: '#4e3d1a',
          900: '#281d0e',
        },
        background: '#f9fafb',
        surface: '#ffffff',
        'patients-accent': '#2563eb', // Blue
        'facility-accent': '#059669', // Teal/Green
        'slots-accent': '#7c3aed', // Purple
        'myreferrals-accent': '#f97316', // Orange/Coral
        'neutral-gray': '#6b7280',
        'text-primary': '#111827',
        'text-secondary': '#374151',
        // Accent hover (20% opacity)
        'patients-accent-hover': '#2563eb33',
        'facility-accent-hover': '#05966933',
        'slots-accent-hover': '#7c3aed33',
        'myreferrals-accent-hover': '#f9731633',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px 0 rgba(0,0,0,0.06)',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
}
