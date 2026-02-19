/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Background Colors
        'app-bg': '#02040A',
        'surface': '#09090B',
        'surface-highlight': '#18181B',
        
        // Brand Colors (Profitcast Teal/Mint)
        'brand-teal': '#00A1C7',
        'brand-mint': '#00FFAA',
        'brand-orange': '#FF6826',
        
        // Text Colors
        'text-primary': '#FAFAFA',
        'text-secondary': '#A1A1AA',
        'text-muted': '#52525B',
        
        // Status Colors
        'status-healthy': '#00FFAA',
        'status-warning': '#eab308',
        'status-critical': '#ef4444',
        'status-info': '#00A1C7',
        
        // Platform Colors
        'meta-blue': '#1877F2',
        'google-blue': '#4285F4',
        'google-red': '#EA4335',
        'google-yellow': '#FBBC05',
        'google-green': '#34A853',
      },
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-teal': '0 0 20px rgba(0, 161, 199, 0.4)',
        'glow-mint': '0 0 20px rgba(0, 255, 170, 0.3)',
        'glow-orange': '0 0 20px rgba(255, 104, 38, 0.4)',
      },
      backdropBlur: {
        'glass': '16px',
        'glass-heavy': '24px',
      },
      borderRadius: {
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}
