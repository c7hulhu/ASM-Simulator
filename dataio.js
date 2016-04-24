const ipcRenderer = require('electron').ipcRenderer;

window.onbeforeunload = function (e) {
   ipcRenderer.send('hideDataPage');
   return false;
}

ipcRenderer.on('old-Data', function(event, args){
   document.getElementById('dominantMeaning').value = args.dominantMeaning;
   document.getElementById('secondaryMeaning').value = args.secondaryMeaning;
   document.getElementById('baseline').value = args.baseline;
   document.getElementById('selectionThreshold').value = args.selectionThreshold;
});


function saveData(){
   var newData = {
      dominantMeaning : document.getElementById('dominantMeaning').value,
      secondaryMeaning : document.getElementById('secondaryMeaning').value,
      baseline: document.getElementById('baseline').value,
      selectionThreshold : document.getElementById('selectionThreshold').value,
   };

   ipcRenderer.send('hideDataPage', newData);
}
