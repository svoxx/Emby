define(["playbackSettings","userSettingsBuilder","dom","globalize","loading","userSettings","listViewStyle"],function(PlaybackSettings,userSettingsBuilder,dom,globalize,loading,currentUserSettings){"use strict";return function(view,params){var settingsInstance,userId=params.userId||ApiClient.getCurrentUserId(),userSettings=userId===ApiClient.getCurrentUserId()?currentUserSettings:new userSettingsBuilder,autoSave=!0;view.addEventListener("viewshow",function(){settingsInstance?settingsInstance.loadData():settingsInstance=new PlaybackSettings({serverId:ApiClient.serverId(),userId:userId,element:view.querySelector(".settingsContainer"),userSettings:userSettings,enableSaveButton:!autoSave,enableSaveConfirmation:!autoSave})}),view.addEventListener("viewbeforehide",function(){autoSave&&settingsInstance&&settingsInstance.submit()}),view.addEventListener("viewdestroy",function(){settingsInstance&&(settingsInstance.destroy(),settingsInstance=null)})}});