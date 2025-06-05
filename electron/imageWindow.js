import { BrowserWindow } from 'electron';
import path from 'path';
import fs from 'fs';

export function createImageWindow(imageData, imageFolder, __dirname) {
  if (!imageData || typeof imageData !== 'string') {
    console.error('Invalid image data');
    return;
  }

  // 1️⃣ 提取 base64 并写入临时图片
  const base64 = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const tempFileName = `preview_${Date.now()}.png`;
  if (!fs.existsSync(imageFolder)) {
    fs.mkdirSync(imageFolder, { recursive: true }); 
  }
  const filePath = path.join(imageFolder, tempFileName);

  fs.writeFileSync(filePath, buffer); // ✅ 保存成功

  // 2️⃣ 构建 file:// 路径（需编码）
  const imageUrl = `file://${filePath.replace(/\\/g, '/')}`;
  const safeURL = encodeURI(imageUrl); // 防止路径中有中文或空格

  // 3️⃣ 创建窗口
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

  // 4️⃣ 加载 preview.html 并传入图片路径
  imgWin.loadFile(path.join(__dirname, 'public/preview.html'), {
    query: { path: safeURL }
  });

  // 监听关闭事件，删除临时图片文件
  imgWin.on('closed', () => {
    // 异步删除，避免阻塞
    fs.unlink(filePath, (err) => {
      if (err) {
        console.warn('Failed to delete temp image:', filePath, err);
      }
    });
  });
}