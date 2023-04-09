import type { App, MarkdownPostProcessorContext } from 'obsidian';
import {
    delete_file,
    move_file,
    open_next_daily,
    open_path,
    write_metadata,
} from './obsidian_helpers';
import { EntrySuggest } from './obsidian_controls/EntrySuggest';
import type { Parent } from './types';
import EntryHeader from './components/EntryHeader.svelte';
import TasksList from './components/TasksList.svelte';
import ProjectsList from './components/ProjectsList.svelte';
import TopicsList from './components/TopicsList.svelte';
import { paths } from './paths';
import DailyHeader from './components/DailyHeader.svelte';

export const process_krake_codeblock =
    (app: App) =>
    (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        // TODO why?
        // ctx.addChild()

        const config = parse_config(source, ctx);

        if (config.type === 'tasks') {
            new TasksList({
                target: el,
                props: {
                    open: open_path(app),
                    move_file: (f, t) => move_file(app, f, t),
                    write_metadata: write_metadata(app),
                    config,
                },
            });
            return;
        }

        if (config.type === 'projects') {
            new ProjectsList({
                target: el,
                props: {
                    open: open_path(app),
                    move_file: (f, t) => move_file(app, f, t),
                    write_metadata: write_metadata(app),
                    config,
                },
            });
            return;
        }

        if (config.type === 'topics') {
            new TopicsList({
                target: el,
                props: {
                    open: open_path(app),
                    config,
                },
            });
            return;
        }

        if (config.type === 'entry-header') {
            new EntryHeader({
                target: el,
                props: {
                    path: ctx.sourcePath,
                    open: open_path(app),
                    move_file: (f, t) => move_file(app, f, t),
                    delete_file: delete_file(app),
                    write_metadata: write_metadata(app),
                    suggest_project: (exclude_paths) => {
                        return new Promise<Omit<Parent, 'parents'>>(
                            (resolve) => {
                                new EntrySuggest(
                                    app,
                                    paths.project,
                                    exclude_paths,
                                    1,
                                    resolve
                                ).open();
                            }
                        );
                    },
                    suggest_topic: (exclude_paths) => {
                        return new Promise<Omit<Parent, 'parents'>>(
                            (resolve) => {
                                new EntrySuggest(
                                    app,
                                    paths.topic,
                                    exclude_paths,
                                    2,
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
            new DailyHeader({
                target: el,
                props: {
                    open: open_next_daily(app, ctx),
                },
            });

            return;
        }

        el.createEl('div', {
            text: `Error. Unknown or missing type "${config.type}".`,
        });
    };

function parse_config(source: string, ctx: MarkdownPostProcessorContext) {
    const lines = source.split('\n');

    const config: any = lines.reduce((obj, l) => {
        const [key, value] = l.split(':').map((x) => x.trim());
        return { ...obj, [key]: value };
    }, {});

    config.type ??= '';
    config.file_path = ctx.sourcePath;

    return config;
}
