import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true, // 是否显示原生窗口框架，包括关闭/最小化按钮
    autoHideMenuBar: true, // ✅ 自动隐藏菜单栏
    webPreferences: {
      // 如果你没有 preload.js，可以先注释掉这一行
      // preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL('http://localhost:5173'); // dev 模式下访问 Vite 服务
  // win.loadFile('dist/index.html'); 生产环境使用
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
