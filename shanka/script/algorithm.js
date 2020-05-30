/*
    Shanka HSK Flashcards - algorithm.js

    You are free to copy, distribute, and modify this code, under a similar license
    to this one. You must give the original author (me) credit in any derived work.
    You may not use any part of this code for commercial purposes without obtaining
    my permission.
    
    Alan Davies 2014 alan@hskhsk.com
    
    See http://hskhsk.com/shanka for more information.

*/

// Algorithm is for SRS algorithms

function Algorithm () {
    this.algorithmid = 0;
    this.current = false;
    this.enabled = true;
    this.name = "";
    this.type = "";
    this.data = {};
};

// ---------------------------
// Algorithm methods

Algorithm.prototype.write = function() {
    localStorage["a" + this.algorithmid.toString(36)] = shanka.compress(JSON.stringify(this));
}

Algorithm.prototype.del = function() {
    delete shanka.algorithms[this.algorithmid];
    localStorage.removeItem("a" + this.algorithmid.toString(36))
}

Algorithm.prototype.getdata = function(key) {
    if (key in this.data) {
        return this.data[key];
    }
    return this._getdefault(key);
}

/* ********** Begin algorithm-specific code ********** */

Algorithm.prototype._getdefault= function(key) {
    switch (this.type) {
        case "shanka":
            // just break for now
            break;
        
        default:
            ReportError("Algorithm._getdefault Unknown type: " + this.type);
            break;
    }
    
    switch (key) {
        case "auto_unknown_min"    : return 7;   break; // shanka
        case "daily_correct_target": return 50;   break; // shanka
        case "daily_new_target"    : return 10;   break; // shanka
        case "daily_time_target"   : return 20;   break; // shanka
        case "default_kn_rate"     : return 0.5;  break; // shanka
        case "known_kn_rate"       : return 0.8;  break; // shanka
        case "default_lead_time"   : return 24*60*60*1000;  break; // time based SRS, in ms
        case "answer_1_factor"     : return 0.33; break; // time based SRS
        case "answer_2_factor"     : return 0.67; break; // time based SRS
        case "answer_3_factor"     : return 1.0;  break; // time based SRS
        case "answer_4_factor"     : return 1.5;  break; // time based SRS
        case "answer_5_factor"     : return 3.0;  break; // time based SRS
        case "adjustment_speed"    : return 2.0;  break; // shanka
        case "prob_of_any_random"  : return 0.1;  break; // shanka
        case "first_element_prob"  : return 0.15; break; // shanka
        case "minimum_interval"    : return 4; break; // shanka
        default: ReportError("Algorithm._getdefault Unknown key: " + key + " for type: " + this.type);
    }
    
    return "";
}

Algorithm.prototype.getnextcardquestion = function() {
    var card = null;
    var question = null;
    
    if (shanka.queue.length == 0) {
        shanka.rebuildqueue();
    }

    switch (this.type) {
        case "shanka":
            var prob_of_any_random = this.getdata("prob_of_any_random");
            var random1 = Math.random();
            var random2 = Math.random();
            var index = 0;
            
            // trim the queue, to avoid repeating characters
            var trimmedqueue = shanka.queue.concat();
            var minimum_interval = this.getdata("minimum_interval");
            var lastOutOfTrimmedQueue = null;
            for (var i=0; i<minimum_interval; i++) {
                if (trimmedqueue.length == 1) {
                    // save this one for later
                    lastOutOfTrimmedQueue = trimmedqueue[0];
                }
                if (shanka.history.length == i) {
                    // not enough in the history
                    break;
                }
                var cardremove = shanka.history[i];
                var removeindex = trimmedqueue.indexOf(cardremove);
                if (removeindex != -1) {
                    trimmedqueue.splice(removeindex, 1);
                }
            }
            
            if (random1 < prob_of_any_random) {
                // choose a random element from the queue
                index = Math.floor(random2 * trimmedqueue.length);
            } else {
                var a = this.getdata("first_element_prob");
                /* Element 0 is chosen with probability a           => random2 < a  = p_0
                 * Element 1 is chosen with probability a(1-a) = ar => random2 < ar = p_1
                 * Element 2 is chosen with probability a(1-a)^2    => random2 < ar = p_2
                 * p_n = Sum[k=0 to n](ar^n) = a(1-r^(n+1))/(1-r)
                 * => n = ln(1-p_n(1-r)/a)/ln(r) - 1
                 * As 1-r = a this simplifies: n = ln(1-p_n)/ln(r) - 1
                 * Round up n to the next integer and we have an index into the array! If this index is too big for the array, set it
                 * to zero, to assign any extra probability to the first element. */
                var raw = Math.log(1-random2)/Math.log(1-a) - 1
                var index = Math.ceil(raw);
            }
            if (index >= trimmedqueue.length || index < 0) {
               card = shanka.addcardtoqueueifallowed();
               index = 0;
               if (!card) {
                    // we failed to get a new card in the queue, at least try 
                    // the last one that was in the trimmed queue.
                    card = lastOutOfTrimmedQueue;
               }
            }
            if (!card && index < trimmedqueue.length) {
                card = trimmedqueue[index];
            }
            
            // todo choose the least known question
            // if no matching question, should de-queue card, and try again!
            var questionids  = shanka.getallactivequestionidslist();
            var questionid = questionids[Math.floor(Math.random() * questionids.length)];

            question = shanka.questions[questionid];

            break;
        
        default:
            ReportError("Algorithm.getnextcardquestion Unknown Algorithm: " + this.type);
            break;
    }

    return [card, question];
}

Algorithm.prototype.choosequestionbasedoncard = function(card) {
    var question = null;
    
    switch (this.type) {
        case "shanka":
            // todo choose the least known question for this card
            // TODO card must also have valid fields for this question
            // can return NULL
            var questionids  = shanka.getallactivequestionidslist();
            var questionid = questionids[Math.floor(Math.random() * questionids.length)];
            question = shanka.questions[questionid];
            break;
        
        default:
            ReportError("Algorithm.choosequestionbasedoncard Unknown Algorithm: " + this.type);
            break;
    }
    
    return question;
}

Algorithm.prototype.setcardscore = function(card, question, scores) {
    switch (this.type) {
        case "shanka":
            for (var i = 0, anslen = question.answer.length; i < anslen; i++) {
                var answer = question.answer[i];
                var score = scores[answer];
                for (var j = 0, stemlen = question.stem.length; j < stemlen; j++) {
                    var stem = question.stem[j];
                    
                    var kn_rate        = card.getdata("kn_rate"       , stem, answer);
                    var last_time      = card.getdata("last_time"     , stem, answer);
                    var next_time      = card.getdata("next_time"     , stem, answer);
                    var last_score     = card.getdata("last_score"    , stem, answer);
                    var question_count = card.getdata("question_count", stem, answer);
                    var correct_count  = card.getdata("correct_count" , stem, answer);
                    
                    var timeNow = (new Date()).getTime();
                    var leadTime = this.getdata("default_lead_time");                    
                    var adjustment_speed = this.getdata("adjustment_speed");
                    // if (last_time) {
                    //    leadTime = ... TODO for time-based SRS
                    // }

                    if (score == 1) {
                        kn_rate /= Math.pow(adjustment_speed, 2);
                    } else if (score == 2) {
                        kn_rate /= adjustment_speed;
                    } else if (score == 3) {
                        kn_rate *= 1.00001; // just nudge it forward in the queue a little...
                    } else if (score == 4) {
                        kn_rate = 1 + (kn_rate -1) / adjustment_speed;
                    } else {
                        kn_rate = 1 + (kn_rate -1) / Math.pow(adjustment_speed, 2);
                    }
                                        
                    last_time = timeNow;
                    next_time = timeNow + leadTime;
                    last_score = score; 
                    question_count += 1;
                    if (score > 3) correct_count += 1;
                    
                    card.setdata("kn_rate"       , stem, answer, kn_rate       );
                    card.setdata("last_time"     , stem, answer, last_time     );
                    card.setdata("next_time"     , stem, answer, next_time     );
                    card.setdata("last_score"    , stem, answer, last_score    );
                    card.setdata("question_count", stem, answer, question_count);
                    card.setdata("correct_count" , stem, answer, correct_count );
                }
            }
            
            card.kn_rate = card.getminactive("kn_rate");
            card.next_time = card.getminactive("next_time");
            card.last_time = card.getmaxactive("last_time");
            card.test_count += 1;
            
            card.write();
            
            // update queue and history
            shanka.removefromqueue(card);
            shanka.removefromhistory(card);
            shanka.addtoqueue(card);
            shanka.addtohistory(card);
            
            break;
        
        default:
            ReportError("Algorithm.setcardscore Unknown Algorithm: " + this.type);
            break;
    }
}

Algorithm.prototype.queuecompare = function(a, b) {
    var cmp = 0;
    switch (this.type) {
        case "shanka":
            cmp = a.kn_rate - b.kn_rate; // sort on kn_rate, lowest first
            if (cmp == 0.0) {
                cmp = b.last_time - a.last_time; // sort on time, highest first
            }
            break;
        
        default:
            ReportError("Algorithm.queuecompare Unknown Algorithm: " + this.type);
            break;
    }
    return cmp;
}

// nasty to use globals, but quick...
var trouble_shown = false;
var learned_shown = false;
var learning_shown = false;

Algorithm.prototype.getqueuedisplaytext = function(card) {
    var kn_rate = 0;
    var text = "";
    switch (this.type) {
        case "shanka":
            kn_rate = Math.round(card.kn_rate * 100);
            text = STR.algorithm_knowledge_rate_display + ": " + kn_rate.toString() + "%";
            if (kn_rate < Math.round(this.getdata("default_kn_rate") * 100)) {
                if (!trouble_shown) {
                    text += " (" + STR.algorithm_knowledge_rate_trouble + ")";
                    trouble_shown = true;
                }
            } else if (card.kn_rate > this.getdata("known_kn_rate")) {
                if (!learned_shown) {
                    text += " (" + STR.algorithm_knowledge_rate_learned + ")";
                    learned_shown = true;
                }
            } else {
                if (!learning_shown) {
                    text += " (" + STR.algorithm_knowledge_rate_learning + ")";
                    learning_shown = true;
                }
            }
            break;
        
        default:
            ReportError("Algorithm.getqueuedisplaytext Unknown Algorithm: " + this.type);
            break;
    }
    return [kn_rate, text];
}

Algorithm.prototype.gethistorydisplaytext = function(card) {
    var text = "";
    switch (this.type) {
        case "shanka":
            var date = new Date(card.last_time);
            var now = new Date();
            text = date.toLocaleDateString();
            if (text == now.toLocaleDateString()) {
                text += " (" + STR.algorithm_history_today + " )";
            } else {
                var yesterday = new Date(now.getTime() - 86400000);
                if (text == yesterday.toLocaleDateString()) {
                    text += " (" + STR.algorithm_history_yesterday + " )";
                }
            }
            break;
        
        default:
            ReportError("Algorithm.gethistorydisplaytext Unknown Algorithm: " + this.type);
            break;
    }
    return text;
}

/* ********** End algorithm-specific code ********** */

shanka.getuniquealgorithmname = function(prefix) { // New Algorithm by default
    var i = 2;
    var newname = prefix;
    var found = true;
    while (found) {
        found = false;
        for (var algorithmidstr in shanka.algorithms) {
            if (shanka.algorithms[algorithmidstr].name == newname) {
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


shanka.showalgorithms = function() {
    shanka.navigate({"section" : "algorithms"})
}

shanka.addalgorithm = function() {
    shanka.navigate({"section" : "algorithm-add"})
}

shanka.showalgorithm = function(algorithmid) {
    var algorithm = shanka.algorithms[algorithmid];
    shanka.navigate({"section" : "algorithm-" + algorithm.type, "algorithmid" : algorithmid.toString()})
}

shanka.editalgorithms = function() {
    shanka.navigate({"section" : "editalgorithms"})
}

shanka.onalgorithmcheckclick = function(algorithmid) {
    var algorithm = shanka.algorithms[algorithmid];
    
    if (algorithm && shanka.algorithm.algorithmid != algorithm.algorithmid) {
        shanka.algorithm.current = false;
        shanka.algorithm.write();
        shanka.algorithm = algorithm;
        shanka.algorithm.current = true;
        shanka.algorithm.write();
    }
}

shanka.doduplicatealgorithms = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.algorithm_duplicate_selected_confirm)) {
            var algorithmids = Object.keys(shanka.algorithms)
            var i = algorithmids.length;
            while (i--) {
                var algorithmid = algorithmids[i];
               
                var toggle = document.getElementById("algorithmselected"+algorithmid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    var algorithm = shanka.algorithms[algorithmid];
                    var newalgorithm = JSON.parse(JSON.stringify(algorithm)); // copy
                    newalgorithm.__proto__ = Algorithm.prototype;
                    newalgorithm.algorithmid = shanka.getnextguid();
                    newalgorithm.name = shanka.getuniquealgorithmname(algorithm.name); 
                    newalgorithm.current = false;
                    shanka.algorithms[newalgorithm.algorithmid] = newalgorithm;
                    newalgorithm.write();
                    count++;
                }
            }
        
            shanka.editalgorithms();
            shanka.addtoresult(STR.algorithm_duplicated_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("duplicatealgorithms", err);
    }
    WaitCursorOff();
}

shanka.dodeletealgorithms = function() {
    WaitCursorOn();
    try
    {
        var count = 0;
        if (confirm(STR.algorithm_delete_selected_confirm)) {
            var algorithmids = Object.keys(shanka.algorithms)
            var i = algorithmids.length;
            while (i--) {
                var algorithmid = algorithmids[i];
                var algorithm = shanka.algorithms[algorithmid];
                
                var toggle = document.getElementById("algorithmselected"+algorithmid.toString());
                if (toggle && toggle.classList.contains("active")) {
                    if (Object.keys(shanka.algorithms).length == 1) {
                        alert(STR.algorithm_cannot_delete_last_error);
                        break;
                    }
                    algorithm.del();
                    count++;
                }
            }

            // ensure an enabled algorithm is selected
            if (!(shanka.algorithm.algorithmid in shanka.algorithms)) {
                for (var algorithmid in shanka.algorithms) {
                    if (algorithm.enabled) {
                        shanka.algorithm = shanka.algorithms[algorithmid];
                        shanka.algorithm.current = true;
                        shanka.algorithm.write();
                        break;
                    }
                }
            }
            
            shanka.editalgorithms();
            shanka.addtoresult(STR.algorithm_deleted_format.replace("{0}", count.toString()));
        }
    }
    catch(err)
    {
        ExceptionError("deletealgorithms", err);
    }
    WaitCursorOff();
}

shanka.doaddshankaalgorithm = function() {
    shanka.navigate({"section" : "algorithm-shanka"});
}

shanka.dosaveshankaalgorithm = function() {
    WaitCursorOn();
    try
    {
        var newname = document.getElementById("editalgorithmname").value;
        var auto_unknown_min     = parseInt(  document.getElementById("auto_unknown_min"    ).value);
        var daily_correct_target = parseInt(  document.getElementById("daily_correct_target").value);
        var daily_new_target     = parseInt(  document.getElementById("daily_new_target"    ).value);
        var daily_time_target    = parseInt(  document.getElementById("daily_time_target"   ).value);
        var default_kn_rate      = parseFloat(document.getElementById("default_kn_rate"     ).value);
        var known_kn_rate        = parseFloat(document.getElementById("known_kn_rate"       ).value);
        var adjustment_speed     = parseFloat(document.getElementById("adjustment_speed"    ).value);
        var prob_of_any_random   = parseFloat(document.getElementById("prob_of_any_random"  ).value);
        var first_element_prob   = parseFloat(document.getElementById("first_element_prob"  ).value);
        var minimum_interval     = parseInt(  document.getElementById("minimum_interval"    ).value);
        
        if (!newname.length) {
            alert(STR.algorithm_name_cant_be_empty_error);
            WaitCursorOff();    
            return;
        }
        
        if (auto_unknown_min < 1) {
            alert(STR.algorithm_minimum_unknown_card_positive_int_error);
            WaitCursorOff();    
            return;
        }
        
        if (daily_correct_target < 1) {
            alert(STR.algorithm_daily_correct_target_positive_int_error);
            WaitCursorOff();    
            return;
        }
        
        if (daily_new_target < 1) {
            alert(STR.algorithm_daily_new_target_positive_int_error);
            WaitCursorOff();    
            return;
        }
        
        if (daily_time_target < 1) {
            alert(STR.algorithm_daily_minutes_target_positive_int_error);
            WaitCursorOff();    
            return;
        }
        
        if (default_kn_rate < 0 || default_kn_rate > 1) {
            alert(STR.algorithm_default_knowledge_rate_0_1_error);
            WaitCursorOff();    
            return;
        }
        
        if (known_kn_rate < 0 || known_kn_rate > 1) {
            alert(STR.algorithm_threshold_knowledge_rate_0_1_error);
            WaitCursorOff();    
            return;
        }
        
        if (adjustment_speed <= 0) {
            alert(STR.algorithm_adjustment_speed_positive_error);
            WaitCursorOff();    
            return;
        }
        
        if (prob_of_any_random < 0 || prob_of_any_random > 1) {
            alert(STR.algorithm_any_element_probability_0_1_error);
            WaitCursorOff();    
            return;
        }
        
        if (first_element_prob < 0 || first_element_prob > 1) {
            alert(STR.algorithm_first_element_probability_0_1_error);
            WaitCursorOff();    
            return;
        }
        
        if (minimum_interval < 0) {
            alert(STR.algorithm_minimum_interval_postive_0_error);
            WaitCursorOff();    
            return;
        }
        
        if ("algorithmid" in shanka.state) {
            var algorithmid = parseInt(shanka.state["algorithmid"]);
            algorithm = shanka.algorithms[algorithmid];
        } else {
            algorithm = new Algorithm();
            algorithm.algorithmid = shanka.getnextguid();  
            algorithm.type = "shanka";        
        }

        algorithm.name = newname;
        algorithm.setdata("auto_unknown_min"    , auto_unknown_min    );
        algorithm.setdata("daily_correct_target", daily_correct_target);
        algorithm.setdata("daily_new_target"    , daily_new_target    );
        algorithm.setdata("daily_time_target"   , daily_time_target   );
        algorithm.setdata("default_kn_rate"     , default_kn_rate     );
        algorithm.setdata("known_kn_rate"       , known_kn_rate       );
        algorithm.setdata("adjustment_speed"    , adjustment_speed    );
        algorithm.setdata("prob_of_any_random"  , prob_of_any_random  );
        algorithm.setdata("first_element_prob"  , first_element_prob  );
        algorithm.setdata("minimum_interval"    , minimum_interval    );
        
        shanka.algorithms[algorithm.algorithmid] = algorithm;
        algorithm.write();
        shanka.showalgorithms();
        shanka.addtoresult(STR.algorithm_saved_format.replace("{0}", algorithm.name));
    }
    catch(err)
    {
        ExceptionError("doexporttextfile", err);
    }
    WaitCursorOff();    
}

shanka.initalgorithms = function() {
    document.getElementById("algorithm_current_label").innerHTML = STR.algorithm_current_label; 
    document.getElementById("gen_add_text").innerHTML = STR.gen_add_text; 
    document.getElementById("gen_edit_all_text").innerHTML = STR.gen_edit_all_text; 
    // document.getElementById("gen_add_text2").innerHTML = STR.gen_add_text; 
    // document.getElementById("gen_edit_all_text2").innerHTML = STR.gen_edit_all_text; 

    shanka.initalgorithmlist(false);
    var selected = document.getElementById("algorithmenabled"+shanka.algorithm.algorithmid.toString());
    selected.classList.add("active");
}

shanka.initeditalgorithms = function() {
    document.getElementById("gen_duplicate_text").innerHTML = STR.gen_duplicate_text; 
    document.getElementById("gen_delete_text").innerHTML = STR.gen_delete_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 
    // document.getElementById("gen_duplicate_text2").innerHTML = STR.gen_duplicate_text; 
    // document.getElementById("gen_delete_text2").innerHTML = STR.gen_delete_text; 
    // document.getElementById("gen_cancel_text2").innerHTML = STR.gen_cancel_text; 

    shanka.initalgorithmlist(true);
}

shanka.initalgorithmlist = function(addonclick) {
    var algorithmlist = document.getElementById("algorithmlist")
    var lis = algorithmlist.getElementsByTagName("li");
    var template = lis[0].innerHTML;
    while (algorithmlist.firstChild) {
        algorithmlist.removeChild(algorithmlist.firstChild);
    }
    
    for (var algorithmid in shanka.algorithms) {
        var algorithm = shanka.algorithms[algorithmid];
        
        var li=document.createElement("li");
        li.innerHTML = template.replace(/#ID#/g, algorithm.algorithmid.toString())
                               .replace(/#NAME#/g, algorithm.name);
        if (addonclick) {
            li.onclick = function(e) { shanka.togglechild(e.target); e.preventDefault();}
        }
        if (!algorithm.enabled) {
            li.classList.add("disabled");
            
            for (var i=0, len=li.children.length; i<len; i++) {
                var x = li.children[i];
                x.removeAttribute("href");
            }
        }
        algorithmlist.appendChild(li);
    }
}

shanka.initaddalgorithms = function() {
    document.getElementById("algorithm_choose_label").innerHTML = STR.algorithm_choose_label; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 
}

shanka.initshankaalgorithm = function(algorithmid) {
    document.getElementById("page_algo_shanka_title").innerHTML = STR.page_algo_shanka_title; 
    document.getElementById("algorithm_name_label").innerHTML = STR.algorithm_name_label; 
    document.getElementById("algorithm_study_settings").innerHTML = STR.algorithm_study_settings; 
    document.getElementById("algorithm_minimum_unknown_cards").innerHTML = STR.algorithm_minimum_unknown_cards; 
    document.getElementById("algorithm_daily_correct_target").innerHTML = STR.algorithm_daily_correct_target; 
    document.getElementById("algorithm_daily_new_target").innerHTML = STR.algorithm_daily_new_target; 
    document.getElementById("algorithm_daily_minutes_target").innerHTML = STR.algorithm_daily_minutes_target; 
    document.getElementById("algorithm_parameters").innerHTML = STR.algorithm_parameters; 
    document.getElementById("algorithm_default_knowledge_rate").innerHTML = STR.algorithm_default_knowledge_rate; 
    document.getElementById("algorithm_threshold_kn_rate").innerHTML = STR.algorithm_threshold_kn_rate; 
    document.getElementById("algorithm_adjustment_speed").innerHTML = STR.algorithm_adjustment_speed; 
    document.getElementById("algorithm_any_element_probability").innerHTML = STR.algorithm_any_element_probability; 
    document.getElementById("algorithm_first_element_prob").innerHTML = STR.algorithm_first_element_prob; 
    document.getElementById("algorithm_minimum_interval").innerHTML = STR.algorithm_minimum_interval; 
    document.getElementById("gen_save_text").innerHTML = STR.gen_save_text; 
    document.getElementById("gen_cancel_text").innerHTML = STR.gen_cancel_text; 

    var algorithm = null;
    if (algorithmid) {
        algorithm = shanka.algorithms[algorithmid];
    } else {
        algorithm = new Algorithm();
        algorithm.name = shanka.getuniquealgorithmname(STR.algorithm_new_name);
        algorithm.type = "shanka";
    }
    
    document.getElementById("editalgorithmname"   ).value = algorithm.name;
    document.getElementById("auto_unknown_min"    ).value = algorithm.getdata("auto_unknown_min"    ).toString();
    document.getElementById("daily_correct_target").value = algorithm.getdata("daily_correct_target").toString();
    document.getElementById("daily_new_target"    ).value = algorithm.getdata("daily_new_target"    ).toString();
    document.getElementById("daily_time_target"   ).value = algorithm.getdata("daily_time_target"   ).toString();
    document.getElementById("default_kn_rate"     ).value = algorithm.getdata("default_kn_rate"     ).toString();
    document.getElementById("known_kn_rate"       ).value = algorithm.getdata("known_kn_rate"       ).toString();
    document.getElementById("adjustment_speed"    ).value = algorithm.getdata("adjustment_speed"    ).toString();
    document.getElementById("prob_of_any_random"  ).value = algorithm.getdata("prob_of_any_random"  ).toString();
    document.getElementById("first_element_prob"  ).value = algorithm.getdata("first_element_prob"  ).toString();
}
