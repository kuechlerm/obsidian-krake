import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { create_entry_workflow } from './create_entry';
import { paths } from './paths';
import { get } from 'svelte/store';
import { create_default_project, db } from './stores/db';
import type { TFile } from 'obsidian';

describe('create_entry', () => {
    beforeEach(() => {
        // tell vitest we use mocked time
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2021-01-01'));
    });

    afterEach(() => {
        // restoring date after each test run
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test('create Task in Project file', async () => {
        db.init({
            projects: [
                create_default_project({
                    name: 'Project1',
                    file_path: `${paths.project}/Project1.md`,
                }),
            ],
            tasks: [],
            topics: [],
        });

        const create_file_mock = vi
            .fn()
            .mockImplementation(async () => ({} as TFile));

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'task',
            current_file_basename: 'Project1',
            current_file_path: `${paths.project}/Project1.md`,
            create_folder: async () => {
                /** noop */
            },
            create_file: create_file_mock,
            normalize_path: (path) => path,
            get_editor_line: () => 'Test Task',
            set_editor_line: () => {
                /** noop */
            },
            write_metadata: write_metadata_mock,
            open_file: async () => {
                /** noop */
            },
        });

        const current_db = get(db);

        expect(current_db.tasks.at(0)).toEqual({
            type: 0,
            name: 'Test Task',
            file_path: `${paths.task}/Test Task.md`,
            parents: [
                {
                    file_path: 'Krake/Projects/Project1.md',
                    name: 'Project1',
                    parents: [],
                    type: 1,
                },
            ],
            created: new Date('2021-01-01'),
            last_review: new Date('2021-01-01'),
            done: undefined,
            do_date: undefined,
            due_date: undefined,
        });

        expect(current_db.projects.at(0)).toEqual({
            type: 1,
            name: 'Project1',
            file_path: `${paths.project}/Project1.md`,
            parents: [],
            children: [
                {
                    type: 0,
                    file_path: `${paths.task}/Test Task.md`,
                },
            ],
            created: new Date('2021-01-01'),
            last_review: new Date('2021-01-01'),
            done: undefined,
            do_date: undefined,
            due_date: undefined,
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        const file_content = `
\`\`\`krake
type:entry-header
\`\`\`

`;
        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.task}/Test Task.md`,
            file_content
        );

        expect(write_metadata_mock).toHaveBeenCalledOnce();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`,
            { children: '0,Test Task' }
        );
    });

    test('create Task in non Entry file', async () => {
        db.init({
            projects: [],
            tasks: [],
            topics: [],
        });

        const create_file_mock = vi
            .fn()
            .mockImplementation(async () => ({} as TFile));

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'task',
            current_file_basename: 'A non Entry file',
            current_file_path: 'A non Entry file.md',
            create_folder: async () => {
                /** noop */
            },
            create_file: create_file_mock,
            normalize_path: (path) => path,
            get_editor_line: () => 'Test Task',
            set_editor_line: () => {
                /** noop */
            },
            write_metadata: write_metadata_mock,
            open_file: async () => {
                /** noop */
            },
        });

        const current_db = get(db);

        expect(current_db.tasks.at(0)).toEqual({
            type: 0,
            name: 'Test Task',
            file_path: `${paths.task}/Test Task.md`,
            parents: [
                {
                    file_path: 'Krake/Topics/Inbox.md',
                    name: 'Inbox',
                    parents: [],
                    type: 2,
                },
            ],
            created: new Date('2021-01-01'),
            last_review: new Date('2021-01-01'),
            done: undefined,
            do_date: undefined,
            due_date: undefined,
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        const file_content = [
            '',
            '```krake',
            'type:entry-header',
            '```',
            '',
            '',
        ].join('\n');
        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.task}/Test Task.md`,
            file_content
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
    });

    test('create Project in non Entry file', async () => {
        db.init({
            projects: [],
            tasks: [],
            topics: [],
        });

        const create_file_mock = vi
            .fn()
            .mockImplementation(async () => ({} as TFile));

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'project',
            current_file_basename: 'A non Entry file',
            current_file_path: 'A non Entry file.md',
            create_folder: async () => {
                /** noop */
            },
            create_file: create_file_mock,
            normalize_path: (path) => path,
            get_editor_line: () => 'Test Project',
            set_editor_line: () => {
                /** noop */
            },
            write_metadata: write_metadata_mock,
            open_file: async () => {
                /** noop */
            },
        });

        const current_db = get(db);

        expect(current_db.projects.at(0)).toEqual({
            type: 1,
            name: 'Test Project',
            file_path: `${paths.project}/Test Project.md`,
            parents: [
                {
                    file_path: 'Krake/Topics/Inbox.md',
                    name: 'Inbox',
                    parents: [],
                    type: 2,
                },
            ],
            children: [],
            created: new Date('2021-01-01'),
            last_review: new Date('2021-01-01'),
            done: undefined,
            due_date: undefined,
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        const file_content = [
            '',
            '```krake',
            'type:entry-header',
            '```',
            '',
            '#### Tasks',
            '```krake',
            'type:tasks',
            'children:true',
            '```',
            '',
            '',
        ].join('\n');

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.project}/Test Project.md`,
            file_content
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
    });

    test('create Topic in non Entry file', async () => {
        db.init({
            projects: [],
            tasks: [],
            topics: [],
        });

        const create_file_mock = vi
            .fn()
            .mockImplementation(async () => ({} as TFile));

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'topic',
            current_file_basename: 'A non Entry file',
            current_file_path: 'A non Entry file.md',
            create_folder: async () => {
                /** noop */
            },
            create_file: create_file_mock,
            normalize_path: (path) => path,
            get_editor_line: () => 'Test Topic',
            set_editor_line: () => {
                /** noop */
            },
            write_metadata: write_metadata_mock,
            open_file: async () => {
                /** noop */
            },
        });

        const current_db = get(db);

        // current_db.topics.at(0) -> Inbox
        expect(current_db.topics.at(1)).toEqual({
            type: 2,
            name: 'Test Topic',
            file_path: `${paths.topic}/Test Topic.md`,
            parents: [],
            children: [],
            created: new Date('2021-01-01'),
            last_review: new Date('2021-01-01'),
            due_date: undefined,
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        const file_content = [
            '',
            '```krake',
            'type:entry-header',
            '```',
            '',
            '#### Topics',
            '```krake',
            'type:topics',
            'children:true',
            '```',
            '',
            '#### Projects',
            '```krake',
            'type:projects',
            'children:true',
            '```',
            '',
            '#### Tasks',
            '```krake',
            'type:tasks',
            'children:true',
            '```',
            '',
            '',
        ].join('\n');

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.topic}/Test Topic.md`,
            file_content
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
    });
});
