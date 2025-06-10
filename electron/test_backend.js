// electron/test_backend.js
import path from 'path';
import { spawn } from 'child_process';

let backendProcess;

function startBackend(backendApplicationPath) {
  const backendDir = path.dirname(backendApplicationPath); // 设置工作目录

  // 使用 spawn 启动后端，并设置 cwd（当前工作目录）
  backendProcess = spawn(backendApplicationPath, [], {
    cwd: backendDir,  // 设置工作目录为 'backend'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Background process output: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Background process error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Background process exits, exit code: ${code}`);
  });

  return backendProcess; // 返回后端进程对象，以便在其他地方使用
}

startBackend(path.resolve("../backend/MixtexBackend.exe")); // 替换为实际的后端应用程序路径