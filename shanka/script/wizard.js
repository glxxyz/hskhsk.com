/*
    Shanka HSK Flashcards - wizard.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

shanka.onetouchwizard = function() {
    WaitCursorOn();
    try
    {
        shanka.importmultiplecategories(["chineasy", "hsk1"], shanka.onetouchwizard_afterimport, []);
    }
    catch(err)
    {
        ExceptionError("onetouchwizard", err);
    }
    WaitCursorOff();
}

shanka.importmultiplecategories = function(categories, callback, categoryids) {
    WaitCursorOn();
    try
    {
        var category = categories[0];
        var categoriesnew = categories.concat();
        categoriesnew.splice(0, 1);
        var callbackwrapper = function(categoryimported, created, merged) {
            shanka.addtoresult(STR.wizard_created_flashcards_format.replace("{0}", created.toString()));
            if (merged) {
                shanka.addtoresult(STR.wizard_merged_flashcards_format.replace("{0}", merged.toString()));
            }
            var categoryidsnew = categoryids.concat();
            categoryidsnew.push(categoryimported.categoryid);
            if (categoriesnew.length) {
                shanka.importmultiplecategories(categoriesnew, callback, categoryidsnew);
            } else {
                callback(categoryidsnew);
            }
        }
        
        switch (category)
        {
            case "chineasy":
                shanka.importChineasy(callbackwrapper);
            break;
            case "hsk1":
                shanka.importHSK1(callbackwrapper);
            break;
            case "hsk2":
                shanka.importHSK2(callbackwrapper);
            break;
            case "hsk3":
                shanka.importHSK3(callbackwrapper);
            break;
            case "hsk4":
                shanka.importHSK4(callbackwrapper);
            break;
            case "hsk5":
                shanka.importHSK5(callbackwrapper);
            break;
            case "hsk6":
                shanka.importHSK6(callbackwrapper);
            break;
        }
    
    }
    catch(err)
    {
        ExceptionError("onetouchwizard_afterimporthsk", err);
    }
    WaitCursorOff();
}

shanka.onetouchwizard_afterimport= function(categoryids) {
    WaitCursorOn();
    try
    {
        var beginner = shanka.EnsureAlgorithmBeginnerExists();
        shanka.addtoresult(STR.wizard_created_algorithm_message);
        beginner.current = true;
        shanka.algorithm = beginner;                
        beginner.write();
        var sToPD = shanka.EnsureQuestionExists(["simplified"], ["pinyin", "definition"], ["notes"], []);
        var dToPS = shanka.EnsureQuestionExists(["definition"], ["simplified", "pinyin"], ["notes"], ["draw"]);
        var lesson = shanka.EnsureLessonExists("Chinese 101", [sToPD.questionid, dToPS.questionid], categoryids, false);
        lesson.allquestions = false;
        lesson.allcategories = false;
        lesson.enabled = true;
        lesson.write();
        shanka.showstudy();
    }
    catch(err)
    {
        ExceptionError("onetouchwizard_afterimportchineasy", err);
    }
    WaitCursorOff();
}


shanka.wizard = function() {
    var state = {};
    state["section"] = 'wizard1';
    shanka.navigate(state);
}

shanka.wizard2 = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["section"] = 'wizard2';
    shanka.navigate(state);
}

shanka.wizard3 = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["section"] = 'wizard3';
    shanka.navigate(state);
}


shanka.wizard1result = function(script) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["script"] = script;
    state["section"] = 'wizard2';
    shanka.navigate(state);
}

shanka.wizard2result = function() {
    var state = JSON.parse(JSON.stringify(shanka.state));
    var vocab = [];

    if (document.getElementById("vocabchineasy").classList.contains("active")) {
        vocab.push("chineasy")
    }
    if (document.getElementById("vocabhsk1").classList.contains("active")) {
        vocab.push("hsk1")
    }
    if (document.getElementById("vocabhsk2").classList.contains("active")) {
        vocab.push("hsk2")
    }
    if (document.getElementById("vocabhsk3").classList.contains("active")) {
        vocab.push("hsk3")
    }
    if (document.getElementById("vocabhsk4").classList.contains("active")) {
        vocab.push("hsk4")
    }
    if (document.getElementById("vocabhsk5").classList.contains("active")) {
        vocab.push("hsk5")
    }
    if (document.getElementById("vocabhsk6").classList.contains("active")) {
        vocab.push("hsk6")
    }
    
    if (vocab.length == 0) {
        alert(STR.wizard_select_one_vocab_error );
        return;
    }
    
    state["vocab"] = vocab.join(",");
    state["section"] = 'wizard3';
    shanka.navigate(state);
}

shanka.wizard3result = function(level) {
    var state = JSON.parse(JSON.stringify(shanka.state));
    state["level"] = level;
    state["section"] = 'wizard4';
    shanka.navigate(state);
}

shanka.wizard4result = function() {
    WaitCursorOn();
    try
    {
        var categorystr = shanka.state["vocab"];
        var categorynames = categorystr.split(",");
        shanka.importmultiplecategories(categorynames, shanka.wizard4continue, []);
    }
    catch(err)
    {
        ExceptionError("wizard4result", err);
    }
    WaitCursorOff();
}

shanka.wizard4continue = function(categoryids) {
    WaitCursorOn();
    try
    {
        var learndefinition = document.getElementById("learndefinition").classList.contains("active");
        var learnpinyin     = document.getElementById("learnpinyin").classList.contains("active");
        var learnhanzi      = document.getElementById("learnhanzi").classList.contains("active");
        var learnwriting    = document.getElementById("learnwriting").classList.contains("active");
        var learncursive    = document.getElementById("learncursive").classList.contains("active");
        var learncallig     = document.getElementById("learncallig").classList.contains("active");

        var count =    (learndefinition ? 1 : 0)
                     + (learnpinyin ? 1 : 0)
                     + (learnhanzi || learnwriting? 1 : 0)
                     + (learncursive || learncallig ? 1 : 0);
                     
        if (count == 0) {
            alert(STR.wizard_select_something_learn_error);
        }
        
        // set the algorithm
        var level = shanka.state["level"];
        var algorithm = null;
        if (level == "beginner") {
            algorithm = shanka.EnsureAlgorithmBeginnerExists();
        } else if (level == "intermediate") {
            algorithm = shanka.EnsureAlgorithmIntermediateExists();
        } else {
            algorithm = shanka.EnsureAlgorithmAdvancedExists();            
        }
        shanka.addtoresult(STR.wizard_created_algorithm_message);
        algorithm.current = true;
        shanka.algorithm = algorithm;                
        algorithm.write();
        for (algorithmidstr in shanka.algorithms) {
            var algorithmiter = shanka.algorithms[algorithmidstr];
            if (   algorithmiter.algorithmid != algorithm.algorithmid
                && algorithmiter.current) {
                algorithmiter.current = false;
                algorithmiter.write();
            }
        }
        
        // set the script
        var script = shanka.state["script"];
        var simplified = (script == "simplified") || (script == "both");
        var traditional = (script == "traditional") || (script == "both");        
        if (simplified && traditional) {
            shanka.setsetting("script", "simptrad");
        } else if (simplified) {
            shanka.setsetting("script", "simplified");
        } else {
            shanka.setsetting("script", "traditional");
        }
        
        // create the questions        
        var questionids = [];
        var answer = [];
        if (learndefinition) answer.push("definition");
        if (((learnhanzi || learnwriting || learncursive || learncallid) && simplified))  answer.push("simplified");
        if (((learnhanzi || learnwriting || learncursive || learncallid) && traditional))  answer.push("traditional");
        if (learnpinyin) answer.push("pinyin");

        if (learndefinition) {
            var inputs = learnwriting ? ["draw"] : [];
            var answersremoved = copyandremove(answer, "definition");
            var question = shanka.EnsureQuestionExists(["definition"], answersremoved, ["notes"], inputs);   
            questionids.push(question.questionid);
        }
        
        if (learnhanzi || learnwriting) {
            if (simplified) {
                var answersremoved = copyandremove(answer, "simplified");
                var question = shanka.EnsureQuestionExists(["simplified"], answersremoved, ["notes"], []);   
                questionids.push(question.questionid);
            }
            if (traditional) {
                var answersremoved = copyandremove(answer, "traditional");
                var question = shanka.EnsureQuestionExists(["traditional"], answersremoved, ["notes"], []);   
                questionids.push(question.questionid);
            }
        }
         
        if (learncursive) {
            var inputs = learnwriting ? ["draw"] : [];
            //if (simplified) {
                var answersremoved = copyandremove(answer, "cursive");
                var question = shanka.EnsureQuestionExists(["cursive"], answersremoved, ["notes"], inputs);   
                questionids.push(question.questionid);
            /*}
            if (traditional) {
                var answersremoved = copyandremove(answer, "tcursive");
                var question = shanka.EnsureQuestionExists(["tcursive"], answersremoved, ["notes"], inputs);   
                questionids.push(question.questionid);
            }*/
        }
         
        if (learncallig) {
            var inputs = learnwriting ? ["draw"] : [];
            //if (simplified) {
                var answersremoved = copyandremove(answer, "callig");
                var question = shanka.EnsureQuestionExists(["callig"], answersremoved, ["notes"], inputs);   
                questionids.push(question.questionid);
            /*}
            if (learncallig)
                var answersremoved = copyandremove(answer, "tcallig");
                var question = shanka.EnsureQuestionExists(["tcallig"], answersremoved, ["notes"], inputs);   
                questionids.push(question.questionid);
            }*/
        }
        
        var lesson = shanka.EnsureLessonExists(STR.wizard_created_lesson_name, questionids, categoryids, false);
        lesson.allquestions = false;
        lesson.allcategories = false;
        lesson.enabled = true;
        lesson.write();
        shanka.showstudy();        
    }
    catch(err)
    {
        ExceptionError("wizard4result", err);
    }
    WaitCursorOff();
}

copyandremove = function(array, item) {
    var copy = array.concat();
    var index = copy.indexOf(item);
    while (index != -1) {
        copy.splice(index, 1);
        index = copy.indexOf(item);
    }
    return copy;
};



shanka.wizard1init = function() {
}

shanka.wizard2init = function() {
}

shanka.wizard3init = function() {
}

shanka.wizard4init = function() {
}


shanka.importHSK1 = function(callbackafterimport) {
    shanka.import('lists/HSK%20Official%20With%20Definitions%202012%20L1%20freqorder.txt', 'sticky', 'HSK 1 Words', true, callbackafterimport);
}

shanka.importHSK2 = function(callbackafterimport) {
    shanka.import('lists/HSK%20Official%20With%20Definitions%202012%20L2%20freqorder.txt', 'sticky', 'HSK 2 Words', true, callbackafterimport);
}

shanka.importHSK3 = function(callbackafterimport) {
    shanka.import('lists/HSK%20Official%20With%20Definitions%202012%20L3%20freqorder.txt', 'sticky', 'HSK 3 Words', true, callbackafterimport);
}

shanka.importHSK4 = function(callbackafterimport) {
    shanka.import('lists/HSK%20Official%20With%20Definitions%202012%20L4%20freqorder.txt', 'sticky', 'HSK 4 Words', true, callbackafterimport);
}

shanka.importHSK5 = function(callbackafterimport) {
    shanka.import('lists/HSK%20Official%20With%20Definitions%202012%20L5%20freqorder.txt', 'sticky', 'HSK 5 Words', true, callbackafterimport);
}

shanka.importHSK6 = function(callbackafterimport) {
    shanka.import('lists/HSK%20Official%20With%20Definitions%202012%20L6%20freqorder.txt', 'sticky', 'HSK 6 Words', true, callbackafterimport);
}

shanka.importChineasy = function(callbackafterimport) {
    shanka.import('lists/Chineasy%20Pleco%20Flashcards.txt', 'plecotext', 'Chineasy', true, callbackafterimport);
}

shanka.EnsureAlgorithmBeginnerExists = function() {
    var algorithmname = STR.wizard_algorithm_name_beginner;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {"minimum_interval" : 3, "auto_unknown_min" : 5, "default_kn_rate" : 0.4, "first_element_prob" : 0.2};
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmIntermediateExists = function() {
    var algorithmname = STR.wizard_algorithm_name_intermediate;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {}; // use defaults
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmAdvancedExists = function() {
    var algorithmname = STR.wizard_algorithm_name_advanced;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {"minimum_interval" : 5, "auto_unknown_min" : 10, "default_kn_rate" : 0.6, "first_element_prob" : 0.1};
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmReviewExists = function() {
    var algorithmname = STR.wizard_algorithm_name_review;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {"auto_unknown_min" : 0};
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmRandomExists = function() {
    var algorithmname = STR.wizard_algorithm_name_random;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {"prob_of_any_random" : 1};
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmRandomReviewExists = function() {
    var algorithmname = STR.wizard_algorithm_name_randomreview;
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = true;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {"auto_unknown_min" : 0, "prob_of_any_random" : 1};
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmPlecoExists = function() {
    var algorithmname = "Pleco";
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = false;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {}; // use defaults
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.EnsureAlgorithmSkritterExists = function() {
    var algorithmname = "Skritter";
    var algorithm = shanka.FindAlgorithmByName(algorithmname);    
    if (!algorithm)
    {
        algorithm = new Algorithm();
        algorithm.algorithmid = shanka.getnextguid();
        algorithm.current = false;
        algorithm.enabled = false;
        algorithm.name = algorithmname;
        algorithm.type = "shanka"
        algorithm.data = {}; // use defaults
        algorithm.write();
        shanka.algorithms[algorithm.algorithmid] = algorithm;
    }
    return algorithm;
}

shanka.FindAlgorithmByName = function(algorithmname) {
    var algorithm = null;
    for (var algorithmidstr in shanka.algorithms) {
        var algorithmiter = shanka.algorithms[algorithmidstr];
        if (algorithmiter.name == algorithmname) {
            algorithm = algorithmiter;
            break;
        }
    }
    return algorithm;
}

shanka.EnsureQuestionExists = function(stem, answer, display, input) {
    for (var questionidstr in shanka.questions) {
        var question = shanka.questions[questionidstr];
        if (   arrayAEqualsB(stem, question.stem)
            && arrayAEqualsB(answer, question.answer)
            && arrayAEqualsB(display, question.display)
            && arrayAEqualsB(input, question.input)) {
            shanka.addtoresult(STR.wizard_found_question_message);
            return question;
        }
    }
    var question = new Question();
    question.questionid = shanka.getnextguid();  
    shanka.addnewquestiontolessons(question.questionid);
    question.input = input.concat();
    question.stem = stem.concat();
    question.answer = answer.concat();
    question.display = display.concat();
    question.generatename();
    question.generatequestiontext();
    question.write();
    shanka.questions[question.questionid] = question;
    shanka.addtoresult(STR.wizard_added_question_message);
    return question;
}

shanka.EnsureLessonExists = function(lessonname, questionids, categoryids, reviewmode) {
    for (var lessonidstr in shanka.lessons) {
        var lesson = shanka.lessons[lessonidstr];
        if (   arrayAisSubsetOfB(questionids, lesson.questionids)
            && arrayAisSubsetOfB(categoryids, lesson.categoryids)
            && reviewmode == lesson.reviewmode
            && lessonname == lesson.name) {
            shanka.addtoresult(STR.wizard_found_lesson_message);
            return lesson;
        }
    }
    var lesson = new Lesson();
    lesson.lessonid = shanka.getnextguid();  
    lesson.name = shanka.getuniquelessonname(lessonname);
    lesson.questionids = questionids.concat();
    lesson.categoryids = categoryids.concat();
    lesson.reviewmode = reviewmode;
    lesson.write();
    shanka.lessons[lesson.lessonid] = lesson;
    shanka.addtoresult(STR.wizard_added_lesson_message);
    return lesson;
}
