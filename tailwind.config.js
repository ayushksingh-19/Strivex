/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', 'Inter', 'sans-serif'],
      },
      colors: {
        night: '#0A0E0A',      // warm dark green-black
        slate: '#15191A',      // card surfaces
        line: '#1F2421',       // borders
        lime: '#D9FF3D',       // signature acid lime
        limeDim: '#A8C72E',
        mute: '#7A8079',
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
