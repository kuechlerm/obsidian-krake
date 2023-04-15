import { db } from '../stores/db';
import type { Entry, Move_File, Write_Metadata } from '../types';

export async function toggle_done_workflow(
    entry: Entry,
    done: boolean,
    move_file: Move_File,
    write_metadata: Write_Metadata
) {
    const old_path = entry.file_path;
    const new_entry = db.toggle_done(entry, done);

    if (!new_entry) throw new Error('Could not toggle done');

    await move_file(old_path, new_entry.file_path);

    await write_metadata(new_entry.file_path, {
        done: new_entry.done?.getTime().toString() ?? '',
    });

    return new_entry;
}
