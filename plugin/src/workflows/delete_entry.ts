import { get } from 'svelte/store';
import { get_collection, name_from_file_path } from '../helper';
import { db } from '../stores/db';
import type { Child, Entry } from '../types';

export async function delete_entry_workflow(
    entry: Entry,
    delete_file: (file_path: string) => Promise<void>,
    write_metadata: (
        file_path: string,
        metadata: { [key: string]: string }
    ) => Promise<void> // write_metadata(app)(file_path, metadata)
) {
    // remember parents before deleting entry
    const entry_parents = entry.parents;

    await db.remove_entry(entry);

    // TODO extract, is the same as in change_path
    for (const parent of entry_parents) {
        const parent_entry = get_collection(get(db), parent.type).find(
            (x) => x.file_path === parent.file_path
        );

        if (!parent_entry) throw new Error('Parent not found');

        if (!('children' in parent_entry))
            throw new Error('Parent has no children');

        const children = (parent_entry as { children: Child[] }).children
            .map(
                (child) =>
                    `${child.type},${name_from_file_path(child.file_path)}`
            )
            .join(';');

        await write_metadata(parent.file_path, { children });
    }

    await delete_file(entry.file_path);
}
