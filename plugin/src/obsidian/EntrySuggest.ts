import { App, FuzzySuggestModal, TFile, TFolder } from 'obsidian';
import type { EntryType, Parent } from '../types';
import { by_string_property, entry_type_to_folder_path } from '../helper';

export class EntrySuggest extends FuzzySuggestModal<TFile> {
    constructor(
        app: App,
        private type: EntryType,
        private exclude_paths: string[],
        private use_selection: (entry: Omit<Parent, 'parents'>) => void
    ) {
        super(app);
    }

    getItems(): TFile[] {
        const folder_path = entry_type_to_folder_path(this.type);
        const folder = this.app.vault.getAbstractFileByPath(folder_path);

        if (!(folder instanceof TFolder)) {
            return [];
        }

        return folder.children
            .filter(
                (c) =>
                    c instanceof TFile && !this.exclude_paths.includes(c.path)
            )
            .sort(by_string_property('name')) as TFile[];
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
