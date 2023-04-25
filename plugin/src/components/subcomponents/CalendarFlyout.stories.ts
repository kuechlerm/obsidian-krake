import type { Meta, StoryObj } from '@storybook/svelte';
import CalendarFlyout from './CalendarFlyout.svelte';

const meta = {
    title: 'Components/CalendarFlyout',
    component: CalendarFlyout,
    args: {
        selectedDate: undefined,
        show: true,
        target_element: document.createElement('div'),
    },
    tags: [],
} satisfies Meta<CalendarFlyout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
