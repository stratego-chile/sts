import FormsPlugin from '@tailwindcss/forms';
import type { Config } from 'tailwindcss';

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
	theme: {
		extend: {},
	},
	variants: {},
	plugins: [
		FormsPlugin,
	],
} satisfies Config
