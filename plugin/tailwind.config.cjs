/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './src/**/*.{html,js,svelte,ts}',
        '../ui_components/src/lib/components/**/*.{html,js,svelte,ts}',
    ],

    safelist: [
        'border-slate-600',
        'bg-slate-600',
        'border-red-600',
        'bg-red-600',
        'border-sky-600',
        'bg-sky-600',
        'border-violet-600',
        'bg-violet-600',
    ],

    plugins: [require('@tailwindcss/forms')],
};

module.exports = config;
