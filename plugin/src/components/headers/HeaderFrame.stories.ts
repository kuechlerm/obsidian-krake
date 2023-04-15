import type { Meta, StoryObj } from '@storybook/svelte';
import HeaderFrame from './HeaderFrame.svelte';

const meta = {
    title: 'Headers/HeaderFrame',
    component: HeaderFrame,
    tags: [''],
    args: {},
} satisfies Meta<HeaderFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty_Header_Frame: Story = {};
