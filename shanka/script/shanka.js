/*
    Shanka HSK Flashcards - shanka.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// ---------------------------
// create shanka as a singleton
shanka = {};

shanka.init = function() {
    WaitCursorOn();
    try
    {
        shanka.nextguid = 1; // increment so all ids unique

        shanka.cards = {};  // id : card
        shanka.lessons = {}; // id : lesson 
        shanka.categories = {}; // id : category
        shanka.questions = {};   // id : question
        shanka.settings = {}; // key : value
        shanka.algorithms = {}; // id : algorithm 
        shanka.progress = [];   // sorted
        shanka.queue = []; // sorted
        shanka.history = []; // sorted
        
        shanka.studybackstack = [];
        shanka.studyfwdstack = [];
        
        // persistent touchpaints in cache
        shanka.minitps = [];
        
        // shanka.relatedcharmap[ch] = wordmap
        // wordmap[word] = cardids
        shanka.relatedcharmap = {}; // {"X" : {"X" : [1, 4], "XX" : [2, 6], "XY" : 3}, "Y" : {"XY" : 3} }
        
        shanka.algorithm = null;
        
        shanka.readall();

        window.onpopstate = shanka.onpopstate; 

        shanka.initlocal();
        
        var currentState = null;
        if (window.location.hash && window.location.hash.length > 1) {
            console.log("constructing state from hash: " + window.location.hash);
            var hashbits = window.location.hash.slice(1).split(",");
            if (hashbits.length > 0) {
                currentState = { "section" : hashbits[0] };
            }
            for (var i=1; i < hashbits.length; i++) {
                parms = hashbits[i].split("=");
                if (parms.length == 2) {
                    currentState[parms[0]] = parms[1];
                }
            }
            console.log("constructed state: " + JSON.stringify(currentState) );
        }
        
        if (   shanka.state
            && "section" in shanka.state
            && (shanka.state["section"] != "initialising")
            && (   (!currentState)
                || (!("section" in currentState))
                || (currentState["section"] == "main")
                || (currentState["section"] == "welcome")  )  ) {
            var useStoredState = true;
            
            if ("cardid" in shanka.state && !(shanka.state["cardid"] in shanka.cards)) {
                console.log("Cannot used stored state, invalid cardid: " + shanka.state["cardid"].toString());
                useStoredState = false;
            }
            if ("questionid" in shanka.state && !(shanka.state["questionid"] in shanka.questions)) {
                console.log("Cannot used stored state, invalid questionid: " + shanka.state["questionid"].toString());
                useStoredState = false;
            }
            if ("categoryid" in shanka.state && !(shanka.state["categoryid"] in shanka.categories)) {
                console.log("Cannot used stored state, invalid categoryid: " + shanka.state["categoryid"].toString());
                useStoredState = false;
            }
            if ("lessonid" in shanka.state && !(shanka.state["lessonid"] in shanka.lessons)) {
                console.log("Cannot used stored state, invalid lessonid: " + shanka.state["lessonid"].toString());
                useStoredState = false;
            }
            if ("algorithmid" in shanka.state && !(shanka.state["algorithmid"] in shanka.algorithms)) {
                console.log("Cannot used stored state, invalid algorithmid: " + shanka.state["algorithmid"].toString());
                useStoredState = false;
            }
            
            currentState = shanka.state;
            console.log("using stored state instead: " + JSON.stringify(currentState) );
        } else {
            shanka.showstate({"section" : "initialising"});
        }
        
        shanka.navigate(currentState);
        
        shanka.fastclick = new FastClick(document.body);    
    }
    catch(err)
    {
        ExceptionError("shanka.init", err);
    }
    WaitCursorOff();
}

shanka.doexporttextfile = function() {
    WaitCursorOn();
    try
    {
        // saveAs(document.getElementById("exporttextdata").value, "shanka-export.txt");
        //window.open("data:text/json;charset=utf-8," + escape(document.getElementById("exporttextdata").value));
        
        // from http://thiscouldbebetter.wordpress.com/2012/12/18/loading-editing-and-saving-a-text-file-in-html5-using-javascrip/
        var textFileAsBlob = new Blob([document.getElementById("exporttextdata").value], {type:'text/plain'});

        var downloadLink = document.createElement("a");
        downloadLink.download = STR.export_download_filename;
        downloadLink.innerHTML = STR.export_download_filetext;
        
        if (window.webkitURL != null)
        {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
        }
        else
        {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
        }

        downloadLink.click();     
    }
    catch(err)
    {
        ExceptionError("doexporttextfile", err);
    }
    WaitCursorOff();
}

shanka.dorebuild = function() {
    if (confirm(STR.local_storage_rebuild_confirm)) {
        shanka.init();
        shanka.readall();
        
        shanka.addtoresult(STR.local_storage_rebuilt_ok_message);
        shanka._updatemlocalstorageused();        
    }
}

shanka.donuke = function() {
    WaitCursorOn();
    try
    {
        if (confirm(STR.local_storage_erase_confirm)) {
            localStorage.clear();
            shanka.init();
            
            shanka.addtoresult(STR.local_storage_erased_message);
            shanka._updatemlocalstorageused();        
        }
    }
    catch(err)
    {
        ExceptionError("donuke", err);
    }
    WaitCursorOff();
}

shanka.doreload = function() {
    WaitCursorOn();
    try
    {
        shanka.init();
        shanka.addtoresult(STR.app_was_reloaded_message);
    }
    catch(err)
    {
        ExceptionError("doreload", err);
    }
    WaitCursorOff();
}

shanka.addtoresult = function(message) {
    var result = document.getElementById("result").innerHTML;
    
    if (result.length) {
        result += "<br />" + message;
    } else {
        result = message;
    }
    
    document.getElementById("result").innerHTML = result;
}

shanka.showmain = function() {
    shanka.navigate({"section" : "main"})
}

shanka.addcategory = function() {
    shanka.navigate({"section" : "addcategory"})
}

shanka.doaddcategoryadd = function() {
    if (shanka._addcategory()) {
        shanka.showcategories();
    }
}

shanka.doshowcategory = function() {
    if ("categoryid" in shanka.state) {
        shanka.showcategory(parseInt(shanka.state["categoryid"]));
    }
}

shanka.showlessons = function() {
    shanka.navigate({"section" : "lessons"});
}

shanka.showprogress = function() {
    shanka.navigate({"section" : "progress"});
}

shanka.showsettings = function() {
    shanka.navigate({"section" : "settings"});
}

shanka.showmaintenance = function() {
    shanka.navigate({"section" : "maintenance"});
}

shanka.showquestions = function() {
    shanka.navigate({"section" : "questions"});
}

shanka.showquestion = function(questionid) {
    if (questionid) {
        shanka.navigate({"section" : "question", "questionid" : questionid});
    } else {
        shanka.navigate({"section" : "question"});
    }
}

shanka.showsidebarmenu = function() {
  if (is_IE()) {
        shanka.navigate({"section" : "left-drawer"});
  } else {
    snapper.open('left');
  }
}

shanka.showimport = function() {
    shanka.navigate({"section" : "import"});
}

shanka.showshankiimport= function() {
    shanka.navigate({"section" : "shankiimport"});
}

shanka.showplecoimport= function() {
    shanka.navigate({"section" : "plecoimport"});
}

shanka.showstickyimport= function() {
    shanka.navigate({"section" : "stickyimport"});
}

shanka.showskritterimport= function() {
    shanka.navigate({"section" : "skritterimport"});
}

shanka.showexport = function() {
    shanka.navigate({"section" : "export"});
}

shanka.doexportshanka = function() {
    shanka.export("shanka");
}

shanka.doexportother = function() {
    var fileformat = "";
    
    if (document.getElementById("exportpleco").classList.contains("active")) {
        fileformat = "pleco";
    } else if (document.getElementById("exportsticky").classList.contains("active")) {
        fileformat = "sticky";
    } else if (document.getElementById("exportsimp").classList.contains("active")) {
        fileformat = "simplified";
    } else { // exporttrad
        fileformat = "traditional";
    }
    
    shanka.export(fileformat);
}

shanka.navigate = function(state, stateAction) {
    WaitCursorOn();
    try
    {
        if (   !state
            || (   ((state["section"] == "study") || (state["section"] == "main"))
                && isEmpty(shanka.cards))
            || (state["section"] == "welcome")) {
            
            if (isEmpty(shanka.cards)) {
                state = {"section" : "welcome" };
            } else {
                state = {"section" : "main" };
            }
        }
        
        // keep the fwd/back stacks up to date
        if (   (state["section"] == "study")
            || (state["section"] == "practice" && "cardid" in state)
            || (state["section"] == "info")) {
            if ("fwdback" in state) {
                delete state["fwdback"];
            } else {
                if (   (shanka.state["section"] == "study")
                    || (shanka.state["section"] == "practice" && "cardid" in shanka.state)
                    || (shanka.state["section"] == "info")) {
                    shanka.studybackstack.push(shanka.state);
                }
                shanka.studyfwdstack = [];
            }
        } else {
            shanka.studybackstack = [];
            shanka.studyfwdstack = [];
        }

        if (stateAction == "suppress") {
            console.log("suppressing state update");
        } else {
            shanka.updateHistoryUrlState(state, stateAction);
        }
        
        document.getElementById("help-button").style.display = "inline";
        
        var pageTitle = "Shanka 闪卡";

        shanka.showstate(state);

        switch(state["section"])
        {
            case "main":
                shanka.showmenubuttonhideback();
                shanka.initmain();
                shanka.setpagetitle(STR.page_main_app_title);
                break;
            case "welcome":
                shanka.showmenubuttonhideback();
                shanka.initwelcome();
                shanka.setpagetitle(STR.page_main_app_title);
                break;
            case "card":
                var cardid = null;
                if ("cardid" in state) {
                    shanka.hidemenubuttonsetback(shanka.studyinfo);
                    shanka.setpagetitle(STR.page_edit_flashcard_title);
                    cardid = parseInt(state["cardid"]);
                } else {
                    shanka.hidemenubuttonsetback(shanka.navigateprevious);
                    shanka.setpagetitle(STR.page_add_flashcard_title);
                }
                var categoryid = null;
                if ("categoryid" in state) {
                    categoryid = parseInt(state["categoryid"]);
                }
                shanka.initshowcard(cardid, categoryid);
                break;
            case "info":
                if ("cardid" in state) {
                    var cardid = parseInt(state["cardid"]);
                    shanka.initcardinfo(cardid);
                    // no need for a title
                }
                break;
            case "practice":
                shanka.initpractice();
                // no need for a title
                break;
            case "categories":
                shanka.showmenubuttonhideback();
                shanka.initcategories();
                shanka.setpagetitle(STR.page_categories_title);
                break;
            case "editcategory":
                shanka.hidemenubuttonsetback(shanka.showcurrentcategory);
                shanka.initeditcategory(parseInt(state["categoryid"]));
                shanka.setpagetitle(STR.page_edit_category_name_title);
                break;
            case "category":
                shanka.hidemenubuttonsetback(shanka.showcategories);
                shanka.initshowcategory(parseInt(state["categoryid"]), false, false);
                // title set in child function
                break;
            case "editflashcards":
                shanka.hidemenubuttonsetback(shanka.showcurrentcategory);
                shanka.initshowcategory(parseInt(state["categoryid"]), true, true);
                // title set in child function
                break;
            case "progress":
                shanka.showmenubuttonhideback();
                shanka.initprogress();
                shanka.setpagetitle(STR.page_progress_title);
                break;
            case "history":
                shanka.showmenubuttonhideback();
                shanka.inithistory();
                shanka.setpagetitle(STR.page_history_title);
                break;
            case "queue":
                shanka.showmenubuttonhideback();
                shanka.initqueue();
                shanka.setpagetitle(STR.page_queue_title);
                break;
            case "study":
                shanka.initstudy();
                // no need for a title
                break;
            case "settings":
                shanka.showmenubuttonhideback();
                shanka.initsettings();
                shanka.setpagetitle(STR.page_settings_title);
                break;
            case "lessons":
                shanka.showmenubuttonhideback();
                shanka.initlessons();
                shanka.setpagetitle(STR.page_lessons_title);
                break;
            case "lesson":
                shanka.hidemenubuttonsetback(shanka.showlessons);
                if ("lessonid" in state) {
                    shanka.initlesson(parseInt(state["lessonid"]));
                    shanka.setpagetitle(STR.page_edit_lesson_title);
                } else {
                    shanka.initlesson();
                    shanka.setpagetitle(STR.page_add_lesson_title);
                }
                break;
            case "help":
                shanka.hidemenubuttonsetback(shanka.navigateprevious);
                document.getElementById("help-button").style.display = "none";
                if ("page" in state) {
                    shanka.inithelp(state["page"]);
                } else {
                    shanka.inithelp("");
                }
                pageTitle = "Help";
                // title set in child function
                break;
            case "import":
                shanka.showmenubuttonhideback();
                shanka.initimport();
                shanka.setpagetitle(STR.page_import_title);
                break;
            case "export":
                shanka.showmenubuttonhideback();
                shanka.initexport();
                shanka.setpagetitle(STR.page_export_title);
                break;
            case "maintenance":
                shanka.showmenubuttonhideback();
                shanka.initmaintenance();
                shanka.setpagetitle(STR.page_maintenance_title);
                break;
            case "questions":
                shanka.showmenubuttonhideback();
                shanka.initquestions();
                shanka.setpagetitle(STR.page_questions_title);
                break;
            case "question":
                shanka.hidemenubuttonsetback(shanka.showquestions);
                if ("questionid" in state) {
                    shanka.initshowquestion(parseInt(state["questionid"]));
                    shanka.setpagetitle(STR.page_edit_question_title);
                } else {
                    shanka.initshowquestion();
                    shanka.setpagetitle(STR.page_add_question_title);
                }
                break;
            case "algorithms":
                shanka.showmenubuttonhideback();
                shanka.initalgorithms();
                shanka.setpagetitle(STR.page_algorithms_title);
                break;
            case "editalgorithms":
                shanka.hidemenubuttonsetback(shanka.showalgorithms);
                shanka.initeditalgorithms();
                shanka.setpagetitle(STR.page_edit_algorithms_title );
                break;
            case "editcategories":
                shanka.hidemenubuttonsetback(shanka.showcategories);
                shanka.initeditcategories();
                shanka.setpagetitle(STR.page_edit_categories_title);
                break;
            case "editquestions":
                shanka.hidemenubuttonsetback(shanka.showquestions);
                shanka.initeditquestions();
                shanka.setpagetitle(STR.page_edit_questions_title);
                break;
            case "editlessons":
                shanka.hidemenubuttonsetback(shanka.showlessons);
                shanka.initeditlessons();
                shanka.setpagetitle(STR.page_edit_lessons_title);
                break;
            case "algorithm-add":
                shanka.hidemenubuttonsetback(shanka.showalgorithms);
                shanka.initaddalgorithms();
                shanka.setpagetitle(STR.page_add_algorithm_title);
                break;
            case "algorithm-shanka":
                if ("algorithmid" in state) {
                    shanka.hidemenubuttonsetback(shanka.showalgorithms);
                    shanka.initshankaalgorithm(parseInt(state["algorithmid"]));
                    shanka.setpagetitle(STR.page_edit_algorithm_title );
                } else {
                    shanka.hidemenubuttonsetback(shanka.addalgorithm);
                    shanka.initshankaalgorithm();
                    shanka.setpagetitle(STR.page_add_algorithm_title );
                }
                break;
            case "wizard1":
                shanka.showmenubuttonhideback();
                shanka.wizard1init();
                shanka.setpagetitle(STR.page_wizard1_title);
                break;
            case "wizard2":
                shanka.hidemenubuttonsetback(shanka.wizard);
                shanka.wizard2init();
                shanka.setpagetitle(STR.page_wizard2_title);
                break;
            case "wizard3":
                shanka.hidemenubuttonsetback(shanka.wizard2);
                shanka.wizard3init();
                shanka.setpagetitle(STR.page_wizard3_title);
                break;
            case "wizard4":
                shanka.hidemenubuttonsetback(shanka.wizard3);
                shanka.wizard4init();
                shanka.setpagetitle(STR.page_wizard4_title);
                break;
            default:
                console.log("shanka.navigate() unknown section: " + state["section"])
                break;
        }
        
        // fix the scroll problem (iOS, text field)
        window.scrollTo(0,0);
    }
    catch(err)
    {
        ExceptionError("navigate", err);
    }
    WaitCursorOff();
}

shanka.navigateprevious = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    if ("previous" in state) {
        var previous = state["previous"];
        state["section"] = previous;
        delete state["previous"];
    }
    if ("previouscardid" in state) {
        var previouscardid = state["previouscardid"];
        state["cardid"] = previouscardid;
        delete state["previouscardid"];
    }
    shanka.navigate(state);
}

shanka.showmenubuttonhideback = function() {
    document.getElementById("title-button-prev").style.display = "none";
    document.getElementById("toggle-left").style.display = "block";
}

shanka.hidemenubuttonsetback = function(callback) {
    document.getElementById("title-button-prev").style.display = "block";
    document.getElementById("title-button-prev").onclick = callback;
    document.getElementById("toggle-left").style.display = "none";
}

shanka.updateHistoryUrlState = function(state, stateAction) {
    var statebits = [state["section"]];
    for (var key in state) {
        if (key != "section") {
            statebits.push(key + "=" + state[key]);
        }
    }

    if (stateAction == "replace") {
        console.log("replacing state with " + JSON.stringify(state) );
        history.replaceState(state, state["section"], "#" + statebits.join(","));
    } else {
        console.log("pushState " + JSON.stringify(state) );
        history.pushState(state, state["section"], "#" + statebits.join(","));
    }
    
    localStorage["state"] = shanka.compress(JSON.stringify(shanka.state));
}

shanka.showstate = function(state) {
    console.log("showState " + JSON.stringify(state));

    if (!state) state = {"section" : "main" };
    var _body = document.getElementById("pagecontent");
    var section = state["section"];
    if (_body && section) {    
        if (section == "study" || section == "info" || section == "practice") {
            // disable the bar, and move the page content up for 'study'/info/practice
            document.getElementById("bar-title").style.display="none";
            document.getElementById("pagecontentouter").style.top = "0px";
            document.getElementById("pagecontentouter").setAttribute("data-snap-ignore", "true"); // disable snap
        } else {
            document.getElementById("bar-title").style.display="block"; // enabled by default
            document.getElementById("pagecontentouter").style.top = "44px"; // spaced by default
            document.getElementById("pagecontentouter").removeAttribute("data-snap-ignore"); // enable snap
        }    
        
        if (section == "study" || section == "practice") {
            _body.style.display = 'none';
            _body.innerHTML = "";
            // will display study/practice later when it is initialised...
        } else {
            var _content = document.getElementById(section);
            if (_content) {
                var _html = _content.innerHTML;
                _body.innerHTML = _html;            
            }
            _body.style.display = 'inline';
            document.getElementById("study").style.display = 'none';
        }
        shanka.state = state;
        localStorage["state"] = shanka.compress(JSON.stringify(shanka.state));
        
    }
}

shanka.setpagetitle = function(title) {
    document.getElementById("pagetitle").innerHTML = title;
}

shanka.onpopstate = function(event) {
    console.log("onpopstate " + JSON.stringify(event.state));
    if (event.state) {
        shanka.navigate(event.state, "suppress");
    }
}

// Main Section

shanka.initmain = function() {
    document.getElementById("maincardsinvocab").innerHTML = Object.keys(shanka.cards).length.toString();
    document.getElementById("maincardslearned").innerHTML = shanka.queue.length - shanka.countqueueunknown();
    document.getElementById("maincardsqueued").innerHTML = shanka.queue.length;
    // don't really need to know this?
    // document.getElementById("maincategories").innerHTML = (Object.keys(shanka.categories).length-1).toString();
}

shanka.initwelcome = function() {
}

// ================
// Pinyin numbers to tone marks

pinyintones = ["A\u0100\u00C1\u0102\u00C0A", "a\u0101\u00E1\u0103\u00E0a",
               "E\u0112\u00C9\u0114\u00C8E", "e\u0113\u00E9\u0115\u00E8e",
               "O\u014C\u00D3\u014E\u00D2O", "o\u014D\u00F3\u014F\u00F2o",
               "I\u012A\u00CD\u012C\u00CCI", "i\u012B\u00ED\u012D\u00ECi",
               "U\u016A\u00DA\u016C\u00D9U", "u\u016B\u00FA\u016D\u00F9u",
               "\u00DC\u01D5\u01D7\u01D9\u01DB\u00DC", "\u00FC\u01D6\u01D8\u01DA\u01DC\u00FC"];
pyreplacements = [["u:", "\u00FC"], ["v", "\u00FC"], ["U:", "\u00DC"], ["V", "\u00DC"]];

pinyin_numbers_to_tone_marks = function(inputstr) {
    var result = "";
    var nexthanzi = 0;
    var reg = new RegExp(/[A-Za-z\u00FC\u00DC:]+[1-5]/g);
    while((match = reg.exec(inputstr)) != null) {
        var start = inputstr.indexOf(match, nexthanzi);
        
        if (start != nexthanzi) {
            result += inputstr.substr(nexthanzi, start - nexthanzi);
        }
        
        var syllable = match.substr(0, match.length-1);
        var tone = parseInt(match.substr(match.length-1, 1));
        for (var i=0, len=pyreplacements.length; i<len; i++) {
            syllable = syllable.replace(pyreplacements[i][0], pyreplacements[i][1]);
        }

        for (var i=0, len=pyreplacements.length; i<len; i++) {
            var tonetest = pyreplacements[i];
            var chartest = tonetest.substr(0,1);
            if (contains(syllable, chartest)) {
                // don't replace the "i" when we have "iu", we'll do the "u" instead later
                if (chartest.toLowerCase() != "i" || !syllable.toLowerCase().contains("iu")) {
                    result += syllable.replace(chartest, tonetest.substr(tone, 1))
                    break;
                }
            }
        }
        
        nexthanzi += match.length;
    }
    if (nexthanzi != inputstr.length) {
        result += inputstr.substr(nexthanzi);
    }
}

