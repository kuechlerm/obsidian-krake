import type { Meta, StoryObj } from '@storybook/svelte';
import ParentPath from './ParentPath.svelte';

const meta = {
    title: 'Components/ParentPath',
    component: ParentPath,
    tags: ['autodocs'],
    args: {
        open: async () => console.log('open'),
        size: 'm',
    },
} satisfies Meta<ParentPath>;

export default meta;
type Story = StoryObj<typeof meta>;

export const No_Parent: Story = {
    args: {
        parents: [],
    },
};

export const One_Parent_S: Story = {
    args: {
        parents: [{ name: 'Parent', file_path: '', type: 2, parents: [] }],
        size: 's',
    },
};

export const One_Parent: Story = {
    args: {
        parents: [{ name: 'Parent', file_path: '', type: 2, parents: [] }],
    },
};

export const Two_Parents: Story = {
    args: {
        parents: [
            { name: 'Parent A', file_path: '', type: 2, parents: [] },
            { name: 'Parent B', file_path: '', type: 2, parents: [] },
        ],
    },
};

export const Parent_with_Grandparent: Story = {
    args: {
        parents: [
            {
                name: 'Project',
                file_path: '',
                type: 2,
                parents: [
                    {
                        name: 'Topic',
                        file_path: '',
                        type: 1,
                        parents: [],
                    },
                ],
            },
        ],
    },
};

export const Two_Parents_with_Grandparents: Story = {
    args: {
        parents: [
            {
                name: 'Project A',
                file_path: '',
                type: 1,
                parents: [
                    {
                        name: 'Topic A',
                        file_path: '',
                        type: 2,
                        parents: [],
                    },
                ],
            },
            {
                name: 'Project B',
                file_path: '',
                type: 1,
                parents: [
                    {
                        name: 'Topic B',
                        file_path: '',
                        type: 2,
                        parents: [],
                    },
                ],
            },
        ],
    },
};

export const Parent_with_two_Grandparent: Story = {
    args: {
        parents: [
            {
                name: 'Project',
                file_path: '',
                type: 2,
                parents: [
                    {
                        name: 'Topic A',
                        file_path: '',
                        type: 1,
                        parents: [],
                    },
                    {
                        name: 'Topic B',
                        file_path: '',
                        type: 1,
                        parents: [],
                    },
                ],
            },
        ],
    },
};
