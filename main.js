const ipcRenderer = require('electron').ipcRenderer;

class attribute {
   constructor(weight = 0.5, multiplier = 1.0, borderColor = '#FFFFFF'){
      this.weight = weight;
      this.multiplier = multiplier;
      this.borderColor = borderColor;
   }

   get liveWeight(){
      return this.calcProbability();
   }

   calcProbability() {
      return this.weight * this.multiplier;
   }
}

var dominantAttributeArray = [];
var secondaryAttributeArray = [];


var attributeCount = 50;
var primingMethod = 'Word';
var resistanceLevel = 100;
var attributeWeightRep = 'Decimals';
var attributeWeightIncrement = 0.3;
// var weightDirstibution = 'Randomized';
var decayTime = 5;
var decayTimeMultiplier = 20;
var numSampledAttributes = 19;

var dominantMeaning = 'Right';
var secondaryMeaning = 'Write';
var baseline = 0.74;
var selectionThreshold = 0.6;
var numSampledAttributes = 19;

// var activatedAttributeIndices = [];
var dominantActivatedAttributes = [];
var secondaryActivatedAttributes = [];

function resetActivationLevels() {
   for (var i = 0; i < attributeCount; i++) {
      dominantAttributeArray[i].multiplier = 1.0;
      secondaryAttributeArray[i].multiplier = 1.0;
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

   document.getElementById('primingSequence2').style.display = 'none';
   document.getElementById('primingSequence').innerHTML = 'Priming Sequence: [press one of the priming buttons below]&nbsp;';
   document.getElementById('primingSequence2').innerHTML = 'Priming Sequence: ';
   document.getElementById('primingSequence').style.display = 'block';

   dominantAttributeArray = [];
   secondaryAttributeArray = [];

   for (var i = 0; i < count; i++) {
      dominantAttributeArray.push(new attribute());
      secondaryAttributeArray.push(new attribute());
   }

   randomizeWeights(count, baseline, dominantAttributeArray, secondaryAttributeArray);
}

function reloadAttributes(){
   var dominantMeaning = document.getElementById('dominantMeaning');
   var secondaryMeaning = document.getElementById('secondaryMeaning');
   dominantMeaning.innerHTML = '';
   secondaryMeaning.innerHTML = '';

   var dominantAdjustedLiveWeight = 1;
   var secondaryAdjustedLiveWeight = 1;

   for (var i = 0; i < attributeCount; i++) {

      if(dominantAttributeArray[i].borderColor == "#FFFF00"){
         startDecay(dominantAttributeArray[i]);
      }

      if([i].borderColor == "#FFFF00"){
         startDecay(secondaryAttributeArray[i]);
      }

      dominantAdjustedLiveWeight = dominantAttributeArray[i].liveWeight;
      if(dominantAttributeArray[i].liveWeight>1){
         dominantAdjustedLiveWeight = 1;
      }

      secondaryAdjustedLiveWeight = secondaryAttributeArray[i].liveWeight;
      if(secondaryAttributeArray[i].liveWeight>1){
         secondaryAdjustedLiveWeight = 1;
      }

      dominantMeaning.innerHTML +=   '<div class="w-clearfix attribute"><div class="attributeweight">'+dominantAdjustedLiveWeight.toFixed(3)+'</div></div>';
      secondaryMeaning.innerHTML +=  '<div class="w-clearfix attribute"><div class="attributeweight">'+secondaryAdjustedLiveWeight.toFixed(3)+'</div></div>';
   }
}

function startDecay(attribute) {

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

function calculateCurrentSelection(){
   var totalDominant = 0;
   var totalSecondary = 0;

   for (var i = 0; i < attributeCount; i++) {
      totalDominant += dominantAttributeArray[i].weight;
      totalSecondary += secondaryAttributeArray[i].weight;
   }

   var currentBaseline = totalDominant/totalSecondary;
   var adjustedMeaning;

   if(currentBaseline > selectionThreshold){
      adjustedMeaning = 'Dominant';
      adjustedBaseline = 100 * currentBaseline
   }else{
      adjustedMeaning = 'Secondary';
      adjustedBaseline = 100*(1-currentBaseline);
   }

   document.getElementById('currentSelection').innerHTML = 'Current Selection: &nbsp;'+adjustedMeaning+' - '+adjustedBaseline.toFixed(2)+'%';
}

ipcRenderer.on('new-Data', function (event, args) {
   dominantMeaning = args.dominantMeaning;
   secondaryMeaning = args.secondaryMeaning;
   baseline = args.baseline;
   selectionThreshold = args.selectionThreshold;

   document.getElementById('dominantMeaningTicker').innerHTML = 'Dominant Meaning/Spelling: &nbsp;'+dominantMeaning;
   document.getElementById('secondaryMeaningTicker').innerHTML = 'Secondary Meaning/Spelling: &nbsp;'+secondaryMeaning;

   // var adjustedBaseline;
   // var adjustedMeaning;
   // if(baseline<0.5){
   //    adjustedBaseline = 100*(1-baseline);
   //    adjustedMeaning = 'Secondary';
   // }else{
   //    adjustedBaseline = 100*baseline;
   //    adjustedMeaning = 'Dominant';
   // }
   //
   // document.getElementById('currentSelection').innerHTML = 'Current Selection: &nbsp;'+adjustedMeaning+' - '+adjustedBaseline.toFixed(2)+'%';

   calculateCurrentSelection();

   generateArray(attributeCount);
   reloadAttributes();
});

window.onload = function () {
   // first function to get called...
   generateArray(attributeCount);
   reloadAttributes();
};


function primeDominant() {

   document.getElementById('primingSequence').style.display = 'none';
   document.getElementById('primingSequence2').innerHTML += 'D ';
   document.getElementById('primingSequence2').style.display = 'block';

  var toPrimeCount = numSampledAttributes;
  var initialToPrime = 0;
  var finalToPrime = 0;

  if(primingMethod == 'Word'){
     initialToPrime = 4;
  }else if(primingMethod == 'Sentence'){
     initialToPrime = 6;
  }else{
     initialToPrime = 8;
  }

  finalToPrime = toPrimeCount - initialToPrime;

  while (initialToPrime > 0) {
     randPlace=((Math.random()*1000)|0)%attributeCount;
     if (primingMethod=='Word'){
        dominantAttributeArray[randPlace].multiplier+=.3;
        dominantAttributeArray[randPlace].borderColor = "#FFFF00"
     } else if(primingMethod=='Sentence') {
        dominantAttributeArray[randPlace].multiplier+=.4;
        dominantAttributeArray[randPlace].borderColor = "#FFFF00"
     } else {
        dominantAttributeArray[randPlace].multiplier+=.5;
        dominantAttributeArray[randPlace].borderColor = "#FFFF00"
     }

     dominantActivatedAttributes.push(randPlace);

     reloadAttributes();

     initialToPrime--;
  }
  finishPriming(finalToPrime, 1);
}

function primeSecondary(){

   document.getElementById('primingSequence').style.display = 'none';
   document.getElementById('primingSequence2').innerHTML += 'S ';
   document.getElementById('primingSequence2').style.display = 'block';

     var toPrimeCount = numSampledAttributes;
     var initialToPrime = 0;
     var finalToPrime = 0;

     if(primingMethod == 'Word'){
        initialToPrime = 4;
     }else if(primingMethod == 'Sentence'){
        initialToPrime = 6;
     }else{
        initialToPrime = 8;
     }

     finalToPrime = toPrimeCount - initialToPrime;

     while (initialToPrime > 0) {
        randPlace=((Math.random()*1000)|0)%attributeCount;
        if (primingMethod=='Word'){
           secondaryAttributeArray[randPlace].multiplier+=.3;
           dominantAttributeArray[randPlace].borderColor = "#FFFF00"
        } else if(primingMethod=='Sentence') {
           secondaryAttributeArray[randPlace].multiplier+=.4;
           dominantAttributeArray[randPlace].borderColor = "#FFFF00"
        } else {
           secondaryAttributeArray[randPlace].multiplier+=.5;
           dominantAttributeArray[randPlace].borderColor = "#FFFF00"
        }

        secondaryActivatedAttributes.push(randPlace);

        reloadAttributes();

        initialToPrime--;
     }
     finishPriming(finalToPrime, 2);
}

function finishPriming(remainingCount, id){
   while (remainingCount > 0) {

      randPlace=((Math.random()*1000)|0)%attributeCount;

      if(Math.random() < resistanceLevel/100){
         // select from current array
         if(id == 1){
            dominantAttributeArray[randPlace].multiplier += 0.2;
         }else{
            secondaryAttributeArray[randPlace].multiplier += 0.2;
         }
      }else{
         // select from the other array
         if(id == 1){
            secondaryAttributeArray[randPlace].multiplier += 0.2;
         }else{
            dominantAttributeArray[randPlace].multiplier += 0.2;
         }
      }

      reloadAttributes();

      remainingCount--;
   }
}

function makeSelection(){

   var toSampleCount = numSampledAttributes;

   var dominantSum = 0;
   var secondarySum = 0;

   var di = [];
   var si = [];

   while (toSampleCount > 0) {
      randPlace=((Math.random()*1000)|0)%attributeCount;

      if(Math.random() < 0.5){
         // dominantAttributeArray[randPlace].weight += attributeWeightIncrement;
         dominantSum += dominantAttributeArray[randPlace].weight;
         di.push(randPlace);
      }else{
         // secondaryAttributeArray[randPlace].weight += attributeWeightIncrement;
         secondarySum += secondaryAttributeArray[randPlace].weight;
         si.push(randPlace);
      }

      toSampleCount--;
   }


   if(dominantSum > secondarySum){
      alert("dominant wins!");
      for (var i = 0; i < numSampledAttributes/2; i++) {
         dominantAttributeArray[di[i]].weight += attributeWeightIncrement;
      }
   }else{
      alert("secondary wins!");
      for (var i = 0; i < numSampledAttributes/2; i++) {
         secondaryAttributeArray[si[i]].weight += attributeWeightIncrement;
      }
   }



   calculateCurrentSelection();



   resetActivationLevels();
}
