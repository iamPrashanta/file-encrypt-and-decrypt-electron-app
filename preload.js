const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  encryptFile: (data) => ipcRenderer.invoke('encrypt-file', data), // New
  decryptFile: (data) => ipcRenderer.invoke('decrypt-file', data)
});
