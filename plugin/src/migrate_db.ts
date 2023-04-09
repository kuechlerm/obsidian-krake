import type { App, TFile } from 'obsidian';
import type { Child, Parent } from './types';

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
    const project_file = app.vault.getAbstractFileByPath(
        entry.file_path
    ) as TFile | null;
    if (!project_file) return;

    const project_content = await app.vault.read(project_file);

    const krake_block = project_content
        .match(/```krake\ntype:entry-header([\s\S]*?)\n```/)
        ?.first();

    if (!krake_block) return;

    const lines = krake_block.split('\n');
    const prop_lines = lines
        .slice(2, -1)
        .filter((line) => !line.startsWith('children:'));

    const map_child_name = (child: Child) =>
        child.file_path.split('/').last()?.split('.').first();

    prop_lines.push(
        'children:' +
            entry.children
                .map((child) => `${child.type},${map_child_name(child)}`)
                .join(';')
    );

    const krake_block_update = [
        '```krake',
        'type:entry-header',
        ...prop_lines,
        '```',
    ].join('\n');

    const [empty_line, after_krake_block] = project_content.split(krake_block);

    const project_update = [
        empty_line,
        krake_block_update,
        after_krake_block,
    ].join('');

    // console.log(project_update);

    await app.vault.modify(project_file, project_update);
}
