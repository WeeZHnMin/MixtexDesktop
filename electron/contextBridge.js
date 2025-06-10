import fs from 'fs';
import fsp from 'fs/promises';     // 用于 await fsp.readFile 等异步 API
import path from 'path';
import { spawn } from 'child_process';
import { clipboard, ipcMain } from 'electron';

import { createImageWindow } from './imageWindow.js'; // ✅ 引入图片预览窗口创建函数
import { openSaveFolder } from './openDocxFolder.js'; // ✅ 引入打开文件夹函数
import { clearSaveFolderWithConfirm } from './clearSaveFolder.js'; // 引入清理保存文件夹的函数
import { openHtmlInBrowser } from './openLatexIntro.js'; 

export function TexToDocxHandler(options) {
  const {
    pandocConfigFolder,  // 用于保存 .tex 文件的文件夹
    saveFolder,          // 转换后 .docx 文件保存路径
    pandocBin,           // pandoc.exe 的完整路径
    customDocxPath       // 参考样式模板 docx 文件路径
  } = options;

  ipcMain.handle('tex-to-docx', async (event, inputContent) => {
    let filename = "output"; // 默认文件名
    let content = `\\documentclass{article}
\\usepackage[UTF8]{ctex}
\\usepackage{amsmath}
\\begin{document}

${inputContent}

\\end{document}`;

    try {
      // 1. 确保输出文件夹存在
      if (!fs.existsSync(saveFolder)) {
        fs.mkdirSync(saveFolder, { recursive: true });
      }

      // 2. 保存 .tex 文件
      const texPath = path.join(pandocConfigFolder, filename + '.tex');
      let docxPath = path.join(saveFolder, filename + '.docx');

      let counter = 1;
      while (fs.existsSync(docxPath)) {
        docxPath = path.join(saveFolder, `${filename}(${counter}).docx`);
        counter++;
      }

      fs.writeFileSync(texPath, content, 'utf8');

      // 3. 构造 Pandoc 命令参数
      const args = [
        texPath,
        '-o', docxPath,
        '--reference-doc=' + customDocxPath,
        '--from=latex' // 明确指定输入格式为 LaTeX
      ];

      // 4. 调用 Pandoc 转换
      return await new Promise((resolve, reject) => {
        const pandoc = spawn(pandocBin, args);

        let stderr = '';
        pandoc.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        pandoc.on('close', (code) => {
          if (code === 0) {
            resolve({ success: true, docxPath });
          } else {
            reject(new Error(`Pandoc exited with code ${code}\n${stderr}`));
          }
        });
      });

    } catch (err) {
      console.error('Error in tex-to-docx:', err);
      throw err;
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

export function OpenLatexIntroHandler(__dirname) {
  ipcMain.handle('open-html-in-browser', async () => {
    try {
      openHtmlInBrowser(__dirname);
      return true;
    } catch (error) {
      return false;
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

export function copyTextToClipboard() {
  ipcMain.handle('copy-to-clipboard', async (event, text) => {
    try {
      clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}