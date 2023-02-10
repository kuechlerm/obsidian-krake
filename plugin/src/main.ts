import { Platform, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { db, paths } from 'ui-components';
import { processKrakeCodeBlock } from './krakeCodeBlockProcessor';
import { SampleSettingTab } from './SampleSettingTab';

import './styles.css';
import { create_plugin_db_adapter } from './plugin_db_adapter';
import { create_entry } from './createEntry';
import { OK_Structrue_View } from './ok_structure_view';

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
            processKrakeCodeBlock(this.app)
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

    onWorkspaceLayoutReady(): void {
        // TODO das müsste erwartet werden
        db.init(create_plugin_db_adapter(this.app));
        // TODO nur in dev
        (window as any).db = db;
    }

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
