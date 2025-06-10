// electron/trayManager.js
import path from 'path';
import { Tray, Menu, app } from 'electron';

// 创建托盘
export function createTray(mainWindow, backendProcess, __dirname) {
  const tray = new Tray(path.join(__dirname, 'assets/icon.ico'));

  const showMainWindow = () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  };

  const hideMainWindow = () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  };

  const quitApp = () => {
    app.isQuiting = true;
    if (backendProcess) backendProcess.kill();
    app.quit();
  };

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示主界面', click: showMainWindow },
    { label: '隐藏主界面', click: hideMainWindow },
    { label: '退出', click: quitApp }
  ]);

  tray.setToolTip('MixTex 应用');
  tray.setContextMenu(contextMenu);

  tray.on('double-click', showMainWindow);

  return tray;
}