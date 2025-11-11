// Main process entry point for the Electron application.
const { app, BrowserWindow } = require('electron');

// Keep a global reference to prevent garbage collection of the window.
let mainWindow;

// Create the main application window once Electron is ready.
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // Hide the menu bar for a clean window.
    webPreferences: {
      contextIsolation: true, // Isolate context for improved security.
      nodeIntegration: false // Disable Node.js integration in the renderer.
    }
  });

  // Load the Notion Mail web app.
  mainWindow.loadURL('https://mail.notion.so/');

  // Ensure authentication popups open in the same window instead of being blocked.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (mainWindow) {
      mainWindow.loadURL(url);
    }

    return { action: 'deny' };
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Automatically create the window when Electron finishes initialization.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS where apps traditionally stay active.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create the window on macOS when the dock icon is clicked and there are no other windows open.
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
