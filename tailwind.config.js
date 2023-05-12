//@ts-check

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
	theme: {
		extend: {},
	},
	variants: {},
	plugins: [
		require('@tailwindcss/forms'),
	],
}
