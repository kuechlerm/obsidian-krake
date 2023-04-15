import type { Meta, StoryObj } from '@storybook/svelte';
import OverviewEntry from './OverviewEntry.svelte';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
} from '../../stores/db';

const meta = {
    title: 'Components/OverviewEntry',
    component: OverviewEntry,
    args: {
        entry: create_default_topic({
            name: 'Topic1',
            file_path: 'topics/Topic1.md',
        }),
        open: async () => console.log('open'),
        move_file: async () => console.log('move_file'),
        write_metadata: async () => console.log('write_metadata'),
        selected: false,
    },
    tags: [],
} satisfies Meta<OverviewEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Topic: Story = {};
export const Topic_Selected: Story = {
    args: {
        selected: true,
    },
};

export const Project: Story = {
    args: {
        entry: create_default_project({
            name: 'Project1',
            file_path: 'projects/Project1.md',
        }),
    },
};
export const Project_Selected: Story = {
    args: {
        ...Project.args,
        selected: true,
    },
};

export const Task: Story = {
    args: {
        entry: create_default_task({
            name: 'Task1',
            file_path: 'tasks/Task1.md',
        }),
    },
};
export const Task_Selected: Story = {
    args: {
        ...Task.args,
        selected: true,
    },
};
