define(["libraryBrowser","events","serverNotifications","connectionManager","globalize","listViewStyle"],function(libraryBrowser,events,serverNotifications,connectionManager,globalize){"use strict";function updateNotificationCount(apiClient){var userId=apiClient.getCurrentUserId();userId&&apiClient.getNotificationSummary(userId).then(function(summary){var btnNotificationsInner=document.querySelector(".btnNotificationsInner");btnNotificationsInner&&(btnNotificationsInner.classList.remove("levelNormal"),btnNotificationsInner.classList.remove("levelWarning"),btnNotificationsInner.classList.remove("levelError"),btnNotificationsInner.innerHTML=summary.UnreadCount,summary.UnreadCount?(btnNotificationsInner.classList.add("level"+summary.MaxUnreadNotificationLevel),btnNotificationsInner.classList.remove("hide")):btnNotificationsInner.classList.add("hide"))},function(){})}function notifications(){var self=this;self.total=0,self.markNotificationsRead=function(ids,callback){ApiClient.markNotificationsRead(ApiClient.getCurrentUserId(),ids,!0).then(function(){updateNotificationCount(ApiClient),callback&&callback()})},self.showNotificationsList=function(startIndex,limit,elem){refreshNotifications(startIndex,limit,elem,!0)}}function refreshNotifications(startIndex,limit,elem,showPaging){var apiClient=window.ApiClient;if(apiClient)return apiClient.getNotifications(apiClient.getCurrentUserId(),{StartIndex:startIndex,Limit:limit}).then(function(result){listUnreadNotifications(result.Notifications,result.TotalRecordCount,startIndex,limit,elem,showPaging)})}function listUnreadNotifications(list,totalRecordCount,startIndex,limit,elem,showPaging){if(!totalRecordCount)return void(elem.innerHTML='<p style="padding:.5em 1em;">'+globalize.translate("LabelNoUnreadNotifications")+"</p>");Notifications.total=totalRecordCount;var html="";if(totalRecordCount>limit&&!0===showPaging){var query={StartIndex:startIndex,Limit:limit};html+=libraryBrowser.getQueryPagingHtml({startIndex:query.StartIndex,limit:query.Limit,totalRecordCount:totalRecordCount,showLimit:!1,updatePageSizeSetting:!1})}require(["humanedate"],function(){for(var i=0,length=list.length;i<length;i++){var notification=list[i];html+=getNotificationHtml(notification)}elem.innerHTML=html})}function getNotificationHtml(notification){var itemHtml="";return notification.Url&&(itemHtml+='<a class="clearLink" href="'+notification.Url+'" target="_blank">'),itemHtml+='<div class="listItem">',"Error"==notification.Level?itemHtml+='<i class="listItemIcon md-icon" style="background:#cc3333;">error</i>':itemHtml+='<i class="listItemIcon md-icon">dvr</i>',itemHtml+='<div class="listItemBody three-line">',itemHtml+='<h3 class="listItemBodyText">',itemHtml+=notification.Name,itemHtml+="</h3>",itemHtml+='<div class="listItemBodyText secondary">',itemHtml+=humane_date(notification.Date),itemHtml+="</div>",notification.Description&&(itemHtml+='<div class="listItemBodyText secondary listItemBodyText-nowrap">',itemHtml+=notification.Description,itemHtml+="</div>"),itemHtml+="</div>",itemHtml+="</div>",notification.Url&&(itemHtml+="</a>"),itemHtml}function onServerNotificationEvent(e,apiClient){updateNotificationCount(apiClient)}window.Notifications=new notifications,events.on(connectionManager,"localusersignedin",function(e,user){updateNotificationCount(connectionManager.getApiClient(user.ServerId))}),events.on(serverNotifications,"NotificationUpdated",onServerNotificationEvent),events.on(serverNotifications,"NotificationAdded",onServerNotificationEvent),events.on(serverNotifications,"NotificationsMarkedRead",onServerNotificationEvent),connectionManager.currentApiClient()&&updateNotificationCount(connectionManager.currentApiClient())});