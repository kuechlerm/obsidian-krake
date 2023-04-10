import type { Preview } from '@storybook/svelte';

// css var scropes adapted
// TODO remove unnecessary css?
import './obsidian.css';
import '../src/styles.css';

const preview: Preview = {
    parameters: {
        actions: { argTypesRegex: '^on[A-Z].*' },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
    },
};

export default preview;
