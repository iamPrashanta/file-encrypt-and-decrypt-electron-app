document.addEventListener("DOMContentLoaded", () => {
  // UI Elements
  const appTitle = document.getElementById("app-title");
  const fileLabelText = document.getElementById("file-label-text");
  const filePicker = document.getElementById("filePicker");
  const fileNameDisplay = document.getElementById("file-name");
  const keyLabel = document.getElementById("key-label");
  const actionButton = document.getElementById("action-button");
  const actionButtonText = actionButton.querySelector("span");
  const keyInput = document.getElementById("keyInput");
  const themeSlider = document.getElementById("theme-slider");
  const toggleModeButton = document.getElementById("toggle-mode-button"); // Get the new button

  let currentMode = "decrypt";
  let isProcessing = false;

  // --- Theme Management ---
  function applyTheme(theme) {
    if (theme === "light") {
      document.body.classList.add("light-theme");
      themeSlider.checked = true;
    } else {
      document.body.classList.remove("light-theme");
      themeSlider.checked = false;
    }
  }

  themeSlider.addEventListener("change", () => {
    const newTheme = themeSlider.checked ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  });

  // --- Form and UI Management ---
  function resetForm() {
    filePicker.value = "";
    keyInput.value = "";
    fileNameDisplay.textContent = "No file selected";
  }

  function updateUIForMode() {
    if (currentMode === "decrypt") {
      appTitle.innerText = "File Decrypter";
      fileLabelText.innerText = "Choose a .enc file";
      filePicker.accept = ".enc";
      keyLabel.innerText = "Decryption Key:";
      actionButtonText.innerText = "Decrypt File";
    } else {
      appTitle.innerText = "File Encrypter";
      fileLabelText.innerText = "Choose any file";
      filePicker.accept = "*/*";
      keyLabel.innerText = "Encryption Key:";
      actionButtonText.innerText = "Encrypt File";
    }
    resetForm();
  }

  filePicker.addEventListener("change", () => {
    if (filePicker.files.length > 0) {
      fileNameDisplay.textContent = filePicker.files[0].name;
    } else {
      fileNameDisplay.textContent = "No file selected";
    }
  });

  // --- Main Action Logic ---
  async function handleAction() {
    if (isProcessing) return;

    if (filePicker.files.length === 0) {
      alert("Please select a file.");
      return;
    }
    if (!keyInput.value) {
      alert("Please enter a key.");
      return;
    }

    isProcessing = true;
    actionButton.classList.add("loading");
    actionButton.disabled = true;

    const filePath = filePicker.files[0].path;
    const key = keyInput.value;

    let result;
    if (currentMode === "decrypt") {
      result = await window.electronAPI.decryptFile({
        filePath,
        decryptionKey: key,
      });
    } else {
      result = await window.electronAPI.encryptFile({
        filePath,
        encryptionKey: key,
      });
    }

    actionButton.classList.remove("loading");
    actionButton.classList.add(result.success ? "success" : "failed");

    setTimeout(() => {
      actionButton.classList.remove("success", "failed");
      actionButton.disabled = false;
      isProcessing = false;
      if (result.success) {
        resetForm();
      }
    }, 1500);
  }

  actionButton.addEventListener("click", handleAction);
  keyInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAction();
    }
  });

  // NEW: Use the visible button to toggle the mode
  toggleModeButton.addEventListener("click", () => {
    currentMode = currentMode === "decrypt" ? "encrypt" : "decrypt";
    updateUIForMode();
  });

  // --- Initialization ---
  const savedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(savedTheme);
  updateUIForMode();
});
