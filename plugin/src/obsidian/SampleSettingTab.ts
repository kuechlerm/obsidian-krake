import { App, PluginSettingTab } from 'obsidian';
import type ObsidianKrakePlugin from '../main';

export class SampleSettingTab extends PluginSettingTab {
    plugin: ObsidianKrakePlugin;

    constructor(app: App, plugin: ObsidianKrakePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Settings for my awesome plugin.' });

        // new Setting(containerEl)
        //     .setName('Setting #1')
        //     .setDesc('It\'s a secret')
        //     .addText((text) =>
        //         text
        //             .setPlaceholder('Enter your secret')
        //             .setValue(this.plugin.settings.mySetting)
        //             .onChange(async (value) => {
        //                 this.plugin.settings.mySetting = value;
        //                 await this.plugin.saveSettings();
        //             })
        //     );
    }
}
