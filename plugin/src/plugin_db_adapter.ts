import { App, TFile } from 'obsidian';
import {
    create_default_topic,
    paths,
    type Child,
    type DB,
    type DbAdapter,
    type Parent,
    type Project,
    type Task,
    type Topic,
} from 'ui-components';

export type Entry_JSON = {
    parents: Parent[];

    name: string;
    file_path: string;
    done?: number;
    created: number;
    last_review: number;
};

export type Task_JSON = Entry_JSON & {
    due_date?: number;
    do_date?: number;
};

export type Project_JSON = Entry_JSON & {
    children: Child[];
    due_date?: number;
};

export type Topic_JSON = Entry_JSON & {
    children: Child[];
};

export type DB_JSON = {
    version: number;
    topics: Topic_JSON[];
    projects: Project_JSON[];
    tasks: Task_JSON[];
};

export const create_plugin_db_adapter = (app: App): DbAdapter => {
    const db_path = 'db.json';

    const load = async () => {
        const afile = app.vault.getAbstractFileByPath(db_path);

        if (!afile) return null;

        if (!(afile instanceof TFile)) {
            throw new Error('should be a file');
        }

        const content = await app.vault.read(afile);
        const db_json = JSON.parse(content) as DB_JSON;

        const db: DB = {
            version: db_json.version,
            tasks: db_json.tasks.map(toTask),
            projects: db_json.projects.map(toProject),
            topics: db_json.topics.map(toTopic),
        };

        migrate(db);

        if (!db.topics.find((t) => t.name === 'Inbox')) {
            await create_inbox_topic(db);
            await save(db);
        }

        console.log('DB', db);
        return db;
    };

    const save = async (db: DB) => {
        const db_json: DB_JSON = {
            version: db.version,
            tasks: db.tasks.map(fromTask),
            projects: db.projects.map(fromProject),
            topics: db.topics.map(fromTopic),
        };
        const data = JSON.stringify(db_json);

        let db_file = app.vault.getAbstractFileByPath(db_path);

        if (!db_file) {
            db_file = await app.vault.create(db_path, data);
            return;
        }

        if (!(db_file instanceof TFile)) {
            throw new Error('should be a file');
        }

        console.log('save DB', db_json);
        await app.vault.modify(db_file, data);
    };

    const create_inbox = async (file_path: string) => {
        const file = app.vault.getAbstractFileByPath(file_path);
        if (file) return;

        await app.vault.create(file_path, inbox_content());
    };

    return {
        load,
        save,
        create_inbox,
    };
};

const fromDate = (date?: Date) => date?.valueOf();
const toDate = (value?: number) => (value ? new Date(value) : undefined);

const toTask = (task: Task_JSON): Task => ({
    ...task,
    type: 0,
    parents: task.parents,
    done: toDate(task.done),
    created: toDate(task.created) ?? new Date(),
    last_review: toDate(task.last_review) ?? new Date(),
    do_date: toDate(task.do_date),
    due_date: toDate(task.due_date),
});
const fromTask = (task: Task): Task_JSON => ({
    name: task.name,
    file_path: task.file_path,
    parents: task.parents,
    done: fromDate(task.done),
    created: fromDate(task.created) ?? new Date().valueOf(),
    last_review: fromDate(task.last_review) ?? new Date().valueOf(),
    do_date: fromDate(task.do_date),
    due_date: fromDate(task.due_date),
});

const toProject = (project: Project_JSON): Project => ({
    ...project,
    type: 1,
    done: toDate(project.done),
    created: toDate(project.created) ?? new Date(),
    last_review: toDate(project.last_review) ?? new Date(),
    due_date: toDate(project.due_date),
});
const fromProject = (project: Project): Project_JSON => ({
    name: project.name,
    file_path: project.file_path,
    parents: project.parents,
    children: project.children,
    done: fromDate(project.done),
    created: fromDate(project.created) ?? new Date().valueOf(),
    last_review: fromDate(project.last_review) ?? new Date().valueOf(),
    due_date: fromDate(project.due_date),
});

const toTopic = (topic: Topic_JSON): Topic => ({
    ...topic,
    type: 2,
    done: toDate(topic.done),
    created: toDate(topic.created) ?? new Date(),
    last_review: toDate(topic.last_review) ?? new Date(),
});
const fromTopic = (topic: Topic): Topic_JSON => ({
    name: topic.name,
    file_path: topic.file_path,
    parents: topic.parents,
    children: topic.children,
    created: fromDate(topic.created) ?? new Date().valueOf(),
    last_review: fromDate(topic.last_review) ?? new Date().valueOf(),
});

async function create_inbox_topic(db: DB) {
    const folder_name = paths.topic;
    const file_path = `${folder_name}/Inbox.md`;

    // check folder
    const folder = app.vault.getAbstractFileByPath(folder_name);
    if (!folder) {
        await app.vault.createFolder(folder_name);
    }

    // check file
    const file = app.vault.getAbstractFileByPath(file_path);
    if (!file) {
        await app.vault.create(file_path, inbox_content());
    }

    db.topics.push(
        create_default_topic({
            name: 'Inbox',
            file_path,
        })
    );
}

function inbox_content() {
    const lines = [
        '```krake',
        'type:entry-header',
        '```',
        '',
        '### Projects',
        '```krake',
        'type:projects',
        'parent:Inbox',
        '```',
        '',
        '### Tasks',
        '```krake',
        'type:tasks',
        'parent:Inbox',
        '```',
        '',
    ];

    return lines.join('\n');
}

function migrate(db: DB) {
    if (db.version === 1) {
        // db.projects
        // db.topics
        // db.version = 2;
    }
}
