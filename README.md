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

## Entwicklungshinweise
- `main.js` enthält den Electron-Main-Prozess.
- Die App lädt ausschließlich die Weboberfläche von Notion Mail, zusätzliche Integrationen sind nicht enthalten.
