import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { move_file, open_path } from './obsidian_helpers';
import Overview from '../components/structure/Overview.svelte';

export class OkStructureView extends ItemView {
    view: Overview;

    constructor(leaf: WorkspaceLeaf, private _app: App) {
        super(leaf);
    }

    static getViewTypeName() {
        return 'ok_structure_view';
    }

    getViewType(): string {
        return 'ok_structure_view';
    }

    getDisplayText(): string {
        return 'OK Overview';
    }

    getIcon(): string {
        return 'layout-list';
    }

    async onOpen(): Promise<void> {
        this.view = new Overview({
            target: this.contentEl,
            props: {
                move_file: (f, t) => move_file(app, f, t),
                open: open_path(this._app),
            },
        });
    }
}
