import type { TFolder, TFile, App } from 'obsidian';
import { paths } from '../paths';
import {
    db,
    create_default_topic,
    create_default_project,
    create_default_task,
} from '../stores/db';
import type { Task, Topic, Project, DB, Entry } from '../types';

export const init_db = (app: App) => async () => {
    const topics = await get_entries<Topic>(paths.topic);

    const projects = await get_entries<Project>(paths.project);
    const done_projects = await get_entries<Project>(paths.project_archive);

    const tasks = await get_entries<Task>(paths.task);
    const done_tasks = await get_entries<Task>(paths.task_archive);

    const init_db: DB = {
        topics,
        projects: [...projects, ...done_projects],
        tasks: [...tasks, ...done_tasks],
    };

    db.init(init_db);
};

async function get_entries<T extends Entry>(path: string): Promise<T[]> {
    const entries_folder = app.vault.getAbstractFileByPath(path) as TFolder;

    if (!entries_folder) return [];

    const entries: T[] = [];

    // TODO better without forof?
    for (const file of entries_folder.children as TFile[]) {
        try {
            const content = await app.vault.cachedRead(file);

            // TODO match ist nicht richtig
            const krake_block = content
                .match(/```krake\ntype:entry-header([\s\S]*?)\n```/)
                ?.first();

            if (!krake_block) {
                continue;
            }

            const lines = krake_block.split('\n');
            const prop_lines = lines.slice(2, -1);

            const props: any = prop_lines.reduce((obj, l) => {
                const [key, value] = l.split(':').map((x) => x.trim());
                return { ...obj, [key]: value };
            }, {});

            let entry: Entry | undefined;
            if (path === paths.topic) {
                entry = create_default_topic({
                    name: file.basename,
                    file_path: file.path,
                    created: new Date(file.stat.ctime),
                });

                if (props.children) {
                    // TODO this is a hack
                    (entry as any)._children_text = props.children;
                }
            }

            if (path === paths.project || path === paths.project_archive) {
                entry = create_default_project({
                    name: file.basename,
                    file_path: file.path,
                    created: new Date(file.stat.ctime),
                });

                if (props.due_date)
                    (entry as Project).due_date = new Date(
                        parseInt(props.due_date)
                    );

                if (props.children) {
                    // TODO this is a hack
                    (entry as any)._children_text = props.children;
                }
            }

            if (path === paths.task || path === paths.task_archive) {
                entry = create_default_task({
                    name: file.basename,
                    file_path: file.path,
                    created: new Date(file.stat.ctime),
                });

                if (props.due_date)
                    (entry as Task).due_date = new Date(
                        parseInt(props.due_date)
                    );

                if (props.do_date)
                    (entry as Task).do_date = new Date(parseInt(props.do_date));
            }

            if (!entry) throw new Error('not implemented');

            if (props.parents) entry.parents = JSON.parse(props.parents);

            if (props.done) entry.done = new Date(parseInt(props.done));
            if (props.last_review)
                entry.last_review = new Date(parseInt(props.last_review));

            entries.push(entry as T);
        } catch (error) {
            console.error(error);
        }
    }

    return entries;
}
