import { get } from 'svelte/store';
import { get_collection, name_from_file_path } from './helper';
import { db } from './stores/db';
import type { Child } from './types';

export async function change_path(
    old_path: string,
    new_path: string,
    new_basename: string,
    write_metadata: (
        file_path: string,
        metadata: { [key: string]: string }
    ) => Promise<void> // write_metadata(app)(file_path, metadata)
) {
    const updated_entry = db.change_path(old_path, new_path, new_basename);

    if (!updated_entry) throw new Error('Entry not found');

    for (const parent of updated_entry.parents) {
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
}
