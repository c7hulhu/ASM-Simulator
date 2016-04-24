'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

var parametersWindow = null;

var numAttributes = 50;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
     width: 1400,
     height: 900,
     minWidth: 1000,
     minHeight: 750,
    //fullscreen: true,
    title: "ASM Simulator",
    center: true
  });

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/main.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Make the Parameters Page
  parametersWindow = new BrowserWindow({
     width: 420,
     height: 750,
     minWidth: 420,
     //resizable: false,
     show: false,
     alwaysOnTop: true,
     title: "Simulation Parameters",
     center: true,
     frame: false
  });

  parametersWindow.loadURL('file://' + __dirname + '/settings.html');


  // event coming from main.html buttom press
  ipcMain.on('showSettings', function() {
    parametersWindow.once('show', function() {
       parametersWindow.webContents.send('old-Data', {
          attributeCount : numAttributes
       });
    });
    parametersWindow.show();
  });

  ipcMain.on('hideSettings', function(event, args) {
    parametersWindow.hide();
    numAttributes = args.attributeCount;
    mainWindow.webContents.send('new-Data', args);
  });

});
