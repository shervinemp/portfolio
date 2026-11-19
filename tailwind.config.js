/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./*.html", "./src/**/*.js", "./build.js"],
    theme: {
        extend: {
            colors: {
                ink: '#121417',
                panel: '#171a1e',
                bone: '#e4e4df',
                muted: '#9aa09e',
                line: '#2a2e31',
                accent: '#8fb8a8',
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
