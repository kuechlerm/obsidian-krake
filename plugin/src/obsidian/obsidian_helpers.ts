import { add, format, parse } from 'date-fns';
import { de } from 'date-fns/locale';
import {
    App,
    Notice,
    Platform,
    TFile,
    type MarkdownPostProcessorContext,
} from 'obsidian';
import { paths } from '../paths';

export const open_file =
    (app: App) =>
    async (file: TFile, same_tab = false) => {
        const leaf = app.workspace.getLeaf(!same_tab && !Platform.isMobile);
        await leaf.openFile(file);
    };

export const open_path =
    (app: App) =>
    async (path: string, same_tab = false) => {
        const afile = app.vault.getAbstractFileByPath(path);

        if (!(afile instanceof TFile)) {
            console.log('O-K Error', 'path is not a file');
            throw new Error('path is not a file');
        }

        await open_file(app)(afile, same_tab);
    };

export const open_next_daily =
    (app: App, ctx: MarkdownPostProcessorContext) =>
    (direction: 'yesterday' | 'tomorrow') => {
        const file_name_format = 'EEEEEE dd.MM.yyyy';

        const file_name = ctx.sourcePath.split('/').at(-1);
        if (!file_name) return;

        // TODO not the most secure way to remove the extension
        const file_name_without_extension = file_name.substring(
            0,
            file_name.length - 3
        );
        if (!file_name_without_extension) return;

        const current_date = parse(
            file_name_without_extension,
            file_name_format,
            new Date(),
            { locale: de }
        );

        const new_path = find_next_daily(
            app,
            current_date,
            direction,
            file_name_format
        );

        if (!new_path) {
            new Notice(
                'Cannot find next daily. Please use the calendar to navigate.'
            );
            return;
        }

        open_path(app)(new_path, true);
    };

function find_next_daily(
    app: App,
    current_date: Date,
    direction: 'yesterday' | 'tomorrow',
    file_name_format: string,
    count = 0
): string | null {
    const new_date = add(current_date, {
        days: direction === 'yesterday' ? -1 : 1,
    });
    const new_path = `Logbuch/${format(new_date, file_name_format, {
        locale: de,
    })}.md`;

    if (!app.vault.getAbstractFileByPath(new_path)) {
        if (count > 9) {
            // too many days without a daily
            return null;
        }

        return find_next_daily(
            app,
            new_date,
            direction,
            file_name_format,
            count + 1
        );
    }

    return new_path;
}

export const move_file =
    (app: App) => async (from_path: string, to_path: string) => {
        const file = app.vault.getAbstractFileByPath(from_path);

        if (!(file instanceof TFile)) {
            console.log('O-K Error', 'path is not a file');
            throw new Error('path is not a file');
        }

        // check folder
        const folder_name = to_path.substring(0, to_path.lastIndexOf('/'));
        const folder = app.vault.getAbstractFileByPath(folder_name);
        if (!folder) {
            await app.vault.createFolder(folder_name);
        }

        await app.vault.copy(file, to_path);
        await app.vault.delete(file);
    };

export const delete_file = (app: App) => async (file_path: string) => {
    const file = app.vault.getAbstractFileByPath(file_path);
    if (!file) {
        throw new Error(`${file_path} does not exist`);
    }
    if (!(file instanceof TFile)) {
        throw new Error(`${file_path} not a file`);
    }

    await app.vault.delete(file);
};

export const write_metadata =
    (app: App) =>
    async (file_path: string, metadata: { [key: string]: string }) => {
        // Inbox will never be changed
        if (file_path === `${paths.topic}/Inbox.md`) return;

        const entry_file = app.vault.getAbstractFileByPath(
            file_path
        ) as TFile | null;
        if (!entry_file) return;

        const project_content = await app.vault.read(entry_file);

        const krake_block = project_content
            .match(/```krake\ntype:entry-header([\s\S]*?)\n```/)
            ?.first();

        if (!krake_block) return;

        const lines = krake_block.split('\n');
        const prop_lines = lines.slice(2, -1);
        let props_obj = Object.fromEntries(
            prop_lines.map((line) => line.split(':'))
        );

        props_obj = { ...props_obj, ...metadata };

        const krake_block_update = [
            '```krake',
            'type:entry-header',
            ...Object.entries(props_obj).map(
                ([key, value]) => `${key}:${value}`
            ),
            '```',
        ].join('\n');

        const [empty_line, after_krake_block] =
            project_content.split(krake_block);

        const file_update = [
            empty_line,
            krake_block_update,
            after_krake_block,
        ].join('');

        await app.vault.modify(entry_file, file_update);
    };
