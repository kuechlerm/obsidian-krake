import { paths } from '../paths';
import { create_default_task, db } from '../stores/db';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { change_date_workflow } from './change_date';

const write_metadata_mock = vi.fn().mockImplementation(async () => {
    /** noop */
});

describe('change_date', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('change date of Task', async () => {
        const task = create_default_task({
            name: 'Task1',
            file_path: `${paths.task}/Task1.md`,
            do_date: new Date('2021-09-10'),
        });

        await change_date_workflow(task, write_metadata_mock);

        expect(write_metadata_mock).toHaveBeenCalled();
        expect(write_metadata_mock).toHaveBeenCalledWith(
            `${paths.task}/Task1.md`,
            {
                due_date: '',
                do_date: task.do_date?.getTime().toString(),
            }
        );
    });
});
