module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        forge: {
          50: '#18181B',
          100: '#27272A',
          200: '#3F3F46',
          300: '#52525B',
          400: '#A1A1AA',
          500: '#D4D4D8',
          600: '#E4E4E7',
          700: '#F4F4F5',
          800: '#FAFAFA',
          900: '#FFFFFF',
        },
        success: {
          400: '#34D399',
          500: '#10B981',
        },
        danger: {
          400: '#F87171',
          500: '#EF4444',
        }
      }
    }
  },
  plugins: []
};
