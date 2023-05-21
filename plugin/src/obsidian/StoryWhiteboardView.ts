import { App, WorkspaceLeaf, TextFileView } from 'obsidian';
import Board from '../components/story_whiteboard/Board.svelte';

export class StoryWhiteboardView extends TextFileView {
    // Daten von mir erhalten, um sie in die Datei zu schreiben
    getViewData(): string {
        return JSON.stringify(this.content ? this.content : {});
    }

    content: any = null;

    // Daten von der Datei erhalten, um sie anzuzeigen
    setViewData(data: string, clear: boolean): void {
        this.content = data ? JSON.parse(data) : {};
    }

    clear(): void {
        console.log('+++ CLEAR');
    }

    view: Board;

    constructor(leaf: WorkspaceLeaf, private _app: App) {
        super(leaf);
        // TODO brauche kein _app, da leaf.view.app vorhanden ist?
    }

    static getViewTypeName() {
        return 'ok_story_whiteboard_view';
    }

    getViewType(): string {
        return 'ok_story_whiteboard_view';
    }

    getDisplayText(): string {
        return this.file?.basename ?? 'Story Whiteboard';
    }

    getIcon(): string {
        return 'krake';
    }

    async onOpen(): Promise<void> {
        this.view = new Board({
            target: this.contentEl,
            props: {
                get_content: () => this.content,
                set_content: (content: any) => {
                    this.content = content;
                    this.save();
                },
            },
        });
    }
}
