/*
    Shanka HSK Flashcards - util.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

function isEmpty(ob){
   for(var i in ob){ return false;}
   return true;
}

contains = function(array, obj) {
    var i = array.indexOf(obj);
    return i != -1;
}

function is_iOS() {
    return /iP(hone|od|ad)/.test(navigator.platform);
}

function is_IE() {
    return /Trident/.test(navigator.userAgent);
}

arrayAisSubsetOfB = function(arrayA, arrayB) {
    for (var i=0, len=arrayA.length; i<len; i++) {
        if (!contains(arrayB, arrayA[i])) {
            return false;
        }
    }
    return true;
}

arrayAEqualsB = function(arrayA, arrayB) {
    return (arrayA.length == arrayB.length) && arrayAisSubsetOfB(arrayA, arrayB);
}

commaAndList = function(list) {
    var text = "";
    for (var i=0, len=list.length; i<len; i++) {
        if (i > 0) {
            if (i == list.length - 1) {
                text += " and ";
            } else {
                text += ", ";
            }
        }
        text += list[i];
    }
    return text;
}

LookupAtoB = function(inputkeys, outputvalues, keys, values) {
    for (var i=0, len=inputkeys.length; i<len; i++) {
        var key = inputkeys[i];
        var index = keys.indexOf(key);
        if (index != -1) {
            var value = values[index];
            if (!contains(outputvalues, value)) {
                outputvalues.push(value);
            }
        }
    }
}

// internal errors can be silenced
var errors_enabled = true;
function ReportError(str) {

    // get it in the log first at least
    console.log(str);

    // delete this- at least prevent us from going back to this page when refreshing
    delete localStorage["state"];    

    if (errors_enabled) {
        if (!confirm(STR.app_generic_error + ":\n\n" + str + "\n\n" + STR.app_cancel_silences_error)) {
            errors_enabled = false;
        }
    }
}

function ExceptionError(context, err) {
    var str = STR.app_exception_error + " (" + context + "):\n\n";
    if (err.message) str += err.message + "\n";
    if (err.stack) str += err.stack + "\n";

    // get it in the log first at least
    console.log(str);

    // delete this- at least prevent us from going back to this page when refreshing
    delete localStorage["state"];    
    
    if (err.code === DOMException.QUOTA_EXCEEDED_ERR) {
        if (is_iOS()) {
            alert(STR.local_storage_cannot_save_ios);
        } else {
            alert(STR.local_storage_cannot_save_other);
        }
    } else {
        if (errors_enabled) {
            if (!confirm(str + STR.app_cancel_silences_error)) {
                errors_enabled = false;
            }
        }
    }
}


var wait_cursor_on = false;
function WaitCursorOn() {
    if (!wait_cursor_on) {
        wait_cursor_on = true;
        // wait 100ms before showing wait cursor
        setTimeout(WaitCursorSwitchOnTimer, 100);
    }
}

function WaitCursorSwitchOnTimer() {
    if (wait_cursor_on) {
        document.getElementById("waitcursor").style.display="inline";
        document.body.style.cursor = 'wait';            
    }
}

function WaitCursorOff() {
    wait_cursor_on = false;
    document.getElementById("waitcursor").style.display="none";
    document.body.style.cursor = 'default';        
}

function GetUserLanguage() {
    var lang = "";
    if (navigator
            && navigator.userAgent
            && (lang = navigator.userAgent
                    .match(/android.*\W(\w\w)-(\w\w)\W/i))) {
        lang = lang[1];
    }

    if ((!lang || !lang.length) && navigator) {
        if (navigator.language) {
            lang = navigator.language;
        } else if (navigator.browserLanguage) {
            lang = navigator.browserLanguage;
        } else if (navigator.systemLanguage) {
            lang = navigator.systemLanguage;
        } else if (navigator.userLanguage) {
            lang = navigator.userLanguage;
        }
        lang = lang.substr(0, 2);
    }

    console.log("current language is", lang);
    
    return lang;
}

