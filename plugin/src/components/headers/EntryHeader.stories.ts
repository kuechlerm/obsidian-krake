import type { Meta, StoryObj } from '@storybook/svelte';
import EntryHeader from './EntryHeader.svelte';
import { paths } from '../../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../../stores/db';

const meta = {
    title: 'Headers/EntryHeader',
    component: EntryHeader,
    tags: [''],
    args: {
        open: async () => console.log('open'),
        move_file: async () => console.log('move_file'),
        write_metadata: async () => console.log('write_metadata'),
        delete_file: async () => console.log('delete_file'),
        suggest_parent: async () => {
            return { type: 0, name: 'TODO', file_path: 'TODO' };
        },
    },
} satisfies Meta<EntryHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

const create_task = (index: number) =>
    create_default_task({
        name: `Task${index}`,
        file_path: `${paths.task}/Task${index}.md`,
    });

const create_project = (index: number) =>
    create_default_project({
        name: `Project${index}`,
        file_path: `${paths.project}/Project${index}.md`,
    });

export const Empty_Task_Header: Story = {
    args: {
        path: `${paths.task}/Task1.md`,
    },
    play: async () => {
        const task = create_task(1);

        db.init({
            tasks: [task],
            projects: [],
            topics: [],
        });
    },
};

export const Empty_Project_Header: Story = {
    args: {
        path: `${paths.project}/Project1.md`,
    },
    play: async () => {
        const project = create_project(1);

        db.init({
            tasks: [],
            projects: [project],
            topics: [],
        });
    },
};

export const Empty_Topic_Header: Story = {
    args: {
        path: `${paths.topic}/Topic1.md`,
    },
    play: async () => {
        const topic = create_default_topic({
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
        });

        db.init({
            tasks: [],
            projects: [],
            topics: [topic],
        });
    },
};

export const Task_Header_with_one_parent: Story = {
    args: {
        path: `${paths.task}/Task1.md`,
    },
    play: async () => {
        const task = create_task(1);
        const project = create_project(1);

        db.init({
            tasks: [task],
            projects: [project],
            topics: [],
        });

        await db.add_parent(task, project);
    },
};

export const Project_Header_with_Tasks: Story = {
    args: {
        path: `${paths.project}/Project1.md`,
    },
    play: async () => {
        const task1 = create_task(1);
        const task2 = create_task(2);
        const task3 = create_task(3);

        const project = create_project(1);

        db.init({
            tasks: [task1, task2, task3],
            projects: [project],
            topics: [],
        });

        await db.add_parent(task1, project);
        await db.add_parent(task2, project);
        await db.add_parent(task3, project);
    },
};

export const Topic_Header_with_Projects_and_Tasks: Story = {
    args: {
        path: `${paths.topic}/Topic1.md`,
    },
    play: async () => {
        const task1 = create_task(1);
        const task2 = create_task(2);
        const task3 = create_task(3);

        const project1 = create_project(1);
        const project2 = create_project(2);

        const topic = create_default_topic({
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
        });

        db.init({
            tasks: [task1, task2, task3],
            projects: [project1, project2],
            topics: [topic],
        });

        await db.add_parent(task1, topic);
        await db.add_parent(task2, topic);
        await db.add_parent(task3, topic);
        await db.add_parent(project1, topic);
        await db.add_parent(project2, topic);
    },
};
