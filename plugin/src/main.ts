import { Platform, Plugin, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { process_krake_codeblock } from './codeblock_processor';
import { SampleSettingTab } from './obsidian_controls/SampleSettingTab';

import './styles.css';
import { create_entry } from './create_entry';
import { OK_Structrue_View } from './ok_structure_view';
import { paths } from './paths';
import {
    create_default_project,
    create_default_task,
    create_default_topic,
    db,
} from './stores/db';
import type { DB } from './types';
import type { Topic } from './types';
import type { Project } from './types';
import type { Task } from './types';
import type { Entry } from './types';

// @ts-ignore
const version = __version__;

// interface MyPluginSettings {
//     mySetting: string;
// }

// const DEFAULT_SETTINGS: MyPluginSettings = {
//     mySetting: 'default',
// };

export default class ObsidianKrakePlugin extends Plugin {
    private structure_view: OK_Structrue_View;
    // settings: MyPluginSettings;

    async onload() {
        console.log('obsidian-krake', version);

        await this.loadSettings();

        // TODO does it work at this point?
        await this.init_db();

        this.registerView(
            OK_Structrue_View.getViewTypeName(),
            (leaf: WorkspaceLeaf) =>
                (this.structure_view = new OK_Structrue_View(leaf, this.app))
        );

        this.addRibbonIcon(
            'layout-list',
            'OK Overview',
            async (evt: MouseEvent) => {
                const workspace = this.app.workspace;
                workspace.detachLeavesOfType(
                    OK_Structrue_View.getViewTypeName()
                );
                const leaf = workspace.getLeaf(!Platform.isMobile);
                await leaf.setViewState({
                    type: OK_Structrue_View.getViewTypeName(),
                });
                workspace.revealLeaf(leaf);
            }
        );

        this.app.workspace.onLayoutReady(
            this.onWorkspaceLayoutReady.bind(this)
        );

        // This adds a simple command that can be triggered anywhere
        // this.addCommand({
        //     id: 'open-sample-modal-simple',
        //     name: 'Open sample modal (simple)',
        //     callback: () => this.openMapView(),
        // });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor(
            'krake',
            process_krake_codeblock(this.app)
        );

        this.addCommand({
            id: 'krake-create-task',
            name: 'Create Task from Line',
            editorCallback: create_entry(this.app, 'task'),
        });

        this.addCommand({
            id: 'krake-create-project',
            name: 'Create Project from Line',
            editorCallback: create_entry(this.app, 'project'),
        });

        this.addCommand({
            id: 'krake-create-topic',
            name: 'Create Topic from Line',
            editorCallback: create_entry(this.app, 'topic'),
        });

        this.registerEvent(
            this.app.vault.on('rename', (file, old_path) => {
                if (!(file instanceof TFile)) return;
                if (!old_path.startsWith(paths.base)) return;

                db.change_path(old_path, file.path, file.basename);
            })
        );
    }

    async init_db() {
        const topics = await this.get_entries<Topic>(paths.topic);
        const projects = await this.get_entries<Project>(paths.project);
        const tasks = await this.get_entries<Task>(paths.task);

        const init_db: DB = {
            topics,
            projects,
            tasks,
        };

        console.log('init_db', init_db);

        db.init(init_db);
    }

    async get_entries<T extends Entry>(path: string): Promise<T[]> {
        const entries_folder = this.app.vault.getAbstractFileByPath(
            path
        ) as TFolder;

        if (!entries_folder) return [];

        const entries: T[] = [];

        // TODO better without forof?
        for (const file of entries_folder.children as TFile[]) {
            const content = await this.app.vault.cachedRead(file);
            const krake_block = content
                .match(/```krake\ntype:entry-header([\s\S]*?)\n```/)
                ?.first();

            if (!krake_block) {
                continue;
            }

            const lines = krake_block.split('\n');
            const prop_lines = lines.slice(2, -1);

            const props: any = prop_lines.reduce((obj, l) => {
                const [key, value] = l.split(':').map((x) => x.trim());
                return { ...obj, [key]: value };
            }, {});

            // TODO the typing is ... not great
            let entry: Entry | undefined;
            if (path === paths.topic) {
                entry = create_default_topic({
                    name: file.basename,
                    file_path: file.path,
                    created: new Date(file.stat.ctime),
                });

                if (props.children)
                    (entry as Topic).children = JSON.parse(props.children);
            }

            if (path === paths.project) {
                entry = create_default_project({
                    name: file.basename,
                    file_path: file.path,
                    created: new Date(file.stat.ctime),
                });

                if (props.due_date)
                    (entry as Project).due_date = new Date(
                        parseInt(props.due_date)
                    );

                if (props.children)
                    (entry as Project).children = JSON.parse(props.children);
            }

            if (path === paths.task) {
                entry = create_default_task({
                    name: file.basename,
                    file_path: file.path,
                    created: new Date(file.stat.ctime),
                });

                if (props.due_date)
                    (entry as Task).due_date = new Date(
                        parseInt(props.due_date)
                    );

                if (props.do_date)
                    (entry as Task).do_date = new Date(parseInt(props.do_date));
            }

            if (!entry) throw new Error('not implemented');

            if (props.parents) entry.parents = JSON.parse(props.parents);

            if (props.done) entry.done = new Date(parseInt(props.done));
            if (props.last_review)
                entry.last_review = new Date(parseInt(props.last_review));

            entries.push(entry as T);
        }

        return entries;
    }

    onWorkspaceLayoutReady(): void {}

    onunload() {}

    async loadSettings() {
        // this.settings = Object.assign(
        //     {},
        //     DEFAULT_SETTINGS,
        //     await this.loadData()
        // );
    }

    async saveSettings() {
        // await this.saveData(this.settings);
    }
}
