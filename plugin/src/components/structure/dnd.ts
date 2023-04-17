import { paths } from '../../paths';
import type { Entry, Project, Task, Topic, Write_Metadata } from '../../types';
import { get, writable } from 'svelte/store';
import { remove_parent_workflow } from '../../workflows/remove_parent';
import { add_parent_workflow } from '../../workflows/add_parent';
import { get_collection } from '../../helper';
import { db } from '../../stores/db';

export const dragging_entry = writable<Entry | null>(null);

export const drag_start = (entry: Entry) => (e: Event) => {
    dragging_entry.set(entry);

    const element = e.target as HTMLElement;
    element.classList.add('dragging');
};

export const drop =
    (entry: Entry, dragging: Entry | null, write_metadata: Write_Metadata) =>
    async (e: Event) => {
        if (!dragging) return;
        dragging_entry.set(null);

        const element = e.target as HTMLElement;
        element.classList.remove('dragging');

        // TODO if entry has more than one parent, remove on the parent that the user is dragging from
        if (dragging.parents.length > 1) return;

        const parent = dragging.parents.at(0);
        if (parent) {
            const parent_entry = get_collection(get(db), parent.type).find(
                (t) => t.file_path === parent.file_path
            ) as Project | Topic | undefined;

            if (!parent_entry) throw new Error('Parent not found');

            remove_parent_workflow(
                dragging as Task | Project | Topic,
                parent_entry,
                write_metadata
            );
        }

        // TODO add without suggest_parent!
        const suggest = async () => entry;
        add_parent_workflow(dragging, entry.type, suggest, write_metadata);
    };

export const drag_over =
    (entry: Entry, dragging: Entry | null) => (e: Event) => {
        if (
            !entry.file_path.startsWith(paths.task) &&
            entry.file_path !== dragging?.file_path
        )
            e.preventDefault(); // um dnd zu erlauben
    };
