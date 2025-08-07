const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

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
    const downloadsPath = app.getPath("downloads");
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
    const downloadsPath = app.getPath("downloads");
    const savePath = path.join(downloadsPath, originalFilename);

    // save this fine
    fs.writeFileSync(savePath, plaintext);

    dialog.showMessageBox({
      type: "info",
      title: "Success",
      message: `File decrypted and saved to: ${savePath}`,
    });

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
