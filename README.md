# Notion Mail Electron Wrapper

## Überblick
Eine minimalistische Electron-Anwendung, die die Webseite [https://mail.notion.so/](https://mail.notion.so/) in einem eigenständigen Fenster lädt.

## Voraussetzungen
- [Node.js](https://nodejs.org/) (empfohlen: aktuelle LTS-Version)
- npm (wird mit Node.js installiert)

## Installation
```bash
npm install
```

## Start
```bash
npm start
```
Dadurch öffnet sich ein etwa 1200×800 Pixel großes Fenster ohne Menüleiste, das direkt die Notion-Mail-Webseite lädt.

## Lokale Entwicklung & Tests
- Für automatisches Reloading während der Entwicklung kann `npm run dev` verwendet werden. Nodemon überwacht Änderungen an JavaScript-, HTML- und CSS-Dateien und startet Electron neu.
- Ein schneller End-to-End-Smoke-Test steht mit `npm run test:spectron` zur Verfügung. Dabei wird geprüft, ob sich das Fenster öffnen lässt und `https://mail.notion.so` geladen wird.
- Bei jedem Push auf den `main`-Branch führt die GitHub Action unter `.github/workflows/electron-build.yml` automatisch `npm ci`, `npx electron-builder --dir` sowie den Spectron-Smoke-Test aus. Dadurch wird sichergestellt, dass Build und Login-Flow lauffähig bleiben.

## Entwicklungshinweise
- `main.js` enthält den Electron-Main-Prozess.
- Die App lädt ausschließlich die Weboberfläche von Notion Mail, zusätzliche Integrationen sind nicht enthalten.
