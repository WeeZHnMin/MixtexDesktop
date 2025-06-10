// electron/electron-main.js
// ⚡️ Electron 主进程代码
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { TexToDocxHandler, 
  OpenImageWindowHandler, 
  OpenDocxFolderHandler, 
  ClearSaveFolderHandler,  
  BackendUrlHandler,
  copyTextToClipboard,
  OpenLatexIntroHandler
} from "./contextBridge.js";
import { createTray } from './trayManager.js';
import { startBackend } from './backend.js';
import { ensurePandocExists } from './ensurePandocExists.js';

let tray;
let backendProcess;
let mainWindow = null;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const __dirname = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const isDev = !app.isPackaged;
const pandocFolder = isDev ? path.join(__dirname, 'pandoc'): path.join(process.resourcesPath, 'app.asar.unpacked', 'pandoc');
const backendFolder = isDev ? path.join(__dirname, 'backend'): path.join(process.resourcesPath, 'app.asar.unpacked', 'backend');

const saveFolder = path.join(pandocFolder, 'MixTex-Output');
const imageFolder = path.join(saveFolder, 'MixTex-Preview');

const pandocConfigFolder = path.join(pandocFolder, "custom-config");
const pandocBin = path.join(pandocFolder, 'pandoc-3.7.0.2', 'pandoc.exe');
const sourceFile = path.join(pandocFolder, 'pandoc-3.7.0.2-windows-x86_64.zip');
const customDocxPath = path.join(pandocConfigFolder, 'custom.docx');

const backendApplicationPath = path.join(backendFolder, 'MixtexBackend.exe');
const backendUrlJsonPath = path.join(backendFolder, 'config.json');

// 创建主窗口
function createWindow () {
  if (mainWindow) {
    mainWindow.show();
    return;
  }

  mainWindow  = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,   // ✅ 设置最小宽度
    minHeight: 600,  // ✅ 设置最小高度
    frame: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'assets/icon.ico'), // 这里指定你的图标文件路径
    webPreferences: {
      preload: path.join(currentDir, 'preload.js'), // ✅ 使用 preload 脚本
      nodeIntegration: false,
      contextIsolation: true, // ✅ 安全模式，配合 preload 使用
    }
  });

  // mainWindow.loadURL('http://localhost:5173');
  // if (!fs.existsSync(indexPath)) {
  //   console.error('index.html not found at', indexPath);
  // }
  mainWindow.loadFile(path.join(__dirname, 'web-dist/index.html'));
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null; // 💡窗口关闭后清空引用
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
}

app.whenReady().then(() => {
  backendProcess = startBackend(backendApplicationPath); // 启动后端进程
  TexToDocxHandler({  //生成docx文件的功能
    pandocConfigFolder,
    saveFolder,
    pandocBin,
    customDocxPath,
  });

  ensurePandocExists(pandocBin, sourceFile, pandocFolder); // 确保 Pandoc 已解压
  OpenImageWindowHandler(imageFolder, __dirname); // 打开图片预览窗口的功能
  OpenDocxFolderHandler(saveFolder); // 打开保存文件夹的功能
  ClearSaveFolderHandler(saveFolder);
  BackendUrlHandler(backendUrlJsonPath); // 获取后端 URL 的功能
  copyTextToClipboard(); // 复制文本到剪贴板的功能
  OpenLatexIntroHandler(__dirname); 

  
  createWindow(); // 1️⃣ 应用准备好后创建主窗口
  mainWindow.once('ready-to-show', () => {
    tray = createTray(mainWindow, backendProcess, __dirname); // 等窗口准备好再创建托盘
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow(); // 2️⃣ macOS 下点击 Dock 图标时，如果没有窗口，就重新创建窗口
  });
});

app.on('window-all-closed', async () => {
  try {
    // 删除 MixTex-Preview 文件夹及其内容
    await fs.rm(imageFolder, { recursive: true, force: true });
  } catch (err) {
    console.error(`Fail to delete ImageFolder: ${imageFolder}`, err);
  }

  if (process.platform !== 'darwin') {
    // 退出时关闭后端进程
    if (backendProcess) {
      backendProcess.kill();
      console.log('后台进程已终止');
    }
    app.quit();
  }
});