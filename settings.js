const ipcRenderer = require('electron').ipcRenderer;

// event coming from settings.html submit button press
function saveParameters(){
   var newData = {
      attributeCount : document.getElementById('attributeCount').value,
      resistanceLevel: document.getElementById('resistanceLevel').value,
      attributeWeightIncrement: document.getElementById('attributeWeightIncrement').value
   };

   var radios = document.getElementsByName('primingMethod');
   for (var i = 0; i < radios.length; i++) {
      if(radios[i].checked){
         newData.primingMethod = radios[i].value;
      }
   }

   var radios2 = document.getElementsByName('attributeWeightRep');
   for (var i = 0; i < radios2.length; i++) {
      if(radios2[i].checked){
         newData.attributeWeightRep = radios2[i].value;
      }
   }

   var radios3 = document.getElementsByName('attributeWeightRep');
   for (var i = 0; i < radios3.length; i++) {
      if(radios3[i].checked){
         newData.weightDirstibution = radios3[i].value;
      }
   }

   ipcRenderer.send('hideSettings', newData);
}

window.onbeforeunload = function (e) {
   ipcRenderer.send('hideSettings');
   return false;
}

ipcRenderer.on('old-Data', function(event, args){
   document.getElementById('attributeCount').value = args.attributeCount;
   document.getElementById(args.primingMethod).checked = true;
   document.getElementById('resistanceLevel').value = args.resistanceLevel;
   document.getElementById(args.attributeWeightRep).checked = true;
   document.getElementById('attributeWeightIncrement').value = args.attributeWeightIncrement;
   document.getElementById(args.weightDirstibution).checked = true;
});
