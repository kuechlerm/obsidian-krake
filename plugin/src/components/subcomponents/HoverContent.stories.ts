import type { Meta, StoryObj } from '@storybook/svelte';
import HoverContent from './HoverContent.example.svelte';

const meta = {
    title: 'Components/HoverContent',
    component: HoverContent,
    tags: [''],
    args: {},
} satisfies Meta<HoverContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};
