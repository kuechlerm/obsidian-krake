import { writable } from 'svelte/store';
import type { Child, DB, Entry, Parent, Project, Task, Topic } from '../types';
import { paths } from '../paths';
import { get_collection } from '../helper';

const empty_db = (): DB => ({
    topics: [],
    projects: [],
    tasks: [],
});

// TODO use on init if no Inbox-Topic exists
function inbox_content() {
    const lines = [
        '',
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

export const create_default_task = (
    task: Partial<Task> & { name: string; file_path: string }
): Task => {
    return {
        type: 0,
        name: task.name,
        file_path: task.file_path,
        created: task.created ?? new Date(),
        last_review: task.last_review ?? new Date(),
        done: task.done,
        parents: task.parents ?? [],
        do_date: task.do_date,
        due_date: task.due_date,
    };
};

export const create_default_project = (
    project: Partial<Project> & { name: string; file_path: string }
): Project => {
    return {
        type: 1,
        name: project.name,
        file_path: project.file_path,
        created: project.created ?? new Date(),
        last_review: project.last_review ?? new Date(),
        done: project.done,
        parents: project.parents ?? [],
        children: project.children ?? [],
        due_date: project.due_date,
    };
};

export const create_default_topic = (
    topic: Partial<Topic> & { name: string; file_path: string }
): Topic => {
    return {
        type: 2,
        name: topic.name,
        file_path: topic.file_path,
        created: topic.created ?? new Date(),
        last_review: topic.last_review ?? new Date(),
        parents: topic.parents ?? [],
        children: topic.children ?? [],
    };
};

const by_not_file_path_from =
    (compare_entry: { file_path: string }) => (entry: { file_path: string }) =>
        compare_entry.file_path !== entry.file_path;

function create_db_store() {
    const store = writable<DB>(empty_db());

    async function check_parents(entry: Entry) {
        if (entry.parents.length === 0) {
            await add_parent(entry, {
                type: 2,
                name: 'Inbox',
                file_path: `${paths.topic}/Inbox.md`,
            });
        }
    }

    const init = (init_db: DB) => {
        if (!init_db.topics.find((t) => t.name === 'Inbox')) {
            const inbox = create_default_topic({
                name: 'Inbox',
                file_path: `${paths.topic}/Inbox.md`,
            });

            init_db.topics.push(inbox);
        }

        store.set(init_db);

        // has to run after store.set
        for (const project of init_db.projects) {
            process_children(init_db, (project as any)._children_text, project);
        }

        for (const topic of init_db.topics) {
            process_children(init_db, (topic as any)._children_text, topic);
        }

        console.log('+++++ init db', init_db);
    };

    function process_children(db: DB, prop_text: string, entry: Entry) {
        // eg: 2,A;2,B
        if (!prop_text) return;

        const child_strings = prop_text.split(';');

        child_strings.forEach((child_string) => {
            const [child_type, child_name] = child_string.split(',');

            const collection = get_collection(
                db,
                parseInt(child_type) as 0 | 1 | 2
            );

            const child = collection.find((c) => c.name === child_name);
            if (!child) return;

            add_parent(child, entry);
        });
    }

    const add_task = async (task: Task) => {
        await check_parents(task);

        store.update((curr) => {
            curr.tasks.push(task);
            return curr;
        });
    };

    const add_project = async (project: Project) => {
        await check_parents(project);

        store.update((curr) => {
            curr.projects.push(project);
            return curr;
        });
    };

    const add_topic = async (topic: Topic) => {
        store.update((curr) => {
            curr.topics.push(topic);
            return curr;
        });
    };

    const toggle_done = async (entry: Entry, done: boolean) => {
        entry.done = done ? new Date() : undefined;

        if (done) {
            const old_folder = entry.type === 0 ? paths.task : paths.project;
            const new_folder =
                entry.type === 0 ? paths.task_archive : paths.project_archive;
            const new_path = entry.file_path.replace(old_folder, new_folder);

            change_path(entry.file_path, new_path, entry.name);
        } else {
            const old_folder =
                entry.type === 0 ? paths.task_archive : paths.project_archive;
            const new_folder = entry.type === 0 ? paths.task : paths.project;
            const new_path = entry.file_path.replace(old_folder, new_folder);

            change_path(entry.file_path, new_path, entry.name);
        }
    };

    const change_path = async (
        old_path: string,
        new_path: string,
        new_name: string
    ) => {
        // TODO anders lösen?
        const folder_name = old_path
            .split('/')
            .at(1)
            ?.replace(' Archive', '')
            .toLowerCase();

        if (!folder_name) return;

        store.update((curr) => {
            const collection = (curr as any)[folder_name] as Entry[];
            const entry = collection.find((e) => e.file_path === old_path);

            if (!entry) return curr;

            // Update entry
            entry.file_path = new_path;
            entry.name = new_name;

            // specific updates for entry types

            // update first level of parent
            entry.parents.forEach((parent) => {
                if (parent.name === 'Inbox') return;

                const parent_entry = get_collection(curr, parent.type).find(
                    (e) => e.file_path === parent.file_path
                );
                if (!parent_entry) throw new Error('No parent_entry');

                // parent muss children haben
                const child = (
                    parent_entry as Entry & { children: Child[] }
                ).children.find((c) => c.file_path === old_path);
                if (!child) throw new Error('No child');
                child.file_path = new_path;
            });

            // projects and topics have children
            if (folder_name !== paths.task.toLowerCase()) {
                // update all levels of children
                update_all_children(
                    curr,
                    old_path,
                    new_path,
                    new_name,
                    (entry as any).children
                );
            }

            return curr;
        });
    };

    const add_parent = async (
        entry: Entry,
        new_parent_info: Omit<Parent, 'parents'>
    ) => {
        store.update((curr) => {
            const parent_entry = get_collection(
                curr,
                new_parent_info.type
            ).find((e) => e.file_path === new_parent_info.file_path);

            if (!parent_entry) throw new Error('No parent entry found');

            // Add this entry as a Child to the Parent
            // must have children because its a parent
            (parent_entry as Entry & { children: Child[] }).children.push({
                type: entry.type,
                file_path: entry.file_path,
            });

            if (new_parent_info.name !== 'Inbox') {
                // remove from inbox
                const inbox = curr.topics.find((t) => t.name === 'Inbox');
                if (!inbox) throw new Error('no inbox found');
                inbox.children = inbox.children.filter(
                    by_not_file_path_from(entry)
                );

                // Inbox automatically removed
                entry.parents = entry.parents.filter(
                    (parent) => parent.name !== 'Inbox'
                );
            }

            entry.parents.push({
                ...new_parent_info,
                parents: [...parent_entry.parents],
            });

            // update all children, gand-children etc
            const updated_parent: Parent = {
                file_path: entry.file_path,
                name: entry.name,
                type: entry.type,
                parents: entry.parents,
            };

            add_parent_to_all_children(
                curr,
                updated_parent,
                (entry as any).children
            );

            return curr;
        });
    };

    const remove_parent = async (entry: Entry, parent_to_remove: Parent) => {
        store.update((curr) => {
            entry.parents = entry.parents.filter(
                by_not_file_path_from(parent_to_remove)
            );

            // remove child in parent
            const parent_entry = get_collection(
                curr,
                parent_to_remove.type
            ).find((p) => p.file_path === parent_to_remove.file_path);
            if (!parent_entry) throw new Error('no parent entry');

            (parent_entry as Entry & { children: Child[] }).children = (
                parent_entry as Entry & { children: Child[] }
            ).children.filter(by_not_file_path_from(entry));

            // remove parent in all children
            remove_parent_from_all_children(
                curr,
                entry.file_path,
                parent_to_remove.file_path,
                (entry as any).children
            );

            return curr;
        });
    };

    const remove_entry = async (entry: Entry) => {
        for (const parent of entry.parents) {
            await remove_parent(entry, parent);
        }

        store.update((curr) => {
            // remove parent from children
            for (const child of (entry as Entry & { children?: Child[] })
                .children ?? []) {
                const child_entry = get_collection(curr, child.type).find(
                    (e) => e.file_path === child.file_path
                );
                if (!child_entry) throw new Error('no child entry');

                child_entry.parents = child_entry.parents.filter(
                    (p) => p.file_path !== entry.file_path
                );
                if (child_entry.parents.length === 0) {
                    add_parent(child_entry, {
                        type: 2,
                        name: 'Inbox',
                        file_path: `${paths.topic}/Inbox.md`,
                    });
                }
            }

            if (entry.type === 0)
                curr.tasks = curr.tasks.filter(by_not_file_path_from(entry));
            if (entry.type === 1)
                curr.projects = curr.projects.filter(
                    by_not_file_path_from(entry)
                );
            if (entry.type === 2)
                curr.topics = curr.topics.filter(by_not_file_path_from(entry));

            return curr;
        });
    };

    const change_type = async (
        entry: Entry,
        new_type: 0 | 1 | 2,
        new_path: string
    ) => {
        store.update((curr) => {
            if (entry.type === 0) {
                curr.tasks = curr.tasks.filter(by_not_file_path_from(entry));
            }
            if (entry.type === 1) {
                curr.projects = curr.projects.filter(
                    by_not_file_path_from(entry)
                );
            }
            if (entry.type === 2) {
                curr.topics = curr.topics.filter(by_not_file_path_from(entry));
            }

            get_collection(curr, new_type).push({
                ...entry,
                type: new_type,
                file_path: new_path,
            });

            return curr;
        });
    };

    const clear = async () => {
        store.set(empty_db());
    };

    return {
        init,
        add_task,
        add_project,
        add_topic,
        change_path,
        add_parent,
        remove_parent,
        toggle_done,
        remove_entry,
        change_type,
        clear,
        ...store,
    };
}

// function is_type<T extends Entry>(entry: Entry): asserts entry is T {
// 	//
// }

function update_all_children(
    current_db: DB,
    old_path: string,
    new_path: string,
    new_name: string,
    children?: Child[]
) {
    if (!children) return;

    children.forEach((child) => {
        const entry = get_collection(current_db, child.type).find(
            (e) => e.file_path === child.file_path
        );
        if (!entry) throw new Error('No entry for file_path');

        const parent = entry.parents.find((p) => p.file_path === old_path);
        if (!parent) throw new Error('No parent for file_path');

        parent.file_path = new_path;
        parent.name = new_name;

        update_all_children(
            current_db,
            old_path,
            new_path,
            new_name,
            (entry as any).children
        );
    });
}

function add_parent_to_all_children(
    current_db: DB,
    new_parent: Parent,
    children?: Child[]
) {
    if (!children) return;

    children.forEach((child) => {
        const child_entry = get_collection(current_db, child.type).find(
            (e) => e.file_path === child.file_path
        );
        if (!child_entry) throw new Error('No entry for file_path');

        // TODO remove Inbox??
        // replace changed Parent or could be new(?)
        child_entry.parents = [
            ...child_entry.parents.filter(by_not_file_path_from(new_parent)),
            new_parent,
        ];

        const updated_parent: Parent = {
            file_path: child_entry.file_path,
            name: child_entry.name,
            type: child.type,
            parents: child_entry.parents,
        };

        add_parent_to_all_children(
            current_db,
            updated_parent,
            (child_entry as any).children
        );
    });
}

function remove_parent_from_all_children(
    current_db: DB,
    parent_path: string,
    remove_parent_path: string,
    children?: Child[]
) {
    if (!children) return;

    children.forEach((child) => {
        const child_entry = get_collection(current_db, child.type).find(
            (e) => e.file_path === child.file_path
        );
        if (!child_entry) throw new Error('no child entry');

        // remove parent from parents - recursive
        const start_parent = child_entry.parents.find(
            (p) => p.file_path === parent_path
        );
        if (!start_parent) throw new Error('no parent');

        remove_parent(start_parent, remove_parent_path);

        remove_parent_from_all_children(
            current_db,
            remove_parent_path,
            (child_entry as any).children
        );
    });
}

function remove_parent(parent: Parent, remove_parent_path: string) {
    const parent_to_remove = parent.parents.find(
        (p) => p.file_path === remove_parent_path
    );
    if (parent_to_remove) {
        parent.parents = parent.parents.filter(
            (p) => p.file_path !== remove_parent_path
        );
        return;
    }

    parent.parents.forEach((p) => remove_parent(p, remove_parent_path));
}

export const db = create_db_store();
