var jobQueue = [];
bannedlist = ["|","Spawn Block","Attached","_",":"]
tempBanned=["|","Spawn Block","Attached","_",":"]
function banned(bannedlist, id){
  res=false
  for (i=0;i<bannedlist.length;i++){
    md=bannedlist[i]
	try{
	btm=api.blockIdToBlockName(id)
    if (btm.includes(md)){
      res=true
	  
      return res
    }}catch{
		return 1
	}
  }
  return res
}
blks_cnt={}
itms_cnt={}
blcked_cnt={}
sttimes={}
finid={}
endtimes={}
function tick(){
   var opsBudget = 50;
    while (opsBudget > 0 && jobQueue.length > 0) {
        var job = jobQueue[0];
		if (sttimes[job.playerId][0]===0){
			sttimes[job.playerId][0]=api.now()
		}
		bdl=banned(bannedlist, job.currentN)
        if (!bdl && bdl!==1){
			try{
           api.editItemCraftingRecipes(job.playerId, job.currentN + "", [{
               requires: [{ items: ["Stone"], amt: 0 }],
               produces: 1,
               station: "Workbench"
           }]);}catch{}
           api.sendMessage(job.playerId,"Loading Blocks to Workbench. ID: "+job.currentN)
		   //api.setClientOption(job.playerId, "middleTextLower", "Loading Blocks to Workbench. ID: "+job.currentN)
			blks_cnt[job.playerId]++
        }else if (bdl===true){
			blcked_cnt[job.playerId]++
		}else if (bdl===1){
			if (endtimes[job.playerId][0]===0){
				endtimes[job.playerId][0]=api.now()
			}
			if (finid[job.playerId][0]===0){
				finid[job.playerId][0]=job.currentN
			}
			if (sttimes[job.playerId][1]===0){
				sttimes[job.playerId][1]=api.now()
			}
			try{
           api.editItemCraftingRecipes(job.playerId, job.currentN + "", [{
               requires: [{ items: ["Stone"], amt: 0 }],
               produces: 1,
               station: "Artisan Bench"
           }]);}catch{
			job.end=true

			endtimes[job.playerId][1]=api.now()
			finid[job.playerId][1]=job.currentN
		   }
           api.sendMessage(job.playerId,"Loading Items to Artisan Bench. ID: "+job.currentN)
			//api.setClientOption(job.playerId, "middleTextLower", "Loading Items to Artisan Bench. ID: "+job.currentN)
			itms_cnt[job.playerId]++
           
		}
        
        job.currentN++;
        opsBudget--;
        if (job.maxN === -1 && job.end) {
            api.log("finished")
			api.sendFlyingMiddleMessage(job.playerId, ["Finished Loading All Blocks and Items."], 0)
			//api.setClientOption(job.playerId, "middleTextLower", "")
            jobQueue.shift();
        }
    }
}
function removeByIndex(arr, index) {
    if (!Array.isArray(arr)) throw new Error("First argument must be an array");
	if (typeof index !== "number" || index < 0 || index >= arr.length) {
        throw new Error("Invalid index");
    }
    arr.splice(index, 1);
    return arr;
}
function playerCommand(id,cmd){
  if (cmd==="all"){
	blks_cnt[id]=0
	itms_cnt[id]=0
	blcked_cnt[id]=0
	sttimes[id]=[0,0]
	endtimes[id]=[0,0]
	finid[id]=[0,0]
	jobQueue.push({
         playerId: id,
         currentN: 2,
         maxN: -1,
		 end: false
     });
     return true
  }else if (cmd==="stats"){
		if (!blks_cnt[id]){
			api.sendMessage(id, "ERROR: YOU HAVE NOT STARTED LOADING ITEMS, USE /all TO START LOADING ITEMS")
		}else{
			api.sendMessage(id, "Currently loaded "+(blks_cnt[id]+itms_cnt[id])+" objects: "+blks_cnt[id]+" blocks and "+itms_cnt[id]+" items.\nFinal ID for Blocks is "+finid[id][0]+", final ID for Items is "+finid[id][1]+"\nTotal Time: "+((endtimes[id][0]-sttimes[id][0])+(endtimes[id][1]-sttimes[id][1]))+"ms.\nTime for loading blocks: "+(endtimes[id][0]-sttimes[id][0])+"ms.\nTime for loading items: "+(endtimes[id][1]-sttimes[id][1])+"ms.\nBlocked "+blcked_cnt[id]+" blocks in total due to banned list. Use /bannedlist to check it out, and /bannedlist add [name] and /bannedlist remove [index] to edit. Use /bannedlist restore to restore.")
		}
		return true
	}else if (cmd.split(" ")[0]==="bannedlist"){
		if (!cmd.split(" ")[1]){
			api.sendMessage(id, "Currently banned substrings with "+tempBanned.length+" items (block name with these strings in them are filtered out):\n"+JSON.stringify(tempBanned))
		}else if (cmd.split(" ")[1] === "remove"){
			if (cmd.split(" ")[2]){
				tempBanned=removeByIndex(tempBanned, parseInt(cmd.split(" ")[2])-1)
				api.sendMessage(id, "Newest Banned List with "+tempBanned.length+" items: "+JSON.stringify(tempBanned))
			}else{
				api.sendMessage(id, "You need to include the index of the item you want to remove! The first item's index is 0. E.G. /bannedlist remove 2")
			}
		}else if (cmd.split(" ")[1] === "add"){
			if (cmd.split(" ")[2]){
				tempBanned.push((cmd.split(" ").slice(2, cmd.split(" ").length)).join(" "))
				api.sendMessage(id, "Newest Banned List with "+tempBanned.length+" items: "+JSON.stringify(tempBanned))
			}else{
				api.sendMessage(id, "You need to include the item name you want to add! E.G. /bannedlist add Artisan Bench")
			}
		}else if (cmd.split(" ")[1] === "restore"){
			tempBanned=["|","Spawn Block","Attached","_",":"]
			api.sendMessage(id, "Banned List restored to Default: "+JSON.stringify(tempBanned))
		}
		return true
	}
}
