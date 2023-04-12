import type { Meta, StoryObj } from '@storybook/svelte';
import EntryHeader from './EntryHeader.svelte';
import { paths } from '../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';

const meta = {
    title: 'Components/EntryHeader',
    component: EntryHeader,
    tags: ['autodocs'],
} satisfies Meta<EntryHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Task_Header: Story = {
    args: {
        path: `${paths.task}/Test1.md`,
        open: () => console.log('open'),
        suggest_parent: async () => {
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

export const Project_Header: Story = {
    args: {
        path: `${paths.project}/Test1.md`,
        open: () => console.log('open'),
        suggest_parent: async () => {
            return { type: 0, name: 'TODO', file_path: 'TODO' };
        },
        move_file: async () => console.log('move_file'),
        delete_file: async () => console.log('delete_file'),
        write_metadata: async () => console.log('write_metadata'),
    },
    play: () => {
        db.init({
            tasks: [],
            projects: [
                create_default_project({
                    name: 'Test1',
                    file_path: `${paths.project}/Test1.md`,
                }),
            ],
            topics: [],
        });
    },
};

export const Topic_Header: Story = {
    args: {
        path: `${paths.topic}/Test1.md`,
        open: () => console.log('open'),
        suggest_parent: async () => {
            return { type: 0, name: 'TODO', file_path: 'TODO' };
        },

        move_file: async () => console.log('move_file'),
        delete_file: async () => console.log('delete_file'),
        write_metadata: async () => console.log('write_metadata'),
    },
    play: () => {
        db.init({
            tasks: [],
            projects: [],
            topics: [
                create_default_topic({
                    name: 'Test1',
                    file_path: `${paths.topic}/Test1.md`,
                }),
            ],
        });
    },
};
