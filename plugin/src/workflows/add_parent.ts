import type { Child, Entry, EntryType, Parent } from '../types';
import { entry_type_to_folder_path, name_from_file_path } from '../helper';
import { db } from '../stores/db';

export async function add_parent_workflow(
    entry: Entry,
    parent_entry_type: EntryType,
    suggest_parent: (
        parent_entry_type: EntryType,
        exclude_file_paths: string[]
    ) => Promise<Omit<Parent, 'parents'>>,
    write_metadata: (
        file_path: string,
        metadata: { [key: string]: string }
    ) => Promise<void> // write_metadata(app)(file_path, metadata)
) {
    const folder_path = entry_type_to_folder_path(parent_entry_type);

    const parent_info = await suggest_parent(
        parent_entry_type,
        entry.parents.map((p) => p.file_path)
    );

    const new_parent = await db.add_parent(entry, parent_info);

    if (!new_parent) throw new Error('Parent not found');
    if (!('children' in new_parent)) throw new Error('Parent has no children');

    const children = (new_parent as { children: Child[] }).children
        .map((child) => `${child.type},${name_from_file_path(child.file_path)}`)
        .join(';');

    await write_metadata(new_parent.file_path, { children });
}
