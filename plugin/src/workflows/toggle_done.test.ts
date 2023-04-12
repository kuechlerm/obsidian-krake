import { paths } from 'src/paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { toggle_done_workflow } from './toggle_done';

describe('toggle_done', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('toggle Task done', async () => {
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

        const move_file_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await toggle_done_workflow(task, true, move_file_mock);

        expect(move_file_mock).toHaveBeenCalled();
        expect(move_file_mock).toHaveBeenCalledWith(
            `${paths.task}/Task1.md`,
            `${paths.task_archive}/Task1.md`
        );

        expect(task.file_path).toBe(`${paths.task_archive}/Task1.md`);
        // TODO test done date
        expect(task.done).toBeTruthy();

        expect(project.children.at(0)?.file_path).toBe(
            `${paths.task_archive}/Task1.md`
        );
    });

    test('toggle Task un-done', async () => {
        const task = create_default_task({
            name: 'Task1',
            file_path: `${paths.task_archive}/Task1.md`,
            done: new Date(),
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

        const move_file_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await toggle_done_workflow(task, false, move_file_mock);

        expect(move_file_mock).toHaveBeenCalled();
        expect(move_file_mock).toHaveBeenCalledWith(
            `${paths.task_archive}/Task1.md`,
            `${paths.task}/Task1.md`
        );

        expect(task.file_path).toBe(`${paths.task}/Task1.md`);
        // TODO test done date
        expect(task.done).toBeFalsy();

        expect(project.children.at(0)?.file_path).toBe(
            `${paths.task}/Task1.md`
        );
    });

    test('toggle Project done', async () => {
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

        const move_file_mock = vi.fn().mockImplementation(async () => {
            /** noop */
        });

        await toggle_done_workflow(project, true, move_file_mock);

        expect(move_file_mock).toHaveBeenCalled();
        expect(move_file_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`,
            `${paths.project_archive}/Project1.md`
        );

        expect(project.file_path).toBe(`${paths.project_archive}/Project1.md`);
        // TODO test done date
        expect(project.done).toBeTruthy();

        expect(task.parents.at(0)?.file_path).toBe(
            `${paths.project_archive}/Project1.md`
        );

        expect(topic.children.at(0)?.file_path).toBe(
            `${paths.project_archive}/Project1.md`
        );
    });
});
