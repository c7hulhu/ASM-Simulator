//numNodes:int - number of nodes in each array
//ratio: double - arr1/arr2
function randomInit(numNodes,ratio,arr1,arr2)
{
  for(i=0;i < numNodes;i++) {
    arr1[i].weight=Math.random();
    if(arr1[i].weight/ratio>1)
      arr2[i].weight=arr1[i].weight*ratio;
    else arr2[i].weight=arr1[i].weight/ratio;
  }
}
