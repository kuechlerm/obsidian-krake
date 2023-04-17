import type { Meta, StoryObj } from '@storybook/svelte';
import Checkbox from './Checkbox.svelte';

const meta = {
    title: 'Components/Checkbox',
    component: Checkbox,
    tags: [''],
    args: {
        checked: false,
    },
} satisfies Meta<Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};

export const With_label: Story = {
    args: {
        label: 'Click me',
    },
};
