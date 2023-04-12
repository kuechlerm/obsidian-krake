import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { create_entry_workflow } from './create_entry';
import { paths } from '../paths';
import { get } from 'svelte/store';
import { create_default_project, create_default_topic, db } from '../stores/db';
import type { TFile } from 'obsidian';
import { entry_header_file_content } from '../utils/file_content_inits';

const create_file_mock = vi.fn().mockImplementation(async () => ({} as TFile));

const write_metadata_mock = vi.fn().mockImplementation(async () => {
    /** noop */
});

const create_mock_actions = (editor_line: string) => ({
    create_folder: async () => {
        /** noop */
    },
    create_file: create_file_mock,
    normalize_path: (path: string) => path,
    get_editor_line: () => editor_line,
    set_editor_line: () => {
        /** noop */
    },
    write_metadata: write_metadata_mock,
    open_file: async () => {
        /** noop */
    },
});

const create_base_props_result = () => ({
    created: new Date('2021-01-01'),
    last_review: new Date('2021-01-01'),
    done: undefined,
    do_date: undefined,
    due_date: undefined,
});

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

    test('create Task in non Entry file', async () => {
        db.init({
            projects: [],
            tasks: [],
            topics: [],
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'task',
            current_file_basename: 'A non Entry file',
            current_file_path: 'A non Entry file.md',
            ...create_mock_actions('Test Task'),
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
            ...create_base_props_result(),
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.task}/Test Task.md`,
            entry_header_file_content('task')
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
    });

    test('create Project in non Entry file', async () => {
        db.init({
            projects: [],
            tasks: [],
            topics: [],
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'project',
            current_file_basename: 'A non Entry file',
            current_file_path: 'A non Entry file.md',
            ...create_mock_actions('Test Project'),
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
            ...create_base_props_result(),
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.project}/Test Project.md`,
            entry_header_file_content('project')
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
    });

    test('create Topic in non Entry file', async () => {
        db.init({
            projects: [],
            tasks: [],
            topics: [],
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'topic',
            current_file_basename: 'A non Entry file',
            current_file_path: 'A non Entry file.md',
            ...create_mock_actions('Test Topic'),
        });

        const current_db = get(db);

        // current_db.topics.at(0) -> Inbox
        expect(current_db.topics.at(1)).toEqual({
            type: 2,
            name: 'Test Topic',
            file_path: `${paths.topic}/Test Topic.md`,
            parents: [],
            children: [],
            ...create_base_props_result(),
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.topic}/Test Topic.md`,
            entry_header_file_content('topic')
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
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

        await create_entry_workflow({
            line_no: 0,
            type: 'task',
            current_file_basename: 'Project1',
            current_file_path: `${paths.project}/Project1.md`,
            ...create_mock_actions('Test Task'),
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
            ...create_base_props_result(),
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
            ...create_base_props_result(),
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.task}/Test Task.md`,
            entry_header_file_content('task')
        );

        expect(write_metadata_mock).toHaveBeenCalledOnce();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`,
            { children: '0,Test Task' }
        );
    });

    test('create Task in Topic file', async () => {
        db.init({
            topics: [
                create_default_topic({
                    name: 'Topic1',
                    file_path: `${paths.topic}/Topic1.md`,
                }),
            ],
            tasks: [],
            projects: [],
        });

        await create_entry_workflow({
            line_no: 0,
            type: 'task',
            current_file_basename: 'Topic1',
            current_file_path: `${paths.topic}/Topic1.md`,
            ...create_mock_actions('Test Task'),
        });

        const current_db = get(db);

        expect(current_db.tasks.at(0)).toEqual({
            type: 0,
            name: 'Test Task',
            file_path: `${paths.task}/Test Task.md`,
            parents: [
                {
                    file_path: `${paths.topic}/Topic1.md`,
                    name: 'Topic1',
                    parents: [],
                    type: 2,
                },
            ],
            ...create_base_props_result(),
        });

        // topics.at(0) = Inbox
        expect(current_db.topics.find((t) => t.name !== 'Inbox')).toEqual({
            type: 2,
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
            parents: [],
            children: [
                {
                    type: 0,
                    file_path: `${paths.task}/Test Task.md`,
                },
            ],
            ...create_base_props_result(),
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.task}/Test Task.md`,
            entry_header_file_content('task')
        );

        expect(write_metadata_mock).toHaveBeenCalledOnce();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.topic}/Topic1.md`,
            { children: '0,Test Task' }
        );
    });

    test('create Project in Topic file', async () => {
        db.init({
            topics: [
                create_default_topic({
                    name: 'Topic1',
                    file_path: `${paths.topic}/Topic1.md`,
                }),
            ],
            tasks: [],
            projects: [],
        });

        await create_entry_workflow({
            line_no: 1,
            type: 'project',
            current_file_basename: 'Topic1',
            current_file_path: `${paths.topic}/Topic1.md`,
            ...create_mock_actions('Test Project'),
        });

        const current_db = get(db);

        expect(current_db.projects.at(0)).toEqual({
            type: 1,
            name: 'Test Project',
            file_path: `${paths.project}/Test Project.md`,
            parents: [
                {
                    file_path: `${paths.topic}/Topic1.md`,
                    name: 'Topic1',
                    parents: [],
                    type: 2,
                },
            ],
            children: [],
            ...create_base_props_result(),
        });

        // topics.at(0) = Inbox
        expect(current_db.topics.find((t) => t.name !== 'Inbox')).toEqual({
            type: 2,
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
            parents: [],
            children: [
                {
                    type: 1,
                    file_path: `${paths.project}/Test Project.md`,
                },
            ],
            ...create_base_props_result(),
        });

        expect(create_file_mock).toHaveBeenCalledOnce();

        expect(create_file_mock).toHaveBeenCalledWith(
            `${paths.project}/Test Project.md`,
            entry_header_file_content('project')
        );

        expect(write_metadata_mock).toHaveBeenCalledOnce();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.topic}/Topic1.md`,
            { children: '1,Test Project' }
        );
    });
});
