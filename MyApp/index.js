'use strict';

// index.js (main process)
// - GUI (renderer process)

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const dialog = electron.dialog;
const ipcMain = electron.ipcMain;

let mainWindow;
let settingsWindow;

let menuTemplate = [{
  label: 'MyApp',
  submenu: [
    { label: 'About', accelerator: 'CmdOrCtrl+Shift+A', click: function() { showAboutDialog(); } },
    { type: 'separator'},
    { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: function () { showSettingsWindow(); }},
    { type: 'separator' },
    { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: function () { app.quit(); } },
  ]
}];

let menu = Menu.buildFromTemplate(menuTemplate);

ipcMain.on('settings_changed', function(event, color) {
  mainWindow.webContents.send('set_bgcolor', color);
});

function showAboutDialog() {
  dialog.showMessageBox({
    type: 'info',
    buttons: ['ok'],
    message: 'About This App',
    detail: 'ok farm'
  });
}

function showSettingsWindow() {
  settingsWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`
    },
    width: 600, height: 300
  });
  settingsWindow.loadURL(`file://${__dirname}/settings.html`);
  settingsWindow.webContents.openDevTools();
  settingsWindow.show();
  settingsWindow.on("closed", function () {
    settingsWindow = null;
  });
}

function createMainWindow() {
  Menu.setApplicationMenu(menu);
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`
    },
    width: 800, height: 400
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.webContents.openDevTools();
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on('ready', function() {
  // create window
  createMainWindow();
});

app.on('window-all-closed', function() {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  if(mainWindow === null) {
    createMainWindow();
  }
});