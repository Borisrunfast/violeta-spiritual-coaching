/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#D4AF37",   // Rich, warm gold
        accent:  "#F0E68C",   // Soft, light gold
        secondary: "#2C2C2C", // Deep charcoal
        background: "#121212",// Almost black
        text: "#EEEEEE"       // Soft white for body text
      },
    },
  },
  plugins: [],
}
