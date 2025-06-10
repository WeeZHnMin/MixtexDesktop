// electron/ensurePandocExists.js

import fs from 'fs';
import { spawn } from 'child_process';

export function ensurePandocExists(pandocBin, sourceZip, extractTo) {
  if (fs.existsSync(pandocBin)) {
    return;
  }

  // Ensure extractTo folder exists
  if (!fs.existsSync(extractTo)) {
    fs.mkdirSync(extractTo, { recursive: true });
  }

  // Use built-in tar to extract .zip
  const tarProcess = spawn('tar', ['-xf', sourceZip, '-C', extractTo], {
    stdio: 'inherit',
    shell: false,
    windowsHide: true
  });

  tarProcess.on('exit', (code) => {
    if (code === 0) {
      console.log("Extraction complete via tar.");
    } else {
      console.error(`Extraction failed with exit code ${code}`);
    }
  });
}