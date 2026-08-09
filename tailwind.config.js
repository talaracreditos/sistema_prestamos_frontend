/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // activa modo oscuro por clase .dark en <html>
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red:          '#8B1A1A', // Rojo corporativo principal
          'red-dark':   '#6B1111', // Rojo hover/oscuro
          'red-light':  '#F5E6E6', // Rojo muy claro (fondos modo claro)
          'red-glow':   '#B03030', // Rojo suavizado para fondos oscuros
          gold:         '#F5A623', // Dorado/amarillo del logo
          'gold-dark':  '#D4891A', // Dorado hover
          'gold-light': '#FEF3DC', // Dorado muy claro (fondos modo claro)
          cream:        '#FAF7F4', // Crema para fondos neutros modo claro
        },
        primary: {
          DEFAULT: '#8B1A1A',
          hover:   '#6B1111',
          light:   '#F5E6E6',
        },
        secondary: {
          DEFAULT: '#ffffff',
          text:    '#374151',
          muted:   '#9ca3af',
        },
        // Paleta para modo oscuro (fondos, bordes, texto)
        dark: {
          bg:            '#0F1115', // fondo base app
          surface:       '#171A21', // cards / sidebar
          'surface-alt': '#1F232C', // hover / elementos elevados
          border:        '#2A2F3A',
          text:          '#E5E7EB',
          'text-muted':  '#9CA3AF',
        },
      },
    }
  },
  plugins: [],
}