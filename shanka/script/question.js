/*
    Shanka HSK Flashcards - question.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

function Question () {
    this.questionid = 0;
    this.autogenname = true;
    this.name = "";
    this.autogentext = true;
    this.questiontext = "";
    this.input = []; // ["draw", "type"]
    this.stem = []; // ["simplified"]
    this.answer = []; // ["english", "pinyin"];
    this.display = []; // ["traditional", "cursive"];
};

// ---------------------------
// Question methods

Question.prototype.write = function() {
    localStorage["q" + this.questionid.toString(36)] = shanka.compress(JSON.stringify(this));
}

Question.prototype.del = function() {
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        for (var j=0, len=lesson.questionids.length; j<len; j++) {
            if (lesson.questionids[j] == this.questionid) {
                lesson.questionids.splice(j, 1);
                lesson.write();
                break;
            }
        }
    }

    delete shanka.questions[this.questionid];

    localStorage.removeItem("q" + this.questionid.toString(36));
}

Question.prototype.generatename = function() {
    var stembits = []
    var answerbits = []
    var inputbits = []

    var studyfieldsName = [STR.study_field_question_name_simplified,
                           STR.study_field_question_name_cursive,
                           STR.study_field_question_name_calligraphy,
                           STR.study_field_question_name_traditional,
                           STR.study_field_question_name_pinyin,
                           STR.study_field_question_name_definition,
                           STR.study_field_question_name_notes];

    var inputfieldsName = [STR.study_field_question_text_input_draw,
                           STR.study_field_question_text_input_type];
                           
    LookupAtoB(this.stem, stembits, studyfields, studyfieldsName);
    LookupAtoB(this.answer, answerbits, studyfields, studyfieldsName);
    LookupAtoB(this.input, inputbits, inputfields, inputfieldsName);

    if (stembits.length == 0) {
        stembits = ["..."];
    }
    
    if (answerbits.length == 0) {
        answerbits = ["..."];
    }
    
    this.name = "";

    if (inputbits.length) {
        this.name += commaAndList(inputbits) + ": "
    }
    
    this.name += commaAndList(stembits) + " -> " + commaAndList(answerbits);
}

Question.prototype.generatequestiontext = function() {
    var answerbits = []
    var inputbits = []

    var studyfieldsText = [STR.study_field_question_text_simplified,
                           STR.study_field_question_text_cursive,
                           STR.study_field_question_text_calligraphy,
                           STR.study_field_question_text_traditional,
                           STR.study_field_question_text_pinyin,
                           STR.study_field_question_text_definition,
                           STR.study_field_question_text_notes];
                           
    var inputfieldsName = [STR.study_field_question_text_input_draw,
                           STR.study_field_question_text_input_type];

    LookupAtoB(this.answer, answerbits, studyfields, studyfieldsText);
    LookupAtoB(this.input, inputbits, inputfields, inputfieldsName);
    
    if (answerbits.length == 0) {
        answerbits = ["..."];
    }
    
    this.questiontext = STR.question_whats_the_format.replace("{0}", commaAndList(answerbits));
}

shanka.getuniquequestionname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var questionidstr in shanka.questions) {
            if (shanka.questions[questionidstr].name == newname) {
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

shanka.initquestions = function() {
    shanka.initquestionlist(false);
}


shanka.editquestions = function() {
    shanka.navigate({"section" : "editquestions"})
}

shanka.initeditquestions = function() {
    shanka.initquestionlist(true);
}

shanka.initquestionlist = function(addonclick) {
    var questionlist = document.getElementById("questionlist")
    var lis = questionlist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (questionlist.firstChild) {
        questionlist.removeChild(questionlist.firstChild);
    }
    
    for (var questionidstr in shanka.questions) {
        var question = shanka.questions[questionidstr];
        var li=document.createElement("li");    
        li.innerHTML = template.replace(/#ID#/g, questionidstr)
                               .replace(/#NAME#/g, question.name);
        if (addonclick) {
            li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
        }
        questionlist.appendChild(li);
    }
}

shanka.initshowquestion = function(questionid) {
    var question = null;
    if (questionid && questionid in shanka.questions) {
        question = shanka.questions[questionid];
    } else {
        question = new Question();
        question.name = shanka.getuniquequestionname(STR.question_new_name);
    }
        
    if (question.autogenname) document.getElementById("questionnameauto").classList.add("active");
    document.getElementById("questionname").value = question.name;
    if (question.autogentext) document.getElementById("questiontextauto").classList.add("active");
    document.getElementById("questiontext").value = question.questiontext;
    if (contains(question.input, "draw")) document.getElementById("questiondrawinput").classList.add("active");
    if (contains(question.input, "type")) document.getElementById("questiontypeinput").classList.add("active");
    
    for (var i=0, len=studyfields.length; i<len; i++) {
        var field = studyfields[i];
        var stemcheck    = document.getElementById(field + "stem"   );
        var answercheck  = document.getElementById(field + "answer" );
        var displaycheck = document.getElementById(field + "display");
        
        if (contains(question.stem, field)) {
            stemcheck.classList.add("active");
        }
        
        if (contains(question.answer, field)) {
            answercheck.classList.add("active");
        }
        
        if (contains(question.display, field)) {
            displaycheck.classList.add("active");
        }
    }            
        
    shanka.onquestionchange();
}

shanka.addquestionoption = function(field) {
    var stemlist = document.getElementById(field + "options");
    
    for (var i=0; i<10; i++) {
        var select = document.getElementById(field + "select" + i.toString());
        if (!select) {
            var template = document.getElementById("questionoptiontemplate");
            select=document.createElement("select");  
            select.innerHTML = template.innerHTML;
            select.id = field + "select" + i.toString();
            select.onchange = shanka.onquestionchange;
            stemlist.appendChild(select);
            return select;
        }        
    }
    return null;
}

shanka.onquestionchange = function() {
    var stembits = []
    var answerbits = []
    var displaybits = []
    var inputbits = []
    
    shanka.getquestionbits(stembits, answerbits, displaybits, inputbits);
    
    var question = new Question();
    question.stem = stembits;
    question.answer = answerbits;
    question.display = displaybits;
    question.input = inputbits;
    
    question.generatename();
    question.generatequestiontext();
    
    if (document.getElementById("questionnameauto").classList.contains("active")) {
        document.getElementById("questionname").disabled = true;
        document.getElementById("questionname").value = question.name;
    } else {
        document.getElementById("questionname").disabled = false;
    }

    if (document.getElementById("questiontextauto").classList.contains("active")) {
        document.getElementById("questiontext").disabled = true;
        document.getElementById("questiontext").value = question.questiontext;
    } else {
        document.getElementById("questiontext").disabled = false;
    }
}

shanka.getquestionbits = function(stembits, answerbits, displaybits, inputbits) {
    for (var i=0, len=studyfields.length; i<len; i++) {
        var field = studyfields[i];
        var stemcheck    = document.getElementById(field + "stem"   );
        var answercheck  = document.getElementById(field + "answer" );
        var displaycheck = document.getElementById(field + "display");
        
        if (stemcheck.classList.contains("active")) {
            stembits.push(field);
        }
        
        if (answercheck.classList.contains("active")) {
            answerbits.push(studyfields[i]);
        }

        if (displaycheck.classList.contains("active")) {
            displaybits.push(studyfields[i]);
        }
    }                 
    
    if (document.getElementById("questiondrawinput").classList.contains("active")) {
        inputbits.push("draw");
    }
    if (document.getElementById("questiontypeinput").classList.contains("active")) {
        inputbits.push("type");
    }
}

shanka.doupdatequestion = function() {
    WaitCursorOn();
    try
    {
        var stembits = []
        var answerbits = []
        var displaybits = []
        var inputbits = []
        
        shanka.getquestionbits(stembits, answerbits, displaybits, inputbits);
                
        if (!stembits.length || !answerbits.length) {
            alert(STR.question_stem_answer_error);
            WaitCursorOff();    
            return;
        }
        
        var newname = document.getElementById("questionname").value;
        var newtext = document.getElementById("questiontext").value;
        
        if (!newname.length || !newtext.length) {
            alert(STR.question_name_text_error);
            WaitCursorOff();    
            return;        
        }
        
        var question = null;
        if ("questionid" in shanka.state) {
            var questionid = parseInt(shanka.state["questionid"]);
            question = shanka.questions[questionid];
        } else {
            question = new Question();
            question.questionid = shanka.getnextguid();  
            shanka.addnewquestiontolessons(question.questionid);
        }

        question.name = newname;
        question.questiontext = newtext;
        question.autogenname = document.getElementById("questionnameauto").classList.contains("active");
        question.autogentext = document.getElementById("questiontextauto").classList.contains("active");
        question.input = inputbits;
        question.stem = stembits;
        question.answer = answerbits;
        question.display = displaybits;

        shanka.questions[question.questionid] = question;
        question.write();
        shanka.showquestions();
        shanka.addtoresult(STR.question_saved_format.replace("{0}", question.name));
    }
    catch(err)
    {
        ExceptionError("doupdatequestion", err);
    }
    WaitCursorOff();    
}

shanka.doduplicatequestions = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.question_duplicate_sel_confirm)) {
            var questionids = Object.keys(shanka.questions)
            var i = questionids.length;
            while (i--) {
                var questionid = questionids[i];
               
                var toggle = document.getElementById("questionselected" + questionid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var question = shanka.questions[questionid];
                    var newquestion = JSON.parse(JSON.stringify(question)); // copy
                    newquestion.__proto__ = Question.prototype;
                    newquestion.questionid = shanka.getnextguid();
                    newquestion.name = shanka.getuniquequestionname(question.name); 
                    newquestion.current = false;
                    shanka.questions[newquestion.questionid] = newquestion;
                    shanka.addnewquestiontolessons(newquestion.questionid);
                    newquestion.write();
                    count++;
                }
            }
        
            shanka.editquestions();
            shanka.addtoresult(STR.question_duplicated_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("duplicatequestions", err);
    }
    WaitCursorOff();
}

shanka.dodeletequestions = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.question_delete_selected_confirm)) {
            var questionids = Object.keys(shanka.questions)
            var i = questionids.length;
            while (i--) {
                var questionid = questionids[i];
                var question = shanka.questions[questionid];
                
                var toggle = document.getElementById("questionselected" + questionid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    question.del();
                    count++;
                }
            }
            
            shanka.editquestions();
            shanka.addtoresult(STR.question_deleted_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("deletequestions", err);
    }
    WaitCursorOff();
}

shanka.addnewquestiontolessons = function(questionid) {
    // add this question to any lessons flagged 'all'
    for (var lessonidstr in shanka.lessons) {
        var lessonid = parseInt(lessonidstr);
        var lesson = shanka.lessons[lessonid];
        if (lesson.allquestions) {
            lesson.questionids.push(questionid);
            lesson.write();
        }
    }
}

