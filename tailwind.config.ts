const BREAKPOINTS = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
} as const

const Z_INDEX = {
	base: 0,
	dropdown: 1000,
	sticky: 1100,
	sidebar: 1200,
	overlay: 1300,
	modal: 1400,
	popover: 1500,
	tooltip: 1600,
	toast: 1700,
} as const

const config = {
	darkMode: "class",
	theme: {
		screens: {
			'xs': '320px',
			'sm': '480px',
			'md': `${BREAKPOINTS.md}px`,
			'lg': `${BREAKPOINTS.lg}px`,
			'xl': `${BREAKPOINTS.xl}px`,
			'2xl': `${BREAKPOINTS['2xl']}px`,
			'3xl': '1920px',
			'4xl': '2560px',
		},
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
				serif: ['var(--font-serif)', 'Georgia', 'Cambria', 'serif'],
				mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
				terminal: ['var(--font-mono)', 'ui-monospace', 'monospace'],
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				// Premium Gradient Utilities
				'gradient-premium': 'linear-gradient(135deg, var(--tw-gradient-stops))',
				'gradient-mesh': 'radial-gradient(at 20% 30%, var(--tw-gradient-stops))',
				'gradient-mesh-2': 'radial-gradient(at 80% 20%, var(--tw-gradient-stops))',
				'gradient-mesh-3': 'radial-gradient(at 40% 80%, var(--tw-gradient-stops))',
				'gradient-mesh-complex': 'radial-gradient(at 20% 30%, hsl(var(--primary) / 0.3) 0px, transparent 50%), radial-gradient(at 80% 70%, hsl(var(--accent) / 0.3) 0px, transparent 50%)',
				'gradient-glow': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
				'gradient-shine': 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
			},
			backgroundSize: {
				'300': '300%',
				'400': '400%',
			},
			backgroundPosition: {
				'gradient-shine': '200% center',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Premium Border Utilities
				'4xl': '2rem',
				'5xl': '2.5rem',
				// MiniMax Border Radius Tokens
				pill: '9999px',
				comfortable: '13px',
				generous: '20px',
				large: '24px',
			},
			fontSize: {
				'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem)',
				'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 0.9375rem)',
				'fluid-base': 'clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)',
				'fluid-lg': 'clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)',
				'fluid-xl': 'clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',
				'fluid-2xl': 'clamp(1.5rem, 1.35rem + 0.75vw, 2rem)',
				'fluid-3xl': 'clamp(1.875rem, 1.65rem + 1.125vw, 2.5rem)',
				'fluid-4xl': 'clamp(2.25rem, 1.95rem + 1.5vw, 3.25rem)',
				'fluid-5xl': 'clamp(3rem, 2.5rem + 2.5vw, 5rem)',
				'fluid-6xl': 'clamp(3.75rem, 3.125rem + 3.125vw, 6.25rem)',
				'fluid-7xl': 'clamp(4.5rem, 3.75rem + 3.75vw, 7.5rem)',
				'fluid-8xl': 'clamp(6rem, 5rem + 5vw, 10rem)',
				'fluid-9xl': 'clamp(7.5rem, 6.25rem + 6.25vw, 12.5rem)',
				'2xs': '0.625rem',
				'xs': '0.75rem',
				'sm': '0.8125rem',
				'base': '0.875rem',
				'caption': '0.8125rem',
				'body': '0.9375rem',
				'subhead': '1.0625rem',
				'lg': '1.125rem',
				'xl': '1.25rem',
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
			},
			spacing: {
				'fluid-3xs': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
				'fluid-2xs': 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',
				'fluid-xs': 'clamp(0.75rem, 0.6rem + 0.75vw, 1rem)',
				'fluid-sm': 'clamp(1rem, 0.85rem + 0.75vw, 1.5rem)',
				'fluid-md': 'clamp(1.5rem, 1.25rem + 1.25vw, 2.5rem)',
				'fluid-lg': 'clamp(2rem, 1.75rem + 1.25vw, 3.5rem)',
				'fluid-xl': 'clamp(3rem, 2.5rem + 2.5vw, 5rem)',
				'fluid-2xl': 'clamp(4rem, 3.5rem + 2.5vw, 7rem)',
				'fluid-3xl': 'clamp(5rem, 4.5rem + 2.5vw, 10rem)',
				'18': '4.5rem',
				'128': '32rem',
				// Enhanced Spacing - subtle gap variations
				'4.5': '1.125rem',
				'5.5': '1.375rem',
				'6.5': '1.625rem',
				'7.5': '1.875rem',
				'8.5': '2.125rem',
				'9.5': '2.375rem',
				'10.5': '2.625rem',
				'11.5': '2.875rem',
				'12.5': '3.125rem',
				'13.5': '3.375rem',
				'14.5': '3.625rem',
				'15.5': '3.875rem',
				'16.5': '4.125rem',
				'17.5': '4.375rem',
				'18.5': '4.625rem',
				'19.5': '4.875rem',
				'20.5': '5.125rem',
				'21.5': '5.375rem',
				'22.5': '5.625rem',
				'23.5': '5.875rem',
				'24.5': '6.125rem',
			},
			maxWidth: {
				'xs': '20rem',
				'container-xs': '320px',
				'container-sm': '480px',
				'container-md': '768px',
				'container-lg': '1024px',
				'container-xl': '1200px',
				'container-2xl': '1440px',
				'container-3xl': '1920px',
				'container-4xl': '2560px',
				// Container refinements - intermediate sizes
				'container-xs-plus': '360px',
				'container-sm-plus': '540px',
				'container-md-plus': '840px',
				'container-lg-plus': '1120px',
				'container-xl-plus': '1320px',
				'container-2xl-plus': '1600px',
			},
			gridTemplateColumns: {
				'13': 'repeat(13, minmax(0, 1fr))',
				'14': 'repeat(14, minmax(0, 1fr))',
				'15': 'repeat(15, minmax(0, 1fr))',
				'16': 'repeat(16, minmax(0, 1fr))',
			},
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100',
				'9999': '9999',
				...Object.fromEntries(
					Object.entries(Z_INDEX).map(([key, value]) => [key, String(value)])
				),
			},
			// Refined Shadow Utilities
			boxShadow: {
				// MiniMax Shadow Tokens
				'minimax-brand-glow': 'rgba(44, 30, 116, 0.16) 0px 0px 15px',
				'minimax-elevated': 'rgba(36, 36, 36, 0.08) 0px 12px 16px -4px',
				'minimax-ambient': 'rgba(0, 0, 0, 0.08) 0px 0px 22.576px',
				// Layered shadows - small
				'sm-layered': '0 1px 2px 0 rgb(0 0 0 / 0.05), 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.1)',
				// Layered shadows - medium
				'md-layered': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1), 0 6px 8px -4px rgb(0 0 0 / 0.1)',
				// Layered shadows - large
				'lg-layered': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 20px 25px -5px rgb(0 0 0 / 0.1)',
				// Layered shadows - xl
				'xl-layered': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 25px 50px -12px rgb(0 0 0 / 0.25)',
				// Inner shadows
				'inner-sm': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'inner-md': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
				'inner-lg': 'inset 0 4px 8px 0 rgb(0 0 0 / 0.12)',
				'inner-xl': 'inset 0 8px 16px 0 rgb(0 0 0 / 0.15)',
				// Colored shadows - accent glows
				'glow-primary': '0 0 20px rgb(var(--primary) / 0.3), 0 0 40px rgb(var(--primary) / 0.2)',
				'glow-primary-md': '0 0 30px rgb(var(--primary) / 0.4), 0 0 60px rgb(var(--primary) / 0.3)',
				'glow-primary-lg': '0 0 40px rgb(var(--primary) / 0.5), 0 0 80px rgb(var(--primary) / 0.4)',
				'glow-accent': '0 0 20px rgb(var(--accent) / 0.3), 0 0 40px rgb(var(--accent) / 0.2)',
				'glow-accent-md': '0 0 30px rgb(var(--accent) / 0.4), 0 0 60px rgb(var(--accent) / 0.3)',
				'glow-accent-lg': '0 0 40px rgb(var(--accent) / 0.5), 0 0 80px rgb(var(--accent) / 0.4)',
				// Semantic colored shadows
				'glow-success': '0 0 20px rgb(var(--semantic-success) / 0.3), 0 0 40px rgb(var(--semantic-success) / 0.2)',
				'glow-warning': '0 0 20px rgb(var(--semantic-warning) / 0.3), 0 0 40px rgb(var(--semantic-warning) / 0.2)',
				'glow-error': '0 0 20px rgb(var(--semantic-error) / 0.3), 0 0 40px rgb(var(--semantic-error) / 0.2)',
				'glow-info': '0 0 20px rgb(var(--semantic-info) / 0.3), 0 0 40px rgb(var(--semantic-info) / 0.2)',
				// Premium soft shadows
				'soft-sm': '0 2px 8px rgb(0 0 0 / 0.04), 0 1px 3px rgb(0 0 0 / 0.06)',
				'soft-md': '0 4px 12px rgb(0 0 0 / 0.06), 0 2px 4px rgb(0 0 0 / 0.08)',
				'soft-lg': '0 8px 24px rgb(0 0 0 / 0.08), 0 4px 8px rgb(0 0 0 / 0.10)',
				'soft-xl': '0 16px 48px rgb(0 0 0 / 0.10), 0 8px 16px rgb(0 0 0 / 0.12)',
				// Dramatic shadows
				'dramatic-sm': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.05)',
				'dramatic-md': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.05)',
				'dramatic-lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -4px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(0 0 0 / 0.05)',
				'dramatic-xl': '0 25px 50px -12px rgb(0 0 0 / 0.25), 0 12px 24px -4px rgb(0 0 0 / 0.08), 0 0 0 1px rgb(0 0 0 / 0.05)',
			},
			// Glass & Blur Utilities
			backdropBlur: {
				xs: '2px',
				'3xl': '64px',
				'4xl': '96px',
			},
			// MiniMax Glassmorphism Utilities (Light Mode)
			backgroundColor: {
				'glass-minimax': 'hsla(0, 0%, 100%, 0.4)',
				'glass-minimax-light': 'hsla(0, 0%, 100%, 0.6)',
				'glass-minimax-border': 'rgba(255, 255, 255, 0.2)',
			},
			// Premium Border Utilities
			borderColor: {
				'glass': 'rgba(255, 255, 255, 0.1)',
				'glass-dark': 'rgba(0, 0, 0, 0.1)',
				'glow-primary': 'rgb(var(--primary) / 0.5)',
				'glow-accent': 'rgb(var(--accent) / 0.5)',
			},
			// Enhanced transition utilities
			transitionTimingFunction: {
				'spring-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'spring-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'spring-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'spring-in': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
				'spring-in-out': 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
				'ease-out-back': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				'ease-in-back': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
				'ease-out-back-custom': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'ease-elastic': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'ease-overstep': 'cubic-bezier(0.7, 0, 0.3, 1)',
			},
			transitionDuration: {
				'400': '400ms',
				'600': '600ms',
				'800': '800ms',
				'1200': '1200ms',
				'1600': '1600ms',
				'2000': '2000ms',
			},
			// Staggered animation delays
			animationDelay: {
				'75': '75ms',
				'100': '100ms',
				'150': '150ms',
				'200': '200ms',
				'250': '250ms',
				'300': '300ms',
				'400': '400ms',
				'500': '500ms',
				'600': '600ms',
				'700': '700ms',
				'800': '800ms',
				'900': '900ms',
				'1000': '1000ms',
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				/* Secondary accent - blue tint */
				rose: {
					DEFAULT: 'hsl(222 68% 66%)',
					50: '222 68% 95%',
					100: '222 68% 90%',
					200: '222 68% 82%',
					300: '222 68% 74%',
					400: '222 68% 66%',
					500: '222 68% 58%',
					600: '222 68% 50%',
					700: '222 68% 42%',
					800: '222 68% 34%',
					900: '222 68% 26%',
				},
				/* Tertiary accent - blue tint */
				bronze: {
					DEFAULT: 'hsl(222 60% 56%)',
					50: '222 60% 92%',
					100: '222 60% 86%',
					200: '222 60% 78%',
					300: '222 60% 70%',
					400: '222 60% 62%',
					500: '222 60% 56%',
					600: '222 60% 48%',
					700: '222 60% 40%',
					800: '222 60% 32%',
					900: '222 60% 24%',
				},
				gray: {
					50: 'hsl(var(--legacy-50))',
					100: 'hsl(var(--legacy-100))',
					200: 'hsl(var(--legacy-100))',
					300: 'hsl(var(--legacy-300))',
					400: 'hsl(var(--legacy-400))',
					500: 'hsl(var(--legacy-500))',
					600: 'hsl(var(--legacy-600))',
					700: 'hsl(var(--legacy-700))',
					800: 'hsl(var(--legacy-800))',
					900: 'hsl(var(--legacy-900))',
					950: 'hsl(var(--legacy-950))',
				},
				zinc: {
					50: 'hsl(var(--legacy-50))',
					100: 'hsl(var(--legacy-100))',
					200: 'hsl(var(--legacy-100))',
					300: 'hsl(var(--legacy-100))',
					400: 'hsl(var(--legacy-400))',
					500: 'hsl(var(--legacy-500))',
					600: 'hsl(var(--legacy-600))',
					700: 'hsl(var(--legacy-700))',
					800: 'hsl(var(--legacy-800))',
					900: 'hsl(var(--legacy-900))',
					950: 'hsl(var(--legacy-950))',
				},
				neutral: {
					50: 'hsl(var(--legacy-50))',
					100: 'hsl(var(--legacy-100))',
					200: 'hsl(var(--legacy-100))',
					300: 'hsl(var(--legacy-300))',
					400: 'hsl(var(--legacy-400))',
					500: 'hsl(var(--legacy-500))',
					600: 'hsl(var(--legacy-600))',
					700: 'hsl(var(--legacy-700))',
					800: 'hsl(var(--legacy-800))',
					900: 'hsl(var(--legacy-900))',
					950: 'hsl(var(--legacy-950))',
				},
				slate: {
					50: 'hsl(var(--legacy-50))',
					100: 'hsl(var(--legacy-100))',
					200: 'hsl(var(--legacy-100))',
					300: 'hsl(var(--legacy-300))',
					400: 'hsl(var(--legacy-400))',
					500: 'hsl(var(--legacy-500))',
					600: 'hsl(var(--legacy-600))',
					700: 'hsl(var(--legacy-700))',
					800: 'hsl(var(--legacy-800))',
					900: 'hsl(var(--legacy-900))',
					950: 'hsl(var(--legacy-950))',
				},
				stone: {
					50: 'hsl(var(--legacy-50))',
					100: 'hsl(var(--legacy-50))',
					200: 'hsl(var(--legacy-50))',
					300: 'hsl(var(--legacy-50))',
					400: 'hsl(var(--legacy-500))',
					500: 'hsl(var(--legacy-500))',
					600: 'hsl(var(--legacy-600))',
					700: 'hsl(var(--legacy-700))',
					800: 'hsl(var(--legacy-800))',
					900: 'hsl(var(--legacy-900))',
					950: 'hsl(var(--legacy-950))',
				},
				white: 'hsl(var(--legacy-white))',
				black: 'hsl(var(--legacy-black))',
				matte: {
					obsidian: 'hsl(var(--legacy-black))',
					panel: 'hsl(var(--precision-panel))',
					layer: 'hsl(var(--precision-panel-line))',
					line: 'hsl(var(--precision-panel-line))',
				},
				precision: {
					cobalt: 'hsl(var(--primary))',
					'highlight': 'hsl(var(--foreground))',
					'line': 'hsl(var(--primary) / 0.06)',
				},
				'precision-blue': 'hsl(var(--primary))',
				'steel-grey': 'hsl(var(--muted-foreground))',
				'cyber-pink': 'hsl(222 68% 66%)',
				'matte-black': 'hsl(var(--legacy-black))',
				'obsidian': 'hsl(var(--background))',
				// MiniMax Brand Colors
				'minimax': {
					brand: 'hsl(var(--primary))',
					pink: 'hsl(309 73% 65%)',
					sky: 'hsl(203 100% 62%)',
					deep: 'hsl(222 89% 51%)',
				},
				semantic: {
					success: 'hsl(var(--semantic-success))',
					'success-fg': 'hsl(var(--semantic-success-fg))',
					'success-bg': 'hsl(var(--semantic-success-bg))',
					'success-border': 'hsl(var(--semantic-success-border))',
					warning: 'hsl(var(--semantic-warning))',
					'warning-fg': 'hsl(var(--semantic-warning-fg))',
					'warning-bg': 'hsl(var(--semantic-warning-bg))',
					'warning-border': 'hsl(var(--semantic-warning-border))',
					error: 'hsl(var(--semantic-error))',
					'error-fg': 'hsl(var(--semantic-error-fg))',
					'error-bg': 'hsl(var(--semantic-error-bg))',
					'error-border': 'hsl(var(--semantic-error-border))',
					info: 'hsl(var(--semantic-info))',
					'info-fg': 'hsl(var(--semantic-info-fg))',
					'info-bg': 'hsl(var(--semantic-info-bg))',
					'info-border': 'hsl(var(--semantic-info-border))'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'scanner-smooth': {
					'0%': {
						top: '0%'
					},
					'50%': {
						top: 'calc(100% - 3px)'
					},
					'50.001%': {
						top: 'calc(100% - 3px)'
					},
					'100%': {
						top: '0%'
					}
				},
				'glow-subtle': {
					'0%': {
						opacity: '0.5'
					},
					'50%': {
						opacity: '0.7'
					},
					'100%': {
						opacity: '0.5'
					}
				},
				'glow-success': {
					'0%': {
						opacity: '0.5'
					},
					'50%': {
						opacity: '0.8'
					},
					'100%': {
						opacity: '0.5'
					}
				},
				'success-pulse': {
					'0%': {
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					},
					'100%': {
						opacity: '0'
					}
				},
				'success-sweep': {
					'0%': {
						transform: 'translateX(-100%)'
					},
					'100%': {
						transform: 'translateX(100%)'
					}
				},
				// Enhanced Animation System - Spring-based
				'spring-in': {
					'0%': {
						transform: 'scale(0.9)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.02)'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'spring-out': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(0.9)',
						opacity: '0'
					}
				},
				'bounce-in': {
					'0%': {
						transform: 'scale(0)',
						opacity: '0'
					},
					'50%': {
						transform: 'scale(1.1)'
					},
					'70%': {
						transform: 'scale(0.95)'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'bounce-out': {
					'0%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'30%': {
						transform: 'scale(1.05)'
					},
					'100%': {
						transform: 'scale(0)',
						opacity: '0'
					}
				},
				'slide-up-spring': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-down-spring': {
					'0%': {
						transform: 'translateY(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'slide-left-spring': {
					'0%': {
						transform: 'translateX(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'slide-right-spring': {
					'0%': {
						transform: 'translateX(-20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200% 0'
					},
					'100%': {
						backgroundPosition: '200% 0'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1',
						boxShadow: '0 0 20px rgb(var(--primary) / 0.4)'
					},
					'50%': {
						opacity: '0.8',
						boxShadow: '0 0 40px rgb(var(--primary) / 0.6)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'wiggle': {
					'0%, 100%': {
						transform: 'rotate(0deg)'
					},
					'25%': {
						transform: 'rotate(3deg)'
					},
					'75%': {
						transform: 'rotate(-3deg)'
					}
				},
				'morph': {
					'0%, 100%': {
						borderRadius: '40% 60% 60% 40% / 60% 30% 70% 40%'
					},
					'50%': {
						borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'scanner-smooth': 'scanner-smooth 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'glow-subtle': 'glow-subtle 3s ease-in-out infinite',
				'glow-success': 'glow-success 2s ease-in-out infinite',
				'success-pulse': 'success-pulse 3s ease-in-out infinite',
				'success-sweep': 'success-sweep 1.5s ease-in-out forwards',
				// Enhanced animations
				'spring-in': 'spring-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'spring-out': 'spring-out 0.4s cubic-bezier(0.36, 0, 0.66, -0.56)',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'bounce-out': 'bounce-out 0.4s cubic-bezier(0.36, 0, 0.66, -0.56)',
				'slide-up-spring': 'slide-up-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'slide-down-spring': 'slide-down-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'slide-left-spring': 'slide-left-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'slide-right-spring': 'slide-right-spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
				'shimmer': 'shimmer 2s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'wiggle': 'wiggle 0.5s ease-in-out',
				'morph': 'morph 8s ease-in-out infinite',
			},
			typography: {
				DEFAULT: {
					css: {
						'code::before': {
							content: '""'
						},
						'code::after': {
							content: '""'
						},
						table: {
							width: '100%',
							marginTop: '1.5rem',
							marginBottom: '1.5rem',
							borderCollapse: 'collapse',
							fontSize: '0.875rem',
							lineHeight: '1.25rem',
							border: '1px solid var(--tw-prose-td-borders)'
						},
						thead: {
							backgroundColor: 'var(--tw-prose-th-borders)',
							borderWidth: '1px',
							borderStyle: 'solid',
							borderColor: 'var(--tw-prose-td-borders)'
						},
						'thead th': {
							padding: '1rem',
							fontWeight: '500',
							textAlign: 'left',
							backgroundColor: 'var(--tw-prose-th-borders)'
						},
						'tbody tr': {
							borderBottomWeight: '1px',
							borderBottomStyle: 'solid',
							borderBottomColor: 'var(--tw-prose-td-borders)'
						},
						'tbody td': {
							padding: '1rem',
							borderWidth: '1px',
							borderStyle: 'solid',
							borderColor: 'var(--tw-prose-td-borders)'
						}
					}
				}
			}
		}
	}
}
export default config
