// - alle Parents werden an Entry gespeichert
// - nur direkte Children wird an Entry gespeichert

export type Parent = {
	parents: Parent[];

	name: string;
	file_path: string;
	type: 0 | 1 | 2; // 0: task, 1: project, 2: topic
};

export type Child = {
	file_path: string;
	type: 0 | 1 | 2; // 0: task, 1: project, 2: topic
};

// Topic / Project / Task -> für Struktur-Darstellung
export type Entry = {
	parents: Parent[];

	name: string; // TODO muss das einzigartig sein!?
	file_path: string; // kann als id dienen
	type: 0 | 1 | 2; // 0: task, 1: project, 2: topic
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

// -----

export type DB = {
	version: number;
	topics: Topic[];
	projects: Project[];
	tasks: Task[];
};

// ----------------------------------------------------------------

export type DbAdapter = {
	load: () => Promise<DB | null>;
	save: (db: DB) => Promise<void>;
	create_inbox: (file_path: string) => Promise<void>;
};

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
