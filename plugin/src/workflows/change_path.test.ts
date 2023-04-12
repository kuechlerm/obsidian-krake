import { describe, test, expect, vi, afterEach } from 'vitest';

import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';
import { change_path } from './change_path';
import { paths } from '../paths';

describe('change_path', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('change task name', async () => {
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

        db.add_parent(task, {
            type: 1,
            name: 'Project1',
            file_path: `${paths.project}/Project1.md`,
        });

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await change_path(
            `${paths.task}/Task1.md`,
            `${paths.task}/Task1 NEW.md`,
            'Task1 NEW',
            write_metadata_mock
        );

        expect(task.file_path).toBe(`${paths.task}/Task1 NEW.md`);
        expect(project.children.at(0)?.file_path).toBe(
            `${paths.task}/Task1 NEW.md`
        );

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`,
            { children: '0,Task1 NEW' }
        );
    });

    test('change project name', async () => {
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

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await change_path(
            `${paths.project}/Project1.md`,
            `${paths.project}/Project1 NEW.md`,
            'Project1 NEW',
            write_metadata_mock
        );

        expect(project.file_path).toBe(`${paths.project}/Project1 NEW.md`);
        expect(task.parents.at(0)?.file_path).toBe(
            `${paths.project}/Project1 NEW.md`
        );
        expect(topic.children.at(0)?.file_path).toBe(
            `${paths.project}/Project1 NEW.md`
        );

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.topic}/Topic1.md`,
            { children: '1,Project1 NEW' }
        );
    });

    test('change topic name', async () => {
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

        const write_metadata_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await change_path(
            `${paths.topic}/Topic1.md`,
            `${paths.topic}/Topic1 NEW.md`,
            'Topic1 NEW',
            write_metadata_mock
        );

        expect(project.parents.at(0)?.file_path).toBe(
            `${paths.topic}/Topic1 NEW.md`
        );

        expect(task.parents.at(0)?.parents.at(0)?.file_path).toBe(
            `${paths.topic}/Topic1 NEW.md`
        );

        expect(write_metadata_mock).not.toHaveBeenCalled();
    });
});
