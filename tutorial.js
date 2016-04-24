const ipcRenderer = require('electron').ipcRenderer;

window.onbeforeunload = function (e) {
   ipcRenderer.send('hideTutorial');
   return false;
}
