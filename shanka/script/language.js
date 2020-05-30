/*
    Shanka HSK Flashcards - version.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any dervied work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

function language() {

    this.primary_language = new lang_english();
    this.fallback_language = new lang_english();

    // fetch a string from the primary or secondary language
    this.get_str = function(id) {
        if (this.primary_language .hasOwnProperty(id)) {
            return this.primary_language[id];
        }
        
        if (this.fallback_language.hasOwnProperty(id)) {
            
            ReportError("get_str id not in primary language: " + id);
            
            return this.fallback_language[id];
        }
        
        ReportError("get_str id not found: " + id);
        
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
}

// define the global string accessor object
var STR = new language();
