/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'] },
      colors: {
        bg: { base: 'var(--bg-base)', card: 'var(--bg-card)', elevated: 'var(--bg-elevated)' },
        primary: 'var(--color-primary)',
        accent1: 'var(--color-accent1)',
        accent2: 'var(--color-accent2)',
        accent3: 'var(--color-accent3)',
        accent4: 'var(--color-accent4)',
        'c-text': 'var(--color-text)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
      },
      animation: {
        'float': 'float 5s ease-in-out infinite',
        'fade-in': 'fadeIn 0.45s ease',
        'slide-up': 'slideUp 0.35s ease',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
