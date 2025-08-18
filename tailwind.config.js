/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'sans': ['Lato', 'system-ui', 'sans-serif'],
                'display': ['Cabin', 'system-ui', 'sans-serif'],
                'body': ['Lato', 'system-ui', 'sans-serif'],
                'heading': ['Cabin', 'system-ui', 'sans-serif'],
            },
            colors: {
                border: "oklch(0.922 0 0 / <alpha-value>)",
                input: "oklch(0.97 0 0 / <alpha-value>)",
                ring: "oklch(0.55 0.22 350 / <alpha-value>)",
                "outline-ring": "oklch(0.55 0.22 350 / <alpha-value>)",
                background: "oklch(0.96 0 0 / <alpha-value>)",
                foreground: "oklch(0.145 0 0 / <alpha-value>)",
                primary: {
                    DEFAULT: "oklch(0.55 0.22 350 / <alpha-value>)",
                    foreground: "oklch(1 0 0 / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "oklch(0.15 0.05 240 / <alpha-value>)",
                    foreground: "oklch(1 0 0 / <alpha-value>)",
                },
                destructive: {
                    DEFAULT: "oklch(0.577 0.245 27.325 / <alpha-value>)",
                    foreground: "oklch(0.985 0 0 / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "oklch(0.97 0 0 / <alpha-value>)",
                    foreground: "oklch(0.556 0 0 / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "oklch(0.92 0.02 85 / <alpha-value>)",
                    foreground: "oklch(0.145 0 0 / <alpha-value>)",
                },
                popover: {
                    DEFAULT: "oklch(1 0 0 / <alpha-value>)",
                    foreground: "oklch(0.145 0 0 / <alpha-value>)",
                },
                card: {
                    DEFAULT: "oklch(1 0 0 / <alpha-value>)",
                    foreground: "oklch(0.145 0 0 / <alpha-value>)",
                },
            },
            borderRadius: {
                lg: "0.75rem",
                md: "calc(0.75rem - 2px)",
                sm: "calc(0.75rem - 4px)",
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
                    '50%': { transform: 'translateY(-10px) rotate(2deg)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)' },
                    '50%': { boxShadow: '0 0 30px rgba(250, 204, 21, 0.5)' },
                }
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "float": "float 6s ease-in-out infinite",
                "pulse-glow": "pulse-glow 3s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
}