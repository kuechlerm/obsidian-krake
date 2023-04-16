import { paths } from '../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { add_parent_workflow } from './add_parent';

const write_metadata_mock = vi.fn().mockImplementation(async () => {
    /** noop */
});

describe('add_parent', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('add Project as parent to Task', async () => {
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

        const suggest_parent_mock = vi.fn().mockImplementation(async () => {
            return project;
        });

        await add_parent_workflow(
            task,
            project.type,
            suggest_parent_mock,
            write_metadata_mock
        );

        expect(task.parents.at(0)?.file_path).toBe(
            `${paths.project}/Project1.md`
        );

        expect(suggest_parent_mock).toHaveBeenCalled();
        expect(suggest_parent_mock).toHaveBeenCalledWith(1, [
            `${paths.topic}/Inbox.md`,
        ]);

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.project}/Project1.md`,
            { children: '0,Task1' }
        );
    });

    test('add Topic as parent to Task', async () => {
        const task = create_default_task({
            name: 'Task1',
            file_path: `${paths.task}/Task1.md`,
        });

        const topic = create_default_topic({
            name: 'Topic1',
            file_path: `${paths.topic}/Topic1.md`,
        });

        db.init({
            topics: [topic],
            projects: [],
            tasks: [task],
        });

        const suggest_parent_mock = vi.fn().mockImplementation(async () => {
            return topic;
        });

        await add_parent_workflow(
            task,
            topic.type,
            suggest_parent_mock,
            write_metadata_mock
        );

        expect(task.parents.at(0)?.file_path).toBe(`${paths.topic}/Topic1.md`);

        expect(suggest_parent_mock).toHaveBeenCalled();
        expect(suggest_parent_mock).toHaveBeenCalledWith(2, [
            `${paths.topic}/Inbox.md`,
        ]);

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.topic}/Topic1.md`,
            { children: '0,Task1' }
        );
    });

    test('add Topic as parent to Project', async () => {
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
            tasks: [],
        });

        const suggest_parent_mock = vi.fn().mockImplementation(async () => {
            return topic;
        });

        await add_parent_workflow(
            project,
            topic.type,
            suggest_parent_mock,
            write_metadata_mock
        );

        expect(project.parents.at(0)?.file_path).toBe(
            `${paths.topic}/Topic1.md`
        );

        expect(suggest_parent_mock).toHaveBeenCalled();
        expect(suggest_parent_mock).toHaveBeenCalledWith(2, [
            `${paths.topic}/Inbox.md`,
        ]);

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.topic}/Topic1.md`,
            { children: '1,Project1' }
        );
    });
});
