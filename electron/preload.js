// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openImageWindow: (imageData) => ipcRenderer.invoke('open-image-window', imageData),
  texToDocx: (filename, content) => ipcRenderer.invoke('tex-to-docx', filename, content),
  openDocxFolder: () => ipcRenderer.invoke('open-docx-folder'),
  clearSaveFolder: () => ipcRenderer.invoke('clear-save-folder'),
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
});