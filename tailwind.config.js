/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                navy: {
                    900: '#001529', // Main Sidebar
                    800: '#002140', // Secondary
                },
                orange: {
                    500: '#FF6B00', // Vibrant Orange
                },
                gray: {
                    100: '#f0f2f5', // Background
                }
            },
        },
    },
    plugins: [],
}
