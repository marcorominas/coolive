/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'beix-clar': '#F5F1E9',   
        'ocre': '#D98C38',       
        'marron-fosc': '#3E2C2A',
        'blanc-pur': '#FFFFFF',  
      }     
    },
  },
  plugins: [],
}