import { Notice, Plugin, TFile, TFolder, PluginSettingTab, Setting, App } from 'obsidian';
import * as path from 'path';

export default class MyPlugin extends Plugin {
    settings: { folder: string };

    async onload() {
        await this.loadSettings();

        this.addCommand({
            id: 'rename-files',
            name: 'Rename Files',
            callback: () => this.renameFiles(),
        });

        this.addSettingTab(new MyPluginSettingTab(this.app, this));
    }

    async renameFiles() {
        // inside the folder
        const folder = this.app.vault.getAbstractFileByPath(this.settings.folder);
        if (!(folder instanceof TFolder)) {
            new Notice(`Folder ${this.settings.folder} not found.`);
            return;
        }

        const files = folder.children.filter(file => file instanceof TFile) as TFile[];
        const nonMdFiles = files.filter(file => !file.path.endsWith('.md'));
        // Renaming files
        for (const file of nonMdFiles) {
            const oldPath = file.path;
            const newPath = oldPath.replace(/ /g, '_');

            if (oldPath !== newPath) {
                try {
                    await this.app.vault.rename(file, newPath);

                    // Update links
				this.app.metadataCache.on('resolve', async () => {
					const fileCache = this.app.metadataCache.getFileCache(file);
					if (fileCache && fileCache.links) {
						for (const link of fileCache.links) {
							const linkedFile = this.app.metadataCache.getFirstLinkpathDest(link.link, file.path);
							if (linkedFile) {
								const newLink = linkedFile.path.replace(/ /g, '_');
								let content = await linkedFile.vault.read(linkedFile);
								content = content.replace(link.link, newLink);
								linkedFile.vault.modify(linkedFile, content);
							}
						}
					}
				});

                    new Notice(`Renamed ${path.basename(oldPath)} to ${path.basename(newPath)}`);
                } catch (err) {
                    console.error(`Error renaming ${oldPath} to ${newPath}:`, err);
                }
            }
        }
    }

    async loadSettings() {
        this.settings = Object.assign({ folder: '/' }, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class MyPluginSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName('Folder')
            .setDesc('Choose a folder to rename files in')
            .addText(text => text
                .setPlaceholder('/')
                .setValue(this.plugin.settings.folder)
                .onChange(async (value) => {
                    this.plugin.settings.folder = value;
                    await this.plugin.saveSettings();
                }));
    }
}