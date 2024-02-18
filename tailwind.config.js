/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      screens: {
        xs: "320px",
      },
      fontFamily: {
        sourceCodePro: ["sourceCodePro"],
      },
      // stretch the grid so that footer is always at the bottom
      // even on pages with little content
      gridTemplateRows: {
        "auto-1fr": "auto 1fr",
      },
    },
  },
  daisyui: {
    themes: [
      // browse DeXter colors at https://www.figma.com/file/qushS15h87wjpoXaY6ND4W/DeXter-UI---refresh?node-id=456%3A129&mode=dev
      // by clicking on "Show more colors" in dev mode (while the whole page is selected)
      {
        dark: {
          // full list of available color vars at https://daisyui.com/docs/colors/
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],

          // unused colors not listed
          // override more colors if needed below

          "secondary-content": "#858D92",
          accent: "#CBFC42",
          "accent-focus": "#CBFC42",
          "accent-content": "#000000",
          primary: "#000000",
          "primary-content": "#FFFFFF",
          neutral: "#383C3E",

          error: "#DE4040",
          "error-content": "#4D2929",

          success: "#2B9548",
          "success-content": "#243E17",

          "base-100": "#232629",
          "base-200": "#191B1D",
          "base-300": "#000000",
          "base-content": "#FFFFFF",

          "--rounded-btn": "0",
          "--btn-text-case": "none",
          "--rounded-box": "0",
        },
      },
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          // TODO: configure these colors when working with light theme

          "secondary-content": "#858D92",
          accent: "#BFED3F",
          "accent-content": "#000000",
          primary: "#000000",
          "primary-content": "#FFFFFF",
          neutral: "#383C3E",

          error: "#FF5C5C",
          "error-content": "#4D2929",

          success: "#73D2BD",
          "success-content": "#243E17",

          "base-100": "#232629",
          "base-200": "#191B1D",
          "base-300": "#000000",
          "base-content": "#FFFFFF",

          "--rounded-btn": "0",
          "--btn-text-case": "none",
          "--rounded-box": "0",
        },
      },
    ], // true: all themes | false: only light + dark | array: specific themes like this ["light", "dark", "cupcake"]
    darkTheme: "dark", // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    rtl: false, // rotate style direction from left-to-right to right-to-left. You also need to add dir="rtl" to your html tag and install `tailwindcss-flip` plugin for Tailwind CSS.
    prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  },
  plugins: [
    require("daisyui"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/container-queries"),
  ],
};
