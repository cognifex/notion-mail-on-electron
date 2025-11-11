// Main process entry point for the Electron application.
const { app, BrowserWindow, shell, session } = require('electron');

// URLs and shared session configuration used across the app.
const NOTION_MAIL_URL = 'https://mail.notion.so/';
const NOTION_PARTITION = 'persist:notion';

// The session can only be created after the app is ready, so defer the lookup
// until the first window is being constructed.
let notionSession;

// Keep global references to prevent garbage collection of windows.
let mainWindow;
const childWindows = new Set();
const popupState = new Map();

const isHttpUrl = (targetUrl) => {
  try {
    const { protocol } = new URL(targetUrl);
    return protocol === 'http:' || protocol === 'https:';
  } catch (error) {
    return false;
  }
};

const isNotionUrl = (targetUrl) => {
  try {
    const { hostname } = new URL(targetUrl);
    return hostname === 'notion.so' || hostname.endsWith('.notion.so');
  } catch (error) {
    return false;
  }
};

const loadMailHome = () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.loadURL(NOTION_MAIL_URL);
  }
};

const attachNavigationGuards = (webContents) => {
  webContents.on('will-navigate', (event, url) => {
    const ownerWindow = BrowserWindow.fromWebContents(webContents);

    if (isNotionUrl(url)) {
      if (ownerWindow && ownerWindow !== mainWindow) {
        // Track that this popup reached a Notion redirect so we can refresh
        // the main window once the flow finishes.
        const existingState = popupState.get(ownerWindow) || {};
        popupState.set(ownerWindow, {
          ...existingState,
          shouldReloadMail: true
        });
      }
      return;
    }

    if (isHttpUrl(url)) {
      // Any navigation that leaves the Notion domain should be opened in the
      // user's default browser instead of inside the Electron app.
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  webContents.on('did-navigate', (event, url) => {
    const ownerWindow = BrowserWindow.fromWebContents(webContents);

    if (ownerWindow && ownerWindow !== mainWindow) {
      const state = popupState.get(ownerWindow);
      if (state && state.shouldReloadMail && isNotionUrl(url)) {
        // The OAuth popup reached a Notion page that signals completion. Reuse
        // the authenticated session in the main window and close the popup.
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.loadURL(NOTION_MAIL_URL);
        }
        if (!ownerWindow.isDestroyed()) {
          ownerWindow.close();
        }
      }
      return;
    }

    if (webContents === mainWindow.webContents && isNotionUrl(url)) {
      const { hostname } = new URL(url);
      if (hostname !== 'mail.notion.so') {
        // Ensure we always land back on Notion Mail after authentication flows
        // that temporarily redirect to notion.so.
        loadMailHome();
      }
    }
  });
};

// Create the main application window once Electron is ready.
const createWindow = () => {
  if (!notionSession) {
    notionSession = session.fromPartition(NOTION_PARTITION, { cache: true });
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // required so OAuth popups can access window.opener
      nativeWindowOpen: true, // enables real popup windows used during OAuth
      session: notionSession,
      partition: NOTION_PARTITION // share cookies/session between windows
    }
  });

  attachNavigationGuards(mainWindow.webContents);

  // Load the Notion Mail web app.
  mainWindow.loadURL(NOTION_MAIL_URL);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isNotionUrl(url)) {
      // Allow Notion-hosted OAuth popups and ensure they reuse the same session.
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
            sandbox: false,
            nativeWindowOpen: true,
            session: notionSession,
            partition: NOTION_PARTITION
          }
        }
      };
    }

    if (isHttpUrl(url)) {
      // For true external URLs (e.g. Google sign-in help links), prefer the
      // system browser so the user stays in control of their credentials.
      shell.openExternal(url);
    }

    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-create-window', (event, childWindow) => {
    childWindows.add(childWindow);
    popupState.set(childWindow, { shouldReloadMail: false });
    attachNavigationGuards(childWindow.webContents);
    childWindow.on('closed', () => {
      childWindows.delete(childWindow);
      const state = popupState.get(childWindow);
      popupState.delete(childWindow);
      if (state && state.shouldReloadMail) {
        // After a successful OAuth login the popup closes itself. Reload the
        // main window so Notion Mail picks up the fresh session immediately.
        loadMailHome();
      }
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

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  app.quit();
});
