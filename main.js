const ipcRenderer = require('electron').ipcRenderer;

class attribute {
   constructor(weight = 0.5, multiplier = 1.0, borderColor = 'FFFFFF'){
      this.weight = weight;             // Actual weight of the attribute
      this.multiplier = multiplier;     // Multiplier of the weight which temporarily increases the weight for UI purposes
      this.borderColor = borderColor;   // Border color of the attribute (white = deactivated / yellow = activated)
   }

   get liveWeight(){                    // Calculated property to get weight x multiplier
      return this.calcProbability();
   }

   calcProbability() {
      return this.weight * this.multiplier;
   }
}


var dominantAttributeArray = [];         // Array holding all the attributes for the dominant meaning
var secondaryAttributeArray = [];        // Array holding all the attributes for the secondary meaning


//---------------------------------------// Global Attributes for the simulation
var attributeCount = 50;
var primingMethod = 'Word';
var resistanceLevel = 100;
var attributeWeightRep = 'Decimals';
var attributeWeightIncrement = 0.3;
var decayTime = 5;
var decayTimeMultiplier = 20;
var numSampledAttributes = 19;

var dominantMeaning = 'Air';
var secondaryMeaning = 'Heir';
var baseline = 0.74;
var selectionThreshold = 0.6;
var numSampledAttributes = 19;

var activeAttributes = [];                    // an attribute index gets added upon activation and removed upon complete deactivation
var timer = null;
//---------------------------------------//


window.onload = function () {
   // first function to get called upon launch
   generateArray(attributeCount);
   reloadAttributes();

};


function generateArray(count) {

   // UI changes
   document.getElementById('primingSequence').style.display = 'none';
   document.getElementById('primingSequence').innerHTML = 'Priming Sequence: ';
   document.getElementById('primingSequencePrompt').style.display = 'block';

   // Data changes
   dominantAttributeArray = [];
   secondaryAttributeArray = [];

   for (var i = 0; i < count; i++) {
      dominantAttributeArray.push(new attribute());
      secondaryAttributeArray.push(new attribute());
   }

   randomizeWeights(count, baseline, dominantAttributeArray, secondaryAttributeArray);
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

function reloadAttributes(){

   // clear the existing boxes
   var dominantMeaning = document.getElementById('dominantMeaning');
   var secondaryMeaning = document.getElementById('secondaryMeaning');

   dominantMeaning.innerHTML = '';
   secondaryMeaning.innerHTML = '';

   // Reload the attributes to show their most recent changes from the global arrays
   // if an attribute has a yellow border color, it must be recently activated... start deacy for that attribute
   // put the new values in the boxes

   var dominantAdjustedLiveWeight = 1;
   var secondaryAdjustedLiveWeight = 1;

   for (var i = 0; i < attributeCount; i++) {
      dominantAdjustedLiveWeight = dominantAttributeArray[i].liveWeight;
      if(dominantAttributeArray[i].liveWeight>1){
         dominantAdjustedLiveWeight = 1;
      }

      secondaryAdjustedLiveWeight = secondaryAttributeArray[i].liveWeight;
      if(secondaryAttributeArray[i].liveWeight>1){
         secondaryAdjustedLiveWeight = 1;
      }

      if (attributeWeightRep == 'Decimals') {
        dominantMeaning.innerHTML +=   '<div id="att-'+ i +'" class="w-clearfix attribute"><div class="attributeweight">'+dominantAdjustedLiveWeight.toFixed(3)+'</div></div>';
        secondaryMeaning.innerHTML +=  '<div id="att-'+ (i+attributeCount) + '" class="w-clearfix attribute"><div class="attributeweight">'+secondaryAdjustedLiveWeight.toFixed(3)+'</div></div>';
      } else {
        dominantMeaning.innerHTML +=   '<div id="att-'+ i +'" class="w-clearfix attribute"><div class="attributeweight">'+ (100*dominantAdjustedLiveWeight).toFixed(1)+'%</div></div>';
        secondaryMeaning.innerHTML +=  '<div id="att-'+ (i+attributeCount) + '" class="w-clearfix attribute"><div class="attributeweight">'+ (100*secondaryAdjustedLiveWeight).toFixed(1)+'%</div></div>';
      }
   }
}


function showParameters(){
   ipcRenderer.send('showSettings', {attributeCount : attributeCount,
                                      primingMethod : primingMethod,
                                    resistanceLevel : resistanceLevel,
                                 // attributeWeightRep : attributeWeightRep,
                           attributeWeightIncrement : attributeWeightIncrement,
                                          decayTime : decayTime,
                                decayTimeMultiplier : decayTimeMultiplier,
                               numSampledAttributes : numSampledAttributes});
}

ipcRenderer.on('new-Settings', function (event, args) {

   attributeCount = args.attributeCount;
   primingMethod = args.primingMethod;
   resistanceLevel = args.resistanceLevel;
   // attributeWeightRep = args.attributeWeightRep;
   attributeWeightIncrement = args.attributeWeightIncrement;
   decayTime = args.decayTime;
   decayTimeMultiplier = args.decayTimeMultiplier;
   numSampledAttributes = args.numSampledAttributes;
   generateArray(attributeCount);
   reloadAttributes();

   clearInterval(timer);
   timer = false;

});



function showTutorial(){
   ipcRenderer.send('showTutorial');
}

function showDataIO(){
   ipcRenderer.send('showDataPage', {dominantMeaning : dominantMeaning,
                                    secondaryMeaning : secondaryMeaning,
                                            baseline : baseline,
                                  selectionThreshold : selectionThreshold});
}

ipcRenderer.on('new-Data', function (event, args) {
   dominantMeaning = args.dominantMeaning;
   secondaryMeaning = args.secondaryMeaning;
   baseline = args.baseline;
   selectionThreshold = args.selectionThreshold;

   document.getElementById('dominantMeaningTicker').innerHTML = 'Dominant Meaning/Spelling: &nbsp;'+dominantMeaning;
   document.getElementById('secondaryMeaningTicker').innerHTML = 'Secondary Meaning/Spelling: &nbsp;'+secondaryMeaning;

   generateArray(attributeCount);
   reloadAttributes();

   calculateCurrentSelection();

   clearInterval(timer);
   timer = false;

});


function startTimer() {

   if(!timer){
      timer = setInterval( function startDecay() {
         console.log("tick");
         for (var i = 0; i < attributeCount; i++) {

            if (dominantAttributeArray[i].multiplier > 1.0) {
               dominantAttributeArray[i].multiplier -= (dominantAttributeArray[i].multiplier)*0.0125;
               if (dominantAttributeArray[i].multiplier < 1.0){
                  dominantAttributeArray[i].multiplier = 1.0;
               }
            }

            if (secondaryAttributeArray[i].multiplier > 1.0) {
               secondaryAttributeArray[i].multiplier -= (secondaryAttributeArray[i].multiplier)*0.0125;
               if (secondaryAttributeArray[i].multiplier < 1.0){
                  secondaryAttributeArray[i].multiplier = 1.0;
               }
            }

         }

         reloadAttributes();

      } , decayTime * decayTimeMultiplier);
   }
}






function primeDominant() {

   startTimer();

   document.getElementById('primingSequencePrompt').style.display = 'none';
   document.getElementById('primingSequence').innerHTML += 'D ';
   document.getElementById('primingSequence').style.display = 'block';

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
        dominantAttributeArray[randPlace].borderColor = "FFFF00";
     } else if(primingMethod=='Sentence') {
        dominantAttributeArray[randPlace].multiplier+=.4;
        dominantAttributeArray[randPlace].borderColor = "FFFF00";
     } else {
        dominantAttributeArray[randPlace].multiplier+=.5;
        dominantAttributeArray[randPlace].borderColor = "FFFF00";
     }

     initialToPrime--;
  }

  finishPriming(finalToPrime, 1);
}

function primeSecondary(){

   startTimer();

   document.getElementById('primingSequencePrompt').style.display = 'none';
   document.getElementById('primingSequence').innerHTML += 'S ';
   document.getElementById('primingSequence').style.display = 'block';

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
           secondaryAttributeArray[randPlace].borderColor = "FFFF00";
        } else if(primingMethod=='Sentence') {
           secondaryAttributeArray[randPlace].multiplier+=.4;
           secondaryAttributeArray[randPlace].borderColor = "FFFF00";
        } else {
           secondaryAttributeArray[randPlace].multiplier+=.5;
           secondaryAttributeArray[randPlace].borderColor = "FFFF00";
        }

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
            dominantAttributeArray[randPlace].borderColor = "FFFF00";
         }else{
            secondaryAttributeArray[randPlace].multiplier += 0.2;
            secondaryAttributeArray[randPlace].borderColor = "FFFF00";
         }
      }else{
         // select from the other array
         if(id == 1){
            secondaryAttributeArray[randPlace].multiplier += 0.2;
            secondaryAttributeArray[randPlace].borderColor = "FFFF00";
         }else{
            dominantAttributeArray[randPlace].multiplier += 0.2;
            dominantAttributeArray[randPlace].borderColor = "FFFF00";
         }
      }

      remainingCount--;
   }

   reloadAttributes();
}

function makeSelection(){

   clearInterval(timer);
   timer = false;

   var toSampleCount = numSampledAttributes;

   var totalWeight = 0;
   var currentWeight = 0;
   var unifiedIndex = 0;

   for (var i = 0; i < attributeCount; i++) {
      totalWeight += dominantAttributeArray[i].liveWeight;
      totalWeight += secondaryAttributeArray[i].liveWeight;
   }

   while (toSampleCount > 0) {
      randPlace = (Math.random()*totalWeight)
      currentWeight = 0;
      unifiedIndex = -1;

      while (currentWeight < randPlace) {

         unifiedIndex++;

         if(unifiedIndex < attributeCount){
            currentWeight += dominantAttributeArray[unifiedIndex].liveWeight;
         }else{
            currentWeight += secondaryAttributeArray[unifiedIndex - attributeCount].liveWeight;
         }
      }

      // alert("unifiedIndex: "+unifiedIndex+"  attributeCount: "+attributeCount);

      if (unifiedIndex < attributeCount) {
         dominantAttributeArray[unifiedIndex].weight += attributeWeightIncrement;
      }else{
         secondaryAttributeArray[unifiedIndex - attributeCount].weight += attributeWeightIncrement;
      }

      toSampleCount--;
   }

   calculateCurrentSelection();

   resetActivationLevels();

   startTimer();

}


function calculateCurrentSelection(){
   var totalDominant = 0;
   var totalSecondary = 0;

   for (var i = 0; i < attributeCount; i++) {
      totalDominant += dominantAttributeArray[i].weight;
      totalSecondary += secondaryAttributeArray[i].weight;
   }


   var currentBaseline = totalDominant/(totalDominant+totalSecondary);
   var adjustedMeaning;


   if(currentBaseline >= selectionThreshold){
      adjustedMeaning = 'Dominant';
      adjustedBaseline = 100 * currentBaseline
   }else{
      adjustedMeaning = 'Secondary';
      adjustedBaseline = 100*(1-currentBaseline);
   }

   document.getElementById('currentSelection').innerHTML = 'Current Selection: &nbsp;'+adjustedMeaning+' - '+adjustedBaseline.toFixed(2)+'%';
}


function resetActivationLevels() {
   for (var i = 0; i < attributeCount; i++) {
      dominantAttributeArray[i].multiplier = 1.0;
      secondaryAttributeArray[i].multiplier = 1.0;
   }
   reloadAttributes();
}
