# File Encrypter \& Decrypter

A fast, privacy-first desktop app to securely encrypt and decrypt files with a simple, modern UI and a sci‑fi theme. It supports both light and dark themes with a persistent toggle, integrates a single action button with animated progress feedback, and lets you switch between Encrypt and Decrypt modes via a dedicated toggle button.

This app is built with Electron and implements secure, authenticated encryption so your files remain confidential and tamper‑evident. Encrypted files are saved with a .enc extension; decrypted files are written to your configured Downloads folder and opened with the system’s default app.

## Why use this app?

- Strong, modern cryptography (AES‑256‑GCM) for both confidentiality and integrity.
- Simple workflow: pick a file + enter a key → click Encrypt/Decrypt.
- Prevents accidental overwrite by auto‑renaming outputs if the destination filename already exists.
- After decryption, opens the result in your default viewer (no extra clicks).
- User‑friendly UI with:
    - Mode toggle (Encrypt/Decrypt)
    - Light/Dark theme toggle (remembers your choice)
    - Sci‑fi visual style and animated action button (no spinner)
- Packaged installer for Windows with an interactive setup:
    - Choose install directory
    - Choose default Downloads directory used by the app


## How it protects your data

- Algorithm: AES‑256‑GCM (Authenticated Encryption with Associated Data)
    - 256‑bit key derived directly from your passphrase using SHA‑256.
    - Random IV generated per file to ensure non‑deterministic ciphertext.
    - Authentication Tag (GCM tag) included to detect any modification/tampering.
- File format of .enc:
    - First 16 bytes: IV
    - Next 16 bytes: GCM Authentication Tag
    - Remainder: Ciphertext
- On decryption:
    - The app verifies the Authentication Tag.
    - If the ciphertext or IV were changed, decryption fails and no corrupted output is produced.

Note: In earlier CBC (AES‑256‑CBC) designs, bit‑flipping attacks could change plaintext in predictable ways without knowing the key. Using AES‑GCM prevents this by authenticating the data end‑to‑end.

## Features

- Encrypt any file to .enc using AES‑256‑GCM.
- Decrypt .enc files back to their original formats.
- Auto‑rename outputs to avoid overwriting existing files.
- Open decrypted files automatically via the OS default app.
- Clean, sci‑fi UI:
    - Dedicated mode toggle button with lock/unlock icons.
    - Persistent light/dark theme toggle (saved locally).
    - Animated primary button shows “filling” progress on action and success/failure state.
- Windows installer (NSIS) with custom page to choose your default Downloads path used by the app.


## Screenshots

- Coming soon (add images of Encrypt mode, Decrypt mode, light/dark themes, and the animated button).


## Getting started (development)

Prerequisites:

- Node.js (LTS recommended)
- npm

Install and run:

```bash
npm install
npm start
```

Build an installer (Windows NSIS):

```bash
npm run dist
```

This produces an installer in the dist folder.

## Installation (Windows)

- Run the generated Setup .exe.
- You can choose:
    - Install directory
    - Default Downloads directory (used by the app to save outputs)
- After install, launch “File Encrypter \& Decrypter” from the Start Menu or desktop shortcut.


## Usage

1. Launch the app.
2. Select mode:
    - Click the “Switch Mode” button (lock/unlock icon) to toggle Encrypt vs Decrypt.
3. Select file:
    - Encrypt mode: choose any file.
    - Decrypt mode: choose a .enc file.
4. Enter key:
    - Type your passphrase (remember it—there is no recovery).
5. Click the main action button:
    - The button animates as the operation runs.
    - On success, it briefly shows a success color; on failure, a failure color.
    - For decryption, the output is opened automatically with your default app.
6. Outputs:
    - Encrypt mode: saves fileName.ext.enc in your configured Downloads folder.
    - Decrypt mode: saves the original fileName.ext in your configured Downloads folder, auto‑renamed if needed.

Tip: You can press Enter in the key field to trigger the action.

## Configuration

- Theme preference:
    - Toggled via the theme slider in the header.
    - Saved locally and restored on next launch.
- Default Downloads path:
    - Chosen during installation via the installer’s custom page.
    - Stored in a config.ini under the app’s installation directory.
    - If missing, the app falls back to the OS default Downloads folder.


## App icon

- Custom icon files live under build/icon.png and are bundled into the app and installer.
- Update build/icon.png to change the app/installer icon.


## Security notes and best practices

- Keep your passphrase secret:
    - Anyone with the passphrase can decrypt your files.
    - There is no recovery if you lose it.
- Avoid reusing weak keys:
    - Use a strong, unique passphrase for best protection.
- Verify recipients:
    - Only share .enc files and passphrases through secure channels (avoid email/IM in plain text).
- Integrity:
    - AES‑GCM ensures tamper detection; do not ignore decryption errors.
- Backups:
    - Keep backups of original files and .enc files separately as needed for your workflow.


## Troubleshooting

- Decryption failed (wrong key/tampered file):
    - Ensure the passphrase is correct and corresponds to the one used for encryption.
    - Confirm the .enc file wasn’t modified or truncated during transfer.
- Cannot create installer (Windows):
    - Run the build with elevated privileges or enable Windows Developer Mode to allow symlink operations during packaging.
- Default viewer didn’t open:
    - The app uses the OS default associated application; ensure the file type has a default app set in your OS.


## Scripts

- Start in development:

```bash
npm start
```

- Package installer:

```bash
npm run dist
```


## Tech stack

- Electron (desktop shell)
- Node.js crypto (AES‑256‑GCM)
- NSIS installer (customizable installer with directory selection and custom page)
- Vanilla HTML/CSS/JS (custom sci‑fi UI, theme system, animations)


## Project structure (simplified)

```
project/
├─ build/
│  ├─ icon.png
│  └─ installer.nsh
├─ dist/               # build outputs (ignored in git)
├─ main.js             # Electron main process, crypto logic, IPC, shell integration
├─ preload.js          # secure bridge to expose IPC APIs
├─ index.html          # UI
├─ renderer.js         # UI logic: modes, theme, animations, actions
├─ package.json
└─ README.md
```


## Roadmap

- Cross‑platform installers (macOS .dmg, Linux AppImage/deb/rpm)
- Key handling enhancements (optional key manager, hardware key support)
- Drag‑and‑drop files
- Batch encryption/decryption
- Checksums and exportable logs


## License

MIT (or your preferred license).

## Disclaimer

This software is provided “as is,” without warranty of any kind. Use at your own risk. Always test your workflow and maintain backups.
