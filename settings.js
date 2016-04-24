const ipcRenderer = require('electron').ipcRenderer;

// event coming from settings.html submit button press
function saveParameters(){
   var data = {
      attributeCount : document.getElementById('attributeCount').value
   };
   ipcRenderer.send('hideSettings', data);
}

ipcRenderer.on('old-Data', function(event, args){
   document.getElementById('attributeCount').value = args.attributeCount;
})
