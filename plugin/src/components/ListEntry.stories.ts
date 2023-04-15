import type { Meta, StoryObj } from '@storybook/svelte';
import ListEntry from './ListEntry.svelte';
import { paths } from '../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';

// TODO use loaders to initialize db
// render: (args, { loaded }) => ({
//     Component: DailyHeader,
//     props: { ...args, ...loaded },
// }),

// loaders: [
//     async () => {
//         db.init({
//             tasks: [
//                 create_default_task({
//                     name: 'Task1',
//                     file_path: `${paths.task}/Task1.md`,
//                     do_date: new Date(),
//                 }),
//             ],
//             projects: [],
//             topics: [],
//         });
//         return { date: new Date() };
//     },
// ],

const task = create_default_task({
    name: 'Task1',
    file_path: `${paths.task}/Task1.md`,
});

const meta = {
    title: 'Components/ListEntry',
    component: ListEntry,
    tags: ['autodocs'],
    args: {
        open: async (file_path) => console.log('open', file_path),
        move_file: async () => console.log('move_file'),
        write_metadata: async () => console.log('write_metadata'),
        entry: task,
    },
    play: () => {
        db.init({
            tasks: [task],
            projects: [],
            topics: [],
        });
    },
} satisfies Meta<ListEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Task_List_Entry: Story = {
    args: {
        entry: create_default_task({
            name: 'Task1',
            file_path: `${paths.task}/Task1.md`,
        }),
    },
};

export const Project_List_Entry: Story = {
    args: {
        entry: create_default_project({
            name: 'Project1',
            file_path: `${paths.project}/Project1.md`,
        }),
    },
};

export const Topic_List_Entry: Story = {
    args: {
        entry: create_default_topic({
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
        }),
    },
};
