// - alle Parents werden an Entry gespeichert
// - nur direkte Children wird an Entry gespeichert

/** 0: task, 1: project, 2: topic */
export type EntryType = 0 | 1 | 2;

export type Parent = {
    parents: Parent[];

    name: string;
    file_path: string;
    type: EntryType;
};

export type Child = {
    file_path: string;
    type: EntryType;
};

// Topic / Project / Task -> für Struktur-Darstellung
export type Entry = {
    parents: Parent[];

    name: string; // TODO muss das einzigartig sein!?
    file_path: string; // kann als id dienen
    type: EntryType;
    done?: Date;
    created: Date;
    last_review: Date;
};

export type Task = Entry & {
    type: 0;

    due_date?: Date;
    do_date?: Date;
};

export type Project = Entry & {
    type: 1;
    children: Child[];

    due_date?: Date;
};

export type Topic = Entry & {
    type: 2;

    children: Child[];
};

export type DB = {
    topics: Topic[];
    projects: Project[];
    tasks: Task[];
};
// ----------------------------------------------------------------

// store metadata of an entry in the entires md file
// use a minimal representation of the metadata

export type EntryFileRepresentation = {
    // not needed: name, file_path, type, done
    last_review: string; // as date.getTime()
    // we store children as there are less files to update if you rename a parent (update none) or a child (update only the parents)
    children: string; // children -> [type],[name];[type],[name];...
};

// ----------------------------------------------------------------

// TODO remove after removal of Lists
export type TaskBlockConfig = {
    type: 'tasks';
    done?: 'true' | 'false' | string; // string : "=dd.MM.yyyy" => not done + done that day
    due_date?: string; // [ < | > ] [ dd.MM.yyyy | today ] [[ - | + ] n [ d | m | y ]]
    do_date?: string; // [ < | > ] [ dd.MM.yyyy | today ] [[ - | + ] n [ d | m | y ]]
    parent?: string; // name
    file_path: string;
    children?: 'true';
};

export type ProjectBlockConfig = {
    type: 'projects';
    done?: 'true' | 'false' | string; // string : "=dd.MM.yyyy" => not done + done that day
    due_date?: string; // [ < | > ] [ dd.MM.yyyy | today ] [[ - | + ] n [ d | m | y ]]
    parent?: string; // name
    file_path: string;
    children?: 'true';
};

export type TopicBlockConfig = {
    type: 'topics';
    parent?: string; // name
    file_path: string;
    children?: 'true';
};

// ----------------------------------------------------------------

export type Write_Metadata = (
    file_path: string,
    metadata: { [key: string]: string }
) => Promise<void>;
