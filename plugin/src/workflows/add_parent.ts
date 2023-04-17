import type { Child, Entry, EntryType, Parent, Write_Metadata } from '../types';
import { name_from_file_path } from '../helper';
import { db } from '../stores/db';
import { paths } from '../paths';

export async function add_parent_workflow(
    entry: Entry,
    parent_entry_type: EntryType,
    suggest_parent: (
        parent_entry_type: EntryType,
        exclude_file_paths: string[]
    ) => Promise<Omit<Parent, 'parents'>>,
    write_metadata: Write_Metadata
) {
    const parent_info = await suggest_parent(parent_entry_type, [
        ...new Set([
            `${paths.topic}/Inbox.md`,
            ...entry.parents.map((p) => p.file_path),
        ]),
    ]);

    const new_parent = db.add_parent(entry, parent_info);

    if (!new_parent) throw new Error('Parent not found');
    if (!('children' in new_parent)) throw new Error('Parent has no children');

    const children = (new_parent as { children: Child[] }).children
        .map((child) => `${child.type},${name_from_file_path(child.file_path)}`)
        .join(';');

    await write_metadata(new_parent.file_path, { children });
}
