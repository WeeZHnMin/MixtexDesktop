// build/remove-unwanted.js
import fs from 'fs';
import path from 'path';

export default async function (context) {
  const appPath = context.appOutDir;

  // 1️⃣ 要移除的根目录文件
  const filesToRemove = [
    'LICENSE.electron.txt',
    'LICENSES.chromium.html'
  ];

  for (const file of filesToRemove) {
    const fullPath = path.join(appPath, file);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath);
    }
  }

  // 2️⃣ locales/ 目录处理
  const localesDir = path.join(appPath, 'locales');
  const keepList = ['en-GB.pak', 'zh-CN.pak', 'en-US.pak'];
  const tempDir = path.join(appPath, '__keep_locales__');

  if (fs.existsSync(localesDir)) {
    // 创建临时目录
    fs.mkdirSync(tempDir, { recursive: true });

    // 把保留的 pak 文件暂时迁移出去
    for (const file of keepList) {
      const src = path.join(localesDir, file);
      const dest = path.join(tempDir, file);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`📤 Moved out: ${file}`);
      }
    }

    // 清空 locales 文件夹
    const allFiles = fs.readdirSync(localesDir);
    for (const file of allFiles) {
      fs.rmSync(path.join(localesDir, file));
    }

    // 把保留文件迁移回 locales
    for (const file of keepList) {
      const src = path.join(tempDir, file);
      const dest = path.join(localesDir, file);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`📥 Restored: ${file}`);
      }
    }

    // 删除临时目录
    fs.rmdirSync(tempDir);
  }
}
