const path = require("node:path");
const { app, BrowserWindow, Menu, shell } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 1660,
    height: 980,
    minWidth: 1280,
    minHeight: 760,
    backgroundColor: "#1b0d08",
    autoHideMenuBar: true,
    title: "Spud Arena",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, "..", "index.html"));

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
