/*
    Shanka HSK Flashcards - card.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// Card stores individual flash cards

function Card () {
    this.cardid = 0;
    this.enabled = true;
    this.queued = false;
    this.simplified = "";
    this.traditional = "";
    this.pinyin = "";
    this.kn_rate = 0;
    this.last_time = 0;
    this.next_time = 0;
    this.test_count = 0;

    // not read, but written to disk
    this._definition = null;
    this._notes = null;
    this._data = null; // {"ks" : 0.5, "kt" : 0.8, ...}
    
    // not stored
    this.categoryids = []; // array of category ids
};

// ---------------------------
// Card methods

Card.prototype._getdefault

Card.prototype._getdefault = function(section, keystem, keyans) {
    switch (section) {
        // no need to switch on keystem or keyans
        case "kn_rate":    return 0.5; break;
        case "last_time":  return 0; break;
        case "next_time":  return 0; break;
        case "last_score": return 0; break;
        case "question_count": return 0; break;
        case "correct_count": return 0; break;
        default: Error("Card._getdefault unknown section: " + section);
    }
    return "";
}

Card.prototype._getseckey = function(section, keystem, keyans) {
    var seckey = "";

    switch (section) {
        case "kn_rate":    seckey = "k"; break;
        case "last_time":  seckey = "t"; break;
        case "next_time":  seckey = "n"; break;
        case "last_score": seckey = "s"; break;
        case "question_count": seckey = "q"; break;
        case "correct_count": seckey = "c"; break;
        default: Error("Card._getseckey unknown section: " + section);
    }

    switch (keystem) {
        case "simplified":  seckey += "s"; break;
        case "traditional": seckey += "t"; break;
        case "cursive":     seckey += "v"; break;
        case "callig":      seckey += "g"; break;
        case "tcursive":    seckey += "V"; break; // deprecated
        case "tcallig":     seckey += "G"; break; // deprecated
        case "pinyin":      seckey += "p"; break;
        case "definition":  seckey += "d"; break;
        case "notes":       seckey += "n"; break;
        default: Error("Card._getseckey unknown keystem: " + keystem);
    }
    
    switch (keyans) {
        case "simplified":  seckey += "s"; break;
        case "traditional": seckey += "t"; break;
        case "cursive":    seckey += "v"; break;
        case "callig":     seckey += "g"; break;
        case "tcursive":    seckey += "V"; break; // deprecated
        case "tcallig":     seckey += "G"; break;// deprecated
        case "pinyin":      seckey += "p"; break;
        case "definition":  seckey += "d"; break;
        case "notes":       seckey += "n"; break;
        default: Error("Card._getseckey unknown keyans: " + keyans);
    }
    
    return seckey;
}

Card.prototype.ensuredataloaded = function() {
    if (this._data === null) {
        if (this.cardid) {
            var key = "x" + this.cardid.toString(36);
            var text = localStorage.getItem(key);
            if (text !== null) {
                this._data = JSON.parse(shanka.decompress(text));
            } else {
                this._data = {};
            }
        } else {
            this._data = {};
        }
    }
}

Card.prototype.setdata = function(section, keystem, keyans, value) {
    this.ensuredataloaded();
    var seckey = this._getseckey(section, keystem, keyans);
    this._data[seckey] = value;
}

Card.prototype.hasdata = function(section, keystem, keyans) {
    this.ensuredataloaded();
    var seckey = this._getseckey(section, keystem, keyans);
    return (seckey in this._data);
}

Card.prototype.getdata = function(section, keystem, keyans) {
    this.ensuredataloaded();
    var seckey = this._getseckey(section, keystem, keyans);
    if (seckey in this._data) {
        return this._data[seckey];
    }
    return this._getdefault(section, keystem, keyans);
}

Card.prototype.getdatastring = function() {
    this.ensuredataloaded();
    var text = JSON.stringify(this._data);
    return text;
}

Card.prototype.write = function() {
    // do it like this; save local storage space!
    var arr = this.toarray();
    var key = "f" + this.cardid.toString(36);
    var data = shanka.compress(JSON.stringify(arr));
    localStorage[key] = data;

    if (this._definition !== null) {
        var defkey = "d" + this.cardid.toString(36)
        if (this._definition.length) {
            localStorage[defkey] = shanka.compress(this._definition);
        } else {
            localStorage.removeItem(defkey);
        }
    }
    
    if (this._notes !== null) {
        var noteskey = "n" + this.cardid.toString(36)
        if (this._notes.length) {
            localStorage[noteskey] = shanka.compress(this._notes);
        } else {
            localStorage.removeItem(noteskey);
        }
    }
    
    if (this._data !== null) {
        var datakey = "x" + this.cardid.toString(36)
        if (Object.keys(this._data).length) {
            localStorage[datakey] = shanka.compress(JSON.stringify(this._data));
        } else {
            localStorage.removeItem(datakey);
        }
    }
    
    // remove cached definition, notes, data
    this._definition = null;
    this._notes = null;
    this._data = null;
}

Card.prototype.del = function() {
    if (this.categoryids.length) {   
        for (var i=0, len=this.categoryids.length; i<len; i++) {
            var categoryid = this.categoryids[i];
            var category = shanka.categories[categoryid];
            var index = category.cardids.indexOf(this.cardid);
            if (index != -1) {
                console.log("Deleting card " + this.cardid.toString() + " from category " + categoryid.toString());
                category.cardids.splice(index, 1);
                category.write();
            }
        }
    }

    delete shanka.cards[this.cardid];
    
    console.log("Removing card" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("f" + this.cardid.toString(36));
    console.log("Removing card definition" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("d" + this.cardid.toString(36));
    console.log("Removing card notes" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("n" + this.cardid.toString(36));
    console.log("Removing card data" + this.cardid.toString() + " from local storage");
    localStorage.removeItem("x" + this.cardid.toString(36));
}

Card.prototype.toarray = function() {
    var arr = [ this.cardid,
                this.enabled,
                this.queued,
                this.simplified,
                this.traditional,
                this.pinyin,
                this.kn_rate,
                this.last_time,
                this.next_time,
                this.test_count];
    return arr;
}

Card.prototype.fromarray = function(arr) {
    this.cardid      = arr[0];
    this.enabled     = arr[1];
    this.queued      = arr[2];
    this.simplified  = arr[3];
    this.traditional = arr[4];
    this.pinyin      = arr[5];
    this.kn_rate     = arr[6];
    this.last_time   = arr[7];
    this.next_time   = arr[8];
    this.test_count  = arr[9];
}

Card.prototype.getdefinition = function() {
    if (this._definition === null) {
        if (this.cardid == 0) {
            return "";
        } else {
            var key = "d" + this.cardid.toString(36);
            var text = shanka.decompress(localStorage.getItem(key));
            if (text === null) {
                return "";
            } else {
                return text;
            }
        }
    }
    return this._definition;
}

Card.prototype.setdefinition = function(newtext) {
    this._definition = newtext;
}

Card.prototype.getnotes = function() {
    if (this._notes === null) {
        if (this.cardid == 0) {
            return "";
        } else {
            var key = "n" + this.cardid.toString(36);
            var text = shanka.decompress(localStorage.getItem(key));
            if (text === null) {
                return "";;
            } else {
                return text;
            }
        }
    }
    return this._notes;
}

Card.prototype.setnotes = function(newtext) {
    this._notes = newtext;
}

Card.prototype.getminactive = function(section) {
    var min = null;
    var questionids = shanka.getallactivequestionidslist();
    
    for (var i=0, questlen=questionids.length; i < questlen; i++) {
        var questionid = questionids[i];
        var question = shanka.questions[questionid];
        for (var j = 0, anslen = question.answer.length; j < anslen; j++) {
            var answer = question.answer[j];
            for (var k = 0, stemlen = question.stem.length; k < stemlen; k++) {
                var stem = question.stem[k];
                if (this.hasdata(section, stem, answer)) {
                    var val = this.getdata(section, stem, answer);
                    if (min === null) {
                        min = val;
                    } else {
                        min = Math.min(min, val);
                    }
                }
            }
        }
    }
    
    return min;
}

Card.prototype.getmaxactive = function(section) {
    var max = null;
    var questionids = shanka.getallactivequestionidslist();
    
    for (var i=0, questlen=questionids.length; i < questlen; i++) {
        var questionid = questionids[i];
        var question = shanka.questions[questionid];
        for (var j = 0, anslen = question.answer.length; j < anslen; j++) {
            var answer = question.answer[j];
            for (var k = 0, stemlen = question.stem.length; k < stemlen; k++) {
                var stem = question.stem[k];
                if (this.hasdata(section, stem, answer)) {
                    var val = this.getdata(section, stem, answer);
                    if (max === null) {
                        max = val;
                    } else {
                        max = Math.max(max, val);
                    }
                }
            }
        }
    }
    
    return max;
}
    
Card.prototype.liststring = function() {
    var eng = this.getdefinition();
    if (eng.length >= 30) {
        eng = eng.substring(0, 27) + "...";
    }
    
    return this.simptradtogether() + " " + this.pinyin + " " + eng;
}

Card.prototype.simptradtogether = function() {
    var hanzi = ""
    var script = shanka.getsetting("script");
    
    if (   ((script == "simplified" || script == "simptrad") && this.simplified.length)
        || (this.traditional.length == 0)) {
        hanzi = this.simplified
    } else {
        hanzi = this.traditional;
    }
    
    if (   this.simplified.length
        && this.traditional.length
        && this.simplified != this.traditional) {
        if (script == "simptrad") {
            hanzi += " [" + this.traditional + "]";
        } else if (script == "tradsimp") {
            hanzi += " [" + this.simplified + "]";
        }
    }

    return hanzi;
}

Card.prototype.getindexedchars = function() {
    var script = shanka.getsetting("script");
    if (script == "simplified") {
        return this.simplified;
    } else if (script == "traditional") {
        return this.traditional;
    } else if (script == "simptrad") {
        return this.simplified + this.traditional;
    } else {
        return this.traditional + this.simplified;
    }
}

Card.prototype.getfield = function(field) {
    switch (field)
    {
        case "simplified":
        case "cursive":
        case "callig":
            return this.simplified;
        case "traditional":
            return this.traditional;
        case "pinyin":
            return this.pinyin; // TODO tones to numbers and vice versa
        case "definition":
            return this.getdefinition();
        case "notes":
            return this.getnotes();
    }
    return "";
}

shanka.getuniquecardname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var cardidstr in shanka.cards) {
            if (shanka.cards[cardidstr].name == newname) {
                found = true;
                break;
            }
        }
        if (found) {
            newname = prefix + " ("+i.toString()+")";
            i++;
        }
    }
    return newname;
}

// Card Section
shanka.showcard = function(cardid) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    var section = state["section"];
    state["previous"] = section;
    state["section"] = "card";
        
    if (cardid) {
        state["cardid"] = cardid;
    } else if ("cardid" in state) {
        state["previouscardid"] = state["cardid"];
        delete state["cardid"];
    }
    
    shanka.navigate(state)   
}

shanka.editflashcards = function() {
    if ("categoryid" in shanka.state) {
        var state = {"section" : "editflashcards"};
        state["categoryid"] = shanka.state["categoryid"];
        shanka.navigate(state)   
    }
}

shanka.doduplicateflashcards = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.card_duplicate_selected_confirm)) {
            var categoryid = parseInt(shanka.state["categoryid"]);
            var category = shanka.categories[categoryid];
            var i = category.cardids.length;
            while (i--) {
                var cardid = category.cardids[i];
                var cardtoggle = document.getElementById("cardselected"+cardid.toString());
                if (cardtoggle && cardtoggle.classList.contains("active")) {
                    var card = shanka.cards[cardid];
                    var newcard = new Card;
                    newcard.cardid = shanka.getnextguid();
                    newcard.name = shanka.getuniquecardname(card.name);
                    newcard.simplified = card.simplified;
                    newcard.traditional = card.traditional;
                    newcard.pinyin = card.pinyin;
                    newcard.setdefinition(card.getdefinition());
                    newcard.setnotes(card.getnotes());
                    for (var j=0, len=card.categoryids.length; j<len; j++) {
                        var itercategoryid = card.categoryids[j];
                        var itercategory = shanka.categories[itercategoryid];
                        itercategory.cardids.push(newcard.cardid);
                        newcard.categoryids.push(itercategoryid);
                        if (itercategoryid != categoryid) {
                            itercategory.write();
                        }
                    }
                    shanka.cards[newcard.cardid] = newcard;
                    newcard.write();
                    count++;
                }
            }
            category.write();
            
            shanka.editflashcards();
            shanka.addtoresult(STR.card_duplicated_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("duplicateflashcards", err);
    }
}

shanka.doremoveflashcards = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.card_remove_selected_confirm)) {
            var categoryid = parseInt(shanka.state["categoryid"]);
            var category = shanka.categories[categoryid];
            var i = category.cardids.length;
            while (i--) {
                var cardid = category.cardids[i];
                var card = shanka.cards[cardid];
                var cardtoggle = document.getElementById("cardselected"+cardid.toString());
                if (cardtoggle && cardtoggle.classList.contains("active")) {
                    category.cardids.splice(i, 1);
                    var index = card.categoryids.indexOf(categoryid);
                    if (index != -1) {
                        card.categoryids.splice(index, 1);
                        if (card.categoryids.length == 0) {
                            var uncat = shanka.categories[0];
                            uncat.cardids.push(card.cardid);
                            uncat.write();
                        }
                        card.write();
                        count++;
                    }
                }
            }
            category.write();
        
            shanka.editflashcards();
            shanka.addtoresult(STR.card_removed_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("removeflashcards", err);
    }
}

shanka.dodeleteflashcards = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.card_delete_selected_confirm)) {
            var categoryid = parseInt(shanka.state["categoryid"]);
            var category = shanka.categories[categoryid];
            var i = category.cardids.length;
            while (i--) {
                var cardid = category.cardids[i];
                var card = shanka.cards[cardid];
                var cardtoggle = document.getElementById("cardselected"+cardid.toString());
                if (cardtoggle && cardtoggle.classList.contains("active")) {
                    card.del();
                    count++;
                    shanka.queue = []; // need to rebuild          
                    shanka.relatedcharmap = {}; // reset related chars
                }
            }
        
            shanka.editflashcards();
            shanka.addtoresult(STR.card_deleted_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("deleteflashcards", err);
    }
    WaitCursorOff();
}

shanka.initshowcard = function(cardid, categoryid) {
    var card = null;
    if (cardid) {
        card = shanka.cards[cardid];
    }
    if (!card) {
        card = new Card();
    }

    // don't display uncategorised
    shanka.initcategorylist(true, false);
    
    if (Object.keys(shanka.categories).length == 1) {
        document.getElementById("categorylist").style.display = "none";
        document.getElementById("categorytitle").style.display = "none";
    }
    
    document.getElementById("cardsimp").value = card.simplified;
    document.getElementById("cardtrad").value = card.traditional;
    document.getElementById("cardpiny").value = card.pinyin;
    document.getElementById("carddef").value = card.getdefinition();
    document.getElementById("cardnotes").value = card.getnotes();
    
    if (card.enabled) {
        document.getElementById("cardenabled").classList.add("active");
    }

    if (card.queued) {
        document.getElementById("cardqueued").classList.add("active");
    }

    for (var i=0, len=card.categoryids.length; i<len; i++) {
        var itercatid = card.categoryids[i];
        if (itercatid != 0) {
            document.getElementById("categoryenabled" + itercatid.toString()).classList.add("active");
        }
    }

    if (!cardid) {
        var categorycheck = null;
        if (categoryid === null) {
            categorycheck = document.getElementById("categoryenabled" + shanka.getsetting("lastcategoryid"));
        } else {
            categorycheck = document.getElementById("categoryenabled" + categoryid.toString());
        }        
        if (categorycheck) {
            categorycheck.classList.add("active");
        }
    }
}

shanka.savecard = function() {
    WaitCursorOn();
    try
    {
        var simplified = document.getElementById("cardsimp").value;
        var traditional = document.getElementById("cardtrad").value;
        var pinyin = document.getElementById("cardpiny").value;
        var definition = document.getElementById("carddef").value;
        var notes = document.getElementById("cardnotes").value;
        var newcategories = {}; // id -> category
        var enabled = document.getElementById("cardenabled").classList.contains("active");
        var queued = document.getElementById("cardqueued").classList.contains("active");
        
        for (var categoryidstr in shanka.categories) {
            if (parseInt(categoryidstr) != 0) {
                var categoryenabled = document.getElementById("categoryenabled" + categoryidstr);
                if (categoryenabled.classList.contains("active")) {
                    var category = shanka.categories[categoryidstr];
                    newcategories[categoryidstr] = category;
                }
            }
        }
        
        // add the 'uncategorised' category
        if (Object.keys(newcategories).length == 0) {
            newcategories[0] = shanka.categories[0];
        }
        
        if (queued && !enabled) {
            alert(STR.card_if_queued_must_be_enabled_error);
            WaitCursorOff();
            return;            
        }

        if (!simplified.length && !traditional.length) {
            alert(STR.card_must_have_at_least_simp_trad_error);
            WaitCursorOff();
            return;            
        }
        
        if (!definition.length) {
            alert(STR.card_must_have_definition_error);
            WaitCursorOff();
            return;            
        }
        
        var card = null;
        if ("cardid" in shanka.state) {
            card = shanka.cards[parseInt(shanka.state["cardid"])];
        } else {
            card = new Card();
            card.cardid = shanka.getnextguid();       
        }
        
        if (card.simplified != simplified || card.traditional != traditional) {
            // reset related chars
            shanka.relatedcharmap = {};
        }
        
        card.simplified = simplified;
        card.traditional = traditional;
        card.pinyin = pinyin;
        card.setdefinition(definition);
        card.setnotes(notes);
        card.enabled = enabled;
        card.queued = queued;   

        for (var i=0, catlen=card.categoryids.length; i<catlen; i++) {
            var oldcategoryid = card.categoryids[i];
            if (!(oldcategoryid in newcategories)) {
                var category = shanka.categories[oldcategoryid];
                for (var j=0, cardlen=category.cardids.length; j<cardlen; j++) {
                    if (category.cardids[j] == card.cardid) {
                        category.cardids.splice(j, 1);
                        category.write();
                        shanka.queue = []; // need to rebuild
                        break;
                    }
                }
            }
        }

        card.categoryids = [];
        for (var newcategoryidstr in newcategories) {
            if (parseInt(newcategoryidstr) >= 0) {
                var category = shanka.categories[newcategoryidstr];
                var containsit = false;
                for (var i=0, len=category.cardids.length; i<len; i++) {
                    var testcardid = category.cardids[i];
                    if (card.cardid == testcardid) {
                        containsit = true;
                        break;
                    }
                }
                if (!containsit) {
                    category.cardids.push(card.cardid);
                    category.write();
                    shanka.queue = []; // need to rebuild
                }
                card.categoryids.push(parseInt(newcategoryidstr));
            }
        }
        
        shanka.cards[card.cardid] = card;
        
        card.write();
        
        shanka.removefromqueue(card);
        shanka.addtoqueue(card);
    
        if ("categoryid" in shanka.state) {
            shanka.showcurrentcategory();
        } else {
            shanka.showcardinfo(card.cardid);
        }
        
        shanka.addtoresult(STR.card_saved_message);
    }
    catch(err)
    {
        ExceptionError("savecard", err);
    }
    WaitCursorOff();
}

shanka.addtocharmap = function(word, cardid) {
    for (var i=0, len=word.length; i<len; i++) {
        var ch = word[i];
        if (!(ch in shanka.relatedcharmap)) {
            shanka.relatedcharmap[ch] = {};
        }
        var wordmap = shanka.relatedcharmap[ch];
        if (!(word in wordmap)) {
            wordmap[word] = [];
        }
        if (!contains(wordmap[word], cardid)) {
            wordmap[word].push(cardid);
        }
    }
}

shanka.rebuildcharmap = function() {
    shanka.relatedcharmap = {};
    for (var cardidstr in shanka.cards) {
        var card = shanka.cards[cardidstr];
        shanka.addtocharmap(card.simplified, card.cardid);
        shanka.addtocharmap(card.traditional, card.cardid);
    } 
}

shanka.getrelatedcardids = function(cardid) {
    if (isEmpty(shanka.relatedcharmap)) {
        shanka.rebuildcharmap();
    }
    
    var relatedcardids = [];
    var card = shanka.cards[cardid];
    
    var hanzi = card.getindexedchars();
    for (var i=0, ilen=hanzi.length; i<ilen; i++) {
        var ch = hanzi[i];
        if (ch in shanka.relatedcharmap) {
            wordmap = shanka.relatedcharmap[ch];
            for (var word in wordmap) {
                var cardids = wordmap[word];
                for (var j=0, jlen=cardids.length; j<jlen; j++) {
                    var itercardid = cardids[j];
                    if (!contains(relatedcardids, itercardid) && cardid != itercardid) {
                        relatedcardids.push(itercardid);
                    }
                }
            }
        }
    }
    
    return relatedcardids;
}

shanka.mergeimportedcardwithexisting = function(card) {
    var exactmatch = null;

    if (card.simplified.length) {
        var ch = card.simplified.charAt(0);
        if (ch in shanka.relatedcharmap)
        var wordmap = shanka.relatedcharmap[ch];
        for (var word in wordmap) {
            if (word == card.simplified) {
                var cardids = wordmap[word];
                for (var i=0, len=cardids.length; i<len; i++) {
                    var cardid = cardids[i];
                    var cardmatch = shanka.cards[cardid];
                    if (!cardmatch) {
                        var x = 0;
                    }
                    if (   cardmatch.simplified == card.simplified
                        && cardmatch.traditional == card.traditional) {
                        exactmatch = cardmatch;
                        break;
                    }
                }
            }
            if (exactmatch) {
                break;
            }
        }
    } else {
        var ch = card.traditional.charAt(0);
        if (ch in shanka.relatedcharmap)
        var wordmap = shanka.relatedcharmap[ch];
        for (var word in wordmap) {
            if (word == card.traditional) {
                var cardids = wordmap[word];
                for (var i=0, len=cardids.length; i<len; i++) {
                    var cardid = cardids[i];
                    var cardmatch = shanka.cards[cardid];
                    if (!cardmatch) {
                        var x = 0;
                    }
                    if (   cardmatch.simplified == card.simplified
                        && cardmatch.traditional == card.traditional) {
                        exactmatch = cardmatch;
                        break;
                    }
                }
            }
            if (exactmatch) {
                break;
            }
        }
    }
    
    if (exactmatch) {
        var matchdef = exactmatch.getdefinition();
        var importdef = card.getdefinition();
        var matchpinyin = pinyin_numbers_to_tone_marks(exactmatch.pinyin);
        var importpinyin = pinyin_numbers_to_tone_marks(card.pinyin);
        
        if (matchpinyin == importpinyin) {
            if (card.getdefinition().length) {
                exactmatch.setdefinition(card.getdefinition());
            }
            if (card.getnotes().length) {
                exactmatch.setnotes(card.getnotes());
            }
            return exactmatch;
        }
    }
    
    return null;
}
