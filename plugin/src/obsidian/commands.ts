import {
    normalizePath,
    type App,
    type Editor,
    type MarkdownFileInfo,
    type MarkdownView,
} from 'obsidian';
import { open_file, write_metadata } from './obsidian_helpers';
import { create_entry_workflow } from '../create_entry';

export const create_entry =
    (app: App, type: 'task' | 'project' | 'topic') =>
    async (editor: Editor, ctx: MarkdownView | MarkdownFileInfo) => {
        try {
            if (!ctx.file) throw new Error('No file selected');

            await create_entry_workflow({
                line_no: editor.getCursor().line,
                type,
                current_file_basename: ctx.file.basename,
                current_file_path: ctx.file.path,
                create_folder: async (folder_name) => {
                    const folder = app.vault.getAbstractFileByPath(folder_name);
                    if (!folder) {
                        await app.vault.createFolder(folder_name);
                    }
                },
                create_file: async (path, content) =>
                    await app.vault.create(path, content),
                normalize_path: (path) => normalizePath(path),
                get_editor_line: (line_no: number) => editor.getLine(line_no),
                set_editor_line: (line_no: number, line_text: string) =>
                    editor.setLine(line_no, line_text),
                write_metadata: write_metadata(app),
                open_file: (file) => open_file(app)(file),
            });

            // console.log('ctx', ctx.file?.path);
        } catch (error) {
            console.log('ERROR', error);
        }
    };
