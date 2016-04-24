const ipcRenderer = require('electron').ipcRenderer;

var dominantAttributeWeights = [];
var secondartAttributeWeights = [];

function generateArray(count) {

   dominantAttributeWeights = [];
   secondartAttributeWeights = [];

   for (var i = 0; i < count; i++) {
      dominantAttributeWeights.push(i);
      secondartAttributeWeights.push(i*2);
   }
}

function reloadAttributes(){
   var dominantMeaning = document.getElementById('dominantMeaning');
   var secondaryMeaning = document.getElementById('secondaryMeaning');
   dominantMeaning.innerHTML = '';
   secondaryMeaning.innerHTML = '';
   for (var i = 0; i < dominantAttributeWeights.length; i++) {
      dominantMeaning.innerHTML +=   '<div class="w-clearfix attribute"><div class="attributeweight">'+dominantAttributeWeights[i]+'</div></div>';
      secondaryMeaning.innerHTML +=  '<div class="w-clearfix attribute"><div class="attributeweight">'+secondartAttributeWeights[i]+'</div></div>';
   }
}

function showParameters(){
   ipcRenderer.send('showSettings');
}

ipcRenderer.on('new-Data', function (event, args) {
   generateArray(args.attributeCount);
   reloadAttributes();
});

window.onload = function () {
   //default
   generateArray(50);
   reloadAttributes();
};
