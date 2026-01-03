/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./layouts/**/*.html",
    "./content/**/*.md",
    "./assets/js/**/*.{js,jsx,ts,tsx}",
  ],
  safelist: [
    // System color gradients for dynamic header/footer
    'from-indigo-600', 'via-purple-600', 'to-pink-500',
    'from-blue-600', 'via-cyan-500', 'to-teal-500',
    'from-purple-600', 'via-violet-500', 'to-purple-400',
    'from-slate-700', 'via-blue-600', 'to-slate-800',
    'from-red-600', 'via-blue-600', 'to-green-600',
    'from-slate-600', 'via-gray-700', 'to-slate-800',
    'from-gray-500', 'via-green-600', 'to-gray-600',
    'from-indigo-500', 'via-purple-500', 'to-pink-500',
    'from-red-600', 'via-gray-600', 'to-red-700',
    'from-yellow-500', 'via-orange-500', 'to-red-600',
    // Dark background utilities
    'bg-gray-900', 'bg-gray-950',
    // Dynamic hover shadow colors
    'hover:shadow-purple-600/50', 'hover:shadow-cyan-500/50', 'hover:shadow-violet-500/50',
    'hover:shadow-blue-600/50', 'hover:shadow-gray-700/50', 'hover:shadow-green-600/50',
    'hover:shadow-purple-500/50', 'hover:shadow-gray-600/50', 'hover:shadow-orange-500/50',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
