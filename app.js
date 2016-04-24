'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const ipcMain = require('electron').ipcMain;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

var parametersWindow = null;
var tutorialWindow = null;
var dataIOWindow = null;

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
     minHeight: 800,
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
    tutorialWindow.destroy();
    parametersWindow.destroy();
    dataIOWindow.destroy();
    app.quit();
  });

  // Make the Parameters Page
  parametersWindow = new BrowserWindow({
     width: 420,
     height: 830,
     minWidth: 420,
     minHeight: 830,
     //resizable: false,
     show: false,
     alwaysOnTop: true,
     title: "Simulation Parameters",
     center: true,
  });

  parametersWindow.loadURL('file://' + __dirname + '/settings.html');


  // Make the Data Import/Export Page
  dataIOWindow = new BrowserWindow({
     width: 420,
     height: 550,
     minWidth: 420,
     minHeight: 550,
     //resizable: false,
     show: false,
     alwaysOnTop: true,
     title: "Data Import/Export",
     center: true,
  });

  dataIOWindow.loadURL('file://' + __dirname + '/dataio.html');


  // Make the tutorial Page
  tutorialWindow = new BrowserWindow({
     width: 1000,
     height: 800,
    //fullscreen: true,
    title: "Tutorial",
    center: true,
    show: false
  });

   tutorialWindow.loadURL('file://' + __dirname + '/tutorial.html');


  // event coming from main.html buttom press
  ipcMain.on('showSettings', function(event, args) {
    parametersWindow.once('show', function() {
       parametersWindow.webContents.send('old-Settings', args);
    });
    parametersWindow.show();
  });

  ipcMain.on('hideSettings', function(event, args) {
    parametersWindow.hide();
    if(args){
      mainWindow.webContents.send('new-Settings', args);
   }
  });




  ipcMain.on('showDataPage', function(event, args) {
     dataIOWindow.once('show', function() {
       dataIOWindow.webContents.send('old-Data', args);
     });
     dataIOWindow.show();
  });

  ipcMain.on('hideDataPage', function(event, args) {
    dataIOWindow.hide();
    if(args){
      mainWindow.webContents.send('new-Data', args);
   }
  });





  ipcMain.on('showTutorial', function() {
     tutorialWindow.show();
  });

  ipcMain.on('hideTutorial', function(event, args) {
     tutorialWindow.hide();
  });

});
