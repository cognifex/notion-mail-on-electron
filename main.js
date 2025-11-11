// Main process entry point for the Electron application.
const { app, BrowserWindow } = require('electron');

// Keep global references to prevent garbage collection of windows.
let mainWindow;
const childWindows = new Set();

// Create the main application window once Electron is ready.
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,              // wichtig für OAuth-Fenster
      nativeWindowOpen: true,      // erlaubt echte Popup-Fenster
      partition: 'persist:notion'  // sorgt für gemeinsame Sessions
    }
  });


  // Load the Notion Mail web app.
  mainWindow.loadURL('https://mail.notion.so/');

  // Allow popup-based auth flows by creating a dedicated child window.
  mainWindow.webContents.setWindowOpenHandler(() => {
    if (!mainWindow) {
      return { action: 'deny' };
    }

    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        parent: mainWindow,
        modal: false,
        width: 1000,
        height: 700,
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          session: mainWindow.webContents.session
        }
      }
    };
  });

  mainWindow.webContents.on('did-create-window', (event, childWindow) => {
    childWindows.add(childWindow);
    childWindow.on('closed', () => {
      childWindows.delete(childWindow);
    });
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
    childWindows.forEach((child) => {
      if (!child.isDestroyed()) {
        child.close();
      }
    });
    childWindows.clear();
  });
};

// Automatically create the window when Electron finishes initialization.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});
