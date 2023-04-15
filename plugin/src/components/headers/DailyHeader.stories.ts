import type { Meta, StoryObj } from '@storybook/svelte';
import DailyHeader from './DailyHeader.svelte';
import { paths } from '../../paths';
import {
    create_default_project,
    create_default_task,
    db,
} from '../../stores/db';
import { add } from 'date-fns';

const meta = {
    title: 'Headers/DailyHeader',
    component: DailyHeader,
    tags: [''],
    args: {
        date: new Date(),
        open_next: async (d) => console.log('open ' + d),
        open: async () => console.log('open'),
        move_file: async () => console.log('move_file'),
        write_metadata: async () => console.log('write_metadata'),
    },

    loaders: [
        async () => {
            db.init({
                tasks: [
                    create_default_task({
                        name: 'Task1',
                        file_path: `${paths.task}/Task1.md`,
                        do_date: new Date(),
                    }),
                ],
                projects: [
                    create_default_project({
                        name: 'Project1',
                        file_path: `${paths.project}/Project1.md`,
                        due_date: add(new Date(), { days: 3 }),
                    }),
                ],
                topics: [],
            });
            return {};
        },
    ],
} satisfies Meta<DailyHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {},
};
