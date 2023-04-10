import path from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';
import builtins from 'builtin-modules';

export default defineConfig((env) => {
    const prod = env.mode === 'production';
    return {
        plugins: [
            svelte({
                preprocess: autoPreprocess({ postcss: true }),
            }),
        ],

        watch: !prod,

        define: {
            __version__: JSON.stringify(process.env.npm_package_version),
        },

        test: {
            include: ['**/*.test.ts'],
            globals: false,
            // environment: 'jsdom',
            // setupFiles: ['./vitestSetup.ts'],
            deps: { external: ['**/node_modules/**', '**/dist/**'] },
        },

        build: {
            sourcemap: prod ? false : 'inline',
            minify: prod,
            // Use Vite lib mode https://vitejs.dev/guide/build.html#library-mode
            commonjsOptions: {
                ignoreTryCatch: false,
            },
            lib: {
                entry: path.resolve(__dirname, './src/main.ts'),
                formats: ['cjs'],
            },
            css: {},
            rollupOptions: {
                output: {
                    // Overwrite default Vite output fileName
                    entryFileNames: 'main.js',
                    assetFileNames: 'styles.css',
                },
                external: [
                    'obsidian',
                    'electron',
                    'codemirror',
                    '@codemirror/autocomplete',
                    '@codemirror/closebrackets',
                    '@codemirror/collab',
                    '@codemirror/commands',
                    '@codemirror/comment',
                    '@codemirror/fold',
                    '@codemirror/gutter',
                    '@codemirror/highlight',
                    '@codemirror/history',
                    '@codemirror/language',
                    '@codemirror/lint',
                    '@codemirror/matchbrackets',
                    '@codemirror/panel',
                    '@codemirror/rangeset',
                    '@codemirror/rectangular-selection',
                    '@codemirror/search',
                    '@codemirror/state',
                    '@codemirror/stream-parser',
                    '@codemirror/text',
                    '@codemirror/tooltip',
                    '@codemirror/view',
                    '@lezer/common',
                    '@lezer/lr',
                    '@lezer/highlight',
                    ...builtins,
                ],
            },
            // Use parent as the output dir
            emptyOutDir: false,
            outDir: '..',
        },
    };
});
