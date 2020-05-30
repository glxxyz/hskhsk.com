/*
    Shanka HSK Flashcards - version_offline.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

/* chrome://appcache-internals/ */

shanka.getOnlineAppVersion = function() {
    return STR.app_offline_status;
}

shanka.getOnlineAppBuildDate = function() {
    return "OFFLINE";
}