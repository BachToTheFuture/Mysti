
/*
Followed a tutorial from:
https://blog.logrocket.com/building-a-menu-bar-application-with-electron-and-react/
*/
const { dialog, app, BrowserWindow, ipcMain } = require('electron');
const { is } = require('electron-util');
const TrayGenerator = require('./TrayGenerator');
const path = require('path');

// chokidar is used for watching file changes
var chokidar = require('chokidar');
var fs = require('fs');
// Each directory will have its own watcher and we keep track of all
// of them so that we can dispose of them afterwards.
var watchers = [];
var watchersReady = false;
var Tray;
var filters = null;

// Electron store for saving states and saving filters!
const Store = require('electron-store');
const schema = {
  launchAtStart: false,
  filters: [],
  newUser: true,
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
    icon: __dirname + '/assets/MystiIconTemplate.icns',
    fullscreenable: false,
    resizable: false,
    webPreferences: {
      devTools: is.development,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });
  if (is.development) {
    // Show developer tools only in development
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    mainWindow.loadURL('http://localhost:3000');
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../../build/index.html')}`);
  }
};

function replacePlaceholders(str, params) {
  /*
  This function replaces all of the $1, $2, $n type of placeholders
  with Regex matches.
  */
  for (var i = 0; i < params.length ; i++) {
    var st = '$' + i;
    str = str.split(st).join(params[i])
  }
  return str;
}

function applyFilters(filters, dir, watchPath) {
  /*
  This function checks if a filter applies to a given filename.
  */
  let fname = path.basename(dir);
  for (let n in filters) {
    let re = new RegExp(filters[n].filter, "i");
    let match = fname.match(re);
    // If the pattern matches...
    if (match) {
      // Parse directory and check if the directory has placeholders
      let d = filters[n].dir;
      if (d.includes("$")) {
        d = replacePlaceholders(d, match);
      }

      // Figure out the destination for the file
      // This assumes that the directory inputted is relative
      let dest = watchPath + "/" + d;

      // If the directory doesn't exist, create it.
      if (!fs.existsSync(dest)){
          fs.mkdirSync(dest);
      }

      // Move the file and alert the user!
      fs.rename(dir, dest+"/"+fname, function(err) {
        if ( err ) console.log('ERROR: ' + err);
        else mainWindow.webContents.send('MOVED_SUCCESS', {'dest': dest, 'fname': fname, 'watchPath': watchPath});
      });

      // Break out of the loop as we already found the matching pattern for the file.
      break;
    }
  }
}

function onReady() {
  /*
  The following function runs when the app is ready or if updates were made to the filters.
  */
  for (let n = 0; n < filters.length; n++) {
    // Create a watcher
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
    }).on('ready', function() {
      // The "watchersReady" boolean makes sure that the app doesn't go ahead and move
      // items before the watchers are ready.
      watchersReady = true;
    });
  }
}

/*
Initialize app!
*/
app.on('ready', () => {
  createMainWindow();
  Tray = new TrayGenerator(mainWindow, store);
  Tray.createTray();

  /*
  ipcMain allows the client and the server side to talk to each other.
  */
  ipcMain.on('FILTERS_UPDATED', (event, data) => {
    // No longer a new user once they create their first filter.
    if (store.get('newUser')) store.set('newUser', false);
    store.set('filters', data);
    filters = data;
    /*
    Close all the watchers, and restart them to apply changes
    */
    watchers.forEach(x=>x.close());
    onReady();
  });
  /*
  When the main window finishes loading
  */
  mainWindow.webContents.on('did-finish-load', () => {
    filters = store.get('filters');
    newUser = store.get('newUser');

    // These values are all undefined on first use.
    // We have to set initial values for them.
    if (filters == undefined) {
      store.set('filters', []);
      filters = [];
    }
    if (newUser == undefined) { 
      store.set('newUser', true);
      newUser = true;
    }
    mainWindow.webContents.send('INITIALIZE', filters, newUser);
    onReady();
    Tray.showWindow();
  });
});

// If the user wants to launch Mysti at startup
app.setLoginItemSettings({
  openAtLogin: store.get('launchAtStart'),
});
