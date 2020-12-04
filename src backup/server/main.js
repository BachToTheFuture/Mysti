// eslint-disable-next-line import/no-extraneous-dependencies
const { app, BrowserWindow, ipcMain } = require('electron');
const { is } = require('electron-util');
const TrayGenerator = require('./TrayGenerator');
const path = require('path');

// Remember to launch at start!
const Store = require('electron-store');
const schema = {
  launchAtStart: false,
  filters: []
}
const store = new Store(schema);

// Create main window
// Declared outside for creating a Tray later on.
let mainWindow = null;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false,
    show: false,
    fullscreenable: false,
    //vibrancy: 'sidebar',
    resizable: false,
    webPreferences: {
      devTools: is.development,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });
  if (is.development) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../../build/index.html')}`);
  }
};

app.on('ready', () => {
  createMainWindow();
  const Tray = new TrayGenerator(mainWindow, store);
  Tray.createTray();
  
  ipcMain.on('FILTERS_UPDATED', (event, data) => {
    store.set('filters', data);
  });
  
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log(store.get('filters'));
    mainWindow.webContents.send('INITIALIZE_FILTERS', store.get('filters'));
  });
  
});

app.setLoginItemSettings({
  openAtLogin: store.get('launchAtStart'),
});

app.dock.hide();
