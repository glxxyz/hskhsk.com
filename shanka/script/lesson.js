/*
    Shanka HSK Flashcards - lesson.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// ---------------------------
// Lesson is a collection of questions and categories

function Lesson () {
    this.lessonid = 0;
    this.name = "";
    this.enabled = true;
    this.reviewmode = false;
    this.allquestions = false;
    this.allcategories = false;
    this.questionids = [];
    this.categoryids = [];
};

// ---------------------------
// Lesson methods

Lesson.prototype.write = function() {
    localStorage["l" + this.lessonid.toString(36)] = shanka.compress(JSON.stringify(this));
}

Lesson.prototype.del = function() {
    delete shanka.lessons[this.lessonid];
    localStorage.removeItem("l" + this.lessonid.toString(36));
}



// Lessons Section

shanka.getuniquelessonname = function(prefix) {
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var lessonidstr in shanka.lessons) {
            if (shanka.lessons[lessonidstr].name == newname) {
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

shanka.initlessons = function() {
    document.getElementById("study_study_text").innerHTML = STR.study_study_text; 
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text; 
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text; 
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 

    shanka.initlessonslist(false);
}

shanka.initeditlessons = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text; 
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 

    shanka.initlessonslist(true);
}

shanka.initlessonslist = function(addonclick) {
    var lessonlist = document.getElementById("lessonlist")
    var lis = lessonlist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (lessonlist.firstChild) {
        lessonlist.removeChild(lessonlist.firstChild);
    }
    
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        
        var li=document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, lesson.lessonid.toString())
                               .replace(/#NAME#/g, lesson.name)
                               .replace(/#CHECKED#/g, lesson.enabled ? "active" : "")
                               .replace(/#REVIEW#/g, lesson.reviewmode ? STR.lesson_review_mode_name : "");
        if (addonclick) {
            li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
        }
        lessonlist.appendChild(li);
    }
}

shanka.addlesson = function() {
    shanka.navigate({"section" : "lesson"});
}

shanka.showlesson = function(lessonid) {
    shanka.navigate({"section" : "lesson", "lessonid" : lessonid});
}

shanka.initlesson = function(lessonid) {
    document.getElementById("lesson_name_label").innerHTML = STR.lesson_name_label; 
    document.getElementById("lesson_reviewing_label").innerHTML = STR.lesson_reviewing_label; 
    document.getElementById("page_questions_title").innerHTML = STR.page_questions_title; 
    document.getElementById("questions_gen_all_text").innerHTML = STR.gen_all_text; 
    document.getElementById("categories_gen_all_text").innerHTML = STR.gen_all_text; 
    document.getElementById("page_categories_title").innerHTML = STR.page_categories_title; 
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text; 

    var lesson = null;
    if (lessonid in shanka.lessons) {
        lesson = shanka.lessons[lessonid];
    } else {
        lesson = new Lesson();
        lesson.name = shanka.getuniquelessonname(STR.lesson_new_name )
    }
    
    document.getElementById("editlessonname").value = lesson.name;
    
    if (lesson.reviewmode) {
        document.getElementById("reviewmodeenabled").classList.add("active");
    }
    
    if (lesson.allquestions) {
        document.getElementById("questionenabledall").classList.add("active");
    }
    
    if (lesson.allcategories) {
        document.getElementById("categoryenabledall").classList.add("active");
    }
    
    shanka.initquestionlist(true);    
    shanka.initcategorylist(true, true);
    shanka.lessonquestionallclicked();
    shanka.lessoncategoryallclicked();    
}

shanka.onlessoncheckclick = function() {
    WaitCursorOn();
    try
    {
        for (var lessonidstr in shanka.lessons) {
            var enabled = document.getElementById("lessonenabled" + lessonidstr).classList.contains("active");
            var lesson = shanka.lessons[lessonidstr];
            if (lesson.enabled != enabled) {
                lesson.enabled = enabled;
                lesson.write();
                            
                shanka.queue = []; // need to rebuild queue
            }
        }
    }
    catch(err)
    {
        ExceptionError("onlessoncheckclick", err);
    }
    WaitCursorOff();    
}

shanka.dosavelesson = function() {
    WaitCursorOn();
    try
    {
        var newname = document.getElementById("editlessonname").value;
        var questionids = [];
        var categoryids = [];
        
        if (!newname.length) {
            alert(STR.lesson_name_cant_be_empty_error);
            WaitCursorOff();    
            return;
        }
        
        for (var iterlessonidstr in shanka.categories) {
            var iterlesson = shanka.categories[iterlessonidstr];
            if (parseInt(iterlessonidstr) != lessonid && iterlesson.newname == newname) {
                alert(STR.lesson_name_already_exist_error);
                WaitCursorOff();    
                return;
            }
        }
        
        for (var questionidstr in shanka.questions) {
            if (document.getElementById("questionenabled" + questionidstr).classList.contains("active")) {
                questionids.push(parseInt(questionidstr));
            }
        }
       
        for (var categoryidstr in shanka.categories) {
            if (document.getElementById("categoryenabled" + categoryidstr).classList.contains("active")) {
                categoryids.push(parseInt(categoryidstr));
            }
        }
        
        if (!questionids.length) {
            alert(STR.lesson_must_include_1_quest_error);
            WaitCursorOff();    
            return;
        }

        if (!categoryids.length) {
            alert(STR.lesson_must_include_1_cat_error);
            WaitCursorOff();    
            return;
        }

        var lesson = null;
        if ("lessonid" in shanka.state) {
            var lessonid = parseInt(shanka.state["lessonid"]);
            lesson = shanka.lessons[lessonid];
        } else {
            lesson = new Lesson();
            lesson.lessonid = shanka.getnextguid();  
        }
        
        lesson.reviewmode = document.getElementById("reviewmodeenabled").classList.contains("active");
        lesson.allquestions = document.getElementById("questionenabledall").classList.contains("active");
        lesson.allcategories = document.getElementById("categoryenabledall").classList.contains("active");
        
        lesson.name = newname;
        lesson.categoryids = categoryids;
        lesson.questionids = questionids;
        
        shanka.lessons[lesson.lessonid] = lesson;
        lesson.write();
        shanka.showlessons();
        shanka.addtoresult(STR.lesson_saved_format.replace("{0}", lesson.name));
        
        // need to rebuild
        shanka.queue = [];
    }
    catch(err)
    {
        ExceptionError("dosavelesson", err);
    }
    WaitCursorOff();    
}

shanka.editlessons = function() {
    shanka.navigate({"section" : "editlessons"})
}

shanka.doduplicatelessons = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.lesson_duplicate_selected_confirm)) {
            var lessonids = Object.keys(shanka.lessons)
            var i = lessonids.length;
            while (i--) {
                var lessonid = lessonids[i];
               
                var toggle = document.getElementById("lessonselected" + lessonid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var lesson = shanka.lessons[lessonid];
                    var newlesson = JSON.parse(JSON.stringify(lesson)); // copy
                    newlesson.__proto__ = Lesson.prototype;
                    newlesson.lessonid = shanka.getnextguid();
                    newlesson.name = shanka.getuniquelessonname(lesson.name); 
                    newlesson.current = false;
                    shanka.lessons[newlesson.lessonid] = newlesson;
                    newlesson.write();
                    count++;
                }
            }
        
            shanka.editlessons();
            shanka.addtoresult(STR.lesson_duplicated_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("duplicatelessons", err);
    }
    WaitCursorOff();
}

shanka.dodeletelessons = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.lesson_delete_selected_confirm)) {
            var lessonids = Object.keys(shanka.lessons)
            var i = lessonids.length;
            while (i--) {
                var lessonid = lessonids[i];
                var lesson = shanka.lessons[lessonid];
                
                var toggle = document.getElementById("lessonselected" + lessonid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    lesson.del();
                    count++;
                }
            }
            
            shanka.editlessons();
            shanka.addtoresult(STR.lesson_deleted_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("deletelessons", err);
    }
    WaitCursorOff();
}

shanka.lessonquestionallclicked = function() {
    var allquestions = document.getElementById("questionenabledall").classList.contains("active");
    
    if (allquestions) {
        for (var questionidstr in shanka.questions) {
            var questioncheck = document.getElementById("questionenabled" + questionidstr);
            questioncheck.classList.add("active");
            questioncheck.parentElement.classList.add("disabled");
        }
    } else {
        var lesson = null;
        if ("lessonid" in shanka.state) {
            var lessonid = parseInt(shanka.state["lessonid"]);
            lesson = shanka.lessons[lessonid];
        } else {
            lesson = new Lesson();
            lesson.lessonid = shanka.getnextguid();  
        }
        
        for (var questionidstr in shanka.questions) {
            var questioncheck = document.getElementById("questionenabled" + questionidstr);
            questioncheck.parentElement.classList.remove("disabled");
            if (contains(lesson.questionids, parseInt(questionidstr))) {
                questioncheck.classList.add("active");
            } else {
                questioncheck.classList.remove("active");
            }

        }        
    }
}

shanka.lessoncategoryallclicked = function() {
    var allcategories = document.getElementById("categoryenabledall").classList.contains("active");

    if (allcategories) {
        for (var categoryidstr in shanka.categories) {
            var categorycheck = document.getElementById("categoryenabled" + categoryidstr);
            categorycheck.classList.add("active");
            categorycheck.parentElement.classList.add("disabled");
        }
    } else {
        var lesson = null;
        if ("lessonid" in shanka.state) {
            var lessonid = parseInt(shanka.state["lessonid"]);
            lesson = shanka.lessons[lessonid];
        } else {
            lesson = new Lesson();
            lesson.lessonid = shanka.getnextguid();  
        }

        for (var categoryidstr in shanka.categories) {
            var categorycheck = document.getElementById("categoryenabled" + categoryidstr);
            categorycheck.parentElement.classList.remove("disabled");
            if (contains(lesson.categoryids, parseInt(categoryidstr))) {
                categorycheck.classList.add("active");
            } else {
                categorycheck.classList.remove("active");
            }

        }        
    }
}