import {
    normalizePath,
    type App,
    type Editor,
    type MarkdownFileInfo,
    type MarkdownView,
} from 'obsidian';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
    paths,
} from 'ui-components';
import { open_file } from './helpers';

export const create_entry =
    (app: App, type: 'task' | 'project' | 'topic') =>
    async (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        try {
            // console.log('ctx', ctx.file?.path);

            const line_no = editor.getCursor().line;
            const line_text = editor.getLine(line_no);
            const clean_text = line_text
                .trimStart()
                .replace(/^-/, '')
                .replace(/[^a-zäöüß1-9-_, ]/gi, '') // remove everything but text, numbers, space
                .trim();

            if (!clean_text) return;

            const new_text = line_text.replace(clean_text, `[[${clean_text}]]`);

            editor.setLine(line_no, new_text);

            const folder_name = paths[type];
            // TOOD reicht normalizePath?
            const file_path = normalizePath(`${folder_name}/${clean_text}.md`);
            const file_lines = ['```krake', 'type:entry-header', '```', ''];

            if (type !== 'task') {
                if (type === 'topic') {
                    file_lines.push(
                        ...[
                            '#### Topics',
                            '```krake',
                            'type:topics',
                            'children:true',
                            '```',
                            '',
                        ]
                    );
                }

                file_lines.push(
                    ...[
                        '#### Projects',
                        '```krake',
                        'type:projects',
                        'children:true',
                        '```',
                        '',
                        '#### Tasks',
                        '```krake',
                        'type:tasks',
                        'children:true',
                        '```',
                        '',
                    ]
                );
            }

            file_lines.push('');
            const file_content = file_lines.join('\n');

            // check folder
            const folder = app.vault.getAbstractFileByPath(folder_name);
            if (!folder) {
                await app.vault.createFolder(folder_name);
            }

            const new_file = await app.vault.create(file_path, file_content);

            if (type === 'task') {
                const new_task = create_default_task({
                    name: clean_text,
                    file_path,
                });
                await db.add_task(new_task);

                let parent_type: 0 | 1 | 2 = 0;
                if (ctx.file?.path.startsWith(paths.project)) {
                    parent_type = 1;
                }
                if (
                    ctx.file?.path.startsWith(paths.topic) &&
                    !ctx.file.path.endsWith('Inbox.md')
                ) {
                    parent_type = 2;
                }
                if (parent_type > 0 && ctx.file) {
                    await db.add_parent(new_task, {
                        type: parent_type,
                        name: ctx.file.basename,
                        file_path: ctx.file.path,
                    });
                }
            }

            if (type === 'project') {
                const new_project = create_default_project({
                    name: clean_text,
                    file_path,
                });
                await db.add_project(new_project);

                let parent_type: 0 | 1 | 2 = 0;
                if (
                    ctx.file?.path.startsWith(paths.topic) &&
                    !ctx.file.path.endsWith('Inbox.md')
                ) {
                    parent_type = 2;
                }
                // TODO auch projects?
                if (parent_type > 0 && ctx.file) {
                    await db.add_parent(new_project, {
                        type: parent_type,
                        name: ctx.file.basename,
                        file_path: ctx.file.path,
                    });
                }
            }
            if (type === 'topic') {
                const new_topic = create_default_topic({
                    name: clean_text,
                    file_path,
                });
                await db.add_topic(new_topic);

                let parent_type: 0 | 1 | 2 = 0;
                if (
                    ctx.file?.path.startsWith(paths.topic) &&
                    !ctx.file.path.endsWith('Inbox.md')
                ) {
                    parent_type = 2;
                }
                // TODO auch projects?
                if (parent_type && ctx.file) {
                    await db.add_parent(new_topic, {
                        type: parent_type,
                        name: ctx.file.basename,
                        file_path: ctx.file.path,
                    });
                }
            }

            await open_file(app)(new_file);
        } catch (error) {
            console.log('ERROR', error);
        }
    };
