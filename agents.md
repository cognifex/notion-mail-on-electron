# Projektübersicht

## Komponenten
- **Electron Main Process (`main.js`)**: Erstellt das BrowserWindow, steuert Lebenszyklus-Events und lädt die Notion-Mail-Webseite.
- **Renderer (remote Webseite)**: Die gehostete Seite `https://mail.notion.so/`, die im BrowserWindow dargestellt wird. Es gibt keine lokale Renderer-Logik.

## Aufgaben
- Starte die Electron-App mit `npm start`.
- Die Menüleiste wird automatisch ausgeblendet, weitere Desktop-Integrationen sind nicht vorgesehen.
