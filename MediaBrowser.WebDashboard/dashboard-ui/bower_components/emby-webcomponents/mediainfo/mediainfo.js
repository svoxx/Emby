define(["datetime","globalize","embyRouter","itemHelper","material-icons","css!./mediainfo.css","programStyles"],function(datetime,globalize,embyRouter,itemHelper){"use strict";function getTimerIndicator(item){var status;if("SeriesTimer"===item.Type)return'<i class="md-icon mediaInfoItem mediaInfoIconItem mediaInfoTimerIcon">&#xE062;</i>';if(item.TimerId||item.SeriesTimerId)status=item.Status||"Cancelled";else{if("Timer"!==item.Type)return"";status=item.Status}return item.SeriesTimerId?"Cancelled"!==status?'<i class="md-icon mediaInfoItem mediaInfoIconItem mediaInfoTimerIcon">&#xE062;</i>':'<i class="md-icon mediaInfoItem mediaInfoIconItem">&#xE062;</i>':'<i class="md-icon mediaInfoItem mediaInfoIconItem mediaInfoTimerIcon">&#xE061;</i>'}function getProgramInfoHtml(item,options){var text,date,html="",miscInfo=[];if(item.StartDate)try{text="",date=datetime.parseISO8601Date(item.StartDate),options.startDate!==!1&&(text+=datetime.toLocaleDateString(date,{weekday:"short",month:"short",day:"numeric"})),text+=" "+datetime.getDisplayTime(date),item.EndDate&&(date=datetime.parseISO8601Date(item.EndDate),text+=" - "+datetime.getDisplayTime(date)),miscInfo.push(text)}catch(e){console.log("Error parsing date: "+item.StartDate)}if(item.ChannelNumber&&miscInfo.push("CH "+item.ChannelNumber),item.ChannelName&&(options.interactive&&item.ChannelId?miscInfo.push('<a class="lnkChannel" data-id="'+item.ChannelId+'" data-serverid="'+item.ServerId+'" href="#">'+item.ChannelName+"</a>"):miscInfo.push(item.ChannelName)),options.timerIndicator!==!1){var timerHtml=getTimerIndicator(item);timerHtml&&miscInfo.push({html:timerHtml})}return html+=miscInfo.map(function(m){return getMediaInfoItem(m)}).join("")}function getMediaInfoHtml(item,options){var html="",miscInfo=[];options=options||{};var text,date,minutes,count,showFolderRuntime="MusicAlbum"===item.Type||"MusicArtist"===item.MediaType||"Playlist"===item.MediaType||"MusicGenre"===item.MediaType;if(showFolderRuntime?(count=item.SongCount||item.ChildCount,count&&miscInfo.push(globalize.translate("sharedcomponents#TrackCount",count)),item.RunTimeTicks&&miscInfo.push(datetime.getDisplayRunningTime(item.RunTimeTicks))):"PhotoAlbum"!==item.Type&&"BoxSet"!==item.Type||(count=item.ChildCount,count&&miscInfo.push(globalize.translate("sharedcomponents#ItemCount",count))),("Episode"===item.Type||"Photo"===item.MediaType)&&options.originalAirDate!==!1&&item.PremiereDate)try{date=datetime.parseISO8601Date(item.PremiereDate),text=datetime.toLocaleDateString(date),miscInfo.push(text)}catch(e){console.log("Error parsing date: "+item.PremiereDate)}if("SeriesTimer"===item.Type&&(item.RecordAnyTime?miscInfo.push(globalize.translate("sharedcomponents#Anytime")):miscInfo.push(datetime.getDisplayTime(item.StartDate)),item.RecordAnyChannel?miscInfo.push(globalize.translate("sharedcomponents#AllChannels")):miscInfo.push(item.ChannelName||globalize.translate("sharedcomponents#OneChannel"))),item.StartDate&&"Program"!==item.Type&&"SeriesTimer"!==item.Type)try{date=datetime.parseISO8601Date(item.StartDate),text=datetime.toLocaleDateString(date),miscInfo.push(text),"Recording"!==item.Type&&(text=datetime.getDisplayTime(date),miscInfo.push(text))}catch(e){console.log("Error parsing date: "+item.StartDate)}if(options.year!==!1&&item.ProductionYear&&"Series"===item.Type)if("Continuing"===item.Status)miscInfo.push(globalize.translate("sharedcomponents#SeriesYearToPresent",item.ProductionYear));else if(item.ProductionYear){if(text=item.ProductionYear,item.EndDate)try{var endYear=datetime.parseISO8601Date(item.EndDate).getFullYear();endYear!==item.ProductionYear&&(text+="-"+datetime.parseISO8601Date(item.EndDate).getFullYear())}catch(e){console.log("Error parsing date: "+item.EndDate)}miscInfo.push(text)}if("Program"===item.Type)if(options.programIndicator!==!1&&(item.IsLive?miscInfo.push({html:'<div class="mediaInfoProgramAttribute mediaInfoItem liveTvProgram">'+globalize.translate("sharedcomponents#Live")+"</div>"}):item.IsPremiere?miscInfo.push({html:'<div class="mediaInfoProgramAttribute mediaInfoItem premiereTvProgram">'+globalize.translate("sharedcomponents#Premiere")+"</div>"}):item.IsSeries&&!item.IsRepeat?miscInfo.push({html:'<div class="mediaInfoProgramAttribute mediaInfoItem newTvProgram">'+globalize.translate("sharedcomponents#AttributeNew")+"</div>"}):item.IsSeries&&item.IsRepeat&&miscInfo.push({html:'<div class="mediaInfoProgramAttribute mediaInfoItem repeatTvProgram">'+globalize.translate("sharedcomponents#Repeat")+"</div>"})),(item.IsSeries||item.EpisodeTitle)&&options.episodeTitle!==!1)text=itemHelper.getDisplayName(item,{includeIndexNumber:options.episodeTitleIndexNumber}),text&&miscInfo.push(text);else if(item.PremiereDate&&options.originalAirDate!==!1)try{date=datetime.parseISO8601Date(item.PremiereDate),text=globalize.translate("sharedcomponents#OriginalAirDateValue",datetime.toLocaleDateString(date)),miscInfo.push(text)}catch(e){console.log("Error parsing date: "+item.PremiereDate)}else item.ProductionYear&&miscInfo.push(item.ProductionYear);if(options.year!==!1&&"Series"!==item.Type&&"Episode"!==item.Type&&"Person"!==item.Type&&"Photo"!==item.MediaType&&"Program"!==item.Type)if(item.ProductionYear)miscInfo.push(item.ProductionYear);else if(item.PremiereDate)try{text=datetime.parseISO8601Date(item.PremiereDate).getFullYear(),miscInfo.push(text)}catch(e){console.log("Error parsing date: "+item.PremiereDate)}if(item.RunTimeTicks&&"Series"!==item.Type&&"Program"!==item.Type&&!showFolderRuntime&&options.runtime!==!1&&("Audio"===item.Type?miscInfo.push(datetime.getDisplayRunningTime(item.RunTimeTicks)):(minutes=item.RunTimeTicks/6e8,minutes=minutes||1,miscInfo.push(Math.round(minutes)+" mins"))),item.OfficialRating&&"Season"!==item.Type&&"Episode"!==item.Type&&miscInfo.push({text:item.OfficialRating,cssClass:"mediaInfoOfficialRating"}),item.Video3DFormat&&miscInfo.push("3D"),"Photo"===item.MediaType&&item.Width&&item.Height&&miscInfo.push(item.Width+"x"+item.Height),options.container!==!1&&"Audio"===item.Type&&item.Container&&miscInfo.push(item.Container),html+=miscInfo.map(function(m){return getMediaInfoItem(m)}).join(""),html+=getStarIconsHtml(item),item.HasSubtitles&&options.subtitles!==!1&&(html+='<div class="mediaInfoItem mediaInfoText closedCaptionMediaInfoText">CC</div>'),item.CriticRating&&options.criticRating!==!1&&(html+=item.CriticRating>=60?'<div class="mediaInfoItem mediaInfoCriticRating mediaInfoCriticRatingFresh">'+item.CriticRating+"</div>":'<div class="mediaInfoItem mediaInfoCriticRating mediaInfoCriticRatingRotten">'+item.CriticRating+"</div>"),options.endsAt!==!1){var endsAt=getEndsAt(item);endsAt&&(html+=getMediaInfoItem(endsAt,"endsAt"))}return html}function getEndsAt(item){if("Video"===item.MediaType&&item.RunTimeTicks&&!item.StartDate){var endDate=(new Date).getTime()+item.RunTimeTicks/1e4;endDate=new Date(endDate);var displayTime=datetime.getDisplayTime(endDate);return globalize.translate("sharedcomponents#EndsAtValue",displayTime)}return null}function getEndsAtFromPosition(runtimeTicks,positionTicks,includeText){var endDate=(new Date).getTime()+(runtimeTicks-(positionTicks||0))/1e4;endDate=new Date(endDate);var displayTime=datetime.getDisplayTime(endDate);return includeText===!1?displayTime:globalize.translate("sharedcomponents#EndsAtValue",displayTime)}function getMediaInfoItem(m,cssClass){cssClass=cssClass?cssClass+" mediaInfoItem":"mediaInfoItem";var mediaInfoText=m;if("string"!=typeof m&&"number"!=typeof m){if(m.html)return m.html;mediaInfoText=m.text,cssClass+=" "+m.cssClass}return'<div class="'+cssClass+'">'+mediaInfoText+"</div>"}function getStarIconsHtml(item){var html="",rating=item.CommunityRating;return rating&&(html+='<div class="starRatingContainer mediaInfoItem">',html+='<i class="md-icon starIcon">&#xE838;</i>',html+=rating,html+="</div>"),html}function dynamicEndTime(elem,item){var interval=setInterval(function(){return document.body.contains(elem)?void(elem.innerHTML=getEndsAt(item)):void clearInterval(interval)},6e4)}function fillPrimaryMediaInfo(elem,item,options){var html=getPrimaryMediaInfoHtml(item,options);elem.innerHTML=html,afterFill(elem,item,options)}function fillSecondaryMediaInfo(elem,item,options){var html=getSecondaryMediaInfoHtml(item,options);elem.innerHTML=html,afterFill(elem,item,options)}function afterFill(elem,item,options){if(options.endsAt!==!1){var endsAtElem=elem.querySelector(".endsAt");endsAtElem&&dynamicEndTime(endsAtElem,item)}var lnkChannel=elem.querySelector(".lnkChannel");lnkChannel&&lnkChannel.addEventListener("click",onChannelLinkClick)}function onChannelLinkClick(e){var channelId=this.getAttribute("data-id"),serverId=this.getAttribute("data-serverid");return embyRouter.showItem(channelId,serverId),e.preventDefault(),!1}function getPrimaryMediaInfoHtml(item,options){return options=options||{},null==options.interactive&&(options.interactive=!1),getMediaInfoHtml(item,options)}function getSecondaryMediaInfoHtml(item,options){return options=options||{},null==options.interactive&&(options.interactive=!1),"Program"===item.Type?getProgramInfoHtml(item,options):""}function getResolutionText(item){return item.MediaSources&&item.MediaSources.length?item.MediaSources[0].MediaStreams.filter(function(i){return"Video"===i.Type}).map(function(i){if(i.Height){if(i.Width>=3800)return"4K";if(i.Width>=2500)return"1440P";if(i.Width>=1900)return"1080P";if(i.Width>=1260)return"720P";if(i.Width>=700)return"480P"}return null})[0]:null}function getAudioStreamForDisplay(item){if(!item.MediaSources)return null;var mediaSource=item.MediaSources[0];return mediaSource?(mediaSource.MediaStreams||[]).filter(function(i){return"Audio"===i.Type&&(i.Index===mediaSource.DefaultAudioStreamIndex||null==mediaSource.DefaultAudioStreamIndex)})[0]:null}function getMediaInfoStats(item,options){options=options||{};var list=[],mediaSource=(item.MediaSources||[])[0]||{},videoStream=(mediaSource.MediaStreams||[]).filter(function(i){return"Video"===i.Type})[0]||{},audioStream=getAudioStreamForDisplay(item)||{};"Dvd"===item.VideoType&&list.push({type:"mediainfo",text:"Dvd"}),"BluRay"===item.VideoType&&list.push({type:"mediainfo",text:"BluRay"});var resolutionText=getResolutionText(item);resolutionText&&list.push({type:"mediainfo",text:resolutionText}),videoStream.Codec&&list.push({type:"mediainfo",text:videoStream.Codec});var channelText,channels=audioStream.Channels;if(8===channels?channelText="7.1":7===channels?channelText="6.1":6===channels?channelText="5.1":2===channels&&(channelText="2.0"),channelText&&list.push({type:"mediainfo",text:channelText}),"dca"===audioStream.Codec&&audioStream.Profile?list.push({type:"mediainfo",text:audioStream.Profile}):audioStream.Codec&&list.push({type:"mediainfo",text:audioStream.Codec}),item.DateCreated&&itemHelper.enableDateAddedDisplay(item)){var dateCreated=datetime.parseISO8601Date(item.DateCreated);list.push({type:"added",text:globalize.translate("sharedcomponents#AddedOnValue",datetime.toLocaleDateString(dateCreated)+" "+datetime.getDisplayTime(dateCreated))})}return list}return{getMediaInfoHtml:getPrimaryMediaInfoHtml,fill:fillPrimaryMediaInfo,getEndsAt:getEndsAt,getEndsAtFromPosition:getEndsAtFromPosition,getPrimaryMediaInfoHtml:getPrimaryMediaInfoHtml,getSecondaryMediaInfoHtml:getSecondaryMediaInfoHtml,fillPrimaryMediaInfo:fillPrimaryMediaInfo,fillSecondaryMediaInfo:fillSecondaryMediaInfo,getMediaInfoStats:getMediaInfoStats}});