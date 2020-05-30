/*
    Shanka HSK Flashcards - help.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

shanka.showhelp = function(page) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    var section = state["section"];
    if (section && section != "help") {
        state["previous"] = section;
    }
    state["section"] = "help";
    
    if (page) {
        state["page"] = page;
    } else if ("section" in shanka.state) {
        state["page"] = shanka.state["section"];
    } else {
        state["page"] = "";
    }
    
    shanka.navigate(state);
}

shanka.inithelp = function(page) {
    if (!page) page="";

    switch (page)
    {
        case "":
        case "contents": shanka.inithelp_contents(); break;
        case "initialising":
        case "welcome":
        case "main": shanka.inithelp_mainpage(); break;        
        case "about": shanka.inithelp_about(); break;
        case "algorithm-add":
        case "algorithm-shanka":
        case "editalgorithms":
        case "algorithms": shanka.inithelp_algorithms(); break;
        case "addcategory":
        case "editcategoryname":
        case "categories":
        case "category": shanka.inithelp_categories(); break;
        case "exportresult":
        case "export": shanka.inithelp_export(); break;
        case "history": shanka.inithelp_history(); break;
        case "shankaimport":
        case "skritterimport":
        case "stickyimport":
        case "plecoimport":
        case "import": shanka.inithelp_import(); break;
        case "card":
        case "info": shanka.inithelp_info(); break;
        case "lesson":
        case "lessons": shanka.inithelp_lessons(); break;
        case "maintenance": shanka.inithelp_maintenance(); break;
        case "practice": shanka.inithelp_practice(); break;
        case "progress": shanka.inithelp_progress(); break;
        case "question":
        case "questions": shanka.inithelp_questions(); break;
        case "queue": shanka.inithelp_queue(); break;
        case "settings": shanka.inithelp_settings(); break;
        case "study": shanka.inithelp_study(); break;
        case "wizard1":
        case "wizard2":
        case "wizard3":
        case "wizard4": shanka.inithelp_wizard(); break;
        default: ReportError("shanka.inithelp Unknown help page: " + page); break;
    }
}

// ----------------------------------------------------------------

shanka.inithelp_contents = function() {
    shanka.setpagetitle(STR.page_help_contents_title);
    document.getElementById("helptext").innerHTML = 
        "<h3>" + STR.page_help_contents_title + "</h3>" +
        "<h3><li><a href=\"javascript:shanka.showhelp('main');\">  "      + STR.page_main_title        + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('study');\"> "      + STR.page_study_title       + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('practice');\">"    + STR.page_practice_title    + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('card');\">  "      + STR.page_cards_title       + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('history');\"> "    + STR.page_history_title       + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('queue');\"> "      + STR.page_queue_title       + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('progress');\">"    + STR.page_progress_title    + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('categories');\">"  + STR.page_categories_title  + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('questions');\">"   + STR.page_questions_title   + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('lessons');\">"     + STR.page_lessons_title     + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('algorithms');\">"  + STR.page_algorithms_title  + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('wizard1');\">"     + STR.page_wizard_title     + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('import');\">"      + STR.page_import_title      + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('export');\">"      + STR.page_export_title      + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('settings');\">"    + STR.page_settings_title    + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('maintenance');\">" + STR.page_maintenance_title + "</a></li>" +
           "<li><a href=\"javascript:shanka.showhelp('about');\"> "      + STR.page_about_title       + "</a></li></h3>";
}

shanka.inithelp_mainpage = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_main_title);
    document.getElementById("helptext").innerHTML = STR.help_main_page;
        
}

shanka.inithelp_lessons = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_lessons_title);
    document.getElementById("helptext").innerHTML = STR.help_lessons;
}

shanka.inithelp_study = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_study_title);
    document.getElementById("helptext").innerHTML = STR.help_study;
}

shanka.inithelp_info = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_card_info_title);
    document.getElementById("helptext").innerHTML = STR.help_card_info;
}

shanka.inithelp_practice = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_practice_title);
    document.getElementById("helptext").innerHTML = STR.help_practice;
}

shanka.inithelp_card = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_cards_title);
    document.getElementById("helptext").innerHTML = STR.help_study;
}

shanka.inithelp_categories = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_categories_title);
    document.getElementById("helptext").innerHTML = STR.help_categories;
}

shanka.inithelp_progress = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_progress_title);
    document.getElementById("helptext").innerHTML = STR.help_progress;
}

shanka.inithelp_history = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_history_title);
    document.getElementById("helptext").innerHTML = STR.help_history;
}

shanka.inithelp_import = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_import_title);
    document.getElementById("helptext").innerHTML = STR.help_import;
}

shanka.inithelp_export = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_export_title);
    document.getElementById("helptext").innerHTML = STR.help_export;
}

shanka.inithelp_settings = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_settings_title);
    document.getElementById("helptext").innerHTML = STR.help_settings;
}

shanka.inithelp_queue = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_queue_title);
    document.getElementById("helptext").innerHTML = STR.help_queue;
}

shanka.inithelp_algorithms = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_algorithms_title);
    document.getElementById("helptext").innerHTML = STR.help_algorithms;
}

shanka.inithelp_questions = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_questions_title);
    document.getElementById("helptext").innerHTML = STR.help_questions
}

shanka.inithelp_maintenance = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_maintenance_title);
    document.getElementById("helptext").innerHTML = STR.help_maintenance;
}

shanka.inithelp_wizard = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_wizard_title);
    document.getElementById("helptext").innerHTML = STR.help_wizard;

}

shanka.inithelp_about = function() {
    shanka.setpagetitle(STR.page_help_prefix_title + ": " + STR.page_about_title);
    document.getElementById("helptext").innerHTML = STR.help_about;
}

