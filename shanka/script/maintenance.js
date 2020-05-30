/*
    Shanka HSK Flashcards - maintenance.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// Maintenance Section
shanka.initmaintenance = function() {
    shanka._updatemlocalstorageused();
    
    shanka.updateappcachestatus();
    
    document.getElementById("standalonestatus").innerHTML = String(window.navigator.standalone);
    document.getElementById("systemlanguage").innerHTML = GetUserLanguage();
    
    shanka.setlocalversioninfo();
}

shanka.updateappcachestatus = function() {
    var appcachestatus = document.getElementById("appcachestatus");
    if (appcachestatus) {
        appcachestatus.innerHTML = shanka.getappcachestatus();
    }
}

shanka._updatemlocalstorageused = function() {
    var number = JSON.stringify(localStorage).length;
    var formatted = ""
    
    if (number < 1024) {
        formatted = number.toString();
    } else {
        var suffix = "";
        if (number < 1024 * 1024) {
            number = number / 1024.0;
            suffix = "k";
        } else {
            number = number / (1024.0 * 1024);
            suffix = "M";
        }
        
        if (number < 1) {
            formatted = number.toFixed(3).toString() + suffix;
        } else if (number < 10) {
            formatted = number.toFixed(2).toString() + suffix;
        } else {
            formatted = number.toFixed(1).toString() + suffix;
        }
    }
    
    var usedlabel = STR.maintenance_storage_used_format.replace("{0}", formatted);
    document.getElementById("localstorageused").innerHTML = usedlabel;
}
