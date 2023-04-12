import { describe, test, expect, vi, afterEach } from 'vitest';

import { delete_entry_workflow } from './delete_entry';
import { paths } from '../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';
import { get } from 'svelte/store';

const delete_file_mock = vi.fn().mockImplementation(async () => {
    /** noop */
});

const write_metadata_mock = vi.fn().mockImplementation(async () => {
    /** noop */
});

describe('delete_entry', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('delete Task', async () => {
        const task = create_default_task({
            name: 'Task1',
            file_path: `${paths.task}/Task1.md`,
        });

        const project = create_default_project({
            name: 'Project1',
            file_path: `${paths.project}/Project1.md`,
        });

        db.init({
            topics: [],
            projects: [project],
            tasks: [task],
        });

        db.add_parent(task, project);

        await delete_entry_workflow(
            task,
            delete_file_mock,
            write_metadata_mock
        );

        expect(delete_file_mock).toHaveBeenCalled();
        expect(delete_file_mock).toHaveBeenCalledWith(`${paths.task}/Task1.md`);

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`,
            { children: '' }
        );

        expect(get(db).tasks).toHaveLength(0);
        expect(project.children).toHaveLength(0);
    });

    test('delete Project', async () => {
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
            topics: [topic],
            projects: [project],
            tasks: [task],
        });

        db.add_parent(task, project);
        db.add_parent(project, topic);

        const delete_file_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await delete_entry_workflow(
            project,
            delete_file_mock,
            write_metadata_mock
        );

        expect(delete_file_mock).toHaveBeenCalled();
        expect(delete_file_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`
        );

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.topic}/Topic1.md`,
            { children: '' }
        );

        expect(get(db).projects).toHaveLength(0);
        expect(topic.children).toHaveLength(0);

        // puts task in Inbox
        expect(task.parents.at(0)?.file_path).toBe(`${paths.topic}/Inbox.md`);
    });

    test.skip('delete Topic');
});
