// electron/openDocxFolder.js
import { shell } from 'electron';
import fs from 'fs/promises';

export async function openSaveFolder(saveFolder) {
  try {
    await fs.access(saveFolder).catch(async () => {
      await fs.mkdir(saveFolder, { recursive: true });
    });

    const result = await shell.openPath(saveFolder);
    if (result) {
      console.error('❌ Could not open the folder:', result);
    }
  } catch (err) {
    console.error('❌ Failed to open or create the folder:', err);
    throw err;
  }
}