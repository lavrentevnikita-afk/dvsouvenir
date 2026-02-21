/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.{vue,js,ts}',
    './pages/**/*.{vue,js,ts}',
    './app.vue'
  ],
  theme: {
    extend: {
      colors: {
        // Единая цветовая схема согласно DESIGN_SYSTEM.md
        primary: {
          DEFAULT: '#3659fa', // Electric Indigo
          light: '#a4b4ff',   // Lavender Blue
          dark: '#2847d9',
        },
        brand: {
          DEFAULT: '#ff7a00',  // Сохраняем для обратной совместимости
          orange: '#ff7a00',
        },
        accent: {
          DEFAULT: '#ffc700',  // Amber
          warm: '#ff9500',     // Sunset Orange
        },
      },
      borderRadius: {
        // Единые радиусы согласно DESIGN_SYSTEM.md
        'button': '0.75rem',  // 12px - для кнопок (rounded-lg)
        'card': '1.5rem',     // 24px - для карточек (rounded-xl)
        'input': '0.5rem',    // 8px - для инпутов (rounded-md)
      }
    }
  },
  plugins: []
}
