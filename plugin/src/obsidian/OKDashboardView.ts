import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { move_file, open_path } from './obsidian_helpers';
import OKDashboard from '../components/OKDashboard.svelte';
import { migrate_db } from '../migrate_db';

export class OkDashboardView extends ItemView {
    view: OKDashboard;

    constructor(leaf: WorkspaceLeaf, private _app: App) {
        super(leaf);
    }

    static getViewTypeName() {
        return 'ok_dashboard_view';
    }

    getViewType(): string {
        return 'ok_dashboard_view';
    }

    getDisplayText(): string {
        return 'OK Dashboard';
    }

    getIcon(): string {
        return 'krake';
    }

    async onOpen(): Promise<void> {
        this.view = new OKDashboard({
            target: this.contentEl,
            props: {
                open: open_path(this._app),
                move_file: move_file(this._app),
                migrate_db: migrate_db(this._app),
            },
        });
    }
}
