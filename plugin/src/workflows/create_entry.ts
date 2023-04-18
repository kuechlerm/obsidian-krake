import { type TFile } from 'obsidian';
import { paths } from '../paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from '../stores/db';
import { get_collection } from '../helper';
import { get } from 'svelte/store';
import type { Child, EntryType, Write_Metadata } from '../types';
import { name_from_file_path } from '../helper';
import { entry_header_file_content } from '../utils/file_content_inits';

// TODO cleanup
export async function create_entry_workflow(args: {
    line_no: number; // editor.getCursor().line
    type: 'task' | 'project' | 'topic';
    current_file_basename: string; // ctx.file?.basename
    current_file_path: string; // ctx.file?.path
    create_folder: (path: string) => Promise<void>;
    create_file: (path: string, content: string) => Promise<TFile>;
    normalize_path: (path: string) => string; // normalizePath(path)
    get_editor_line: (line_no: number) => string; // editor.getLine(line_no)
    set_editor_line: (line_no: number, line_text: string) => void; //editor.setLine(line_no, new_text)
    write_metadata: Write_Metadata; // write_metadata(app)(file_path, metadata)
    open_file: (file: TFile) => Promise<void>;
}) {
    const line_text = args.get_editor_line(args.line_no);

    // TODO needed? I think I used this because SyncThing had problems with some characters
    const clean_text = line_text
        .trimStart()
        .replace(/^-/, '')
        // cannot use , or ; as they are used as separators in the metadata
        .replace(/[^a-zäöüß0-9-_ ]/gi, '') // remove everything but text, numbers, space, - and _
        .trim();

    if (!clean_text) return;

    const new_text = line_text.replace(clean_text, `[[${clean_text}]]`);

    args.set_editor_line(args.line_no, new_text);

    const folder_name = paths[args.type];
    await args.create_folder(folder_name);

    // TOOD reicht normalizePath?
    const file_path = args.normalize_path(`${folder_name}/${clean_text}.md`);
    const file_content = entry_header_file_content();

    const new_child_file = await args.create_file(file_path, file_content);

    // TODO extract

    let current_file_entry_type: EntryType = 0; // 0 = any file, not a project or topic

    if (args.type === 'task') {
        const new_task = create_default_task({
            name: clean_text,
            file_path,
        });
        db.add_task(new_task);

        let parent_type: EntryType = 0;
        if (args.current_file_path.startsWith(paths.project)) {
            parent_type = 1;
        }
        if (
            args.current_file_path.startsWith(paths.topic) &&
            !args.current_file_path.endsWith('Inbox.md')
        ) {
            parent_type = 2;
        }
        if (parent_type > 0) {
            current_file_entry_type = parent_type;

            db.add_parent(new_task, {
                type: parent_type,
                name: args.current_file_basename,
                file_path: args.current_file_path,
            });
        }
    }

    if (args.type === 'project') {
        const new_project = create_default_project({
            name: clean_text,
            file_path,
        });
        db.add_project(new_project);

        let parent_type: EntryType = 0;
        if (
            args.current_file_path.startsWith(paths.topic) &&
            !args.current_file_path.endsWith('Inbox.md')
        ) {
            parent_type = 2;
        }
        // TODO auch projects?
        if (parent_type > 0) {
            current_file_entry_type = parent_type;

            db.add_parent(new_project, {
                type: parent_type,
                name: args.current_file_basename,
                file_path: args.current_file_path,
            });
        }
    }

    if (args.type === 'topic') {
        const new_topic = create_default_topic({
            name: clean_text,
            file_path,
        });
        db.add_topic(new_topic);

        let parent_type: EntryType = 0;
        if (
            args.current_file_path.startsWith(paths.topic) &&
            !args.current_file_path.endsWith('Inbox.md')
        ) {
            parent_type = 2;
        }
        // TODO auch projects?
        if (parent_type) {
            current_file_entry_type = parent_type;

            db.add_parent(new_topic, {
                type: parent_type,
                name: args.current_file_basename,
                file_path: args.current_file_path,
            });
        }
    }

    // TODO extract
    if (current_file_entry_type) {
        const parent = get_collection(get(db), current_file_entry_type).find(
            (x) => x.file_path === args.current_file_path
        ) as { children: Child[] } | undefined;

        if (!parent) throw new Error('parent not found');

        await args.write_metadata(args.current_file_path, {
            children: parent.children
                .map(
                    (child) =>
                        `${child.type},${name_from_file_path(child.file_path)}`
                )
                .join(';'),
        });
    }

    await args.open_file(new_child_file);
}
