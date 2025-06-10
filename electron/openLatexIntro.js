import { BrowserWindow,shell } from 'electron';
import path from 'path';
import fs from 'fs';

export function openHtmlInBrowser(__dirname) {

    const imgWin = new BrowserWindow({
      width: 800,
      height: 600,
      title: '',
      frame: true,
      icon: path.join(__dirname, 'assets/icon.ico'), // 这里指定你的图标文件路径
      autoHideMenuBar: true,
      webPreferences: {
        contextIsolation: true,
      }
    });

  imgWin.webContents.setWindowOpenHandler(({ url }) => {
    // ✅ 外部链接用浏览器打开
    if (/^https?:\/\//.test(url)) {
        shell.openExternal(url);
        return { action: 'deny' };
    }

    // ✅ 打开 PDF 文件并隐藏菜单栏
    if (url.endsWith('.pdf')) {
        const pdfPath = decodeURIComponent(url.replace('file:///', '').replace('file://', '')); // 解码并处理路径

        if (fs.existsSync(pdfPath)) {
        const pdfWin = new BrowserWindow({
            width: 800,
            height: 600,
            autoHideMenuBar: true,
            webPreferences: {
            contextIsolation: true,
            }
        });

        // 👇 注意：用 file 协议打开本地 PDF
        pdfWin.loadURL(`file://${pdfPath}`);

        return { action: 'deny' }; // ❗ 阻止默认新窗口
        }
    }

    // ✅ 默认允许
    return { action: 'allow' };
    });


    imgWin.loadFile(path.join(__dirname, 'public/latexIntroduce.html'));
}