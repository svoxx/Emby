define([],function(){"use strict";function addUniquePlaylistItemId(item){item.PlaylistItemId||(item.PlaylistItemId="playlistItem"+currentId,currentId++)}function findPlaylistIndex(playlistItemId,list){for(var i=0,length=list.length;i<length;i++)if(list[i].PlaylistItemId===playlistItemId)return i;return-1}function PlayQueueManager(){this._playlist=[],this._repeatMode="RepeatNone"}function arrayInsertAt(destArray,pos,arrayToInsert){var args=[];args.push(pos),args.push(0),args=args.concat(arrayToInsert),destArray.splice.apply(destArray,args)}function moveInArray(array,from,to){array.splice(to,0,array.splice(from,1)[0])}var currentId=0;return PlayQueueManager.prototype.getPlaylist=function(){return this._playlist.slice(0)},PlayQueueManager.prototype.setPlaylist=function(items){items=items.slice(0);for(var i=0,length=items.length;i<length;i++)addUniquePlaylistItemId(items[i]);this._currentPlaylistItemId=null,this._playlist=items,this._repeatMode="RepeatNone"},PlayQueueManager.prototype.queue=function(items){for(var i=0,length=items.length;i<length;i++)addUniquePlaylistItemId(items[i]),this._playlist.push(items[i])},PlayQueueManager.prototype.queueNext=function(items){var i,length;for(i=0,length=items.length;i<length;i++)addUniquePlaylistItemId(items[i]);var currentIndex=this.getCurrentPlaylistIndex();currentIndex===-1?currentIndex=this._playlist.length:currentIndex++,arrayInsertAt(this._playlist,currentIndex,items)},PlayQueueManager.prototype.getCurrentPlaylistIndex=function(){return findPlaylistIndex(this.getCurrentPlaylistItemId(),this._playlist)},PlayQueueManager.prototype.getCurrentItem=function(){var index=findPlaylistIndex(this.getCurrentPlaylistItemId(),this._playlist);return index===-1?null:this._playlist[index]},PlayQueueManager.prototype.getCurrentPlaylistItemId=function(){return this._currentPlaylistItemId},PlayQueueManager.prototype.setPlaylistState=function(playlistItemId,playlistIndex){this._currentPlaylistItemId=playlistItemId},PlayQueueManager.prototype.setPlaylistIndex=function(playlistIndex){playlistIndex<0?this.setPlaylistState(null):this.setPlaylistState(this._playlist[playlistIndex].PlaylistItemId)},PlayQueueManager.prototype.removeFromPlaylist=function(playlistItemIds){var playlist=this.getPlaylist();if(playlist.length<=playlistItemIds.length)return{result:"empty"};var currentPlaylistItemId=this.getCurrentPlaylistItemId(),isCurrentIndex=playlistItemIds.indexOf(currentPlaylistItemId)!==-1;return this._playlist=playlist.filter(function(item){return playlistItemIds.indexOf(item.PlaylistItemId)===-1}),{result:"removed",isCurrentIndex:isCurrentIndex}},PlayQueueManager.prototype.movePlaylistItem=function(playlistItemId,newIndex){for(var oldIndex,playlist=this.getPlaylist(),i=0,length=playlist.length;i<length;i++)if(playlist[i].PlaylistItemId===playlistItemId){oldIndex=i;break}if(oldIndex===-1||oldIndex===newIndex)return{result:"noop"};if(newIndex>=playlist.length)throw new Error("newIndex out of bounds");return moveInArray(playlist,oldIndex,newIndex),this._playlist=playlist,{result:"moved",playlistItemId:playlistItemId,newIndex:newIndex}},PlayQueueManager.prototype.reset=function(){this._playlist=[],this._currentPlaylistItemId=null,this._repeatMode="RepeatNone"},PlayQueueManager.prototype.setRepeatMode=function(value){this._repeatMode=value},PlayQueueManager.prototype.getRepeatMode=function(){return this._repeatMode},PlayQueueManager.prototype.getNextItemInfo=function(){var newIndex,playlist=this.getPlaylist(),playlistLength=playlist.length;switch(this.getRepeatMode()){case"RepeatOne":newIndex=this.getCurrentPlaylistIndex();break;case"RepeatAll":newIndex=this.getCurrentPlaylistIndex()+1,newIndex>=playlistLength&&(newIndex=0);break;default:newIndex=this.getCurrentPlaylistIndex()+1}if(newIndex<0||newIndex>=playlistLength)return null;var item=playlist[newIndex];return item?{item:item,index:newIndex}:null},PlayQueueManager});