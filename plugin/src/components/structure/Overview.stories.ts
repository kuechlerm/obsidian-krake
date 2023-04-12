import type { Meta, StoryObj } from '@storybook/svelte';
import Overview from './Overview.svelte';
import { create_default_task, db } from '../../stores/db';
import { paths } from '../../paths';
import { create_default_topic } from '../../stores/db';
import { create_default_project } from '../../stores/db';

const meta = {
    title: 'Pages/Overview',
    component: Overview,
    args: {
        move_file: async () => {},
        open: async () => {},
    },
    tags: [],
} satisfies Meta<Overview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Leer: Story = {};

export const Some_Entries: Story = {
    play: () => {
        const topic = create_default_topic({
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
        });

        const project = create_default_project({
            name: 'Project1',
            file_path: `${paths.project}/Project1.md`,
        });

        const task = create_default_task({
            name: 'Task1',
            file_path: `${paths.task}/Task1.md`,
        });

        db.init({
            topics: [topic],
            projects: [project],
            tasks: [task],
        });

        db.add_parent(task, project);
        db.add_parent(project, topic);

        db.add_task(
            create_default_task({
                name: 'Task in Inbox',
                file_path: `${paths.task}/Task in Inbox.md`,
            })
        );
    },
};
