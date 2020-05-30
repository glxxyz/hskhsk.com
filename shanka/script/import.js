/*
    Shanka HSK Flashcards - import.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

shanka.import = function(data, format, categoryname, ishttp, callbackafterimport) {
    WaitCursorOn();
    try
    {
        var newcatid = 0;
        
        if (categoryname)
        {
            newcatid = shanka.findorcreatecategory(categoryname);
        }
        
        if (ishttp || data.slice(0,4) == "http") {
            shanka.addtoresult(STR.import_downloading_file_message);
            var xhr = new XMLHttpRequest(); 
            xhr.open('GET', data, true); 
            xhr.responseType = "text";
            xhr.onreadystatechange = function () { 
                if (xhr.readyState == 4) {
                    shanka.continueimport(xhr.response, format, newcatid, callbackafterimport);
                }
            };
            xhr.onerror = function (e) {
            	e;
                ReportError(STR.import_generic_error + ": " + xhr.statusText);
            };
            xhr.ontimeout = function () {
                ReportError(STR.import_timed_out_error);
            };            
            xhr.onabort = function () {
                ReportError(STR.import_aborted_error);
            };            
            xhr.send(null);        
        } else {
            shanka.continueimport(data, format, newcatid, callbackafterimport);
        }
    }
    catch(err)
    {
        ExceptionError("import", err);
    }
}

shanka.continueimport = function(response, format, categoryid, callbackafterimport) {
    try
    {
        shanka.addtoresult(STR.import_parsing_data_message);
        var countcreated = 0;
        var countmerged = 0;

        var defaultcategory = null;
        if (categoryid >= 0 && categoryid in shanka.categories) {
            defaultcategory = shanka.categories[categoryid];
        }
        
        // TODO: check for duplicate cards when adding
        if (format == "shanka") {
            var importobj = JSON.parse(response);
            for (var key in importobj) {
                // TODO
                switch (key) {
                    case "categories":
                        break;
                    case "cards":
                        break;
                    case "settings":
                        break;
                    case "lessons":
                        break;
                    case "questions":
                        break;
                    case "algorithms":
                        break;
                    case "progress":
                        break;
                    default:
                        ReportError("continueimport: unknown object key: " + key);
                        break;
                }
            }
        } else if (format == "sticky") {
            var lines = response.split("\n");
            for (var i=0, len=lines.length; i<len; i++) {
                var line = lines[i].replace(/\r/g, "");
                var splitted = line.split("\t");
                if (splitted && splitted.length == 5) {
                    var card = new Card;
                    card.simplified = splitted[0];
                    card.traditional = splitted[1];
                    card.pinyin = splitted[3];
                    card.setdefinition(splitted[4].replace(/\s*\|\s*/g, "\n")); // unfold ugly newline replacement I introduced making these lists
                    
                    if (card.simplified.length || card.traditional.length) {
                        var cardfound = shanka.mergeimportedcardwithexisting(card);
                        
                        if (cardfound) {
                            card = cardfound;
                            countmerged++;
                        } else {
                            card.cardid = shanka.getnextguid();     
                            shanka.cards[card.cardid] = card;

                            shanka.addtocharmap(card.simplified, card.cardid);
                            shanka.addtocharmap(card.traditional, card.cardid);
                
                            countcreated++;
                        }
                        
                        if (!contains(card.categoryids, categoryid)) {
                            card.categoryids.push(categoryid);
                            // add the reverse link
                            defaultcategory.cardids.push(card.cardid);
                        }
                        
                        card.write();
                    }
                }
            }
        } else if (format == "plecotext") {
            var lines = response.split("\n");
            for (var i=0, len=lines.length; i<len; i++) {
                var line = lines[i].replace(/\r/g, "");
                
                if (line.charAt(0) == "/") {
                    var catname = line;
                    while (catname.charAt(0) == "/") {
                        catname = catname.slice(1);
                    }
                    catname = catname.replace("/", " ");
                    categoryid = shanka.findorcreatecategory(catname);
                    defaultcategory.write();
                    defaultcategory = shanka.categories[categoryid];
                } else {
                    var splitted = line.split("\t");
                    if (splitted && splitted.length >= 1) {
                        var card = new Card;
                        if (contains(splitted[0], "[")) {
                            var split = splitted[0].split("[");
                            card.simplified = split[0];
                            card.traditional = split[1].replace("]", "");
                        } else {
                            card.simplified = splitted[0];
                            card.traditional = splitted[0];
                        }
                        
                        if (splitted.length >= 2) {
                            card.pinyin = splitted[1];
                        }
         
                        if (splitted.length >= 3) {
                            card.setdefinition(splitted[2]);
                        }
                        
                        if (card.simplified.length || card.traditional.length) {
                            var cardfound = shanka.mergeimportedcardwithexisting(card);
                            
                            if (cardfound) {
                                card = cardfound;
                                countmerged++;
                            } else {
                                card.cardid = shanka.getnextguid();       
                                shanka.cards[card.cardid] = card;

                                shanka.addtocharmap(card.simplified, card.cardid);
                                shanka.addtocharmap(card.traditional, card.cardid);
                    
                                countcreated++;
                            }
                            
                            if (!contains(card.categoryids, categoryid)) {
                                card.categoryids.push(categoryid);
                                // add the reverse link
                                defaultcategory.cardids.push(card.cardid);
                            }
                            
                            card.write();
                        }
                    }
                }
            }
        } else if (format == "plecoxml") {
            // var parser = new DOMParser();
            // var xmlDoc = parser.parseFromString(response,"text/xml");
            // xmlDoc.getElementsByTagName("to")[0].childNodes[0].nodeValue;
            // TODO
        } else if (format == "skrittersimp") {
            // TODO
        } else if (format == "skrittertrad") {
            // TODO
        }
        
        defaultcategory.write();

        callbackafterimport(defaultcategory, countcreated, countmerged);
    }
    catch(err)
    {
        ExceptionError("continueimport", err);
    }
    WaitCursorOff();
}

shanka.initimport = function() {
    var categorylist = document.getElementById("categorylist");
    
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        
        var option=document.createElement("option");
        option.text  = category.name + " (" + category.cardids.length.toString() + ")";
        option.value = category.name;
        categorylist.add(option, null);
    }
    
    document.getElementById("import_section_quick"        ).innerHTML = STR.import_section_quick;    
    document.getElementById("import_section_shanka"       ).innerHTML = STR.import_section_shanka;      
    document.getElementById("import_section_other"        ).innerHTML = STR.import_section_other;      
    document.getElementById("import_hsk1_label"           ).innerHTML = STR.import_hsk1_label;
    document.getElementById("import_hsk2_label"           ).innerHTML = STR.import_hsk2_label; 
    document.getElementById("import_hsk3_label"           ).innerHTML = STR.import_hsk3_label;          
    document.getElementById("import_hsk4_label"           ).innerHTML = STR.import_hsk4_label;          
    document.getElementById("import_hsk5_label"           ).innerHTML = STR.import_hsk5_label;          
    document.getElementById("import_hsk6_label"           ).innerHTML = STR.import_hsk6_label;          
    document.getElementById("import_hsk1_sentences_label" ).innerHTML = STR.import_hsk1_sentences_label;
    document.getElementById("import_hsk2_sentences_label" ).innerHTML = STR.import_hsk2_sentences_label;
    document.getElementById("import_hsk3_sentences_label" ).innerHTML = STR.import_hsk3_sentences_label;
    document.getElementById("import_chineasy_label"       ).innerHTML = STR.import_chineasy_label;      
    document.getElementById("import_flashcards_label"      ).innerHTML = STR.import_flashcards_label;
    document.getElementById("import_lessons_label"         ).innerHTML = STR.import_lessons_label;
    document.getElementById("import_algorithms_label"      ).innerHTML = STR.import_algorithms_label;
    document.getElementById("import_settings_label"        ).innerHTML = STR.import_settings_label;
    document.getElementById("import_progress_label"        ).innerHTML = STR.import_progress_label;
    document.getElementById("import_paste_text_label"      ).innerHTML = STR.import_paste_text_label;
    document.getElementById("import_pleco_text_file_label" ).innerHTML = STR.import_pleco_text_file_label;
    document.getElementById("import_pleco_xml_file_label"  ).innerHTML = STR.import_pleco_xml_file_label;
    document.getElementById("import_stickystudy_label"     ).innerHTML = STR.import_stickystudy_label;
    document.getElementById("import_skritter_simp_label"   ).innerHTML = STR.import_skritter_simp_label;
    document.getElementById("import_skritter_trad_label"   ).innerHTML = STR.import_skritter_trad_label;
    document.getElementById("import_default_category_label").innerHTML = STR.import_default_category_label;
    document.getElementById("import_paste_text_label2"     ).innerHTML = STR.import_paste_text_label;
    document.getElementById("import_button_title"          ).innerHTML = STR.page_import_title;
}

shanka.doimport = function() {
    var data = "";
    var format = "";
    var categoryname = "";
    
    if (document.getElementById("import-shanka-button").classList.contains("active")) {
        data = document.getElementById("importdatashanka").value;
        format = "shanka";
        categoryname = null; // ignore
    } else {
        if (document.getElementById("importplecoxml").classList.contains("active")) {
            format = "plecoxml";
        } else if (document.getElementById("importplecotext").classList.contains("active")) {
            format = "plecotext";
        } else if (document.getElementById("importsticky").classList.contains("active")) {
            format = "sticky";
        } else if (document.getElementById("importsimp").classList.contains("active")) {
            format = "skrittersimp";
        } else {
            format = "skrittertrad";
        }
        data = document.getElementById("importdataother").value;
        
        var categorylist = document.getElementById("categorylist");
        categoryname = categorylist.options[categorylist.selectedIndex].value;
    }
    
    shanka.import(data, format, categoryname, false, function(category, created, merged) {
    	category;
        shanka.showmain();        
        shanka.addtoresult(STR.wizard_created_flashcards_format.replace("{0}", created.toString()));
        if (merged) {
            shanka.addtoresult(STR.wizard_merged_flashcards_format.replace("{0}", merged.toString()));
        }
    });
}

shanka.findorcreatecategory = function(categoryname) {
    var newcatid = null;
    
    for (var categoryidstr in shanka.categories) {
        var category = shanka.categories[categoryidstr];
        if (categoryname == category.name) {
            newcatid = category.categoryid;
            break;
        }
    }
    
    if (newcatid == null) {
        var newcategory = new Category();
        newcategory.name = categoryname;
        newcategory.categoryid = shanka.getnextguid();   
        newcategory.write();
        shanka.categories[newcategory.categoryid] = newcategory;
        newcategory.write();
        shanka.setsetting("lastcategoryid", newcategory.categoryid);
        newcatid = newcategory.categoryid;
    }
    
    return newcatid;
}

shanka.importHSK1Wrapper = function() {
    shanka.importHSK1(shanka.importdefaultcallback);
}
shanka.importHSK2Wrapper = function() {
    shanka.importHSK2(shanka.importdefaultcallback);
}
shanka.importHSK3Wrapper = function() {
    shanka.importHSK3(shanka.importdefaultcallback);
}
shanka.importHSK4Wrapper = function() {
    shanka.importHSK4(shanka.importdefaultcallback);
}
shanka.importHSK5Wrapper = function() {
    shanka.importHSK5(shanka.importdefaultcallback);
}
shanka.importHSK6Wrapper = function() {
    shanka.importHSK6(shanka.importdefaultcallback);
}
shanka.importHSK1SentencesWrapper = function() {
    shanka.importHSK1Sentences(shanka.importdefaultcallback);
}
shanka.importHSK2SentencesWrapper = function() {
    shanka.importHSK2Sentences(shanka.importdefaultcallback);
}
shanka.importHSK3SentencesWrapper = function() {
    shanka.importHSK3Sentences(shanka.importdefaultcallback);
}
shanka.importChineasyWrapper = function() {
    shanka.importChineasy(shanka.importdefaultcallback);
}

shanka.importdefaultcallback = function(category, created, merged) {
    shanka.showcategory(category.categoryid);
    shanka.addtoresult(STR.wizard_created_flashcards_format.replace("{0}", created.toString()));
    if (merged) {
        shanka.addtoresult(STR.wizard_merged_flashcards_format.replace("{0}", merged.toString()));
    }
}





