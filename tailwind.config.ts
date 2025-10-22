
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#4CAF50',
					foreground: '#ffffff',
					50: '#E8F5E8',
					100: '#C8E6C9',
					200: '#A5D6A7',
					300: '#81C784',
					400: '#66BB6A',
					500: '#4CAF50',
					600: '#43A047',
					700: '#388E3C',
					800: '#2E7D32',
					900: '#1B5E20'
				},
				secondary: {
					DEFAULT: '#2196F3',
					foreground: '#ffffff',
					50: '#E3F2FD',
					100: '#BBDEFB',
					200: '#90CAF9',
					300: '#64B5F6',
					400: '#42A5F5',
					500: '#2196F3',
					600: '#1E88E5',
					700: '#1976D2',
					800: '#1565C0',
					900: '#0D47A1'
				},
				destructive: {
					DEFAULT: '#f44336',
					foreground: '#ffffff'
				},
				muted: {
					DEFAULT: '#f5f5f5',
					foreground: '#757575'
				},
				accent: {
					DEFAULT: '#f5f5f5',
					foreground: '#424242'
				},
				popover: {
					DEFAULT: '#ffffff',
					foreground: '#212121'
				},
				card: {
					DEFAULT: '#ffffff',
					foreground: '#212121'
				},
			},
			borderRadius: {
				lg: '12px',
				md: '8px',
				sm: '6px'
			},
			boxShadow: {
				'soft': '0 2px 15px rgba(0, 0, 0, 0.08)',
				'medium': '0 4px 25px rgba(0, 0, 0, 0.12)',
			},
			keyframes: {
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				}
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
