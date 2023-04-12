import { db } from '../../stores/db';
import { paths } from '../../paths';
import type { Entry } from '../../types';
import { writable } from 'svelte/store';

export const dragging_entry = writable<Entry | null>(null);

export const drag_start = (entry: Entry) => (e: Event) => {
    dragging_entry.set(entry);

    const element = e.target as HTMLElement;
    element.classList.add('dragging');
};

export const drop =
    (entry: Entry, dragging: Entry | null) => async (e: Event) => {
        if (!dragging) return;
        dragging_entry.set(null);

        const element = e.target as HTMLElement;
        element.classList.remove('dragging');

        // TODO if entry has more than one parent, remove on the parent that the user is dragging from
        if (dragging.parents.length > 1) return;
        console.log('PING', { dragging, entry });

        const parent = dragging.parents.at(0);
        if (parent) await db.remove_parent(dragging, parent);

        await db.add_parent(dragging, entry);
    };

export const drag_over =
    (entry: Entry, dragging: Entry | null) => (e: Event) => {
        if (
            !entry.file_path.startsWith(paths.task) &&
            entry.file_path !== dragging?.file_path
        )
            e.preventDefault(); // um dnd zu erlauben
    };
