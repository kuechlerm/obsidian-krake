import { App, FuzzySuggestModal, TFile, TFolder } from 'obsidian';
import type { Parent } from '../types';
import { byStringProperty } from '../helper';

export class EntrySuggest extends FuzzySuggestModal<TFile> {
    constructor(
        app: App,
        private folder: string,
        private exclude_paths: string[],
        private type: 0 | 1 | 2,
        private use_selection: (entry: Omit<Parent, 'parents'>) => void
    ) {
        super(app);
    }

    getItems(): TFile[] {
        const folder = this.app.vault.getAbstractFileByPath(this.folder);

        if (!(folder instanceof TFolder)) {
            return [];
        }

        return folder.children
            .filter(
                (c) =>
                    c instanceof TFile && !this.exclude_paths.includes(c.path)
            )
            .sort(byStringProperty('name')) as TFile[];
    }

    getItemText(item: TFile): string {
        return item.basename;
    }

    onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
        this.use_selection({
            type: this.type,
            file_path: item.path,
            name: item.basename,
        });
    }
}
