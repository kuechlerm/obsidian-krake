import type { Task, Project, Topic, Write_Metadata } from '../types';

/** writes changes of due_date and do_date to file */
export async function change_date_workflow(
    entry: Task | Project | Topic,
    write_metadata: Write_Metadata
) {
    const new_metadata: { [key: string]: string } = {};

    // TODO this way all dates are written regardless of whether they have changed or not

    if (entry.type === 0) {
        new_metadata['do_date'] = entry.do_date?.getTime().toString() ?? '';
    }

    if (entry.type !== 2) {
        new_metadata['due_date'] = entry.due_date?.getTime().toString() ?? '';
    }

    await write_metadata(entry.file_path, new_metadata);
}
