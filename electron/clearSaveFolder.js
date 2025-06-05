// electron/clearSaveFolder.js

import { dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export async function clearSaveFolderWithConfirm(saveFolder, browserWindow) {
  // Show a confirmation dialog to the user
  const { response } = await dialog.showMessageBox(browserWindow, {
    type: 'warning',
    buttons: ['Yes', 'No'],
    defaultId: 1,
    cancelId: 1,
    title: 'Mixtex Warning',
    message: `确定删除 ${saveFolder} 下的文件?删除后不可恢复`
  });

  if (response === 0) { // User clicked 'Yes'
    try {
      const entries = await fs.readdir(saveFolder, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(saveFolder, entry.name);
        if (entry.isDirectory()) {
          await fs.rm(fullPath, { recursive: true, force: true });
        } else {
          await fs.unlink(fullPath);
        }
      }

      return true;
    } catch (err) {
      throw err;
    }
  } else {
    return false;
  }
}
