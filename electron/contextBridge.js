import fs from 'fs';
import fsp from 'fs/promises';     // 用于 await fsp.readFile 等异步 API
import path from 'path';
import { spawn } from 'child_process';
import { ipcMain } from 'electron';

import { createImageWindow } from './imageWindow.js'; // ✅ 引入图片预览窗口创建函数
import { openSaveFolder } from './openDocxFolder.js'; // ✅ 引入打开文件夹函数
import { clearSaveFolderWithConfirm } from './clearSaveFolder.js'; // 引入清理保存文件夹的函数

export function TexToDocxHandler(options) {
  const {
    pandocConfigFolder,
    saveFolder,
    pandocBin,
    toDocxCmd,
    customDocxPath,
  } = options;

  ipcMain.handle('tex-to-docx', async (event, filename, content) => {
    try {
      // 1. 创建目录
      if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
      }

      // 2. 保存 tex 文件
      const texPath = path.join(pandocConfigFolder, filename + '.tex');
      let docxPath = path.join(saveFolder, filename + '.docx');
      let counter = 1;
      while (fs.existsSync(docxPath)) {
        // 如果文件已存在，修改文件名
        docxPath = path.join(saveFolder, `${filename}(${counter}).docx`);
        counter++;
      }

      fs.writeFileSync(texPath, content, 'utf8');

      // 3. 运行 run.cmd
      return await new Promise((resolve, reject) => {
        const args = [texPath, docxPath, pandocBin, customDocxPath];

        const child = spawn(toDocxCmd, args, { shell: true });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', (code) => {
          if (code === 0) {
            resolve(`✅ 转换成功！\n输出路径: ${docxPath}`);
          } else {
            reject(new Error(`❌ Pandoc 转换失败(code: ${code})\n${stderr}`));
          }
        });
      });

    } catch (err) {
      throw new Error('tex-to-docx 出错: ' + err.message);
    }
  });
}

export function OpenImageWindowHandler(imageFolder, __dirname) {
  ipcMain.handle('open-image-window', async (event, imageData) => {
    try {
      createImageWindow(imageData, imageFolder, __dirname);
    } catch (error) {
    }
  });
}

export function OpenDocxFolderHandler(saveFolder) {
  ipcMain.handle('open-docx-folder', async () => {
    try {
      await openSaveFolder(saveFolder);
      return true;
    } catch (error) {
      return false;
    }
  });
}

export function ClearSaveFolderHandler(saveFolder) {
  ipcMain.handle('clear-save-folder', async (event) => {
    const browserWindow = event.sender.getOwnerBrowserWindow();
    try {
      const result = await clearSaveFolderWithConfirm(saveFolder, browserWindow);
      return result;
    } catch (error) {
      return false;
    }
  });
}

export function BackendUrlHandler(jsonPath) {
  ipcMain.handle('get-backend-url', async () => {
    try {
      const raw = await fsp.readFile(jsonPath, 'utf-8');
      const json = JSON.parse(raw);
      const backendUrl = json.backend_url || null;

      if (backendUrl) {
        await fsp.unlink(jsonPath);
      }

      return backendUrl;
    } catch (err) {
      return null;
    }
  });
}
