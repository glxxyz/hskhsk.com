/*
    Shanka HSK Flashcards - export.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

shanka.initexported = function() {
    document.getElementById("export_download_filetext").innerHTML = STR.export_download_filetext;
}

shanka.initexport = function() {
    var categorylist = document.getElementById("exportcategorylist")
    var lis = categorylist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (categorylist.firstChild) {
        categorylist.removeChild(categorylist.firstChild);
    }    

    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        
        var li=document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, categoryidstr)
                               .replace(/#NAME#/g, category.name)
                               .replace(/#ITEMS#/g, category.cardids.length.toString());
        li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
        categorylist.appendChild(li);
    }
    
    document.getElementById("export_categories_label"       ).innerHTML = STR.export_categories_label;
    document.getElementById("export_export_format_label"    ).innerHTML = STR.export_export_format_label;
    document.getElementById("export_section_shanka"         ).innerHTML = STR.import_section_shanka;
    document.getElementById("export_other_label"            ).innerHTML = STR.export_other_label;
    document.getElementById("export_lessons_label"          ).innerHTML = STR.import_lessons_label;
    document.getElementById("export_algorithms_label"       ).innerHTML = STR.import_algorithms_label;
    document.getElementById("export_settings_label"         ).innerHTML = STR.import_settings_label;
    document.getElementById("export_progress_label"         ).innerHTML = STR.import_progress_label;
    document.getElementById("export_do_export_label"        ).innerHTML = STR.export_do_export_label;
    document.getElementById("export_pleco_text_file_label"  ).innerHTML = STR.import_pleco_text_file_label;
    document.getElementById("export_stickystudy_label"      ).innerHTML = STR.import_stickystudy_label;
    document.getElementById("export_skritter_simp_label"    ).innerHTML = STR.import_skritter_simp_label;
    document.getElementById("export_skritter_trad_label"    ).innerHTML = STR.import_skritter_trad_label;
    document.getElementById("export_do_export_label2"       ).innerHTML = STR.export_do_export_label;
}

shanka.export = function(fileformat) {
    WaitCursorOn();
    try
    {   
        var exportdata = "";
        
        shanka.addtoresult(STR.export_beginning_message);

        if (fileformat == "shanka") {
            var categories = []
            var cards = []
            
            for (var categoryidstr in shanka.categories) {
                var category = shanka.categories[categoryidstr];            
                if (document.getElementById("exportcategories" + categoryidstr).classList.contains("active")) {
                    categories.push(category);
                    for (var i=0, len=category.cardids.length; i<len; i++)
                    {
                        var cardid = category.cardids[i];
                        var card = shanka.cards[cardid];
                        var array = card.toarray();
                        array.push(card.getdefinition());
                        array.push(card.getnotes());
                        array.push(card.getdatastring());
                        cards.push(array);
                    }                
                }            
            }
            
            var exportobj = {"categories" : categories, "cards" : cards};
            
            if (document.getElementById("exportsettings").classList.contains("active")) {
                exportobj["settings"] = shanka.settings;
            }
            if (document.getElementById("exportlessons").classList.contains("active")) {
                exportobj["lessons"] = shanka.lessons;
                exportobj["questions"] = shanka.questions;
            }
            if (document.getElementById("exportalgorithms").classList.contains("active")) {
                exportobj["algorithms"] = shanka.algorithms;
            }
            if (document.getElementById("exportprogress").classList.contains("active")) {
                exportobj["progress"] = shanka.progress;
            }
            
            exportdata = JSON.stringify(exportobj)
        }
        else {
            for (var categoryidstr in shanka.categories) {
                var category = shanka.categories[categoryidstr];            
                if (document.getElementById("exportcategories" + categoryidstr).classList.contains("active"))
                {               
                    if (fileformat == "pleco") {
                        if (exportdata.length) {
                            exportdata += "\n";
                        }
                        exportdata += "//" + category.name + "\n";
                    }
                    
                    for (var i=0, len=category.cardids.length; i<len; i++)
                    {
                        var cardid = category.cardids[i];
                        var card = shanka.cards[cardid];
                        
                        if (fileformat == "pleco") {
                            if (card.simplified.length) exportdata += card.simplified;
                            if (card.traditional.length) {
                                if (card.simplified.length == 0) exportdata += card.traditional;
                                else if (card.simplified != card.traditional) exportdata += "[" + card.traditional + "]";
                            }
                            // TODO: use pinyin tone numbers not marks
                            exportdata += "\t" + card.pinyin + "\t" + card.getdefinition() + "\n"
                        } else if (fileformat == "sticky") {
                            exportdata += card.simplified + "\t"
                                        + card.traditional + "\t"
                                        + card.pinyin + "\t" // TODO: this one should be numbered pinyin
                                        + card.pinyin + "\t"  
                                        + card.getdefinition() + "\n"
                        } else if (document.getElementById("dataformatsimp").classList.contains("active")) {
                            if (card.simplified.length) exportdata += card.simplified + "\n";
                        } else { // trad
                            if (card.traditional.length) exportdata += card.traditional + "\n";
                        }                    
                    }                
                }            
            }
        }    
        
        shanka.navigate({"section" : "exported"});
        document.getElementById("exporttextdata").value = exportdata;
        
        shanka.addtoresult(STR.export_success_message);
    }
    catch(err)
    {
        ExceptionError("export", err);
    }
    WaitCursorOff();
 }

