/*
    Shanka HSK Flashcards - language.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

var supportedLanguages = {
    "en" : new lang_english(),
    "nl" : new lang_dutch(),
    "es" : new lang_spanish()
//    "de" : new lang_german(),
//    "fr" : new lang_french(),
//    "it" : new lang_italian(),
}

// language object
function language() {

    this.getCurrentLanguage = function() {
        return localStorage["language"];
    }
    
    this.setLanguage = function(language) {
        if (language in supportedLanguages) {
            localStorage["language"] = language;
            this.primary_language = supportedLanguages[language];
            shanka.init();
            shanka.showmain();
        }
    }

    var currentState = parseWindowLocation();
    // Set the current language for string resources
    if (currentState && "section" in currentState) {
        var section = currentState["section"];
        if (section.substr(0, 4) == "lang") {
            var language = section.substr(5);
            if (language in supportedLanguages) {
                localStorage["language"] = language;
            }
        }
    }
    
    if (localStorage["language"]) {
        var language = localStorage["language"];
        this.primary_language = supportedLanguages[language];
    } else {
        // fall back on English
        this.primary_language = supportedLanguages["en"];
        localStorage["language"] = "en";
    }
        
    this.fallback_language = supportedLanguages["en"]; // always English for now

    // fetch a string from the primary or secondary language
    this.get_str = function(id) {
        if (this.primary_language && this.primary_language.hasOwnProperty(id)) {
            return this.primary_language[id];
        }
        
        if (this.fallback_language.hasOwnProperty(id)) {
            
           console.log("get_str id not in primary language: " + id);
            
            return this.fallback_language[id];
        }
        
        console.log("get_str id not found: " + id);
        
        return "";
    }
    
    // define a 'getter' accessor for a property
    this.declare_str = function(id) {
        Object.defineProperty(this, id,
        {
            get : function() { return this.get_str(id); }
        });
    }
    
    // declare a getter for each English string
    for (var prop in this.fallback_language) {
        this.declare_str(prop);
    }
    
    // get a given language's name in the current language
    this.get_language_name = function(languageId) {
        switch (languageId) {
            case "en":
                return this.lang_english_language;
                break;
            case "nl":
                return this.lang_dutch_language;
                break;
            case "es":
                return this.lang_spanish_language;
                break;
            case "de":
                return this.lang_german_language;
                break;
            case "fr":
                return this.lang_french_language;
                break;
            case "it":
                return this.lang_italian_language;
                break;
        }
        
        return "unknown";
    }    
}

// define the global string accessor object
var STR = new language();
