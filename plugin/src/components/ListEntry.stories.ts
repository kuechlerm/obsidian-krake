import type { Meta, StoryObj } from '@storybook/svelte';
import ListEntry from './ListEntry.svelte';
import { paths } from '../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';
import { get } from 'svelte/store';

const meta = {
    title: 'Components/ListEntry',
    component: ListEntry,
    tags: ['autodocs'],
    args: {
        open: () => console.log('open'),
        move_file: async () => console.log('move_file'),
        write_metadata: async () => console.log('write_metadata'),
    },
    play: async () => {
        const task = create_default_task({
            name: 'Task1',
            file_path: `${paths.task}/Task1.md`,
        });

        const project = create_default_project({
            name: 'Project1',
            file_path: `${paths.project}/Project1.md`,
        });

        const topic = create_default_topic({
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
        });

        db.init({
            tasks: [task],
            projects: [project],
            topics: [topic],
        });

        await db.add_parent(task, project);
        await db.add_parent(project, topic);
    },
} satisfies Meta<ListEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Task_List_Entry: Story = {
    args: {
        entry: get(db).tasks[0],
    },
};

export const Project_List_Entry: Story = {
    args: {
        entry: get(db).projects[0],
    },
};

export const Topic_List_Entry: Story = {
    args: {
        entry: get(db).topics[0],
    },
};
