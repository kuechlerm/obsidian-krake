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

export async function migrate_db(app: App, skip = true) {
    if (skip) return;

    const db_file = app.vault.getAbstractFileByPath('db.json') as TFile | null;
    if (!db_file) return;

    console.log('++++++ RUN MIGRATION');

    const db_content = await app.vault.read(db_file);
    const db = JSON.parse(db_content) as DB_JSON;

    for (const project of db.projects) {
        await migrate_entry(app, project);
    }

    for (const topic of db.topics) {
        await migrate_entry(app, topic);
    }

    // TODO set migration flag
}

async function migrate_entry(app: App, entry: Project_JSON | Topic_JSON) {
    const map_child_name = (child: Child) =>
        child.file_path.split('/').last()?.split('.').first();

    await write_metadata(app)(entry.file_path, {
        children: entry.children
            .map((child) => `${child.type},${map_child_name(child)}`)
            .join(';'),
    });
}
