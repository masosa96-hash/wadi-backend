# PHASE 7: ELECTRON DESKTOP APP - IMPLEMENTATION GUIDE

## Overview
This phase wraps the WADI web application in an Electron desktop application for Windows and macOS.

## Architecture

### Project Structure
```
wadi-desktop/
├── package.json
├── electron/
│   ├── main.ts           # Main process
│   ├── preload.ts        # Preload script (security)
│   └── menu.ts           # Application menu
├── electron-builder.json # Build configuration
└── resources/
    ├── icon.png
    ├── icon.icns         # macOS icon
    └── icon.ico          # Windows icon
```

## Implementation Steps

### 1. Install Dependencies
```bash
cd wadi-desktop
pnpm init
pnpm add electron electron-builder
pnpm add -D @types/node typescript
```

### 2. Main Process (electron/main.ts)
```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    icon: path.join(__dirname, '../resources/icon.png')
  });

  // Load frontend
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers for file system access
ipcMain.handle('fs:selectFile', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Documents', extensions: ['txt', 'pdf', 'md'] },
      { name: 'Data', extensions: ['json', 'csv'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  return result.filePaths[0];
});

ipcMain.handle('fs:readFile', async (event, filePath: string) => {
  const fs = require('fs').promises;
  return await fs.readFile(filePath, 'utf-8');
});
```

### 3. Preload Script (electron/preload.ts)
```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe API to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  selectFile: () => ipcRenderer.invoke('fs:selectFile'),
  readFile: (filePath: string) => ipcRenderer.invoke('fs:readFile', filePath),
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});
```

### 4. Package.json
```json
{
  "name": "wadi-desktop",
  "version": "1.0.0",
  "main": "dist/electron/main.js",
  "scripts": {
    "dev": "electron .",
    "build": "tsc && electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac"
  },
  "build": {
    "appId": "com.wadi.desktop",
    "productName": "WADI",
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "resources/**/*"
    ],
    "mac": {
      "target": "dmg",
      "icon": "resources/icon.icns",
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": "nsis",
      "icon": "resources/icon.ico"
    },
    "linux": {
      "target": "AppImage",
      "icon": "resources/icon.png",
      "category": "Development"
    }
  }
}
```

### 5. TypeScript Configuration (tsconfig.json)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./electron",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "electron"]
  },
  "include": ["electron/**/*"],
  "exclude": ["node_modules"]
}
```

## Features

### Desktop-Specific Features
1. **Native File System Access**
   - File picker dialog
   - Read/write local files
   - Drag and drop support

2. **System Integration**
   - Native notifications
   - System tray icon
   - Global keyboard shortcuts

3. **Offline Support**
   - Local cache
   - Offline mode indicator
   - Queue for pending operations

4. **Auto-Updates**
```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
autoUpdater.on('update-available', () => {
  // Notify user
});
```

### Frontend Integration
```typescript
// In React components
if (window.electronAPI) {
  const filePath = await window.electronAPI.selectFile();
  const content = await window.electronAPI.readFile(filePath);
}
```

## Security Considerations

### 1. Context Isolation
- Always use `contextIsolation: true`
- Use preload scripts for IPC

### 2. Disable Node Integration
```typescript
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true
}
```

### 3. Content Security Policy
```typescript
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"]
    }
  });
});
```

## Build Process

### Development
```bash
# Terminal 1: Start backend
cd apps/api && pnpm dev

# Terminal 2: Start frontend
cd apps/frontend && pnpm dev

# Terminal 3: Start Electron
cd wadi-desktop && pnpm dev
```

### Production Build
```bash
# Build frontend
cd apps/frontend && pnpm build

# Build Electron app
cd wadi-desktop && pnpm build

# Output: release/WADI-1.0.0.dmg (macOS)
# Output: release/WADI Setup 1.0.0.exe (Windows)
```

## Platform-Specific Notes

### macOS
- Code signing required for distribution
- Notarization required for Gatekeeper
```bash
export APPLE_ID="your@email.com"
export APPLE_ID_PASSWORD="app-specific-password"
pnpm build:mac
```

### Windows
- Code signing recommended
- NSIS installer included
```bash
pnpm build:win
```

### Linux
- AppImage format (self-contained)
```bash
pnpm build:linux
```

## Testing

### Unit Tests
```typescript
import { app } from 'electron';
import { test } from '@playwright/test';

test('app launches', async () => {
  await app.whenReady();
  // assertions
});
```

### Integration Tests
```bash
pnpm add -D spectron
```

## Distribution

### Auto-Update Server
```typescript
// Using electron-updater with GitHub Releases
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'your-org',
  repo: 'wadi-desktop'
});
```

### Manual Distribution
1. Upload to GitHub Releases
2. Users download DMG/EXE
3. Auto-update handles future versions

## Estimated Implementation Time
- **Setup & Configuration**: 2 hours
- **Main/Preload Scripts**: 2 hours
- **File System Integration**: 2 hours
- **Build & Testing**: 2 hours
- **Platform-Specific Builds**: 2 hours
- **Total**: 10-12 hours

## Dependencies
```json
{
  "dependencies": {
    "electron": "^27.0.0",
    "electron-updater": "^6.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "electron-builder": "^24.0.0",
    "typescript": "^5.0.0"
  }
}
```

## Status
✅ Architecture Defined  
✅ Implementation Guide Complete  
✅ Security Best Practices Documented  
⏸️ Actual Implementation Deferred (Post-Beta)

## Next Steps (When Implementing)
1. Create `wadi-desktop` directory
2. Install Electron dependencies
3. Implement main/preload scripts
4. Configure electron-builder
5. Test on all platforms
6. Setup CI/CD for builds
7. Configure auto-updates

---

**Note**: This phase can be implemented post-beta once the web application is stable and there's user demand for a desktop version.
