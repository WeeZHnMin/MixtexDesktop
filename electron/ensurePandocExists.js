import fs from 'fs';
import { spawn } from 'child_process';

export function ensurePandocExists(pandocBin, unzipCmd, sourceFile, pandocFolder) {
    if (fs.existsSync(pandocBin)) {
        return;
    }

  const unzipProcess = spawn('cmd.exe', ['/c', unzipCmd, sourceFile, pandocFolder], {
    stdio: 'inherit',
    shell: true
  });

  unzipProcess.on('exit', (code) => {
    if (code === 0) {
      console.log("Extraction complete.");
    } else {
      console.error(`Extraction failed with exit code ${code}`);
    }
  });
}