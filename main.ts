import {  Notice, Plugin } from 'obsidian';
import * as path from 'path';

export default class MyPlugin extends Plugin {


    async renameFiles() {
        // Get all the files in the vault
        const files = this.app.vault.getFiles();

        // Renaming
        for (const file of files) {
            const oldPath = file.path;
            const newPath = oldPath.replace(/ /g, '_');

            if (oldPath !== newPath) {
                try {
                    await this.app.vault.rename(file, newPath);
                    new Notice(`Renamed ${path.basename(oldPath)} to ${path.basename(newPath)}`);
                } catch (err) {
                    console.error(`Error renaming ${oldPath} to ${newPath}:`, err);
                }
            }
        }
    }


}