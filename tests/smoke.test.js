const path = require('path');
const { Application } = require('spectron');
const electronPath = require('electron');

(async () => {
  const app = new Application({
    path: electronPath,
    args: [path.join(__dirname, '..')],
    env: {
      ELECTRON_DISABLE_SECURITY_WARNINGS: '1'
    }
  });

  try {
    await app.start();
    await app.client.waitUntilWindowLoaded();

    const windowCount = await app.client.getWindowCount();
    if (windowCount < 1) {
      throw new Error('No browser windows were opened by the application.');
    }

    const url = await app.client.getUrl();
    if (!url.startsWith('https://mail.notion.so')) {
      throw new Error(`Unexpected URL loaded in main window: ${url}`);
    }

    console.log('Spectron smoke test passed.');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (app && app.isRunning()) {
      await app.stop();
    }
  }
})();
