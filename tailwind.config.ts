import type { Config } from 'tailwindcss'

// Design tokens are defined as CSS variables in src/index.css and swapped by
// [data-theme="dark"]. Here we expose them to Tailwind. The dark variant is
// wired to the same selector for the rare explicit `dark:` usage.
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        fg: { DEFAULT: 'var(--fg)', 2: 'var(--fg-2)' },
        muted: 'var(--muted)',
        accent: { DEFAULT: 'var(--accent)', fg: 'var(--accent-fg)', soft: 'var(--accent-soft)' },
        green: { DEFAULT: 'var(--green)', soft: 'var(--green-soft)' },
        danger: { DEFAULT: 'var(--danger)', soft: 'var(--danger-soft)' },
        warn: { DEFAULT: 'var(--warn)', soft: 'var(--warn-soft)' },
        'gray-pill': { DEFAULT: 'var(--gray-pill)', fg: 'var(--gray-pill-fg)' },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          2: 'var(--sidebar-2)',
          fg: 'var(--sidebar-fg)',
          'fg-strong': 'var(--sidebar-fg-strong)',
          border: 'var(--sidebar-border)',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
      },
      keyframes: {
        'ab-spin': { to: { transform: 'rotate(360deg)' } },
        'ab-slidein': { from: { transform: 'translateX(24px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        'ab-drawerin': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'ab-fadein': { from: { opacity: '0' }, to: { opacity: '1' } },
        'ab-pop': { from: { transform: 'scale(.96)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
      animation: {
        'ab-spin': 'ab-spin 0.7s linear infinite',
        'ab-slidein': 'ab-slidein 0.2s ease-out',
        'ab-drawerin': 'ab-drawerin 0.22s ease-out',
        'ab-fadein': 'ab-fadein 0.15s ease-out',
        'ab-pop': 'ab-pop 0.16s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
