//numNodes:int - number of nodes in each array
//ratio: double - arr1/arr2
function randomInit(numNodes,ratio,arr1,arr2)
{
  for(i=0;i < numNodes;i++) {
    temp=Math.random();
    if(temp/ratio>1) {
      arr1[i].weight=temp;
      arr2[i].weight=temp*ratio;
    } else {
      arr1[i].weight=temp/ratio;
      arr2[i].weight=temp;
    }
  }
}
