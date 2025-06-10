// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openImageWindow: (imageData) => ipcRenderer.invoke('open-image-window', imageData),
  texToDocx: (inputContent) => ipcRenderer.invoke('tex-to-docx', inputContent),
  openDocxFolder: () => ipcRenderer.invoke('open-docx-folder'),
  clearSaveFolder: () => ipcRenderer.invoke('clear-save-folder'),
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  copyTextToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  openHtmlInBrowser: () => ipcRenderer.invoke('open-html-in-browser')
});