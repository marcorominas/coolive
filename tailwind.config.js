/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'beige': '#F5F1E9',   //fons principal
        'orange': '#D98C38', //accent i botons      
        'brown': '#3E2C2A', //icones i text principal
        'white': '#FFFFFF',  // text sobre taronja o marró
      },
      fontFamily: {
        // Font per al text corrent
        sans: ['Inter', 'sans-serif'],
        // Font específica per a títols i headers
        heading: ['Poppins', 'sans-serif'],
      },     
    },
  },
  plugins: [],
}