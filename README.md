# WhatsApp Sniffer

🕵️ A Chrome extension that intercepts voice messages and other media files on WhatsApp Web. It captures paste, drag-and-drop, file input, microphone recordings, and blob audio playback, then sends them to a local server.

## ⚙️ Features

- Intercepts `paste`, `drop`, and `<input type="file">` events
- Captures and saves microphone audio via `getUserMedia`
- Hooks into blob-based audio playback
- Sends all captured media to a local Node.js server
- Saves files to `~/Desktop/WhatsAppCaptures`

## 🗂 Project Structure

```
sniffer/
├── extension/
│   ├── content.js            # Main content script
│   ├── injectMicTap.js       # Microphone capture logic
│   ├── injectPlayHook.js     # Audio playback hook
│   └── manifest.json         # Chrome extension manifest
├── server.js                 # Local Node.js server
├── package.json              # Dependencies (Express)
└── package-lock.json
```

## 🚀 Installation

### 1. Load the Extension

1. Go to `chrome://extensions/`
2. Enable **Developer mode**
3. Click "Load unpacked"
4. Select the `extension/` folder

### 2. Start the Server

Install dependencies and launch the server:

```bash
npm install
node server.js
```

The server listens on `http://localhost:3131`  
Captured files are saved to `Desktop/WhatsAppCaptures`.

## 🔒 Notes

- The extension works only on `https://web.whatsapp.com/`
- All files are saved locally and never sent to the internet
- For better security, restrict `Access-Control-Allow-Origin` in `server.js`

## 📄 License

MIT — free to use, modify, and distribute.
