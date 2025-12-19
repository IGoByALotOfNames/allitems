var jobQueue = [];
bannedlist = ["|","Spawn Block","Attached","_",":"]
function banned(bannedlist, id){
  res=false
  for (i=0;i<bannedlist.length;i++){
    md=bannedlist[i]
    if (api.blockIdToBlockName(id).includes(md)){
      res=true
      return res
    }
  }
  return res
}
function tick(){
   var opsBudget = 50;
    while (opsBudget > 0 && jobQueue.length > 0) {
        var job = jobQueue[0];
        if (job.currentN >2651 || !banned(bannedlist, job.currentN)){
           api.editItemCraftingRecipes(job.playerId, job.currentN + "", [{
               requires: [{ items: ["Stone"], amt: 0 }],
               produces: 1,
               station: "Workbench"
           }]);
          api.broadcastMessage(" num:"+job.currentN)
        }
        job.currentN++;
        opsBudget--;
        if (job.currentN >= job.maxN) {
            api.log("finished")
            jobQueue.shift();
        }
    }
}
function playerCommand(id,cmd){
  if (cmd === "allblocks"){
    jobQueue.push({
         playerId: id,
         currentN: 2,
         maxN: 2663
     });
     return true
  }else if (cmd==="allitems"){
    jobQueue.push({
         playerId: id,
         currentN: 2663,
         maxN: 3467
     });
     return true
  }
}
