import { db } from '../stores/db';
import type { Entry } from '../types';

export async function toggle_done_workflow(
    entry: Entry,
    done: boolean,
    move_file: (from_path: string, to_path: string) => Promise<void>
) {
    const old_path = entry.file_path;
    const new_entry = db.toggle_done(entry, done);
    console.log('new_entry', new_entry);

    if (!new_entry) throw new Error('Could not toggle done');

    await move_file(old_path, new_entry.file_path);

    return new_entry;
}
