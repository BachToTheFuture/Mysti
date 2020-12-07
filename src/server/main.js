// eslint-disable-next-line import/no-extraneous-dependencies
const { dialog, app, Notification, BrowserWindow, ipcMain } = require('electron');
const { is } = require('electron-util');
const TrayGenerator = require('./TrayGenerator');
const path = require('path');


// For watching
var chokidar = require('chokidar');
var fs = require('fs');
var watchers = [];
var watchersReady = false;
var Tray;
var filters = null;

// Reset
//store.set('newUser', true);

// Remember to launch at start!
const Store = require('electron-store');
const schema = {
  launchAtStart: false,
  filters: [],
  newUser: true,
}
const store = new Store(schema);

// For manual reset of data
// store.set('filters', []);

// Create main window
// Declared outside for creating a Tray later on.
let mainWindow = null;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: false,
    show: false,
    icon: __dirname + '/assets/MystiIconTemplate.icns',
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


function replacePlaceholders(str, params) {
  for(var i = 0; i < params.length ; i++) {
    var st = '$' + i;
    str = str.split(st).join(params[i])
  }
  return str;
}

function applyFilters(filters, dir, watchPath) {
  let fname = path.basename(dir);
  for (let n in filters) {
    let re = new RegExp(filters[n].filter, "i");
    let match = fname.match(re);
    // If the pattern matches...
    if (match) {
      // Parse dir
      let d = filters[n].dir;
      if (d.includes("$")) {
        d = replacePlaceholders(d, match);
      }
      
      let dest = watchPath+"/"+d;
      
      if (!fs.existsSync(dest)){
          fs.mkdirSync(dest);
      }
      fs.rename(dir, dest+"/"+fname, function(err) {
        if ( err ) console.log('ERROR: ' + err);
        else mainWindow.webContents.send('MOVED_SUCCESS', {'dest': dest, 'fname': fname, 'watchPath': watchPath});
      });
      break;
    }
  }
}

function onReady() {
  for (let n = 0; n < filters.length; n++) {
    watcher = chokidar.watch(filters[n].dir, {
      ignored: /[\/\\]\./,
      persistent: true,
      depth: 0
    });
    watchers.push(watcher);
    watcher
    .on('add', function(path) {
        console.log('File', path, 'has been added');
        if (watchersReady) {
          applyFilters(filters[n].filters, path, filters[n].dir);
        }
    })
  .on('change', function(path) {
      console.log('File', path, 'has been changed');
      if (watchersReady) {
        applyFilters(filters[n].filters, path, filters[n].dir);
      }
  }).on('ready', function(){
      watchersReady = true;
  });
  }
}

app.on('ready', () => {
  createMainWindow();
  Tray = new TrayGenerator(mainWindow, store);
  Tray.createTray();
  ipcMain.on('FILTERS_UPDATED', (event, data) => {
    // No longer a new user once they create their filter.
    if (store.get('newUser')) store.set('newUser', false);

    store.set('filters', data);
    filters = data;
    watchers.forEach(x=>x.close());
    onReady();
  });

  mainWindow.webContents.on('did-finish-load', () => {
    filters = store.get('filters');
    newUser = store.get('newUser');
    if (newUser == undefined) {
      store.set('newUser', true);
      newUser = true;
    }
    mainWindow.webContents.send('INITIALIZE', filters, newUser);
    onReady();
    Tray.showWindow();
  });
});

app.setLoginItemSettings({
  openAtLogin: store.get('launchAtStart'),
});

//app.dock.hide();
