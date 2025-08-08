const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ini = require('ini'); 

function getUniqueFilePath(savePath) {
  // Returns a unique filename if a file already exists
  let base = path.basename(savePath, path.extname(savePath));
  let ext = path.extname(savePath);
  let dir = path.dirname(savePath);
  let counter = 1;
  let candidate = savePath;
  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base}_${counter}${ext}`);
    counter++;
  }
  return candidate;
}

function getDownloadPath() {
  const isDev = !app.isPackaged;
  const configPath = path.join(isDev ? '.' : process.resourcesPath, '../..', 'config.ini');

  if (fs.existsSync(configPath)) {
    try {
      const config = ini.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config.Settings && config.Settings.downloadPath) {
        return config.Settings.downloadPath;
      }
    } catch (e) {
      console.error("Could not read config.ini:", e);
    }
  }
  
  // Fallback to default downloads path
  return app.getPath("downloads");
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Prepare the encryption key (32 bytes for AES-256)
function prepareKey(rawKey) {
  return crypto
    .createHash("sha256")
    .update(String(rawKey))
    .digest("base64")
    .substr(0, 32);
}

ipcMain.handle("encrypt-file", async (event, { filePath, encryptionKey }) => {
  const preparedKey = prepareKey(encryptionKey);

  try {
    const plaintext = fs.readFileSync(filePath);
    const iv = crypto.randomBytes(16); // Generate a secure random IV

    const cipher = crypto.createCipheriv("aes-256-cbc", preparedKey, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

    // Combine IV + ciphertext
    const finalPayload = Buffer.concat([iv, encrypted]);

    // Save with .enc extension
    const downloadsPath = getDownloadPath();
    const savePath = path.join(downloadsPath, path.basename(filePath) + ".enc");

    fs.writeFileSync(savePath, finalPayload);

    dialog.showMessageBox({
      type: "info",
      title: "Success",
      message: `File encrypted and saved to: ${savePath}`,
    });

    return { success: true, path: savePath };
  } catch (error) {
    console.error("Encryption failed:", error);
    dialog.showMessageBox({
      type: "error",
      title: "Encryption Failed",
      message: "Could not encrypt the file.",
    });
    return { success: false, error: error.message };
  }
});

ipcMain.handle("decrypt-file", async (event, { filePath, decryptionKey }) => {
  const preparedKey = prepareKey(decryptionKey);

  try {
    const payload = fs.readFileSync(filePath);
    const iv = payload.subarray(0, 16);
    const ciphertext = payload.subarray(16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", preparedKey, iv);
    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    const originalFilename = path.basename(filePath, ".enc");
    const downloadsPath = getDownloadPath();
    let savePath = path.join(downloadsPath, originalFilename);

    // Ensure no overwrite
    savePath = getUniqueFilePath(savePath);
    fs.writeFileSync(savePath, plaintext);

    shell.openPath(savePath);

    return { success: true, path: savePath };
  } catch (error) {
    console.error("Decryption failed:", error);
    dialog.showMessageBox({
      type: "error",
      title: "Decryption Failed",
      message: "Could not decrypt the file. Please check the key and file.",
    });
    return { success: false, error: error.message };
  }
});
