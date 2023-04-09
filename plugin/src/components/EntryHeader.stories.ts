import type { Meta, StoryObj } from '@storybook/svelte';
import EntryHeader from './EntryHeader.svelte';
import { paths } from '../paths';
import { create_default_task, db } from '../stores/db';

const meta = {
    title: 'Components/EntryHeader',
    component: EntryHeader,
    tags: ['autodocs'],
} satisfies Meta<EntryHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Task: Story = {
    args: {
        path: `${paths.task}/Test1.md`,
        open: () => console.log('open'),
        suggest_project: async () => {
            return { type: 0, name: 'TODO', file_path: 'TODO' };
        },
        suggest_topic: async () => {
            return { type: 0, name: 'TODO', file_path: 'TODO' };
        },
        move_file: async () => console.log('move_file'),
        delete_file: async () => console.log('delete_file'),
        write_metadata: async () => console.log('write_metadata'),
    },
    play: () => {
        db.init({
            tasks: [
                create_default_task({
                    name: 'Test1',
                    file_path: `${paths.task}/Test1.md`,
                }),
            ],
            projects: [],
            topics: [],
        });
    },
};
