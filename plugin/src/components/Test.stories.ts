import type { Meta, StoryObj } from '@storybook/svelte';
import Test from './Test.svelte';

const meta = {
    title: 'Components/Test',
    component: Test,
    tags: ['autodocs'],
} satisfies Meta<Test>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {},
};
