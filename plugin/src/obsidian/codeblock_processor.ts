import type { App, MarkdownPostProcessorContext } from 'obsidian';
import {
    delete_file,
    move_file,
    open_next_daily,
    open_path,
    write_metadata,
} from './obsidian_helpers';
import { EntrySuggest } from './EntrySuggest';
import type { Parent } from '../types';
import EntryHeader from '../components/headers/EntryHeader.svelte';
import DailyHeader from '../components/headers/DailyHeader.svelte';
import { parse_config } from '../helper';
import { parse } from 'date-fns';
import { de } from 'date-fns/locale';

export const process_krake_codeblock =
    (app: App) =>
    (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        // TODO why?
        // ctx.addChild()

        const config = parse_config(source, ctx.sourcePath);

        if (config.type === 'entry-header') {
            new EntryHeader({
                target: el,
                props: {
                    path: ctx.sourcePath,
                    open: open_path(app),
                    move_file: (f, t) => move_file(app)(f, t),
                    write_metadata: write_metadata(app),
                    delete_file: delete_file(app),

                    suggest_parent: (parent_entry_type, exclude_paths) => {
                        return new Promise<Omit<Parent, 'parents'>>(
                            (resolve) => {
                                new EntrySuggest(
                                    app,
                                    parent_entry_type,
                                    exclude_paths,
                                    resolve
                                ).open();
                            }
                        );
                    },
                },
            });

            return;
        }

        if (config.type === 'daily-header') {
            // TODO move to helpers / settings
            const file_name_format = 'EEEEEE dd.MM.yyyy';
            const basename = ctx.sourcePath.split('/').at(-1)?.split('.').at(0);

            if (!basename) throw new Error('basename is undefined');

            const date = parse(basename, file_name_format, new Date(), {
                locale: de,
            });

            new DailyHeader({
                target: el,
                props: {
                    date,
                    open_next: open_next_daily(app, ctx),
                    open: open_path(app),
                    move_file: (f, t) => move_file(app)(f, t),
                    write_metadata: write_metadata(app),
                },
            });

            return;
        }

        el.createEl('div', {
            text: `Error. Unknown or missing type "${config.type}".`,
        });
    };
