import type { App, TFile } from 'obsidian';
import type { Child, Parent } from './types';
import { write_metadata } from './obsidian/obsidian_helpers';

type Entry_JSON = {
    parents: Parent[];

    name: string;
    file_path: string;
    done?: number;
    created: number;
    last_review: number;
};

type Task_JSON = Entry_JSON & {
    due_date?: number;
    do_date?: number;
};

type Project_JSON = Entry_JSON & {
    children: Child[];
    due_date?: number;
};

type Topic_JSON = Entry_JSON & {
    children: Child[];
};

type DB_JSON = {
    topics: Topic_JSON[];
    projects: Project_JSON[];
    tasks: Task_JSON[];
};

export const migrate_db = (app: App) => async () => {
    const db_file = app.vault.getAbstractFileByPath('db.json') as TFile | null;
    if (!db_file) return;

    console.log('++++++ RUN MIGRATION');

    const db_content = await app.vault.read(db_file);
    const db = JSON.parse(db_content) as DB_JSON;

    for (const task of db.tasks) {
        await migrate_done(app, task);
    }

    for (const project of db.projects) {
        await migrate_children(app, project);
        await migrate_done(app, project);
    }

    for (const topic of db.topics) {
        await migrate_children(app, topic);
    }

    alert('Migration done. Please restart Obsidian.');
};

async function migrate_done(app: App, entry: Task_JSON | Project_JSON) {
    if (!entry.done) return;

    await write_metadata(app)(entry.file_path, {
        done: entry.done.toString(),
    });
}

async function migrate_children(app: App, entry: Project_JSON | Topic_JSON) {
    if (!entry.children) {
        console.warn('entry without children', entry);
        return;
    }

    const map_child_name = (child: Child) =>
        child.file_path.split('/').last()?.split('.').first();

    await write_metadata(app)(entry.file_path, {
        children: entry.children
            .map((child) => `${child.type},${map_child_name(child)}`)
            .join(';'),
    });
}
