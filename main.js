const ipcRenderer = require('electron').ipcRenderer;


// var attribute = {
//   multiplier : 1.0,    //increases probability when higher - minimum is 1
//   weight : 0.5,    //increases when primed; affects probability
// };
//
// function attribute
//
// attribute.probability() = this.multiplier * this.weight;

class attribute {
   constructor(weight = 0.5, multiplier = 1.0){
      this.weight = weight;
      this.multiplier = multiplier;
   }

   get liveWeight(){
      return this.calcProbability();
   }

   calcProbability() {
      return this.weight * this.multiplier;
   }
}

var dominantAttributeArray = [];
var secondartAttributeArray = [];


var attributeCount = 50;
var primingMethod = 'Word';
var resistanceLevel = 80;
var attributeWeightRep = 'Decimals';
var attributeWeightIncrement = 0.354;
// var weightDirstibution = 'Randomized';
var decayTime = 5;
var decayTimeMultiplier = 20;
var numSampledAttributes = 19;

var dominantMeaning = 'Air';
var secondaryMeaning = 'Heir';
var baseline = 0.74;
var selectionThreshold = 0.6;


function resetActivationLevels() {
   for (var i = 0; i < attributeCount; i++) {
      dominantAttributeArray[i].multiplier = 1.0;
      secondartAttributeArray[i].multiplier = 1.0;
   }
   reloadAttributes();
}

//count:int - number of nodes in each array
//ratio: double - secondaryArray weights/dominantArray weights
function randomizeWeights(count, ratio, dominantArray, secondaryArray)
{
      var ratio2=1-ratio;
      var realRatio=0;
      if(ratio>ratio2) realRatio=ratio2/ratio;
      else realRatio=ratio/ratio2;
      for(i = 0;i < count; i++) {
        temp=Math.random();  // between 0 and 1

        if (ratio > 0.5) {
           dominantArray[i].weight=temp;
           secondaryArray[i].weight=temp*realRatio;
        }else{
           dominantArray[i].weight=temp*realRatio;
           secondaryArray[i].weight=temp;
        }
     }
}

function generateArray(count) {

   dominantAttributeArray = [];
   secondartAttributeArray = [];

   for (var i = 0; i < count; i++) {
      dominantAttributeArray.push(new attribute());
      secondartAttributeArray.push(new attribute());
   }

   randomizeWeights(count, baseline, dominantAttributeArray, secondartAttributeArray);
}

function reloadAttributes(){
   var dominantMeaning = document.getElementById('dominantMeaning');
   var secondaryMeaning = document.getElementById('secondaryMeaning');
   dominantMeaning.innerHTML = '';
   secondaryMeaning.innerHTML = '';
   for (var i = 0; i < attributeCount; i++) {
      dominantMeaning.innerHTML +=   '<div class="w-clearfix attribute"><div class="attributeweight">'+dominantAttributeArray[i].liveWeight.toFixed(3)+'</div></div>';
      secondaryMeaning.innerHTML +=  '<div class="w-clearfix attribute"><div class="attributeweight">'+secondartAttributeArray[i].liveWeight.toFixed(3)+'</div></div>';
   }
}

function showParameters(){
   ipcRenderer.send('showSettings', {attributeCount : attributeCount,
                                      primingMethod : primingMethod,
                                    resistanceLevel : resistanceLevel,
                                 attributeWeightRep : attributeWeightRep,
                           attributeWeightIncrement : attributeWeightIncrement,
                                 // weightDirstibution : weightDirstibution,
                                          decayTime : decayTime,
                                decayTimeMultiplier : decayTimeMultiplier,
                               numSampledAttributes : numSampledAttributes});
}

function showTutorial(){
   ipcRenderer.send('showTutorial');
}

function showDataIO(){
   ipcRenderer.send('showDataPage', {dominantMeaning : dominantMeaning,
                                    secondaryMeaning : secondaryMeaning,
                                            baseline : baseline,
                                  selectionThreshold : selectionThreshold});
}

ipcRenderer.on('new-Settings', function (event, args) {
   attributeCount = args.attributeCount;
   primingMethod = args.primingMethod;
   resistanceLevel = args.resistanceLevel;
   attributeWeightRep = args.attributeWeightRep;
   attributeWeightIncrement = args.attributeWeightIncrement;
   // weightDirstibution = args.weightDirstibution;
   decayTime = args.decayTime;
   decayTimeMultiplier = args.decayTimeMultiplier;
   numSampledAttributes = args.numSampledAttributes;
   generateArray(attributeCount);
   reloadAttributes();
});

ipcRenderer.on('new-Data', function (event, args) {
   dominantMeaning = args.dominantMeaning;
   secondaryMeaning = args.secondaryMeaning;
   baseline = args.baseline;
   selectionThreshold = args.selectionThreshold;

   document.getElementById('dominantMeaningTicker').innerHTML = 'Dominant Meaning/Spelling: &nbsp;'+dominantMeaning;
   document.getElementById('secondaryMeaningTicker').innerHTML = 'Secondary Meaning/Spelling: &nbsp;'+secondaryMeaning;

   var adjustedBaseline;
   var adjustedMeaning;
   if(baseline<0.5){
      adjustedBaseline = 100*(1-baseline);
      adjustedMeaning = 'Secondary';
   }else{
      adjustedBaseline = 100*baseline;
      adjustedMeaning = 'Dominant';
   }

   document.getElementById('currentSelection').innerHTML = 'Current Selection: &nbsp;'+adjustedMeaning+' - '+adjustedBaseline.toFixed(2)+'%';

   generateArray(attributeCount);
   reloadAttributes();
});

window.onload = function () {
   // first function to get called...
   generateArray(attributeCount);
   reloadAttributes();
};


function primeDominant() {

}

function primeSecondary(){

}

function makeSelection(){

   var adjustedBaseline;
   var adjustedMeaning;
   if(baseline<0.5){
      adjustedBaseline = 100*(1-baseline);
      adjustedMeaning = 'Secondary';
   }else{
      adjustedBaseline = 100*baseline;
      adjustedMeaning = 'Dominant';
   }

   document.getElementById('currentSelection').innerHTML = 'Current Selection: &nbsp;'+adjustedMeaning+' - '+adjustedBaseline.toFixed(2)+'%';

   for (var i = 0; i < count; i++) {
      dominantAttributeArray[i].weight = dominantAttributeArray[i].liveWeight;
      secondartAttributeArray[i].weight = secondartAttributeArray[i].liveWeight;
   }

   resetActivationLevels();
}
