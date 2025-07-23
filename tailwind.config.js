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
      fontSize: {
            base: ["18px", "26px"], // 
            lg: ["20px", "28px"], // 
            xl: ["24px", "32px"], // 
            '2xl': ["30px", "38px"], // 
            '3xl': ["36px", "44px"], // 
            '4xl': ["48px", "56px"], // 
            '5xl': ["60px", "68px"],
      },    
    },
  },
  plugins: [],
}