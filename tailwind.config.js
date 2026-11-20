/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html", "./src/**/*.js", "./build.js"],
    theme: {
        extend: {
            colors: {
                ink: '#111418',
                panel: '#1a1e23',
                bone: '#f2f0ea',
                muted: '#adb3b0',
                line: '#353b42',
                accent: '#67c7b1',
            },
            fontFamily: {
                mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
                sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
                display: ['"IBM Plex Sans"', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
