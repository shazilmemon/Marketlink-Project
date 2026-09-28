/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AgriFlow Signature Color Token System
        agriflow: {
          dark:     '#10251D',   // Deep Forest Green
          deep:     '#0B100D',   // Near Black
          forest:   '#263A2E',   // Dark Olive
          leaf:     '#263A2E',   // Mid Green (using olive)
          gold:     '#C9A45C',   // Champagne Gold
          ochre:    '#A9874B',   // Muted Gold
          cream:    '#F5F0E6',   // Background Base (Warm Ivory)
          sand:     '#E9DFC9',   // Soft Section Base (Cream)
          card:     '#F5F0E6',   // Card Background
        },
        agri: {
          // Backward-compatible mapping updated to AgriFlow tokens
          dark:     '#10251D',   
          pine:     '#263A2E',   
          emerald:  '#10251D',   
          forest:   '#263A2E',   
          sage:     '#C9A45C',   
          mint:     '#E9DFC9',   

          // Accent / Highlights
          harvest:  '#C9A45C',   
          gold:     '#C9A45C',   
          ochre:    '#A9874B',   
          warmGold: '#C9A45C',   

          // Background Base
          cream:    '#F5F0E6',   
          stone:    '#E9DFC9',   
          parchment:'#E9DFC9',   

          // Neutrals & Cards
          surface:  '#F5F0E6',   
          charcoal: '#0B100D',   
          ink:      '#10251D',   
          muted:    '#263A2E',   
          subtle:   '#A9874B',   
          border:   'rgba(201, 164, 92, 0.25)', 
          line:     'rgba(201, 164, 92, 0.25)',   
        },
      },
      fontFamily: {
        sans:    ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
        serif:   ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        card:    '0 4px 20px -2px rgba(16, 37, 29, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        lift:    '0 20px 40px -15px rgba(16, 37, 29, 0.12), 0 8px 16px -8px rgba(201, 164, 92, 0.15)',
        glow:    '0 0 0 1px rgba(201, 164, 92, 0.25)',
        glass:   '0 8px 32px 0 rgba(16, 37, 29, 0.08)',
        navbar:  '0 2px 10px -2px rgba(16, 37, 29, 0.1)',
        gold:    '0 10px 28px -6px rgba(201, 164, 92, 0.25)',
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #10251D 0%, #263A2E 100%)',
        'pine-gradient':    'linear-gradient(135deg, #10251D, #263A2E)',
        'amber-gradient':   'linear-gradient(135deg, #C9A45C, #A9874B)',
        'gold-gradient':    'linear-gradient(135deg, #C9A45C, #A9874B)',
        'card-gradient':    'linear-gradient(145deg, #F5F0E6 0%, #E9DFC9 100%)',
        'section-gradient': 'linear-gradient(180deg, #F5F0E6 0%, #E9DFC9 100%)',
      },
      animation: {
        'bounce-slow': 'floatSubtle 3.5s ease-in-out infinite',
        'float-slow':  'floatSubtle 4s ease-in-out infinite',
        'fade-in-up':  'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down':  'slideInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        floatSubtle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInDown: {
          from: { opacity: '0', transform: 'translateY(-24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
