/*
    Shanka HSK Flashcards - settings.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// Settings Section
shanka.getsetting = function(key) {
    if (key in shanka.settings) {
        return shanka.settings[key];
    }
    
    return shanka.getdefault(key);
}

shanka.getdefault = function(key) {
    // default values
    switch (key.toString()) {
        case "lastcategoryid": return "0";
        
        // study settings
        case "brushcolour":  return "302821"; // "000000";
        case "backgcolour":  return "FDFFF5"; // "FFFFFF";
        case "gridcolour":   return "EEEDE0"; // "eeeeee";
        case "bordercolour": return "B8A983"; // "888888";
        case "brushwidth": return "12";
        case "script": return "simplified";
        case "guide": return "star";
        
        case "tonecolourenable": return "true";
        case "tone1colour": return "FF0000"; // Red 	(rgb 255,0,0)	 - from Marjolein, thanks!
        case "tone2colour": return "FFAA00"; // Orange 	(rgb 255,170,0)	
        case "tone3colour": return "00A000"; // Green 	(rgb 0, 160,0)	
        case "tone4colour": return "0000FF"; // Blue 	(rgb 0,0,255)	
        case "tone5colour": return "5D5D5D"; // Grey	(rgb 93,93,93)	
        
        case "rating1title": return STR.settings_response_1_default;
        case "rating2title": return STR.settings_response_2_default;
        case "rating3title": return STR.settings_response_3_default;
        case "rating4title": return STR.settings_response_4_default;
        case "rating5title": return STR.settings_response_5_default;
        case "rating1enable": return "true";
        case "rating2enable": return "true";
        case "rating3enable": return "true";
        case "rating4enable": return "true";
        case "rating5enable": return "true";
        case "rating5enable": return "true";
        case "addcardsmethod": return "auto";
        case "pinyintones": return "marks";
        case "autoadvance": return "true";
        case "script": return "simplified";
        
        // stats
        case "cardslearned": return "0";
        case "cardsstudied": return "0";   

        // version
        case "currentversionnum": return "0";
        case "currentversiondate": return "2013-12-01";   
    }
    
    return "";
}

shanka.setsetting = function(key, value) {
    if (value == shanka.getdefault(key)) {
        delete shanka.settings[key.toString()];
    } else {
        shanka.settings[key.toString()] = value.toString();
    }
}

shanka.writesettings = function() {
    localStorage["settings"] = shanka.compress(JSON.stringify(shanka.settings));
}

var penColorPicker = null;
var bgColorPicker = null;

shanka.initsettings = function() {
    if (shanka.getsetting("addcardsmethod") == "auto") {document.getElementById("studyaddauto").classList.add("active");}
    if (shanka.getsetting("pinyintones") == "marks") {document.getElementById("pinyinmarks").classList.add("active");}
    if (shanka.getsetting("autoadvance") == "true") {document.getElementById("autoadvance").classList.add("active");}

    if (shanka.getsetting("script") == "simplified" ) {document.getElementById("scriptsimplified" ).classList.add("active");}
    if (shanka.getsetting("script") == "traditional") {document.getElementById("scripttraditional").classList.add("active");}
    if (shanka.getsetting("script") == "simptrad"   ) {document.getElementById("scriptsimptrad"   ).classList.add("active");}
    if (shanka.getsetting("script") == "tradsimp"   ) {document.getElementById("scripttradsimp"   ).classList.add("active");}

    document.getElementById("rating1title").value = shanka.getsetting("rating1title");
    document.getElementById("rating2title").value = shanka.getsetting("rating2title");
    document.getElementById("rating3title").value = shanka.getsetting("rating3title");
    document.getElementById("rating4title").value = shanka.getsetting("rating4title");
    document.getElementById("rating5title").value = shanka.getsetting("rating5title");

    if (shanka.getsetting("guide") == "star")  {document.getElementById("guidestar" ).classList.add("active");}
    if (shanka.getsetting("guide") == "grid")  {document.getElementById("guidegrid" ).classList.add("active");}
    if (shanka.getsetting("guide") == "cross") {document.getElementById("guidecross").classList.add("active");}
    if (shanka.getsetting("guide") == "bar")   {document.getElementById("guidebar"  ).classList.add("active");}
    if (shanka.getsetting("guide") == "none")  {document.getElementById("guidenone" ).classList.add("active");}    

    if (shanka.getsetting("rating1enable") == "true") {document.getElementById("rating1enable").classList.add("active");}
    if (shanka.getsetting("rating2enable") == "true") {document.getElementById("rating2enable").classList.add("active");}
    if (shanka.getsetting("rating3enable") == "true") {document.getElementById("rating3enable").classList.add("active");}
    if (shanka.getsetting("rating4enable") == "true") {document.getElementById("rating4enable").classList.add("active");}
    if (shanka.getsetting("rating5enable") == "true") {document.getElementById("rating5enable").classList.add("active");}    

    var brushcolour = document.getElementById("brushcolour");
    brushcolour.value = shanka.getsetting("brushcolour");
    var brushcolourPicker = new jscolor.color(brushcolour, {"pickerMode":"HVS", "pickerClosable":true});
    brushcolourPicker.pickerPosition = 'top';
    
    var backgcolour = document.getElementById("backgcolour");
    backgcolour.value = shanka.getsetting("backgcolour");
    var backgcolourPicker = new jscolor.color(backgcolour, {"pickerMode":"HSV", "pickerClosable":true});
    backgcolourPicker.pickerPosition = 'top';

    var gridcolour = document.getElementById("gridcolour");
    gridcolour.value = shanka.getsetting("gridcolour");
    var gridcolourPicker = new jscolor.color(gridcolour, {"pickerMode":"HSV", "pickerClosable":true});
    gridcolourPicker.pickerPosition = 'top';

    var bordercolour = document.getElementById("bordercolour");
    bordercolour.value = shanka.getsetting("bordercolour");
    var bordercolourPicker = new jscolor.color(bordercolour, {"pickerMode":"HSV", "pickerClosable":true});
    bordercolourPicker.pickerPosition = 'top';

    var brushwidth = document.getElementById("brushwidth");
    brushwidth.value = shanka.getsetting("brushwidth");
    
    var tone1colour = document.getElementById("tone1colour");
    tone1colour.value = shanka.getsetting("tone1colour");
    var tone1colourPicker = new jscolor.color(tone1colour, {"pickerMode":"HSV", "pickerClosable":true});
    tone1colourPicker.pickerPosition = 'top';

    var tone2colour = document.getElementById("tone2colour");
    tone2colour.value = shanka.getsetting("tone2colour");
    var tone2colourPicker = new jscolor.color(tone2colour, {"pickerMode":"HSV", "pickerClosable":true});
    tone2colourPicker.pickerPosition = 'top';

    var tone3colour = document.getElementById("tone3colour");
    tone3colour.value = shanka.getsetting("tone3colour");
    var tone3colourPicker = new jscolor.color(tone3colour, {"pickerMode":"HSV", "pickerClosable":true});
    tone3colourPicker.pickerPosition = 'top';

    var tone4colour = document.getElementById("tone4colour");
    tone4colour.value = shanka.getsetting("tone4colour");
    var tone4colourPicker = new jscolor.color(tone4colour, {"pickerMode":"HSV", "pickerClosable":true});
    tone4colourPicker.pickerPosition = 'top';

    var tone5colour = document.getElementById("tone5colour");
    tone5colour.value = shanka.getsetting("tone5colour");
    var tone5colourPicker = new jscolor.color(tone5colour, {"pickerMode":"HSV", "pickerClosable":true});
    tone5colourPicker.pickerPosition = 'top';

    if (shanka.getsetting("tonecolourenable") == "true") {document.getElementById("tonecolourenable").classList.add("active");}        
    
    shanka.tonecolourenableclicked();
}

shanka.dosavesettings = function() {

    if (  (document.getElementById("rating1enable").classList.contains("active") ? 1 : 0)
        + (document.getElementById("rating2enable").classList.contains("active") ? 1 : 0)
        + (document.getElementById("rating3enable").classList.contains("active") ? 1 : 0)
        + (document.getElementById("rating4enable").classList.contains("active") ? 1 : 0)
        + (document.getElementById("rating5enable").classList.contains("active") ? 1 : 0) < 2) {
        alert(STR.settings_must_enable_two_buttons_error);
        return;
    }

    if (   (document.getElementById("rating1enable").classList.contains("active") && !document.getElementById("rating1title").value.length)
        || (document.getElementById("rating2enable").classList.contains("active") && !document.getElementById("rating2title").value.length)
        || (document.getElementById("rating3enable").classList.contains("active") && !document.getElementById("rating3title").value.length)
        || (document.getElementById("rating4enable").classList.contains("active") && !document.getElementById("rating4title").value.length)
        || (document.getElementById("rating5enable").classList.contains("active") && !document.getElementById("rating5title").value.length)) {
        alert(STR.settings_each_enabled_rating_must_have_val_error);
        return;
    }
    
    if (document.getElementById("scriptsimplified").classList.contains("active")) {
        shanka.setsetting("script", "simplified");
    } else if (document.getElementById("scripttraditional").classList.contains("active")) {
        shanka.setsetting("script", "traditional");
    } else if (document.getElementById("scriptsimptrad").classList.contains("active")) {
        shanka.setsetting("script", "simptrad");
    } else {
        shanka.setsetting("script", "tradsimp");
    }
    
    if (document.getElementById("guidestar" ).classList.contains("active")) { shanka.setsetting("guide", "star");  }
    if (document.getElementById("guidegrid" ).classList.contains("active")) { shanka.setsetting("guide", "grid");  }
    if (document.getElementById("guidecross").classList.contains("active")) { shanka.setsetting("guide", "cross"); }
    if (document.getElementById("guidebar"  ).classList.contains("active")) { shanka.setsetting("guide", "bar");   }
    if (document.getElementById("guidenone" ).classList.contains("active")) { shanka.setsetting("guide", "none");  }        

    shanka.setsetting("addcardsmethod", document.getElementById("studyaddauto").classList.contains("active") ? "auto" : "manual");
    shanka.setsetting("pinyintones", document.getElementById("pinyinmarks").classList.contains("active") ? "marks" : "numbers");
    shanka.setsetting("autoadvance", document.getElementById("autoadvance").classList.contains("active") ? "true" : "false");

    shanka.setsetting("rating1title", document.getElementById("rating1title").value);
    shanka.setsetting("rating2title", document.getElementById("rating2title").value);
    shanka.setsetting("rating3title", document.getElementById("rating3title").value);
    shanka.setsetting("rating4title", document.getElementById("rating4title").value);
    shanka.setsetting("rating5title", document.getElementById("rating5title").value);
    
    shanka.setsetting("rating1enable", document.getElementById("rating1enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating2enable", document.getElementById("rating2enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating3enable", document.getElementById("rating3enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating4enable", document.getElementById("rating4enable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("rating5enable", document.getElementById("rating5enable").classList.contains("active") ? "true" : "false");

    shanka.setsetting("brushcolour",  document.getElementById("brushcolour" ).value);
    shanka.setsetting("backgcolour",  document.getElementById("backgcolour" ).value);
    shanka.setsetting("gridcolour",   document.getElementById("gridcolour"  ).value);
    shanka.setsetting("bordercolour", document.getElementById("bordercolour").value);
    shanka.setsetting("brushwidth",   document.getElementById("brushwidth"  ).value);
    
    shanka.setsetting("tonecolourenable", document.getElementById("tonecolourenable").classList.contains("active") ? "true" : "false");
    shanka.setsetting("tone1colour", document.getElementById("tone1colour").value);
    shanka.setsetting("tone2colour", document.getElementById("tone2colour").value);
    shanka.setsetting("tone3colour", document.getElementById("tone3colour").value);
    shanka.setsetting("tone4colour", document.getElementById("tone4colour").value);
    shanka.setsetting("tone5colour", document.getElementById("tone5colour").value);
    
    shanka.writesettings();
    
    shanka.showmain();
    
    shanka.addtoresult(STR.settings_saved_message);
}

shanka.tonecolourenableclicked = function() {
    var tone1colour = document.getElementById("tone1colour");
    var tone2colour = document.getElementById("tone2colour");
    var tone3colour = document.getElementById("tone3colour");
    var tone4colour = document.getElementById("tone4colour");
    var tone5colour = document.getElementById("tone5colour");
    var tonecolourenable = document.getElementById("tonecolourenable");

    if (tonecolourenable.classList.contains("active")) {
        tone1colour.removeAttribute("disabled")
        tone2colour.removeAttribute("disabled")
        tone3colour.removeAttribute("disabled")
        tone4colour.removeAttribute("disabled")
        tone5colour.removeAttribute("disabled")
        tone1colour.parentElement.classList.remove("disabled");
        tone2colour.parentElement.classList.remove("disabled");
        tone3colour.parentElement.classList.remove("disabled");
        tone4colour.parentElement.classList.remove("disabled");
        tone5colour.parentElement.classList.remove("disabled");
    } else {
        tone1colour.disabled = "disabled";
        tone2colour.disabled = "disabled";
        tone3colour.disabled = "disabled";
        tone4colour.disabled = "disabled";
        tone5colour.disabled = "disabled";
        tone1colour.parentElement.classList.add("disabled");
        tone2colour.parentElement.classList.add("disabled");
        tone3colour.parentElement.classList.add("disabled");
        tone4colour.parentElement.classList.add("disabled");
        tone5colour.parentElement.classList.add("disabled");
    }
}
