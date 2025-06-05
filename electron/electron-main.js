// electron/electron-main.js
// ⚡️ Electron 主进程代码
import os from 'os';
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { TexToDocxHandler, 
  OpenImageWindowHandler, 
  OpenDocxFolderHandler, 
  ClearSaveFolderHandler,  
  BackendUrlHandler
} from "./contextBridge.js";
import { createTray } from './trayManager.js'; // ✅ 引入托盘管理模块
import { startBackend } from './backend.js';
import { ensurePandocExists } from './ensurePandocExists.js';


let tray;
let backendProcess;
let mainWindow = null;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const saveFolder = path.join(os.homedir(), 'MixTex-Output');
const imageFolder = path.join(saveFolder, 'MixTex-Preview');
const __dirname = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pandocFolder = path.join(__dirname, 'pandoc');
const pandocConfigFolder = path.join(pandocFolder, "custom-config");
const pandocBin = path.join(__dirname, 'pandoc', 'pandoc-3.7.0.2', 'pandoc.exe');
const unzipCmd = path.join(pandocConfigFolder, 'unzip.cmd'); 
const sourceFile = path.join(pandocFolder, 'pandoc-3.7.0.2-windows-x86_64.zip');
const toDocxCmd = path.join(pandocConfigFolder, 'run.cmd');
const customDocxPath = path.join(pandocConfigFolder, 'custom.docx');

const backendApplicationPath = path.join(__dirname, 'backend', 'MixtexBackend.exe');
const backendUrlJsonPath = path.join(__dirname, 'backend', 'config.json');

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

  mainWindow.loadURL('http://localhost:5173');
  // if (!fs.existsSync(indexPath)) {
  //   console.error('index.html not found at', indexPath);
  // }
  // mainWindow.loadFile(path.join(__dirname, 'web-dist/index.html'));
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null; // 💡窗口关闭后清空引用
  });

  // 关键：拦截所有a[target="_blank"]，外部链接在系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
}

app.whenReady().then(() => {
  backendProcess = startBackend(__dirname, backendApplicationPath); // 启动后端进程
  TexToDocxHandler({  //生成docx文件的功能
    pandocConfigFolder,
    saveFolder,
    pandocBin,
    toDocxCmd,
    customDocxPath,
  });

  ensurePandocExists(pandocBin, unzipCmd, sourceFile, pandocFolder); // 确保 Pandoc 已解压
  OpenImageWindowHandler(imageFolder, __dirname); // 打开图片预览窗口的功能
  OpenDocxFolderHandler(saveFolder); // 打开保存文件夹的功能
  ClearSaveFolderHandler(saveFolder);
  BackendUrlHandler(backendUrlJsonPath); // 获取后端 URL 的功能

  
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