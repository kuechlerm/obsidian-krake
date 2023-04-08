import type { App, MarkdownPostProcessorContext } from 'obsidian';
import {
    DailyHeader,
    TasksList,
    ProjectsList,
    TopicsList,
    paths,
    EntryHeader,
    type Parent,
} from 'ui-components';
import { delete_file, move_file, open_next_daily, open_path } from './helpers';
import { EntrySuggest } from './EntrySuggest';
import Test from './components/Test.svelte';

export const processKrakeCodeBlock =
    (app: App) =>
    (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        // TODO why?
        // ctx.addChild()

        const config = parseConfig(source, ctx);

        if (config.type === 'tasks') {
            new TasksList({
                target: el,
                props: {
                    open: open_path(app),
                    move_file: (f, t) => move_file(app, f, t),
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

        if (config.type === 'test') {
            new Test({
                target: el,
                props: {},
            });

            return;
        }

        el.createEl('div', {
            text: `Error. Unknown or missing type "${config.type}".`,
        });
    };

function parseConfig(source: string, ctx: MarkdownPostProcessorContext) {
    const lines = source.split('\n');

    const config: any = lines.reduce((obj, l) => {
        const [key, value] = l.split(':').map((x) => x.trim());
        return { ...obj, [key]: value };
    }, {});

    config.type ??= '';
    config.file_path = ctx.sourcePath;

    return config;
}
