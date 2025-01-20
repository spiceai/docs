import type { Config } from 'tailwindcss';
import * as defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  corePlugins: {
    preflight: false,
    container: false,
  },
  important: '.tailwind',
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          '100': 'hsla(35, 95%, 92%, 1)',
          '200': 'hsla(35, 100%, 86%, 1)',
          '400': 'hsla(27, 91%, 61%, 1)',
          '500': 'hsla(25, 90%, 54%, 1)',
          '600': 'hsla(21, 85%, 48%, 1)',
          '700': 'hsla(17, 83%, 40%, 1)',
        },
        alpha: {
          DEFAULT: 'hsla(0, 0%, 0%, 0)',
          foreground: 'hsla(0, 0%, 0%, 1)',
          '50': 'hsla(0, 0%, 0%, 0.04)',
          '100': 'hsla(0, 0%, 0%, 0.08)',
          '150': 'hsla(0, 0%, 0%, 0.12)',
          '300': 'hsla(0, 0%, 0%, 0.32)',
          '700': 'hsla(0, 0%, 0%, 0.72)',
          '800': 'hsla(0, 0%, 0%, 0.8)',
          '900': 'hsla(0, 0%, 0%, 1)',
        },
        neutral: {
          DEFAULT: 'hsla(0, 0%, 100%, 1)',
          foreground: 'hsla(0, 0%, 0%, 1)',
          '50': 'hsla(60, 5%, 96%, 1)',
          '400': 'hsla(0, 0%, 64%, 1)',
          '600': 'hsla(0, 0%, 32%, 1)',
        },
        red: {
          '400': 'hsla(0, 86%, 63%, 1)',
        },
        green: {
          '400': 'hsla(85, 59%, 58%, 1)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        sans: ['Open Sans', 'Manrope', ...defaultTheme.fontFamily.sans],
        mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        'button-hover': '0px -4px 8px 0px rgba(246, 147, 65, 0.40)',
        box: '0px -8px 16px 0px rgba(0, 0, 0, 0.04)',
        code: '0px -8px 24px 0px var(--Primary-100, #FEEDD6)',
      },
      fontSize: {
        lg: [
          '1.125rem',
          {
            lineHeight: '1.5rem',
          },
        ],
        '3xl': [
          '2rem',
          {
            lineHeight: '2.5rem',
          },
        ],
        '4xl': [
          '2.5rem',
          {
            lineHeight: '3.5rem',
          },
        ],
        '6xl': [
          '4rem',
          {
            lineHeight: '4.5rem',
          },
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
