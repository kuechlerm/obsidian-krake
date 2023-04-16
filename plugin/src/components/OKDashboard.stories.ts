import type { Meta, StoryObj } from '@storybook/svelte';
import OKDashboard from './OKDashboard.svelte';

const meta = {
    title: 'Pages/OKDashboard',
    component: OKDashboard,
    tags: [],
    args: {
        open: async (file_path) => console.log('open', file_path),
        move_file: async () => console.log('move_file'),
        write_metadata: async () => console.log('write_metadata'),
        init_db: async () => console.log('init_db'),
        migrate_db: async () => console.log('migrate_db'),
    },
} satisfies Meta<OKDashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Task_List_Entry: Story = {
    args: {},
};
