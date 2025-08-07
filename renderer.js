document.addEventListener('DOMContentLoaded', () => {
    const appTitle = document.getElementById('app-title');
    const toggleButton = document.getElementById('toggle-button');
    const fileLabel = document.getElementById('file-label');
    const filePicker = document.getElementById('filePicker');
    const keyLabel = document.getElementById('key-label');
    const actionButton = document.getElementById('action-button');
    const keyInput = document.getElementById('keyInput');
    const loader = document.getElementById('loader');

    let currentMode = 'decrypt'; // Can be 'decrypt' or 'encrypt'

    function updateUIForMode() {
        if (currentMode === 'decrypt') {
            appTitle.innerText = 'File Decrypter';
            toggleButton.innerText = 'Switch to Encrypt';
            fileLabel.innerText = 'Choose a .enc file:';
            filePicker.accept = '.enc';
            keyLabel.innerText = 'Decryption Key:';
            actionButton.innerText = 'Decrypt File';
        } else {
            appTitle.innerText = 'File Encrypter';
            toggleButton.innerText = 'Switch to Decrypt';
            fileLabel.innerText = 'Choose a file to encrypt:';
            filePicker.accept = '*/*';
            keyLabel.innerText = 'Encryption Key:';
            actionButton.innerText = 'Encrypt File';
        }
    }

    toggleButton.addEventListener('click', () => {
        currentMode = (currentMode === 'decrypt') ? 'encrypt' : 'decrypt';
        updateUIForMode();
    });

    actionButton.addEventListener('click', async () => {
        if (filePicker.files.length === 0) {
            alert('Please select a file.');
            return;
        }
        if (!keyInput.value) {
            alert('Please enter a key.');
            return;
        }

        const filePath = filePicker.files[0].path;
        const key = keyInput.value;

        loader.style.display = 'block';

        let result;
        if (currentMode === 'decrypt') {
            result = await window.electronAPI.decryptFile({ filePath, decryptionKey: key });
        } else {
            result = await window.electronAPI.encryptFile({ filePath, encryptionKey: key });
        }
        
        loader.style.display = 'none';

        if (result.success) {
            console.log(`Operation successful. Path: ${result.path}`);
        } else {
            console.error(`Operation failed: ${result.error}`);
        }
    });

    // Initialize the UI on startup
    updateUIForMode();
});
