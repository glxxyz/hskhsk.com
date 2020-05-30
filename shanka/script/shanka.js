/*
    Shanka HSK Flashcards - shanka.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    
    You muse also respect the licenses of any components written by others which are
    distributed along with this web app.
    
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 (alan@hskhsk.com)
    
    Dutch Translation by Axel Dessein (axel_dessein@hotmail.com)
    Spanish Translation by Nicolás Godoy (nicolasgastongodoy@gmail.com)
        
    See http://hskhsk.com/shanka for more information.

*/

// Google Analytics stuff goes here

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-39955029-5', 'hskhsk.com');
  ga('send', 'pageview');


// ---------------------------
// create shanka as a singleton
shanka = {};

shanka.init = function() {
    WaitCursorOn();
    try
    {
        var appsupport = document.getElementById("default_app_support_see_message");
        var appinit = document.getElementById("default_app_support_see_message");
        if (appinit) {
            // 'cut' the 'mustard', apparently
            if ('querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {
                appinit.innerHTML = STR.app_initialising_message;
            } else {
                appinit.innerHTML = STR.app_no_html5_message;
            }
        }
        if (appsupport) {
            appsupport.innerHTML = STR.app_support_see_message;
        }
        
        document.getElementById("snap_page_main_title"       ).innerHTML = STR.page_main_title       ;
        document.getElementById("snap_page_practice_title"   ).innerHTML = STR.page_practice_title   ;
        document.getElementById("snap_study_study_text"      ).innerHTML = STR.study_study_text      ;
        document.getElementById("snap_gen_add_text"          ).innerHTML = STR.gen_add_text          ;
        document.getElementById("snap_page_history_title"    ).innerHTML = STR.page_history_title    ;
        document.getElementById("snap_page_queue_title"      ).innerHTML = STR.page_queue_title      ;
        document.getElementById("snap_page_progress_title"   ).innerHTML = STR.page_progress_title   ;
        document.getElementById("snap_page_categories_title" ).innerHTML = STR.page_categories_title ;
        document.getElementById("snap_page_questions_title"  ).innerHTML = STR.page_questions_title  ;
        document.getElementById("snap_page_lessons_title"    ).innerHTML = STR.page_lessons_title    ;
        document.getElementById("snap_page_algorithms_title" ).innerHTML = STR.page_algorithms_title ;
        document.getElementById("snap_page_wizard_title"     ).innerHTML = STR.page_wizard_title     ;
        document.getElementById("snap_page_import_title"     ).innerHTML = STR.page_import_title     ;
        document.getElementById("snap_page_export_title"     ).innerHTML = STR.page_export_title     ;
        document.getElementById("snap_page_settings_title"   ).innerHTML = STR.page_settings_title   ;
        document.getElementById("snap_page_maintenance_title").innerHTML = STR.page_maintenance_title;

        // study
        document.getElementById("studycurrent"                ).innerHTML = STR.study_study_text         ;
        document.getElementById("studypractice"               ).innerHTML = STR.study_practice_text      ;
        document.getElementById("studyedit"                   ).innerHTML = STR.study_edit_text          ;
        document.getElementById("studyreveal"                 ).innerHTML = STR.study_show_answer_label  ;
        document.getElementById("study_search_result_label"   ).innerHTML = STR.study_search_result_label;

    
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
        shanka.currentlang = "";
        
        var currentState = parseWindowLocation();
        
        shanka.readall();

        window.onpopstate = shanka.onpopstate; 

        shanka.initlocal();
        
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
        
        shanka.addtoresult(STR.local_storage_rebuilt_ok_message);
        shanka._updatemlocalstorageused();        
    }
}

shanka.donuke = function() {
    WaitCursorOn();
    try
    {
        if (confirm(STR.local_storage_erase_confirm)) {
            var language = localStorage["language"];
            if (!language || !(language in supportedLanguages)) {
                language = "en";
            }
            
            localStorage.clear();
            localStorage["language"] = language;
            
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
            || (state["section"] == "welcome")
            || (state["section"].substr(0, 4) == "lang")) {
            
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
            case "initialising":
                shanka.initinitialising();
                break;
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
            case "addcategory":
                shanka.hidemenubuttonsetback(shanka.showcategories);
                shanka.initaddcategory();
                shanka.setpagetitle(STR.page_add_category_title);
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
            case "exported":
                shanka.hidemenubuttonsetback(shanka.showexport);
                shanka.initexported();
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

shanka.initinitialising = function() {
    document.getElementById("init_app_support_see_message").innerHTML = STR.app_support_see_message;
    document.getElementById("app_please_wait_a_moment"    ).innerHTML = STR.app_please_wait_a_moment;

    // 'cut' the 'mustard', apparently
    if ('querySelector' in document && 'addEventListener' in window && Array.prototype.forEach ) {
        document.getElementById("app_initialising_message").innerHTML = STR.app_initialising_message;
    } else {
        document.getElementById("app_initialising_message").innerHTML = STR.app_no_html5_message;
    }    
}

// Main Section

shanka.initmain = function() {

    shanka.ensuretodayhasprogress();
    
    document.getElementById("progress_total_label"          ).innerHTML = STR.progress_total_label;
    document.getElementById("progress_today_label"          ).innerHTML = STR.progress_today_label;
    document.getElementById("all_main_cards_learned_label"  ).innerHTML = STR.main_cards_learned_label;
    document.getElementById("all_progress_studied_label"    ).innerHTML = STR.progress_studied_label;
    document.getElementById("today_main_cards_learned_label").innerHTML = STR.main_cards_learned_label;
    document.getElementById("today_progress_studied_label"  ).innerHTML = STR.progress_studied_label;
    document.getElementById("study_study_text"              ).innerHTML = STR.study_study_text;
    document.getElementById("study_practice_text"           ).innerHTML = STR.study_practice_text;
    document.getElementById("card_add_text"                 ).innerHTML = STR.card_add_text;
    
    
    if (shanka.progress.length) {
        var progress = shanka.progress[0];
        var timestudied  = progress.totaltimestudied;
        var itemsstudied = progress.totalitemsstudied;
        var cardsknown   = progress.totalcardsknown;
        var valunit      = shanka.getprogressvalunit(timestudied);
        
        document.getElementById("maintimestudiedalltime") .innerHTML = valunit[0];
        document.getElementById("maintimeunitalltime")    .innerHTML = valunit[1];
        document.getElementById("maincardslearnedalltime").innerHTML = cardsknown.toString();
        document.getElementById("maincardsstudiedalltime").innerHTML = itemsstudied.toString();

        if (shanka.progress.length > 1) {
            var prevprogress = shanka.progress[1];            
            timestudied  = progress.totaltimestudied  - prevprogress.totaltimestudied;
            itemsstudied = progress.totalitemsstudied - prevprogress.totalitemsstudied;
            cardsknown   = progress.totalcardsknown   - prevprogress.totalcardsknown;
        }
        
        document.getElementById("maintimestudiedtoday") .innerHTML = valunit[0];
        document.getElementById("maintimeunittoday")    .innerHTML = valunit[1];
        document.getElementById("maincardslearnedtoday").innerHTML = cardsknown.toString();
        document.getElementById("maincardsstudiedtoday").innerHTML = itemsstudied.toString();
    }
}

shanka.initwelcome = function() {
    // 'cut' the 'mustard', apparently
    if (!('querySelector' in document) || !('addEventListener' in window) || !(Array.prototype.forEach)) {
        shanka.addtoresult(STR.main_browser_no_html5_error);
    }
    
    document.getElementById("main_menu_help_label"           ).innerHTML = STR.main_menu_help_label             ; 
    document.getElementById("main_choose_option_begin_label" ).innerHTML = STR.main_choose_option_begin_label   ;
    document.getElementById("main_beginners_quickstart_label").innerHTML = STR.main_beginners_quickstart_label  ;
    document.getElementById("main_setup_wizard_label"        ).innerHTML = STR.main_setup_wizard_label          ;
    document.getElementById("lang_interface_language"        ).innerHTML = STR.lang_interface_language          ;
    document.getElementById("welcome_app_support_see_message").innerHTML = STR.app_support_see_message          ;
    
    var supportedlanglist = document.getElementById("supportedlanglist");
    for (var languageId in supportedLanguages) {
        if (languageId != STR.getCurrentLanguage()) {
            var language = supportedLanguages[languageId];
            var ul=document.createElement("ul");    
            ul.classList.add("inset");
            ul.classList.add("list");
            ul.innerHTML =  "<li>" +
                                "<a href='javascript:STR.setLanguage(\"" + languageId + "\")'>" + 
                                    language.this_switch_language +
                                    " (" + STR.get_language_name(languageId) + ")" +
                                    "<span class='chevron'></span>" + 
                                "</a>" + 
                            "</li>";
            supportedlanglist.appendChild(ul);
            var br=document.createElement("br");    
            supportedlanglist.appendChild(br);
        }
    }
}

// ================
// Pinyin numbers to tone marks

var pinyintones = [ "A\u0100\u00C1\u0102\u00C0A", "a\u0101\u00E1\u0103\u00E0a",
                    "E\u0112\u00C9\u0114\u00C8E", "e\u0113\u00E9\u0115\u00E8e",
                    "O\u014C\u00D3\u014E\u00D2O", "o\u014D\u00F3\u014F\u00F2o",
                    "I\u012A\u00CD\u012C\u00CCI", "i\u012B\u00ED\u012D\u00ECi",
                    "U\u016A\u00DA\u016C\u00D9U", "u\u016B\u00FA\u016D\u00F9u",
                    "\u00DC\u01D5\u01D7\u01D9\u01DB\u00DC", "\u00FC\u01D6\u01D8\u01DA\u01DC\u00FC"];
var pyreplacements = [["u:", "\u00FC"], ["v", "\u00FC"], ["U:", "\u00DC"], ["V", "\u00DC"]];

var pinyin_numbers_to_tone_marks = function(inputstr) {
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

shanka.filterlistpages = function(population) {
    var pageselect = document.getElementById("pageselect");
    var listmax = parseInt(shanka.getsetting("listmax"));
    var sample = [];
    
    if (population.length <= listmax) {
        pageselect.style.display = "none";
        sample = population;
    } else {
        pageselect.style.display = "inline";
        var page = 0;
        if ("page" in shanka.state) {
            page = parseInt(shanka.state["page"]);
        }
        if (page == -1) {
            sample = population;
        } else {
            for (var i=page; (i<(page+listmax)) && (i<population.length); i++) {
                sample.push(population[i]);
            }
        }
        
        var option=document.createElement("option");
        option.text  = STR.gen_all_text + " (" + population.length.toString() + "）";
        option.value = "-1";
        pageselect.add(option, null);
        
        for (var j=0; j<population.length; j+=listmax) {
            var upperbound = Math.min(j+listmax, population.length);

            var option=document.createElement("option");
            option.text  = (j+1).toString() + " ... " + upperbound.toString();
            option.value = j.toString();
            pageselect.add(option, null);
        }
        
        if (page == -1) {
            pageselect.selectedIndex = 0;
        } else {
            pageselect.selectedIndex = Math.floor(page / listmax) + 1;
        }
    }
    
    return sample;
}

shanka.onpageselectchange = function() {
    var pageselect = document.getElementById("pageselect");
    var page = parseInt(pageselect.options[pageselect.selectedIndex].value);
    var state = JSON.parse(JSON.stringify(shanka.state)); // copy
    state["page"] = page.toString();
    shanka.navigate(state);
}


shanka.snapperclose = function() {
    snapper.close();
}

shanka.snapperopen = function(which) {
    snapper.open(which);
}