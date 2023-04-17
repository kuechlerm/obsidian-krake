import { name_from_file_path } from '../helper';
import { db } from '../stores/db';
import type { Project, Task, Topic, Write_Metadata } from '../types';

export async function remove_parent_workflow(
    entry: Task | Project | Topic,
    parent: Project | Topic,
    write_metadata: Write_Metadata
) {
    db.remove_parent(entry, parent);

    const children = parent.children
        .map((child) => `${child.type},${name_from_file_path(child.file_path)}`)
        .join(';');

    write_metadata(parent.file_path, {
        children,
    });
}
